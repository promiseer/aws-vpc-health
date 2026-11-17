const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("./server");

process.env.SKIP_IMDS = "1";

async function withServer(fn) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await fn(server.address().port);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

test("GET /health returns ok", async () => {
  await withServer(async (port) => {
    const response = await fetch("http://127.0.0.1:" + port + "/health");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });
});

test("GET / names the service without calling IMDS", async () => {
  await withServer(async (port) => {
    const response = await fetch("http://127.0.0.1:" + port + "/");
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.service, "vpc-health");
    assert.equal(body.source, "skipped");
  });
});

test("unknown paths return 404", async () => {
  await withServer(async (port) => {
    const response = await fetch("http://127.0.0.1:" + port + "/nope");
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "not_found" });
  });
});
