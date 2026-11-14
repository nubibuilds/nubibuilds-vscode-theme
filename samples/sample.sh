#!/usr/bin/env bash
# Release helper: exercises most shell token categories.
set -euo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly VERSION_RE='^v[0-9]+\.[0-9]+\.[0-9]+$'
declare -i RETRIES=3
declare -a TARGETS=("linux" "darwin" "win32")
declare -A ARCH=([linux]="x64" [darwin]="arm64")
DRY_RUN=${DRY_RUN:-false}

usage() {
  cat <<EOF
Usage: ${0##*/} [-n] [-t target] <version>

  -n          dry run
  -t target   one of: ${TARGETS[*]}
EOF
}

log() { printf '\033[32m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*" >&2; }
die() { log "error: $1"; exit "${2:-1}"; }

retry() {
  local attempt=1
  until "$@"; do
    if (( attempt >= RETRIES )); then
      return 1
    fi
    sleep $(( 2 ** attempt ))
    (( attempt++ ))
  done
}

build() {
  local target=$1 arch=${ARCH[$1]:-x64}
  log "building ${target}-${arch}"
  if [[ "$DRY_RUN" == true ]]; then
    return 0
  fi
  npm run build --silent -- --target="$target" 2>&1 | tee "build-${target}.log" | grep -Ev '^\s*$' || true
}

while getopts ':nt:h' opt; do
  case "$opt" in
    n) DRY_RUN=true ;;
    t) TARGETS=("$OPTARG") ;;
    h) usage; exit 0 ;;
    \?|:) usage >&2; exit 64 ;;
  esac
done
shift $(( OPTIND - 1 ))

[[ $# -eq 1 ]] || die "missing version" 64
version=$1
[[ $version =~ $VERSION_RE ]] || die "invalid version: '$version'"

trap 'log "interrupted"; exit 130' INT TERM

for target in "${TARGETS[@]}"; do
  retry build "$target" || die "build failed for $target" 2
done

files=$(find "$SCRIPT_DIR" -maxdepth 1 -name '*.log' -newer "$0" | wc -l)
if [ "$files" -gt 0 ] && command -v gzip >/dev/null; then
  gzip -f ./*.log &
  wait
fi

export RELEASE_TAG="${version#v}"
log "released ${RELEASE_TAG} (${#TARGETS[@]} targets, exit $?)"
