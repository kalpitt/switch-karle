#!/usr/bin/env bash
# Runs no-context reviewers on cold-read screenshots.
# Usage: bash run.sh <shots-dir> [model]
# Each reviewer starts in the shots folder, which must NOT be inside the repo:
# a reviewer started inside the repo inherits AGENTS.md and already knows what
# the site is. Project memory is switched off for the same reason.
set -euo pipefail
SHOTS="$(cd "$1" && pwd)"; MODEL="${2:-claude-sonnet-5-5}"; EFFORT="${EFFORT:-low}"
KIT="$(cd "$(dirname "$0")" && pwd)"; OUT="$SHOTS/verdicts"; mkdir -p "$OUT"
case "$SHOTS" in *switch-karle*) echo "Shots folder is inside the repo. Use a folder outside it."; exit 1;; esac
if [ -e "$SHOTS/CLAUDE.md" ] || [ -e "$SHOTS/AGENTS.md" ]; then echo "Remove CLAUDE.md / AGENTS.md from the shots folder."; exit 1; fi
cd "$SHOTS"
review() { # name persona prompt-file dir
  local text; text="$(sed -e "s|{{PERSONA}}|$2|" -e "s|{{DIR}}|$4|" "$KIT/$3")"
  env -u CLAUDE_COWORK_MEMORY_PATH_OVERRIDE timeout 600 claude -p "$text" --model "$MODEL" --effort "$EFFORT" --allowedTools Read < /dev/null > "$OUT/$1.txt" 2> "$OUT/$1.err" || echo "FAILED: $1"
}
# Hindi pages are reviewed only with HINDI=1: Hindi is hidden until the Hindi pass (2026-11-19),
# so meanwhile every persona, including the two who prefer Hindi, sees the English pages.
# FLOWS picks which flows run (default all): A = home, B = plan, C = step pages. Example: FLOWS=C.
FLOWS="${FLOWS:-ABC}"
while IFS='|' read -r id persona lang expect <&3; do  # expect = the card this person should tap ('-' = none); for the judge, never shown to the reviewer
  [ -z "$id" ] && continue
  case "$FLOWS" in *A*)
    if [ "$lang" = hi ] && [ "${HINDI:-0}" = 1 ]; then review "home-hi-$id" "$persona" prompt-home.txt home-hi &
    else review "home-$id" "$persona" prompt-home.txt home & fi;; esac
  case "$FLOWS" in *B*) review "plan-$id" "$persona" prompt-flow.txt plan &;; esac
  case "$FLOWS" in *C*)
    if [ "$expect" != "-" ] && { [ "$lang" = en ] || [ "${HINDI:-0}" != 1 ]; } && [ -d "$SHOTS/step-$expect" ]; then
      review "step-$id" "$persona" prompt-door.txt "step-$expect" &
    elif [ "$expect" != "-" ]; then echo "No step-$expect shots for $id"; fi;; esac
done 3< "$KIT/personas.txt"
wait
echo "Verdicts in $OUT. Read each one. Discard any whose OTHER INFORMATION line is not a plain no."
echo "Pass marks are in REBUILD-PLAN.md section 7. A person or the implementing session judges them; this script does not."
