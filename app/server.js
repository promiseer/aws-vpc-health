const http = require("node:http");

const port = Number(process.env.PORT || 8080);
const imdsRoot = "http://169.254.169.254";

async function instanceIdentity() {
  if (process.env.SKIP_IMDS === "1") {
    return { source: "skipped" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1000);
  try {
    const tokenResponse = await fetch(imdsRoot + "/latest/api/token", {
      method: "PUT",
      headers: { "X-aws-ec2-metadata-token-ttl-seconds": "60" },
      signal: controller.signal,
    });
    if (!tokenResponse.ok) {
      return { source: "unavailable" };
    }
    const token = await tokenResponse.text();

    async function meta(path) {
      const response = await fetch(imdsRoot + "/latest/meta-data/" + path, {
        headers: { "X-aws-ec2-metadata-token": token },
        signal: controller.signal,
      });
      return response.ok ? response.text() : "";
    }

    const instanceId = await meta("instance-id");
    const availabilityZone = await meta("placement/availability-zone");
    return { source: "imds", instanceId, availabilityZone };
  } catch {
    return { source: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function createServer() {
  return http.createServer(async (req, res) => {
    const path = (req.url || "/").split("?")[0];
    if (path === "/health") {
      send(res, 200, { status: "ok" });
      return;
    }
    if (path === "/") {
      const identity = await instanceIdentity();
      send(res, 200, { service: "vpc-health", ...identity });
      return;
    }
    send(res, 404, { error: "not_found" });
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(port, "0.0.0.0", () => {
    process.stdout.write("listening on " + port + "\n");
  });
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      server.close(() => process.exit(0));
    });
  }
}

module.exports = { createServer };
