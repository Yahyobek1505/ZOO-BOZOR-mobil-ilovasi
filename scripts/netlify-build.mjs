// Netlify build: bundle the API function, then export the Expo web app as static files.
import { spawnSync } from "node:child_process";

const shell = process.platform === "win32";
function run(args, env = {}) {
  const r = spawnSync("pnpm", args, { stdio: "inherit", shell, env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run(["--filter", "@workspace/api-server", "exec", "node", "build.mjs", "--netlify"]);
// Empty domain = the API is on the same site (relative /api/... requests).
run(["--filter", "@workspace/zoo-bozor", "exec", "expo", "export", "--platform", "web", "--clear"], { EXPO_PUBLIC_DOMAIN: "" });
