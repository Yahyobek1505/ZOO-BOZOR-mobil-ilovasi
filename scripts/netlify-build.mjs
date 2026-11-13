// Netlify build: bundle the API function, then export the Expo web app as static files.
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const shell = process.platform === "win32";
function run(args, env = {}) {
  const r = spawnSync("pnpm", args, { stdio: "inherit", shell, env: { ...process.env, ...env } });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run(["--filter", "@workspace/api-server", "exec", "node", "build.mjs", "--netlify"]);
// Empty domain = the API is on the same site (relative /api/... requests).
run(["--filter", "@workspace/zoo-bozor", "exec", "expo", "export", "--platform", "web", "--clear"], { EXPO_PUBLIC_DOMAIN: "" });

// Expo puts fonts and icons from packages under assets/__node_modules/.pnpm/.../node_modules/...
// Netlify does not deploy `node_modules` or dot folders, so those URLs served index.html and
// every font and icon failed. Rename those path segments and rewrite the references.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../artifacts/zoo-bozor/dist");
const fixSegment = (s) => (s === "__node_modules" ? "vendor" : s === "node_modules" ? "nm" : s.startsWith(".") ? s.slice(1) : s);
const fixPath = (p) => p.split("/").map(fixSegment).join("/");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(dist);
let moved = 0;
for (const file of files) {
  const rel = path.relative(dist, file).split(path.sep).join("/");
  const fixed = fixPath(rel);
  if (fixed === rel) continue;
  mkdirSync(path.dirname(path.join(dist, fixed)), { recursive: true });
  renameSync(file, path.join(dist, fixed));
  moved++;
}
rmSync(path.join(dist, "assets", "__node_modules"), { recursive: true, force: true });

let rewritten = 0;
for (const file of walk(dist).filter((f) => /\.(js|css|html|json)$/.test(f))) {
  const text = readFileSync(file, "utf8");
  const next = text.replace(/\/assets\/[^"'`\s)]+/g, (m) => fixPath(m));
  if (next !== text) { writeFileSync(file, next); rewritten++; }
}
console.log(`netlify-build: moved ${moved} asset files, rewrote ${rewritten} files`);
