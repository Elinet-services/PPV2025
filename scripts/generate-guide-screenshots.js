#!/usr/bin/env node

/**
 * Generates responsive menu screenshots for the in-app Help (/navody) page.
 *
 * Output:
 *   public/img/guides/menu-mobile-collapsed.png
 *   public/img/guides/menu-mobile.png
 *   public/img/guides/menu-tablet-collapsed.png
 *   public/img/guides/menu-tablet.png
 *   public/img/guides/menu-desktop.png
 *
 * Usage:
 *   node scripts/generate-guide-screenshots.js
 *
 * Notes:
 * - Starts `npm run client` if no dev server is running on BASE_URL.
 * - Stores cookie consent in localStorage to avoid the banner in screenshots.
 */

const fs = require("fs");
const path = require("path");
const { spawn, exec } = require("child_process");
const http = require("http");
const https = require("https");
const { chromium } = require("playwright");

const BASE_URL = process.env.GUIDES_BASE_URL || "http://localhost:3000";
const OUT_DIR = path.resolve(__dirname, "../public/img/guides");

function requestOk(urlString) {
  return new Promise((resolve) => {
    let url;
    try {
      url = new URL(urlString);
    } catch {
      resolve(false);
      return;
    }

    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        method: "GET",
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname || "/",
        timeout: 3_000,
      },
      (res) => {
        resolve(Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 400));
        res.resume();
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
    req.end();
  });
}

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await requestOk(url);
    if (ok) return;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 750));
  }
  throw new Error(`Timed out waiting for dev server: ${url}`);
}

function startClientServer() {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  // CRA uses PORT; BROWSER=none prevents opening a browser window.
  const env = { ...process.env, BROWSER: "none", PORT: "3000" };
  return spawn(npmCmd, ["run", "client"], { env, stdio: "inherit" });
}

function stopProcessTree(proc) {
  if (!proc || !proc.pid) return Promise.resolve();

  if (process.platform === "win32") {
    return new Promise((resolve) => {
      exec(`taskkill /PID ${proc.pid} /T /F`, () => resolve());
    });
  }

  return new Promise((resolve) => {
    proc.once("exit", resolve);
    proc.kill("SIGTERM");
    setTimeout(() => {
      try {
        proc.kill("SIGKILL");
      } catch {
        // ignore
      }
      resolve();
    }, 5_000).unref?.();
  });
}

async function screenshotUserMenuMobileCollapsed(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "cs-CZ",
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("ppv_cookie_consent_v1", "necessary");
    } catch {
      // ignore
    }
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  const header = page.locator(".header-container").first();
  await header.waitFor({ state: "visible" });
  await page.locator(".carousel-menu-toggle").waitFor({ state: "visible" });

  await header.screenshot({
    path: path.join(OUT_DIR, "menu-mobile-collapsed.png"),
  });

  await context.close();
}

async function screenshotUserMenuMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "cs-CZ",
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("ppv_cookie_consent_v1", "necessary");
    } catch {
      // ignore
    }
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.locator(".header-container").first().waitFor({ state: "visible" });

  await page.locator(".carousel-menu-toggle").click();
  await page.locator("#carouselNav").waitFor({ state: "visible" });

  // Give MDBCollapse a moment to finish opening animation before clipping.
  await page.waitForTimeout(250);

  await page.locator("#carouselNav").screenshot({
    path: path.join(OUT_DIR, "menu-mobile.png"),
  });

  await context.close();
}

async function screenshotUserMenuTabletCollapsed(browser) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 820 },
    locale: "cs-CZ",
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("ppv_cookie_consent_v1", "necessary");
    } catch {
      // ignore
    }
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  const navbar = page.locator(".header-container .navbar").first();
  await navbar.waitFor({ state: "visible" });

  await navbar.screenshot({
    path: path.join(OUT_DIR, "menu-tablet-collapsed.png"),
  });

  await context.close();
}

async function screenshotUserMenuTablet(browser) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 820 },
    locale: "cs-CZ",
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("ppv_cookie_consent_v1", "necessary");
    } catch {
      // ignore
    }
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.locator(".header-container .navbar").first().waitFor({ state: "visible" });

  await page.locator(".header-container .navbar-toggler").first().click();
  await page.waitForFunction(() => document.getElementById("navbarNav")?.classList.contains("show"));
  await page.waitForTimeout(250);

  await page.locator(".header-container .navbar").first().screenshot({
    path: path.join(OUT_DIR, "menu-tablet.png"),
  });

  await context.close();
}

async function screenshotUserMenuDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 820 },
    locale: "cs-CZ",
    deviceScaleFactor: 2,
  });

  await context.addInitScript(() => {
    try {
      localStorage.setItem("ppv_cookie_consent_v1", "necessary");
    } catch {
      // ignore
    }
  });

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  const navbar = page.locator(".header-container .navbar").first();
  await navbar.waitFor({ state: "visible" });

  // Ensure at least one menu item is in the DOM (desktop shows it without toggling).
  await page.locator(".header-container .navbar .nav-link").first().waitFor({ state: "visible" });

  await navbar.screenshot({
    path: path.join(OUT_DIR, "menu-desktop.png"),
  });

  await context.close();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const serverAlreadyRunning = await requestOk(BASE_URL);
  const serverProc = serverAlreadyRunning ? null : startClientServer();

  try {
    if (!serverAlreadyRunning) {
      await waitForServer(BASE_URL);
    }

    const browser = await chromium.launch({ headless: true });
    try {
      await screenshotUserMenuMobileCollapsed(browser);
      await screenshotUserMenuMobile(browser);
      await screenshotUserMenuTabletCollapsed(browser);
      await screenshotUserMenuTablet(browser);
      await screenshotUserMenuDesktop(browser);
    } finally {
      await browser.close();
    }
  } finally {
    if (serverProc) {
      await stopProcessTree(serverProc);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Guide screenshots generated in: ${OUT_DIR}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
