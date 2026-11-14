#!/usr/bin/env bash
# Prints the 16 ANSI colours (as text and as backgrounds), sample log lines
# and a `git status`-style block. Run it in the VS Code integrated terminal:
#
#   bash samples/ansi.sh

set -u
ESC=$'\033'
RESET="${ESC}[0m"
NAMES=(Black Red Green Yellow Blue Magenta Cyan White)

echo "== Foreground: normal (30-37) and bright (90-97) =="
for i in 0 1 2 3 4 5 6 7; do
  printf '%s[3%dm%-10s%s  %s[9%dmBright %-10s%s\n' \
    "$ESC" "$i" "${NAMES[$i]}" "$RESET" "$ESC" "$i" "${NAMES[$i]}" "$RESET"
done

echo
echo "== Background: normal (40-47) and bright (100-107), default text =="
for i in 0 1 2 3 4 5 6 7; do
  printf '%s[4%dm  %-10s%s  %s[10%dm  Bright %-10s%s\n' \
    "$ESC" "$i" "${NAMES[$i]}" "$RESET" "$ESC" "$i" "${NAMES[$i]}" "$RESET"
done

echo
echo "== Black text on each background =="
for i in 1 2 3 4 5 6 7; do
  printf '%s[30;4%dm %-8s %s' "$ESC" "$i" "${NAMES[$i]}" "$RESET"
done
echo

echo
echo "== Text attributes =="
printf '%s[1mbold%s  %s[2mdim%s  %s[3mitalic%s  %s[4munderline%s  %s[7minverse%s  %s[9mstrikethrough%s\n' \
  "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET"

echo
echo "== Log output =="
printf '%s[90m2026-11-14 08:30:01%s %s[32mINFO %s server listening on %s[36mhttp://localhost:8080%s\n' "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET"
printf '%s[90m2026-11-14 08:30:02%s %s[34mDEBUG%s cache warmed in %s[35m42ms%s\n' "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET"
printf '%s[90m2026-11-14 08:30:05%s %s[33mWARN %s retrying request (attempt 2/3)\n' "$ESC" "$RESET" "$ESC" "$RESET"
printf '%s[90m2026-11-14 08:30:09%s %s[31mERROR%s connection refused: %s[1;31mECONNREFUSED%s 127.0.0.1:5432\n' "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET"
printf '%s[90m2026-11-14 08:30:09%s %s[41;97m FATAL %s shutting down\n' "$ESC" "$RESET" "$ESC" "$RESET"
printf '%s[92m✔%s 128 passed  %s[91m✖%s 2 failed  %s[93m○%s 5 skipped\n' "$ESC" "$RESET" "$ESC" "$RESET" "$ESC" "$RESET"

echo
echo "== git status =="
cat <<EOF
On branch ${ESC}[36mmain${RESET}
Changes to be committed:
	${ESC}[32mnew file:   src/palette.ts${RESET}
	${ESC}[32mrenamed:    src/old.ts -> src/new.ts${RESET}

Changes not staged for commit:
	${ESC}[31mmodified:   README.md${RESET}
	${ESC}[31mdeleted:    src/legacy.ts${RESET}

Untracked files:
	${ESC}[31mnotes.txt${RESET}

${ESC}[33mcommit 4f9c2ab${RESET} ${ESC}[1;36m(HEAD -> main)${RESET}
${ESC}[32m+ const alpha = 0.15;${RESET}
${ESC}[31m- const alpha = 0.22;${RESET}
${ESC}[36m@@ -12,7 +12,7 @@${RESET}
EOF
