const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DEFAULT_DOMAIN = "ppvcup2026";
const DATA_DIR = path.join(__dirname, ".dev-data");
const DATA_FILE = path.join(DATA_DIR, "jirka-dev-db.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const OUTBOX_DIR = path.join(DATA_DIR, "outbox");
const FRONTEND_ORIGIN = "http://localhost:3000";
const ADMIN_EMAIL = "jiri.janda@elinet.cz";
const ADMIN_PASSWORD_HASH = "36ff68cc586c55fde9fe0bff633eeb3c147e66215e7c758f359c41104437d983";
const DEFAULT_USER_RIGHTS = ["edit", "changepassword", "logout", "getuserdata", "registration"];
const DEFAULT_ADMIN_RIGHTS = [
  ...DEFAULT_USER_RIGHTS,
  "notelist",
  "savenote",
  "savedocument",
  "documentmanagement",
  "racermanagement",
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isoNow() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function hexEncode(value) {
  return Buffer.from(String(value || ""), "utf8").toString("hex");
}

function createInitialDb() {
  const now = isoNow();

  return {
    meta: {
      createdAt: now,
      updatedAt: now,
      currentRace: DEFAULT_DOMAIN,
      sessionTimeoutMinutes: 1200,
      resetPasswordTimeoutMinutes: 60,
    },
    races: {
      [DEFAULT_DOMAIN]: {
        raceName: "PPV Cup 2026",
        applicationDeadline: "2026-09-30",
      },
    },
    users: [
      {
        id: makeId("user"),
        email: ADMIN_EMAIL,
        passwordHash: ADMIN_PASSWORD_HASH,
        rights: DEFAULT_ADMIN_RIGHTS,
        role: "A",
        loginToken: "",
        registeredAt: now,
        resetPasswordHash: "",
        resetPasswordAt: "",
        parameters: {
          [DEFAULT_DOMAIN]: {
            name: "Jiri",
            surname: "Janda",
            email: ADMIN_EMAIL,
            phone: "+420000000000",
            club: "ELINET",
            glider: "",
            imatriculation: "",
            startCode: "JJ",
            gliderClass: "club",
            deviceType1: "",
            deviceId1: "",
            deviceType2: "",
            deviceId2: "",
            status: "A",
            paymentDate: now,
          },
        },
      },
    ],
    notes: [
      {
        id: makeId("note"),
        rowNr: 1,
        date: now,
        header: "Jirka DEV environment",
        bodyText: encodeURIComponent("<p>Lokální DEV API běží nad neprodukčními daty.</p>"),
        published: true,
      },
    ],
    documents: [],
  };
}

function ensureDb() {
  ensureDir(DATA_DIR);
  ensureDir(UPLOAD_DIR);
  ensureDir(OUTBOX_DIR);

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, `${JSON.stringify(createInitialDb(), null, 2)}\n`, "utf8");
  }
}

function loadDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveDb(db) {
  db.meta = {
    ...db.meta,
    updatedAt: isoNow(),
  };
  ensureDb();
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

function findUserByEmail(db, email) {
  const normalizedEmail = normalizeEmail(email);
  return db.users.find((user) => normalizeEmail(user.email) === normalizedEmail);
}

function findUserByToken(db, token) {
  return db.users.find((user) => user.loginToken && user.loginToken === token);
}

function findUserByResetHash(db, token) {
  return db.users.find((user) => user.resetPasswordHash && user.resetPasswordHash === token);
}

function getRaceList(db) {
  return db.races || {};
}

function getUserParametersForDomain(user, domain) {
  return user?.parameters?.[domain] || null;
}

function getAllUserParameters(user) {
  return user?.parameters || {};
}

function toPublishedFlag(value) {
  return value ? "TRUE" : "FALSE";
}

function toNoteDto(note) {
  return {
    rowNr: Number(note.rowNr || 0),
    date: note.date,
    header: note.header,
    bodyText: note.bodyText,
    published: toPublishedFlag(note.published),
  };
}

function getAdminNotesPayload(db) {
  return {
    notesArray: db.notes
      .slice()
      .sort((a, b) => Number(a.rowNr || 0) - Number(b.rowNr || 0))
      .map(toNoteDto),
  };
}

function getPublicNotes(db) {
  return db.notes
    .filter((note) => note.published)
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(toNoteDto);
}

function getPublicDocuments(db) {
  return db.documents
    .filter((doc) => doc.published)
    .slice()
    .sort((a, b) => new Date(b.dateInserted) - new Date(a.dateInserted));
}

function toRacerDto(user, domain) {
  const params = getUserParametersForDomain(user, domain);
  if (!params || params.status === "D") return null;

  return {
    name: params.name || "",
    surname: params.surname || "",
    club: params.club || "",
    glider: params.glider || "",
    imatriculation: params.imatriculation || "",
    startCode: params.startCode || "",
    gliderClass: params.gliderClass || "club",
    paymentDate: params.paymentDate || "",
  };
}

function getRacerList(db, domain) {
  return db.users.map((user) => toRacerDto(user, domain)).filter(Boolean);
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  return String(value || "").toLowerCase() === "true";
}

function parseRequestBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function sendBaseResponse(res, status, message, isError, responseData = {}) {
  res.status(status).json({ message, isError, responseData });
}

function sendGetResponse(res, status, payload) {
  res.status(status).json(payload);
}

function requireUserByToken(db, token) {
  const user = findUserByToken(db, token);
  if (!user) {
    const error = new Error("Session not found.");
    error.status = 401;
    throw error;
  }
  return user;
}

function createSessionForUser(user) {
  user.loginToken = makeId("token");
  return user.loginToken;
}

function createResetTokenForUser(user) {
  user.resetPasswordHash = makeId("reset");
  user.resetPasswordAt = isoNow();
  return `${user.resetPasswordHash}g${hexEncode(user.email)}`;
}

function createRegistrationTokenForUser(user) {
  user.resetPasswordHash = makeId("register");
  user.resetPasswordAt = isoNow();
  return user.resetPasswordHash;
}

function createLocalDownloadUrl(documentId) {
  return `${FRONTEND_ORIGIN.replace(":3000", ":3001")}/dev-api/file/${documentId}`;
}

function createLocalAppUrl(pathnameWithHash) {
  return `${FRONTEND_ORIGIN}${pathnameWithHash}`;
}

function writeOutboxMail({ type, to, subject, html, meta = {} }) {
  ensureDir(OUTBOX_DIR);
  const id = `${Date.now()}-${crypto.randomUUID()}`;
  const payload = {
    id,
    type,
    to,
    subject,
    html,
    meta,
    createdAt: isoNow(),
  };

  fs.writeFileSync(path.join(OUTBOX_DIR, `${id}.json`), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(OUTBOX_DIR, `${id}.html`), html, "utf8");
  return payload;
}

function listOutbox() {
  ensureDir(OUTBOX_DIR);
  return fs
    .readdirSync(OUTBOX_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(OUTBOX_DIR, file), "utf8")))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createRegistrationEmailPreview(user, domain, registerToken) {
  const race = getRaceList(loadDb())[domain] || {};
  const confirmationUrl = createLocalAppUrl(`/#/?registrationsubmittoken=${registerToken}`);
  return writeOutboxMail({
    type: "registration-confirmation",
    to: user.email,
    subject: "[DEV] Potvrzení emailu pro registraci",
    meta: { registerToken, confirmationUrl, domain },
    html: `<!doctype html>
<html lang="cs">
  <head><meta charset="utf-8"><title>DEV potvrzení registrace</title></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h3>DEV potvrzení registrace</h3>
    <p>Pro registraci do prostředí <b>DEV</b> pro závod <b>${escapeHtml(race.raceName || domain)}</b> potvrďte email kliknutím na odkaz níže.</p>
    <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
    <p>Tento mail je vygenerovaný lokálně v outboxu, neposílá se do produkce.</p>
  </body>
</html>`,
  });
}

