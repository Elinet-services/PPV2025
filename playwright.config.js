/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: "e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1200, height: 800 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
};

module.exports = config;
