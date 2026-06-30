import { existsSync } from "node:fs";

const hasPackageJson = existsSync("package.json");
const hasAppProxy = existsSync("src/proxy.ts");
const hasLegacyMiddleware = existsSync("src/middleware.ts");
const looksLikeSrcRoot = !hasPackageJson && existsSync("proxy.ts");

if (looksLikeSrcRoot) {
  console.error(
    [
      "",
      "Vercel Root Directory is set to \"src\" but package.json is at the repo root.",
      "Fix: Vercel -> Project -> Settings -> General -> Root Directory -> leave EMPTY.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

if (!hasPackageJson || !hasAppProxy) {
  console.error(
    [
      "",
      "Build root is missing package.json or src/proxy.ts.",
      "Expected repo root: C:\\MYWEBSITE (where package.json lives).",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

if (hasLegacyMiddleware) {
  console.error(
    [
      "",
      "Found src/middleware.ts alongside src/proxy.ts.",
      "Next.js 16 requires proxy.ts only. Delete src/middleware.ts.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Vercel root directory check passed.");