function createResetEmailPreview(user, resetToken, domain) {
  const resetUrl = createLocalAppUrl(`/#/resetpassword?resetToken=${resetToken}`);
  return writeOutboxMail({
    type: "password-reset",
    to: user.email,
    subject: "[DEV] Reset hesla",
    meta: { resetToken, resetUrl, domain },
    html: `<!doctype html>
<html lang="cs">
  <head><meta charset="utf-8"><title>DEV reset hesla</title></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h3>DEV reset hesla</h3>
    <p>Pro prostředí <b>DEV</b> si nastav nové heslo přes odkaz:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Tento mail je vygenerovaný lokálně v outboxu, neposílá se do produkce.</p>
  </body>
</html>`,
  });
}

function buildBackofficeHtml(title, description) {
  return `<!doctype html>
<html lang="cs">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; background: #f4f6f8; color: #1f2933; }
      main { max-width: 720px; margin: 0 auto; background: white; padding: 24px 28px; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
      h1 { margin-top: 0; }
      p { line-height: 1.6; }
      a { color: #0b6efd; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <p>V lokálním <code>jirka-dev</code> běží data přes Node proxy. Pro běžnou práci používej React stránky na <a href="${FRONTEND_ORIGIN}">${FRONTEND_ORIGIN}</a>.</p>
    </main>
  </body>
</html>`;
}

function registerCors(app) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });
}

function expressTextFallback(req, res, next) {
  if (req.method !== "POST") {
    next();
    return;
  }

  let body = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 25 * 1024 * 1024) req.destroy();
  });
  req.on("end", () => {
    req.rawBody = body;
    next();
  });
  req.on("error", next);
}

