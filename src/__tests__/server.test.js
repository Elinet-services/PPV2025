const http = require("http");

const { createApp } = require("../../server");

function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function stopServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function requestJson(server, path) {
  const port = server.address().port;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method: "GET",
      },
      (res) => {
        let payload = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          payload += chunk;
        });
        res.on("end", () => {
          let body = null;
          if (payload) {
            try {
              body = JSON.parse(payload);
            } catch (error) {
              reject(error);
              return;
            }
          }

          resolve({
            statusCode: res.statusCode,
            body,
          });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function createLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

test("GET /update-racelist: returns success when fetchRacers script succeeds", async () => {
  const execCommand = jest.fn((command, callback) => {
    callback(null, "ok", "");
  });
  const logger = createLogger();
  const app = createApp({ execCommand, logger });
  const server = await startServer(app);

  try {
    const response = await requestJson(server, "/update-racelist");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Data úspěšně aktualizována.",
    });
    expect(execCommand).toHaveBeenCalledTimes(1);
    expect(execCommand).toHaveBeenCalledWith("node fetchRacers.js", expect.any(Function));
    expect(logger.error).not.toHaveBeenCalled();
  } finally {
    await stopServer(server);
  }
});

test("GET /update-racelist: returns error when fetchRacers script fails", async () => {
  const execCommand = jest.fn((command, callback) => {
    callback(new Error("script failed"), "", "script failed");
  });
  const logger = createLogger();
  const app = createApp({ execCommand, logger });
  const server = await startServer(app);

  try {
    const response = await requestJson(server, "/update-racelist");

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: "Chyba při aktualizaci.",
    });
    expect(logger.error).toHaveBeenCalledTimes(1);
  } finally {
    await stopServer(server);
  }
});

test("unknown route: returns 404 from error middleware", async () => {
  const logger = createLogger();
  const app = createApp({ logger });
  const server = await startServer(app);

  try {
    const response = await requestJson(server, "/unknown-endpoint");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Endpoint nenalezen.",
    });
  } finally {
    await stopServer(server);
  }
});
