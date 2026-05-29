#!/usr/bin/env node

const { spawn } = require("node:child_process");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  process.stdout.write(
    [
      "Usage: node gitfixauth.js <git args...>",
      "",
      "Examples:",
      "  node gitfixauth.js status",
      "  node gitfixauth.js push origin worktree-HashBrownHub",
      "  node gitfixauth.js ls-remote origin HEAD",
    ].join("\n") + "\n",
  );
  process.exit(0);
}

const env = { ...process.env };

for (const key of Object.keys(env)) {
  if (
    key === "GIT_ASKPASS" ||
    key === "SSH_ASKPASS" ||
    key === "VSCODE_GIT_IPC_HANDLE" ||
    key.startsWith("VSCODE_GIT_ASKPASS")
  ) {
    delete env[key];
  }
}

const child = spawn("git", args, {
  stdio: "inherit",
  env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`Failed to launch git: ${error.message}`);
  process.exit(1);
});
