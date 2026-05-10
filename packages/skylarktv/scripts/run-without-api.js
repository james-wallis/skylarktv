#!/usr/bin/env node
/* eslint-disable no-console */
// Wraps a child command, temporarily moving src/pages/api out of the tree so
// Next.js does not error on "API Routes cannot be used with output: export"
// while building or dev-serving the electron target. The directory is restored
// on exit (including signals and crashes).
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const apiDir = path.join(root, "src/pages/api");
const stash = path.join(root, ".api-stashed");

const cmd = process.argv[2];
const args = process.argv.slice(3);
if (!cmd) {
  console.error("usage: run-without-api.js <cmd> [args...]");
  process.exit(2);
}

let restored = false;
function restore() {
  if (restored) return;
  restored = true;
  if (fs.existsSync(stash)) {
    fs.renameSync(stash, apiDir);
  }
}
process.on("exit", restore);
process.on("SIGINT", () => {
  restore();
  process.exit(130);
});
process.on("SIGTERM", () => {
  restore();
  process.exit(143);
});
process.on("uncaughtException", (err) => {
  console.error(err);
  restore();
  process.exit(1);
});

if (fs.existsSync(apiDir)) {
  fs.renameSync(apiDir, stash);
}

const child = spawn(cmd, args, { stdio: "inherit", shell: false });
child.on("exit", (code) => {
  restore();
  process.exit(typeof code === "number" ? code : 1);
});
