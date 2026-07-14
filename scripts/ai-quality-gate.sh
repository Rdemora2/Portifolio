#!/usr/bin/env bash
set -euo pipefail

payload="$(cat || true)"

if [[ "${AI_QUALITY_HOOKS:-0}" != "1" ]]; then
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  exit 0
fi

tool_name="$(printf '%s' "$payload" | node -e '
const fs = require("fs");
const raw = fs.readFileSync(0, "utf8");
if (!raw) process.exit(0);
let data;
try {
  data = JSON.parse(raw);
} catch {
  process.exit(0);
}
const nestedName =
  data.tool && typeof data.tool === "object" ? data.tool.name : undefined;
const directTool = typeof data.tool === "string" ? data.tool : undefined;
const name = [
  nestedName,
  data.toolName,
  data.tool_name,
  data.toolId,
  directTool,
].find(
  (candidate) => typeof candidate === "string",
);
if (name) process.stdout.write(name);
'
)"

case "$tool_name" in
  apply_patch|create_file|edit_notebook_file)
    ;;
  *)
    exit 0
    ;;
esac

if ! command -v npm >/dev/null 2>&1; then
  exit 0
fi

if [[ ! -f package.json ]]; then
  exit 0
fi

if node - <<'NODE'
const pkg = require("./package.json");
if (!pkg.scripts || !pkg.scripts.lint) process.exit(1);
NODE
then
  npm run lint
fi
