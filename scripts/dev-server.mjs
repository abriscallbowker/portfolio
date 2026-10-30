import {spawn} from "node:child_process";
import {createServer} from "node:net";
import {pathToFileURL} from "node:url";

function canListen(port, host) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else if (
        host.includes(":") &&
        ["EAFNOSUPPORT", "EADDRNOTAVAIL"].includes(error.code)
      ) resolve(true); // IPv6 is unavailable on this machine.
      else reject(error);
    });
    server.listen({port, host, ipv6Only: host.includes(":")}, () => {
      server.close(() => resolve(true));
    });
  });
}

export async function findAvailablePort(startPort) {
  if (!Number.isInteger(startPort) || startPort < 1 || startPort > 65535) {
    throw new Error("Starting port must be an integer between 1 and 65535.");
  }

  for (let port = startPort; port <= 65535; port += 1) {
    // On macOS, wildcard binds can coexist with existing loopback listeners.
    // Check each address family and its loopback address explicitly.
    let available = true;
    for (const host of ["0.0.0.0", "127.0.0.1", "::", "::1"]) {
      if (!await canListen(port, host)) {
        available = false;
        break;
      }
    }
    if (available) return port;
  }

  throw new Error(`No available port found from ${startPort} to 65535.`);
}

async function main() {
  const [startPort, command, ...args] = process.argv.slice(2);
  if (!command) throw new Error("Usage: dev-server.mjs <port> <command> [args...]");

  // The combined launcher passes its workspace-specific port explicitly.
  const portIndex = args.indexOf("--port");
  const requestedPort = portIndex >= 0 ? args[portIndex + 1] : startPort;
  if (portIndex >= 0) args.splice(portIndex, 2);
  const port = await findAvailablePort(Number(requestedPort));
  console.log(`[dev] ${command}: using port ${port}`);
  const child = spawn(command, [...args, "--port", String(port)], {
    stdio: "inherit",
  });
  const forwardInterrupt = () => child.kill("SIGINT");
  const forwardTerminate = () => child.kill("SIGTERM");
  process.once("SIGINT", forwardInterrupt);
  process.once("SIGTERM", forwardTerminate);
  const cleanup = () => {
    process.off("SIGINT", forwardInterrupt);
    process.off("SIGTERM", forwardTerminate);
  };
  child.once("error", (error) => {
    cleanup();
    console.error(error.message);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    cleanup();
    process.exitCode = code ?? (signal === "SIGINT" ? 130 : 143);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
