#!/usr/bin/env bash
# scripts/pre-push-e2e.sh
#
# Runs the Playwright E2E suite locally before a push reaches GitHub Actions.
# This catches the same failures that the CI job reports, without waiting for
# a full remote run.
#
# Install into the repo once:
#   cp scripts/pre-push-e2e.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push
#
# Skip for a single push (e.g. WIP):
#   E2E_SKIP=1 git push

set -euo pipefail

# Honour the escape hatch.
if [[ "${E2E_SKIP:-0}" == "1" ]]; then
  echo "⏭  E2E pre-push check skipped (E2E_SKIP=1)."
  exit 0
fi

# Only block pushes that target the protected branches.
protected_branches=(main dev)
while read -r _local_ref _local_sha remote_ref _remote_sha; do
  branch="${remote_ref#refs/heads/}"
  match=0
  for b in "${protected_branches[@]}"; do
    [[ "$branch" == "$b" ]] && match=1 && break
  done
  if [[ "$match" -eq 0 ]]; then
    continue
  fi

  echo "🎭 Running Playwright E2E tests before push to '$branch'…"

  # The suite expects a production build and starts a fresh server on port 3100
  # by default. Set PORT for a different local port, or explicitly provide
  # PLAYWRIGHT_TEST_BASE_URL to target an existing server.
  if ! npm run test:e2e; then
    echo ""
    echo "❌  E2E tests failed. Push aborted."
    echo "   Fix the failures or bypass with: E2E_SKIP=1 git push"
    exit 1
  fi

  echo "✅  E2E tests passed."
done

exit 0
