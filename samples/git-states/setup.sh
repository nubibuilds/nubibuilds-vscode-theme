#!/usr/bin/env bash
# Creates a throwaway Git repository that shows every status the theme colours:
# modified, added, untracked, deleted, renamed, conflicting, ignored, plus
# staged modified / staged deleted.
#
#   bash samples/git-states/setup.sh            # creates samples/git-states/repo
#   bash samples/git-states/setup.sh /some/dir  # creates the repo elsewhere
#
# Then open the created folder in VS Code (File > Open Folder).
# To start over, delete the folder yourself and run the script again.

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$HERE/repo}"

if [ -e "$TARGET" ]; then
  echo "error: $TARGET already exists. Delete it first, then run this script again." >&2
  exit 1
fi

mkdir -p "$TARGET"
cd "$TARGET"

git init --quiet --initial-branch=main
git config user.name "Theme Tester"
git config user.email "theme-tester@example.invalid"
git config commit.gpgsign false

write_module() { # write_module <file> <name> <value>
  cat > "$1" <<EOF
// $2 module
export const NAME = '$2';

export function describe(count: number): string {
  if (count === 0) {
    return 'nothing';
  }
  return \`\${NAME}: \${count}\`;
}

export function total(values: number[]): number {
  return values.reduce((sum, value) => sum + value, $3);
}

export const LIMIT = 100;
EOF
  # Lines unique to this file, so Git's rename detection only pairs the one
  # file that really is renamed.
  local key="${2//[^a-zA-Z]/_}"
  for i in $(seq 1 30); do
    echo "export const ${key}_${i} = '$2 value $i';" >> "$1"
  done
}

# --- initial commit -------------------------------------------------------
write_module unchanged.ts unchanged 0
write_module modified.ts modified 0
write_module deleted.ts deleted 0
write_module rename-me.ts renamed 0
write_module staged-modified.ts staged 0
write_module staged-deleted.ts gone 0
write_module conflict.ts conflict 0
printf 'ignored.log\nbuild/\n' > .gitignore
git add -A
git commit --quiet -m "Initial commit"

# --- conflicting histories ------------------------------------------------
git switch --quiet -c feature
write_module conflict.ts conflict 10
git commit --quiet -am "feature: start totals at 10"

git switch --quiet main
write_module conflict.ts conflict 20
git commit --quiet -am "main: start totals at 20"

# This merge is expected to stop with a conflict in conflict.ts.
git merge feature >/dev/null 2>&1 || true

# --- working tree states --------------------------------------------------
# Modified (unstaged): one changed line, one added block, one deleted line.
cat > modified.ts <<'EOF'
// modified module
export const NAME = 'modified (edited)';

export function describe(count: number): string {
  if (count === 0) {
    return 'nothing';
  }
  return `${NAME}: ${count}`;
}

export function average(values: number[]): number {
  return values.length === 0 ? 0 : total(values) / values.length;
}

export function total(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}
EOF

rm deleted.ts                                   # deleted (unstaged)
git mv rename-me.ts renamed.ts                  # renamed (staged)
write_module staged-modified.ts staged 5
git add staged-modified.ts                      # modified (staged)
git rm --quiet staged-deleted.ts                # deleted (staged)
write_module added.ts added 0
git add added.ts                                # added (staged)
write_module untracked.ts untracked 0           # untracked
echo "this file is ignored" > ignored.log       # ignored
mkdir -p build && echo "// ignored build output" > build/out.js

echo "Created $TARGET"
echo
git status --short --ignored
