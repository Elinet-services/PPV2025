#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.resolve(__dirname, "../src/locales");
const TRANSLATION_FILE = "translation.json";
const FALLBACK_LOCALE = "cs";
const MAX_KEYS_IN_OUTPUT = 20;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function flattenLeaves(node, prefix = "", output = {}) {
  if (isPlainObject(node)) {
    for (const [key, value] of Object.entries(node)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenLeaves(value, nextPrefix, output);
    }
    return output;
  }

  output[prefix] = node;
  return output;
}

function loadLocaleData() {
  const locales = [];
  const localeData = {};

  if (!fs.existsSync(LOCALES_DIR)) {
    throw new Error(`Locale directory not found: ${LOCALES_DIR}`);
  }

  const candidates = fs
    .readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const locale of candidates) {
    const filePath = path.join(LOCALES_DIR, locale, TRANSLATION_FILE);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
    }

    locales.push(locale);
    localeData[locale] = {
      raw: parsed,
      flat: flattenLeaves(parsed),
      filePath,
    };
  }

  return { locales, localeData };
}

function toSortedArray(setLike) {
  return Array.from(setLike).sort((a, b) => a.localeCompare(b));
}

function printKeyList(label, keys) {
  if (keys.length === 0) return;

  const preview = keys.slice(0, MAX_KEYS_IN_OUTPUT);
  const suffix =
    keys.length > MAX_KEYS_IN_OUTPUT
      ? ` (+${keys.length - MAX_KEYS_IN_OUTPUT} more)`
      : "";
  console.error(`  - ${label}: ${preview.join(", ")}${suffix}`);
}

function main() {
  const { locales, localeData } = loadLocaleData();

  if (locales.length === 0) {
    console.error(`No locale files found in ${LOCALES_DIR}`);
    process.exit(1);
  }

  if (!localeData[FALLBACK_LOCALE]) {
    console.error(
      `Fallback locale "${FALLBACK_LOCALE}" not found. Existing locales: ${locales.join(", ")}`
    );
    process.exit(1);
  }

  const fallbackKeys = new Set(Object.keys(localeData[FALLBACK_LOCALE].flat));
  const unionKeys = new Set(fallbackKeys);
  const issues = [];

  for (const locale of locales) {
    const keys = Object.keys(localeData[locale].flat);
    for (const key of keys) unionKeys.add(key);
  }

  for (const locale of locales) {
    if (locale === FALLBACK_LOCALE) continue;

    const flat = localeData[locale].flat;
    const localeKeys = new Set(Object.keys(flat));
    const missingKeys = toSortedArray(
      [...fallbackKeys].filter((key) => !localeKeys.has(key))
    );
    const extraKeys = toSortedArray(
      [...localeKeys].filter((key) => !fallbackKeys.has(key))
    );
    const typeMismatches = [];

    for (const key of fallbackKeys) {
      if (!(key in flat)) continue;
      const fallbackType = typeof localeData[FALLBACK_LOCALE].flat[key];
      const localeType = typeof flat[key];
      if (fallbackType !== localeType) {
        typeMismatches.push(
          `${key} (fallback: ${fallbackType}, ${locale}: ${localeType})`
        );
      }
    }

    if (missingKeys.length || extraKeys.length || typeMismatches.length) {
      issues.push({ locale, missingKeys, extraKeys, typeMismatches });
    }
  }

  const fallbackMissingFromUnion = toSortedArray(
    [...unionKeys].filter((key) => !fallbackKeys.has(key))
  );

  if (fallbackMissingFromUnion.length) {
    issues.push({
      locale: FALLBACK_LOCALE,
      fallbackCoverage: fallbackMissingFromUnion,
    });
  }

  if (issues.length > 0) {
    console.error("i18n consistency check failed:");
    for (const issue of issues) {
      console.error(`\nLocale: ${issue.locale}`);
      printKeyList("Missing keys", issue.missingKeys || []);
      printKeyList("Extra keys", issue.extraKeys || []);
      printKeyList("Type mismatches", issue.typeMismatches || []);
      printKeyList(
        "Fallback is missing keys used in other locales",
        issue.fallbackCoverage || []
      );
    }
    process.exit(1);
  }

  console.log(
    `i18n consistency check passed for locales: ${locales.join(", ")} (fallback: ${FALLBACK_LOCALE})`
  );
}

main();
