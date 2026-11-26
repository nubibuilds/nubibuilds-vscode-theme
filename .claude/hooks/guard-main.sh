#!/usr/bin/env bash
# PreToolUse hook (Bash): stop Claude from pushing to main, force pushing,
# deleting remote branches, or changing GitHub branch protection.
# Everything to main goes through a pull request; see .github/rulesets/main.json.

input=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
cwd=$(jq -r '.cwd // empty' <<<"$input")
[ -z "$cmd" ] && exit 0

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput: {hookEventName: "PreToolUse",
    permissionDecision: "deny", permissionDecisionReason: $r}}'
  exit 0
}

protected="main"
branch=$(git -C "${cwd:-.}" symbolic-ref --quiet --short HEAD 2>/dev/null)

# Split the command line into simple commands on ; & | and newlines.
segments=$(printf '%s\n' "$cmd" | sed -E 's/(\|\||&&|[;&|])/\n/g')

while IFS= read -r seg; do
  read -ra tok <<<"$seg"
  n=${#tok[@]}

  # --- gh api calls that change rulesets or branch protection -------------
  if [ "${tok[0]}" = "gh" ] && [ "${tok[1]}" = "api" ] &&
     [[ "$seg" =~ rulesets|/protection ]]; then
    if [[ "$seg" =~ (-X|--method)[[:space:]=]*(POST|PUT|PATCH|DELETE|post|put|patch|delete) ]] ||
       [[ "$seg" =~ (^|[[:space:]])(-f|-F|--field|--raw-field|--input)([[:space:]=]|$) ]]; then
      deny "Changing GitHub rulesets or branch protection is blocked for Claude. Ask the user to do it."
    fi
  fi

  # --- git push ------------------------------------------------------------
  [ "${tok[0]}" = "git" ] || continue
  i=1
  while [ $i -lt $n ] && [[ "${tok[$i]}" == -* ]]; do
    case "${tok[$i]}" in -C|-c) i=$((i + 2)) ;; *) i=$((i + 1)) ;; esac
  done
  [ "${tok[$i]}" = "push" ] || continue

  positional=()
  for ((j = i + 1; j < n; j++)); do
    t=${tok[$j]}
    case "$t" in
      -f|--force|--force-with-lease*|--force-if-includes|--mirror|--all|--prune)
        deny "Blocked: '$t' on git push. Force pushes and bulk pushes are not allowed." ;;
      -d|--delete)
        deny "Blocked: deleting remote branches with git push is not allowed." ;;
      --repo=*|--push-option=*|-o*) ;;
      --repo|--push-option|-o|--receive-pack|--exec) j=$((j + 1)) ;;
      -*) ;;
      *) positional+=("$t") ;;
    esac
  done

  # positional[0] is the remote, the rest are refspecs.
  if [ ${#positional[@]} -le 1 ]; then
    if [ "$branch" = "$protected" ]; then
      deny "Blocked: git push from '$protected'. Create a feature branch and open a pull request."
    fi
    continue
  fi
  for spec in "${positional[@]:1}"; do
    [[ "$spec" == +* ]] && deny "Blocked: force refspec '$spec'."
    [[ "$spec" == :* ]] && deny "Blocked: deleting a remote branch with '$spec'."
    dst=${spec##*:}
    dst=${dst#refs/heads/}
    [ "$dst" = "HEAD" ] && dst=$branch
    if [ "$dst" = "$protected" ]; then
      deny "Blocked: pushing to '$protected'. Push a feature branch and open a pull request."
    fi
  done
done <<<"$segments"

exit 0