function registerLocalDevRoutes(app) {
  registerCors(app);
  app.use(expressTextFallback);

  app.get("/dev-api/get", (req, res) => {
    const db = loadDb();
    const action = String(req.query.action || "").trim().toLowerCase();
    const domain = String(req.query.domain || db.meta.currentRace || DEFAULT_DOMAIN).trim().toLowerCase();

    if (!action) {
      sendGetResponse(res, 400, { ok: false, error: "missing_action" });
      return;
    }

    if (!domain) {
      sendGetResponse(res, 400, { ok: false, error: "missing_domain" });
      return;
    }

    if (action === "notes") {
      const notes = getPublicNotes(db);
      sendGetResponse(res, 200, { ok: true, action, domain, count: notes.length, data: notes });
      return;
    }

    if (action === "documentlist") {
      const documents = getPublicDocuments(db);
      sendGetResponse(res, 200, { ok: true, action, domain, count: documents.length, data: documents });
      return;
    }

    if (action === "racerlist") {
      const racers = getRacerList(db, domain);
      sendGetResponse(res, 200, { ok: true, action, domain, count: racers.length, data: racers });
      return;
    }

    if (action === "racermanagement") {
      res.status(200).type("html").send(buildBackofficeHtml("Správa závodníků", "Lokální DEV běží přes React route /backoffice/racerlist."));
      return;
    }

    if (action === "documentmanagement") {
      res.status(200).type("html").send(buildBackofficeHtml("Správa dokumentů", "Lokální DEV běží přes React route /documents a lokální dev API."));
      return;
    }

    sendGetResponse(res, 400, { ok: false, error: "unsupported_action", action });
  });

  app.get("/dev-api/file/:documentId", (req, res) => {
    const db = loadDb();
    const document = db.documents.find((item) => item.id === req.params.documentId);

    if (!document || !document.localPath || !fs.existsSync(document.localPath)) {
      res.status(404).json({ success: false, message: "Soubor nenalezen." });
      return;
    }

    res.download(document.localPath, document.filename || path.basename(document.localPath));
  });

  app.get("/dev-api/outbox", (req, res) => {
    sendGetResponse(res, 200, { ok: true, count: listOutbox().length, data: listOutbox() });
  });

  app.post("/dev-api/base", (req, res) => {
    const db = loadDb();
    const payload = parseRequestBody(req.rawBody);
    const action = String(payload.action || "").trim().toLowerCase();
    const domain = String(payload.domain || db.meta.currentRace || DEFAULT_DOMAIN).trim().toLowerCase();

    try {
      if (!action) {
        sendBaseResponse(res, 400, "Missing action.", true);
        return;
      }

      if (action === "checkemail") {
        sendBaseResponse(res, 200, "", false, { emailExists: Boolean(findUserByEmail(db, payload.email)) });
        return;
      }

      if (action === "registration") {
        const email = normalizeEmail(payload.email);
        if (!email || !payload.password) {
          sendBaseResponse(res, 400, "Missing registration data.", true);
          return;
        }

        let user = findUserByEmail(db, email);
        if (!user) {
          user = {
            id: makeId("user"),
            email,
            passwordHash: payload.password,
            rights: [...DEFAULT_USER_RIGHTS],
            role: "U",
            loginToken: "",
            registeredAt: "",
            resetPasswordHash: "",
            resetPasswordAt: "",
            parameters: {},
          };
          db.users.push(user);
        }

        user.passwordHash = payload.password || user.passwordHash;
        const registerToken = createRegistrationTokenForUser(user);
        user.parameters[domain] = {
          ...user.parameters[domain],
          ...payload,
          email,
          status: "A",
          paymentDate: user.parameters[domain]?.paymentDate || "",
        };
        delete user.parameters[domain].token;
        delete user.parameters[domain].source;
        delete user.parameters[domain].action;
        delete user.parameters[domain].password;
        delete user.parameters[domain].rePassword;
        delete user.parameters[domain].domain;

        saveDb(db);
        const outboxEntry = createRegistrationEmailPreview(user, domain, registerToken);
        sendBaseResponse(res, 200, "", false, { outboxId: outboxEntry.id, confirmationUrl: outboxEntry.meta.confirmationUrl });
        return;
      }

      if (action === "login") {
        const user = findUserByEmail(db, payload.email);
        if (!user || user.passwordHash !== payload.password) {
          sendBaseResponse(res, 401, "Neplatný e-mail nebo heslo.", true);
          return;
        }
        if (!user.registeredAt) {
          sendBaseResponse(res, 403, "Registrace ještě nebyla potvrzena přes email.", true);
          return;
        }

        const currentDomain = user.parameters[domain] ? domain : Object.keys(user.parameters)[0] || domain;
        const params = user.parameters[currentDomain] || {};
        const token = createSessionForUser(user);
        saveDb(db);

        sendBaseResponse(res, 200, "", false, {
          loginToken: token,
          email: user.email,
          rights: user.rights,
          role: user.role,
          userName: `${params.name || ""} ${params.surname || ""}`.trim() || user.email,
        });
        return;
      }

      if (action === "getuserdata") {
        const user = requireUserByToken(db, payload.token);
        sendBaseResponse(res, 200, "", false, {
          userParameters: getAllUserParameters(user),
          raceList: getRaceList(db),
          email: user.email,
        });
        return;
      }

      if (action === "logout") {
        const user = requireUserByToken(db, payload.token);
        user.loginToken = "";
        saveDb(db);
        sendBaseResponse(res, 200, "", false, {});
        return;
      }

      if (action === "edit") {
        const user = requireUserByToken(db, payload.token);
        user.parameters[domain] = {
          ...user.parameters[domain],
          ...payload,
          email: user.email,
        };
        delete user.parameters[domain].token;
        delete user.parameters[domain].source;
        delete user.parameters[domain].action;
        delete user.parameters[domain].password;
        delete user.parameters[domain].rePassword;
        delete user.parameters[domain].domain;
        saveDb(db);
        sendBaseResponse(res, 200, "", false, {});
        return;
      }

      if (action === "forgotpassword") {
        const user = findUserByEmail(db, payload.email);
        if (user) {
          const resetToken = createResetTokenForUser(user);
          saveDb(db);
          const outboxEntry = createResetEmailPreview(user, resetToken, domain);
          sendBaseResponse(res, 200, "", false, { resetToken, outboxId: outboxEntry.id, resetUrl: outboxEntry.meta.resetUrl });
          return;
        }

        sendBaseResponse(res, 200, "", false, {});
        return;
      }

      if (action === "resetpassword") {
        const user = findUserByResetHash(db, payload.token);
        if (!user) {
          sendBaseResponse(res, 404, "Reset token nebyl nalezen.", true);
          return;
        }

        user.passwordHash = payload.password;
        user.resetPasswordHash = "";
        user.resetPasswordAt = "";
        saveDb(db);
        sendBaseResponse(res, 200, "", false, {});
        return;
      }

      if (action === "changepassword") {
        const user = requireUserByToken(db, payload.token);
        if (user.passwordHash !== payload.oldPassword) {
          sendBaseResponse(res, 400, "Původní heslo nesouhlasí.", true);
          return;
        }

        user.passwordHash = payload.password;
        saveDb(db);
        sendBaseResponse(res, 200, "", false, {});
        return;
      }

      if (action === "registrationsubmit") {
        const user = findUserByResetHash(db, payload.token);
        if (!user) {
          sendBaseResponse(res, 404, "Potvrzovací token nebyl nalezen.", true);
          return;
        }

        user.registeredAt = isoNow();
        user.resetPasswordHash = "";
        user.resetPasswordAt = "";
        saveDb(db);
        sendBaseResponse(res, 200, "", false, {});
        return;
      }

      if (action === "notelist") {
        requireUserByToken(db, payload.token);
        sendBaseResponse(res, 200, "", false, JSON.stringify(getAdminNotesPayload(db)));
        return;
      }

      if (action === "savenote") {
        requireUserByToken(db, payload.token);

        if (Number(payload.rowNr) > 0) {
          const existing = db.notes.find((note) => Number(note.rowNr) === Number(payload.rowNr));
          if (!existing) {
            sendBaseResponse(res, 404, "Poznámka nebyla nalezena.", true);
            return;
          }

          existing.header = payload.description || "";
          existing.bodyText = payload.message || "";
          existing.published = parseBoolean(payload.published);
          existing.date = isoNow();
        } else {
          db.notes.push({
            id: makeId("note"),
            rowNr: (db.notes.reduce((max, note) => Math.max(max, Number(note.rowNr || 0)), 0) || 0) + 1,
            date: isoNow(),
            header: payload.description || "",
            bodyText: payload.message || "",
            published: parseBoolean(payload.published),
          });
        }

        saveDb(db);
        sendBaseResponse(res, 200, "", false, JSON.stringify(getAdminNotesPayload(db)));
        return;
      }

      if (action === "savedocument") {
        requireUserByToken(db, payload.token);

        const documentId = payload.row ? String(payload.row) : makeId("doc");
        let localPath = "";
        const filename = payload.filename || "document.bin";

        if (payload.fileBase64) {
          const cleanBase64 = String(payload.fileBase64).includes(",")
            ? String(payload.fileBase64).split(",").pop()
            : String(payload.fileBase64);
          localPath = path.join(UPLOAD_DIR, `${documentId}-${filename}`);
          fs.writeFileSync(localPath, Buffer.from(cleanBase64, "base64"));
        }

        const existing = db.documents.find((doc) => doc.id === documentId);
        const nextDocument = {
          id: documentId,
          row: documentId,
          filename,
          fileId: documentId,
          docName: payload.docName || filename,
          description: payload.description || "",
          published: parseBoolean(payload.published),
          dateInserted: existing?.dateInserted || isoNow(),
          localPath: localPath || existing?.localPath || "",
          downloadUrl: createLocalDownloadUrl(documentId),
        };

        if (existing) Object.assign(existing, nextDocument);
        else db.documents.push(nextDocument);

        saveDb(db);
        sendBaseResponse(res, 200, "", false, {
          ok: true,
          saved: nextDocument,
          documentList: getPublicDocuments(db),
        });
        return;
      }

      sendBaseResponse(res, 400, `Unsupported action "${action}".`, true);
    } catch (error) {
      const status = Number.isInteger(error.status) ? error.status : 500;
      sendBaseResponse(res, status, error.message || "Lokální DEV API chyba.", true);
    }
  });
}

module.exports = {
  registerLocalDevRoutes,
};
