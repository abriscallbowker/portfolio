import { createServer } from "node:net";
import { concurrently } from "concurrently";

function canListen(port, host) {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" || error.code === "EACCES") {
        resolve(false);
      } else if (error.code === "EAFNOSUPPORT" || error.code === "EADDRNOTAVAIL") {
        resolve(true);
      } else {
        reject(error);
      }
    });
    server.listen({ port, host }, () => server.close(() => resolve(true)));
  });
}

async function availablePort(start, end = 65535, excluded = new Set()) {
  for (let port = start; port <= end; port += 1) {
    if (excluded.has(port)) continue;
    // On macOS a wildcard bind can succeed while ::1 is already occupied.
    const available =
      (await canListen(port, undefined)) &&
      (await canListen(port, "::1")) &&
      (await canListen(port, "127.0.0.1"));
    if (available) return port;
  }
  throw new Error(`No available development port between ${start} and ${end}.`);
}

try {
  const workspacePort = process.env.CONDUCTOR_PORT;
  const basePort = workspacePort ? Number(workspacePort) : 3000;
  if (!Number.isInteger(basePort) || basePort < 1 || basePort > 65526) {
    throw new Error("CONDUCTOR_PORT must be an integer between 1 and 65526.");
  }

  const lastPort = workspacePort ? basePort + 9 : 65535;
  const appPort = await availablePort(basePort, lastPort);
  const studioPort = await availablePort(
    workspacePort ? basePort : 3333,
    lastPort,
    new Set([appPort]),
  );

  console.log(`Portfolio: http://localhost:${appPort}`);
  console.log(`Studio:    http://localhost:${studioPort}`);

  const { result } = concurrently(
    [
      { name: "app", command: `npm run dev:app -- --port ${appPort}`, prefixColor: "cyan" },
      { name: "studio", command: `npm --prefix cms run dev -- --port ${studioPort}`, prefixColor: "magenta" },
    ],
    { prefix: "name", killOthersOn: ["failure", "success"] },
  );
  await result;
} catch (error) {
  if (error instanceof Error) console.error(error.message);
  process.exitCode = 1;
}
