const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  // Stub backend POST requests to Google Apps Script endpoints so UI is testable offline.
  await page.route("**/macros/s/**/exec", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ isError: false, message: "OK", responseData: {} }),
    });
  });
});

test("home loads and header menu opens Nápověda", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/PPVCUP 2026/i);

  // Click menu item "Nápověda" (comes from public/userNavItems.json).
  await page.getByRole("link", { name: "Nápověda" }).click();
  await expect(page).toHaveURL(/#\/navody$/);

  await expect(page.getByLabel("Vyhledat v nápovědě")).toBeVisible();
});

test("nápověda search filters blocks", async ({ page }) => {
  await page.goto("/#/navody");

  await expect(
    page.getByRole("heading", { name: "Přihlášení", exact: true })
  ).toBeVisible();
  await page.getByLabel("Vyhledat v nápovědě").fill("reset");

  await expect(
    page.getByRole("heading", {
      name: "Reset hesla (nastavení nového hesla)",
      exact: true,
    })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Přihlášení", exact: true })
  ).toHaveCount(0);
});

test("login page switches to forgot password form", async ({ page }) => {
  await page.goto("/#/login");

  await expect(page.getByRole("heading", { name: /Přihlášení/ })).toBeVisible();
  await page.getByRole("button", { name: "Zapomenuté heslo" }).click();
  await expect(page.getByRole("heading", { name: /Obnovení hesla/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Odeslat odkaz" })).toBeVisible();
});
