// Build ID for in-fini.com: a hash of the source that ships, so a scheduled
// check can tell whether the live site matches `main` (see
// .github/workflows/live-drift.yml). It hashes file paths and contents,
// never dependencies or timestamps, so the same commit gives the same ID
// in CI, locally and in Bolt's build. Tests are excluded: a test-only
// commit changes nothing users see. OS junk (.DS_Store, Thumbs.db) is
// skipped, but other dotfiles ship (Vite copies public/.well-known/…) and
// are hashed. Text files are hashed with CRLF turned into LF at the byte
// level (no decoding, so nothing else can collide); every other file is
// hashed raw. So an OS or checkout setting cannot raise a false alarm.
// Dependency versions (package-lock.json) are deliberately outside it.
//
//   node scripts/build-id.mjs            -> prints the ID for this checkout

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const TOP_FILES = [
  "index.html",
  "package.json",
  "vite.config.ts",
  "tailwind.config.js",
  "postcss.config.js",
];
const TREES = ["src", "public"];
const EXCLUDE = /\.test\.[cm]?[jt]sx?$/;
const OS_JUNK = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const TEXT = /\.(?:[cm]?[jt]sx?|css|html?|svg|json|txt|md|xml|webmanifest|ya?ml)$/i;

/** CRLF -> LF on raw bytes: lossless for everything except the CR itself. */
function lfBytes(buf) {
  const out = Buffer.allocUnsafe(buf.length);
  let n = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0d && buf[i + 1] === 0x0a) continue;
    out[n++] = buf[i];
  }
  return out.subarray(0, n);
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (OS_JUNK.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export function listBuildInputs(root) {
  const files = [];
  for (const f of TOP_FILES) if (existsSync(join(root, f))) files.push(join(root, f));
  for (const t of TREES) if (existsSync(join(root, t))) walk(join(root, t), files);
  return files
    .map((p) => relative(root, p).split(sep).join("/"))
    .filter((rel) => !EXCLUDE.test(rel))
    .sort();
}

export function computeBuildId(root) {
  const hash = createHash("sha256");
  for (const rel of listBuildInputs(root)) {
    hash.update(rel);
    hash.update("\0");
    const bytes = readFileSync(join(root, rel));
    hash.update(TEXT.test(rel) ? lfBytes(bytes) : bytes);
    hash.update("\0");
  }
  return hash.digest("hex").slice(0, 12);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.stdout.write(computeBuildId(process.cwd()) + "\n");
}
