#!/usr/bin/env node

/**
 * Syncs local "working" Markdown docs to plain .txt mirrors.
 *
 * Why:
 * - `.md` is plain text but offers nicer rendering (headings, tables, checklists).
 * - Some workflows/tools prefer `.txt`, so we keep an auto-generated mirror.
 *
 * Source of truth: the `.md` files.
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");

const DOCS = [
  {
    src: path.join(REPO_ROOT, "backoffice-spec-working.md"),
    dst: path.join(REPO_ROOT, "backoffice-spec-working.txt"),
  },
  {
    src: path.join(REPO_ROOT, "backoffice-rbac-questionnaire-working.md"),
    dst: path.join(REPO_ROOT, "backoffice-rbac-questionnaire-working.txt"),
  },
];

function stripUtf8Bom(buffer) {
  if (!Buffer.isBuffer(buffer)) return buffer;
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3);
  }
  return buffer;
}

function readTextFileMaybe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function syncOne({ src, dst }) {
  if (!fs.existsSync(src)) {
    console.warn(`[sync-working-docs] Missing source: ${path.relative(REPO_ROOT, src)}`);
    return { didWrite: false, reason: "missing-source" };
  }

  const raw = fs.readFileSync(src);
  const content = stripUtf8Bom(raw).toString("utf8");
  const existing = readTextFileMaybe(dst);

  if (existing === content) {
    console.log(`[sync-working-docs] Up to date: ${path.relative(REPO_ROOT, dst)}`);
    return { didWrite: false, reason: "up-to-date" };
  }

  fs.writeFileSync(dst, content, "utf8");
  console.log(
    `[sync-working-docs] Synced: ${path.relative(REPO_ROOT, src)} -> ${path.relative(REPO_ROOT, dst)}`
  );
  return { didWrite: true, reason: "written" };
}

function main() {
  const results = DOCS.map(syncOne);
  const wroteAny = results.some((r) => r.didWrite);
  const missingAny = results.some((r) => r.reason === "missing-source");

  // Exit non-zero only if a declared source is missing.
  if (missingAny) process.exit(1);
  process.exit(wroteAny ? 0 : 0);
}

main();

