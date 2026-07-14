#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
hook="$repo_root/scripts/ai-quality-gate.sh"
tmp_dir="$(mktemp -d)"
fake_bin="$tmp_dir/bin"
call_log="$tmp_dir/npm-calls.log"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

mkdir -p "$fake_bin"
touch "$call_log"
# shellcheck disable=SC2016 # The generated stub must expand these variables when it runs.
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -euo pipefail' \
  'printf "%s\n" "$*" >> "$QUALITY_GATE_TEST_LOG"' \
  > "$fake_bin/npm"
chmod +x "$fake_bin/npm"

run_hook() {
  local enabled="$1"
  local payload="$2"

  printf '%s' "$payload" | (
    cd "$repo_root"
    PATH="$fake_bin:$PATH" \
      QUALITY_GATE_TEST_LOG="$call_log" \
      AI_QUALITY_HOOKS="$enabled" \
      "$hook"
  )
}

assert_call_count() {
  local expected="$1"
  local actual
  actual="$(wc -l < "$call_log" | tr -d ' ')"

  if [[ "$actual" != "$expected" ]]; then
    printf 'Expected %s lint calls, received %s\n' "$expected" "$actual" >&2
    exit 1
  fi
}

run_hook 0 '{"tool":{"name":"apply_patch"}}'
run_hook 1 'not-json'
run_hook 1 '{"tool":{"name":"exec_command"}}'
assert_call_count 0

run_hook 1 '{"tool":{"name":"apply_patch"}}'
run_hook 1 '{"toolName":"create_file"}'
run_hook 1 '{"tool_name":"apply_patch"}'
run_hook 1 '{"toolId":"edit_notebook_file"}'
run_hook 1 '{"tool":"apply_patch"}'
assert_call_count 5

if grep -Evqx 'run lint' "$call_log"; then
  printf 'Quality hook invoked npm with unexpected arguments.\n' >&2
  exit 1
fi

printf 'AI quality gate tests passed.\n'
