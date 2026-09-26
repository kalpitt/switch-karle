#!/bin/bash
# SessionStart hook: load Kalpit's global rules in cloud sessions.
#
# Source of truth: governance/claude/CLAUDE.md and governance/claude/skills/ in
# the private kalpitt/personal-os repo, read from its main branch only, so a
# session serves nothing but Kalpit-merged rules, never an unmerged branch's
# edits. On the Mac, ~/.claude/CLAUDE.md is a symlink into that repo
# (governance/install.sh) and this hook does nothing. Cloud containers start
# without it, so the global rules never load there.
#
# One script for every governed repo, kept byte-identical to
# governance/repo-template/.claude/hooks/session-start-global.sh
# (scripts/test_template_sync.py). Inside personal-os it reads this repo's
# origin/main. In any other repo it fetches personal-os main, which works only
# when this session can read kalpitt/personal-os: select it as an extra
# repository when starting the session.
#
# Claude Code loads CLAUDE.md files before SessionStart hooks run. So when the
# file was missing at startup, this hook also prints the rules to stdout, which
# Claude Code adds to the session's context. Fails open: any error leaves the
# session as it would have been without the hook, plus a one-line notice.
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0

REPO="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CLAUDE_DIR="$HOME/.claude"
TARGET="$CLAUDE_DIR/CLAUDE.md"
SRC="governance/claude/CLAUDE.md"
SKILLS="governance/claude/skills"
MARKER=".installed-from-personal-os"
URL="https://github.com/kalpitt/personal-os"

missing_at_start=0
[ -e "$TARGET" ] || missing_at_start=1

tmp="$(mktemp -d)" || exit 0
trap 'rm -rf "$tmp"' EXIT

fail() {
  # Only speak up when the session really is running without the rules.
  if [ "$missing_at_start" = 1 ]; then
    echo "Kalpit's global rules ($SRC in kalpitt/personal-os) did not load: $1."
    echo "Before starting work, tell Kalpit, or attach kalpitt/personal-os to this session and read $SRC from its main branch."
  fi
  exit 0
}

if [ -f "$REPO/$SRC" ]; then
  # This repo is personal-os itself.
  gitdir="$REPO"
  timeout 20 git -C "$gitdir" fetch --quiet origin main 2>/dev/null
  ref="origin/main"
  git -C "$gitdir" rev-parse --verify --quiet "$ref" >/dev/null || fail "no origin/main"
else
  gitdir="$tmp/personal-os"
  git init --quiet "$gitdir" 2>/dev/null || fail "git init failed"
  timeout 30 git -C "$gitdir" fetch --quiet --depth 1 "$URL" main 2>/dev/null \
    || fail "this session cannot read $URL"
  ref="FETCH_HEAD"
fi

rules="$(git -C "$gitdir" show "$ref:$SRC" 2>/dev/null)" || fail "$SRC is missing on main"
[ -n "$rules" ] || fail "$SRC is empty on main"

mkdir -p "$CLAUDE_DIR/skills" || exit 0

# Never overwrite a CLAUDE.md this hook did not write.
if [ "$missing_at_start" = 1 ] || [ -f "$CLAUDE_DIR/$MARKER" ]; then
  printf '%s\n' "$rules" > "$TARGET" && touch "$CLAUDE_DIR/$MARKER"
fi

# Global skills (/diagnose, /contact-sheet), same merged-only source.
mkdir -p "$tmp/x" || exit 0
if git -C "$gitdir" archive "$ref" "$SKILLS" 2>/dev/null | tar -x -C "$tmp/x" 2>/dev/null; then
  for skill in "$tmp/x/$SKILLS"/*/; do
    [ -d "$skill" ] || continue
    name="$(basename "$skill")"
    dst="$CLAUDE_DIR/skills/$name"
    if [ ! -e "$dst" ] || [ -f "$dst/$MARKER" ]; then
      rm -rf "$dst" && cp -R "${skill%/}" "$dst" && touch "$dst/$MARKER"
    fi
  done
fi

if [ "$missing_at_start" = 1 ]; then
  echo "Kalpit's global operating rules ($SRC on kalpitt/personal-os main)."
  echo "They normally load as ~/.claude/CLAUDE.md and apply to this session like it:"
  echo
  printf '%s\n' "$rules"
fi
exit 0
