import assert from "node:assert/strict";
import {execFile} from "node:child_process";
import {createServer} from "node:net";
import {test} from "node:test";
import {fileURLToPath} from "node:url";
import {promisify} from "node:util";
import {findAvailablePort} from "./dev-server.mjs";

const exec = promisify(execFile);
const launcher = fileURLToPath(new URL("./dev-server.mjs", import.meta.url));

async function occupyPort(t, port = 0, host) {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen({port, host, ipv6Only: host?.includes(":")}, resolve);
  });
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return server.address().port;
}

test("keeps the starting port when it is free", async (t) => {
  const busyPort = await occupyPort(t);
  const freePort = await findAvailablePort(busyPort);
  assert.equal(await findAvailablePort(freePort), freePort);
});

test("skips multiple occupied ports and passes the selected port to the command", async (t) => {
  const firstPort = await occupyPort(t);
  const secondPort = await findAvailablePort(firstPort);
  await occupyPort(t, secondPort);
  const expectedPort = await findAvailablePort(firstPort);
  assert.ok(expectedPort > secondPort);

  const {stdout} = await exec(process.execPath, [
    launcher, String(firstPort), process.execPath,
    "-e", "console.log(JSON.stringify(process.argv.slice(1)))", "--",
  ]);
  assert.ok(stdout.includes(JSON.stringify(["--port", String(expectedPort)])));
});

test("rejects invalid starting ports", async () => {
  for (const port of [0, -1, 65536, 3000.5, NaN]) {
    await assert.rejects(findAvailablePort(port), /Starting port/);
  }
});

for (const host of ["127.0.0.1", "0.0.0.0", "::1", "::"]) {
  test(`skips ports occupied on ${host}`, async (t) => {
    let port;
    try {
      port = await occupyPort(t, 0, host);
    } catch (error) {
      if (["EAFNOSUPPORT", "EADDRNOTAVAIL"].includes(error.code)) {
        t.skip("Address family unavailable on this machine");
        return;
      }
      throw error;
    }
    assert.ok(await findAvailablePort(port) > port);
  });
}

test("preserves a failing command's exit code", async () => {
  await assert.rejects(
    exec(process.execPath, [
      launcher, "3000", process.execPath, "-e", "process.exit(7)", "--",
    ]),
    (error) => error.code === 7,
  );
});
