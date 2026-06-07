import fs from "node:fs";
import path from "node:path";

function readEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "")];
      }),
  );
}

const fileEnv = readEnvFile();
const getEnv = (name) => (process.env[name] || fileEnv[name] || "").trim();
const requiredUrls = ["VITE_API_URL", "VITE_PUBLIC_WEB_URL"];
const errors = [];

for (const name of requiredUrls) {
  const value = getEnv(name);

  if (!value) {
    errors.push(`${name} is missing`);
    continue;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    errors.push(`${name} is not a valid absolute URL`);
    continue;
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    errors.push(`${name} must use http or https`);
  }

  if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
    errors.push(`${name} points to a local address (${value})`);
  }
}

if (errors.length > 0) {
  console.error("[deploy-env] Production deployment blocked:");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("[deploy-env] Production URLs are configured.");
