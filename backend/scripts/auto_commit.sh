#!/usr/bin/env bash
# Auto-commit script for recent backend changes (run from backend/)
set -uo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Running auto-commit sequence in $ROOT_DIR"

commit_or_skip() {
  MSG="$1"
  echo "\nCommit: $MSG"
  git add -A
  if git diff --staged --quiet; then
    echo "No staged changes to commit for: $MSG"
    return 0
  fi
  git commit -m "$MSG" || echo "Commit failed or nothing to commit for: $MSG"
}

commit_or_skip "chore: remove duplicate modules and fix Marshmallow nested schemas"
git add auth.py main.py || true
git commit -m "feat(auth): add JWT user lookup loader and register in main.py" || echo "No changes to commit for auth"
git add models/__init__.py controllers/produce_controller.py || true
git commit -m "feat(listings): add listings relationship to User and paginate produce listings" || echo "No changes to commit for listings pagination"
git add controllers/listing_controller.py || true
git commit -m "feat(listings): require authenticated farmer for create/delete and enforce ownership" || echo "No changes to commit for listing protection"
git add controllers/order_controller.py || true
git commit -m "feat(orders): add pagination and transactional order creation with validation" || echo "No changes to commit for orders"
git add agri-marketplace/client/src/api.js agri-marketplace/client/src/App.jsx || true
git commit -m "feat(client): add API helpers and basic UI to login, fetch paginated orders, and place demo order" || echo "No changes to commit for client"
git add agri-marketplace/client/src/api.js agri-marketplace/client/src/App.jsx || true
git commit -m "feat(client): add produce listing, cart ordering and create-listing UI" || echo "No changes to commit for client produce UI"
git add scripts/seed.py || true
git commit -m "chore(seed): add demo seed script for farmer, buyer and produce" || echo "No changes to commit for seed"

echo "Auto-commit sequence complete. Review with 'git log --oneline'"

echo "If you want to make the script executable: chmod +x scripts/auto_commit.sh"
