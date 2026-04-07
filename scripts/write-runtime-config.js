const fs = require("node:fs");
const path = require("node:path");

const requiredKeys = ["apiBaseUrl", "apiBaseUrlGet", "domainName"];

function parseArgs(argv) {
  return argv.reduce((acc, arg) => {
    if (!arg.startsWith("--")) return acc;

    const [rawKey, rawValue] = arg.slice(2).split("=");
    const key = rawKey.trim();
    const value = rawValue ?? "";

    acc[key] = value;
    return acc;
  }, {});
}

function resolveConfig(profile, overrides) {
  if (profile) {
    const profilePath = path.resolve(__dirname, "..", "config", "runtime", `${profile}.json`);
    if (!fs.existsSync(profilePath)) {
      throw new Error(`Unknown runtime profile "${profile}". Expected file ${profilePath}`);
    }

    const config = JSON.parse(fs.readFileSync(profilePath, "utf8"));
    return { ...config, ...overrides };
  }

  return overrides;
}

function validateConfig(config) {
  const missing = requiredKeys.filter((key) => !String(config[key] || "").trim());
  if (missing.length > 0) {
    throw new Error(`Missing runtime config values: ${missing.join(", ")}`);
  }
}

function toPayload(config) {
  return [
    { apiBaseUrl: config.apiBaseUrl },
    { apiBaseUrlGet: config.apiBaseUrlGet },
    { domainName: config.domainName },
  ];
}

const args = parseArgs(process.argv.slice(2));
const profile = args.profile || process.env.PPV_RUNTIME_PROFILE || "";
const targetPath = path.resolve(
  process.cwd(),
  args.target || process.env.PPV_RUNTIME_TARGET || "build/configuration.json"
);

const overrides = {
  apiBaseUrl: args.apiBaseUrl || process.env.PPV_API_BASE_URL,
  apiBaseUrlGet: args.apiBaseUrlGet || process.env.PPV_API_BASE_URL_GET,
  domainName: args.domainName || process.env.PPV_DOMAIN_NAME,
};

const runtimeConfig = resolveConfig(
  profile,
  Object.fromEntries(Object.entries(overrides).filter(([, value]) => String(value || "").trim()))
);

validateConfig(runtimeConfig);

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, `${JSON.stringify(toPayload(runtimeConfig), null, 2)}\n`, "utf8");

console.log(`Runtime config written to ${targetPath}`);
