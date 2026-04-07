const express = require("express");
const { exec } = require("child_process");
const { registerLocalDevRoutes } = require("./local-dev-api");

const PORT = Number(process.env.PORT || 3001); // Použij jiný port než React
const UPDATE_RACELIST_COMMAND = "node fetchRacers.js";

function logMessage(logger, level, message) {
  const fallback = level === "error" ? "error" : "log";
  const logFn = typeof logger?.[level] === "function" ? logger[level] : logger?.[fallback];
  if (typeof logFn === "function") logFn.call(logger, message);
}

function createHttpError(status, message, options = {}) {
  const error = new Error(message);
  error.status = status;
  error.expose = Boolean(options.expose);
  if (options.cause) error.cause = options.cause;
  return error;
}

function runUpdateRacelist(execCommand = exec) {
  return new Promise((resolve, reject) => {
    execCommand(UPDATE_RACELIST_COMMAND, (error, stdout, stderr) => {
      if (error) {
        reject(
          createHttpError(500, "Chyba při aktualizaci.", {
            expose: true,
            cause: error,
          })
        );
        return;
      }

      resolve({
        stdout: stdout || "",
        stderr: stderr || "",
      });
    });
  });
}

function createApp(options = {}) {
  const app = express();
  const execCommand = options.execCommand || exec;
  const logger = options.logger || console;

  registerLocalDevRoutes(app);

  app.get("/update-racelist", async (req, res) => {
    logMessage(logger, "log", "🔄 Spouštím fetchRacers.js...");

    const { stdout, stderr } = await runUpdateRacelist(execCommand);

    if (stderr.trim()) {
      logMessage(logger, "warn", `⚠️ fetchRacers.js stderr: ${stderr}`);
    }

    logMessage(logger, "log", `✅ Výstup fetchRacers.js: ${stdout}`);
    res.json({ success: true, message: "Data úspěšně aktualizována." });
  });

  app.use((req, res, next) => {
    next(
      createHttpError(404, "Endpoint nenalezen.", {
        expose: true,
      })
    );
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message = error?.expose ? error.message : "Došlo k chybě na serveru.";

    const causeMessage = error?.cause?.message ? ` | cause: ${error.cause.message}` : "";
    logMessage(
      logger,
      "error",
      `❌ [${req.method} ${req.originalUrl}] ${status} ${error?.message || "Unknown error"}${causeMessage}`
    );

    res.status(status).json({ success: false, message });
  });

  return app;
}

function startServer(options = {}) {
  const port = Number(options.port || process.env.PORT || PORT);
  const app = createApp(options);
  const server = app.listen(port, () => {
    logMessage(options.logger || console, "log", `🚀 Server běží na http://localhost:${port}`);
  });

  return { app, server };
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  createHttpError,
  runUpdateRacelist,
  startServer,
};
