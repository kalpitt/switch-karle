#!/usr/bin/env python3
"""PreToolUse guard (template) — mechanically enforces repo invariants.

Architecture adopted from VivoType's guard (the most battle-tested one, 2026-07):
- FAIL-OPEN. Any internal error, unparsable input, or unknown shape -> allow
  (exit 0, no output). A guard must never brick the workflow.
- Defense-in-depth, not airtight security. It catches the obvious violation;
  CLAUDE.md + review remain the real backstop.
- Stdlib only. Runs under system python3.

Wired in .claude/settings.json for Edit|Write|MultiEdit (content scan) and
Bash (command scan).

PER-REPO CUSTOMIZATION: fill CONTENT_DENY with this repo's banned imports /
permissions / tokens, and extend the checks in handle_bash if needed.
"""
import json
import os
import re
import subprocess
import sys


def allow():
    sys.exit(0)


def deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


# ---- Universal: secret shapes never leave the secret stores -----------------
# Adopted from Glass's guard (2026-07): a live credential may only be written
# to a gitignored secret store. Writing one anywhere else — code, docs, config,
# fixtures — is blocked regardless of file type.
SECRET_PATTERNS = [
    (r"AIza[0-9A-Za-z_-]{35}", "Google API key"),
    (r"\bsk-[A-Za-z0-9_-]{32,}", "OpenAI/Anthropic-style secret key"),
    (r"\bghp_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{22,}", "GitHub token"),
    (r"\bAKIA[0-9A-Z]{16}\b", "AWS access key ID"),
    (r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", "private key material"),
]


def is_secret_store(p):
    base = (p.split("/")[-1] or p)
    return (base == "api_key.txt" or base.startswith(".env")
            or base.endswith(".local"))


# ---- Content rules (repo-specific invariants) -------------------------------
# (regex, reason). Matched against added/edited code only — docs and .claude/
# are exempt. EXAMPLES (delete and replace per repo):
#   (r"\bimport\s+openai\b", "Local-only: no cloud APIs — use a local component."),
#   (r"android\.permission\.INTERNET", "This app must never declare INTERNET."),
CONTENT_DENY = [
]

SCAN_EXT = (".py", ".swift", ".kt", ".kts", ".sh", ".js", ".ts", ".tsx", ".rs")


def scan_content(path, text):
    p = path.replace("\\", "/")
    if not is_secret_store(p):
        for pat, what in SECRET_PATTERNS:
            if re.search(pat, text):
                deny(f"Secret material ({what}) must never be written outside "
                     f"a gitignored secret store (.env*, api_key.txt, *.local) "
                     f"— attempted write to {path}.")
    if "/docs/" in p or "/.claude/" in p or p.startswith(".claude/"):
        return
    if not p.endswith(SCAN_EXT):
        return
    for pat, reason in CONTENT_DENY:
        if re.search(pat, text):
            deny(f"{reason} (blocked pattern /{pat}/ in {path})")


def handle_edit(tool, ti):
    path = ti.get("file_path", "") or ""
    if not path:
        allow()
    # OPTIONAL, per-repo: if this repo has a directory that is live elsewhere
    # via a symlink (personal-os's governance/ -> ~/.claude/CLAUDE.md is the
    # model), deny edits to it whenever the checkout CONTAINING the file is on
    # main — worktrees on a branch stay editable; a main checkout must only
    # ever hold Kalpit-merged rules. Harmless no-op if this repo has no such
    # directory (the path check below never matches). Delete this block if
    # this repo has nothing live via a symlink.
    p0 = path.replace("\\", "/")
    if "/governance/" in p0 or p0.startswith("governance/"):
        try:
            d = os.path.dirname(os.path.abspath(p0)) or "."
            r = subprocess.run(["git", "-C", d, "rev-parse", "--abbrev-ref",
                                "HEAD"], capture_output=True, text=True,
                               timeout=2)
            if r.stdout.strip() in ("main", "master"):
                deny("governance/ is live via a symlink elsewhere — edit it "
                     "on a branch in a worktree (Write policy); a main "
                     "checkout must only ever hold Kalpit-merged rules.")
        except Exception:
            pass  # fail-open
    if tool == "Write":
        scan_content(path, ti.get("content", "") or "")
    elif tool == "Edit":
        scan_content(path, ti.get("new_string", "") or "")
    elif tool == "MultiEdit":
        blob = "\n".join(e.get("new_string", "") or ""
                         for e in (ti.get("edits") or []))
        scan_content(path, blob)
    allow()


def current_branch(cwd):
    try:
        r = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"],
                           cwd=cwd, capture_output=True, text=True, timeout=2)
        return r.stdout.strip()
    except Exception:
        return ""


def repo_root():
    """Realpath of this repo's top-level dir (worktrees live under it)."""
    d = os.environ.get("CLAUDE_PROJECT_DIR") or "."
    try:
        # The main-checkout path covers worktrees too: they sit under
        # <repo>/.claude/worktrees/, so a prefix test on the project dir works.
        return os.path.realpath(d)
    except Exception:
        return ""


_QUOTED_OR_BARE = r"\"([^\"]+)\"|'([^']+)'|(\S+)"


def git_effective_dir(cmd):
    """Working dir a git command targets: `git -C <path>` beats a leading
    `cd <path> &&` prefix; empty string means the session's own cwd."""
    m = re.search(r"\bgit\s+(?:-C\s+(?:%s))" % _QUOTED_OR_BARE, cmd)
    if not m:
        m = re.match(r"\s*cd\s+(?:%s)\s*(?:&&|;)" % _QUOTED_OR_BARE, cmd)
    if not m:
        return ""
    return next(g for g in m.groups() if g)


def cmd_targets_this_repo(cmd):
    """True unless the git command's effective dir resolves OUTSIDE this repo.
    Ambiguity enforces (conservative); only a clearly-foreign path exempts."""
    root = repo_root()
    if not root:
        return True
    d = git_effective_dir(cmd)
    if not d:
        return True
    d = os.path.expanduser(d)
    if not os.path.isabs(d):
        d = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR") or ".", d)
    try:
        d = os.path.realpath(d)
    except Exception:
        return True
    return d == root or d.startswith(root + os.sep)


def handle_bash(ti):
    cmd = ti.get("command", "") or ""

    # Cross-repo commands (a named publish/mirror script) are exempt from the
    # main-branch rules below — a public mirror's main IS the intended push
    # target. PER-REPO CUSTOMIZATION: name this repo's own publish script
    # explicitly (e.g. "publish_mirror" in cmd) if it has one; set this to
    # False if it doesn't (personal-os has no publish script, so it does).
    # Do NOT exempt via a blanket `cd <path> &&` prefix — that was a real
    # bypass, closed repo-wide in the 2026-07-31 rollout (see
    # docs/WRITE_POLICY.md); `cmd_targets_this_repo` below is the replacement.
    # switch-karle has NO publish script — it deploys via .github/workflows/pages.yml
    # on push to main. The exemption is therefore dead weight and a live bypass
    # (any command containing "publish" and ".sh" would skip every rule below),
    # so it is disabled here, exactly as the template comment instructs.
    cross_repo = False

    # The main/commit rules are THIS repo's write policy: a git command whose
    # effective dir (`cd <path> &&` or `git -C <path>`) is another repo is out
    # of scope for them (2026-07-20 false positives).
    in_repo = cmd_targets_this_repo(cmd)

    if not cross_repo and in_repo:
        if re.search(r"\bgit\s+push\b", cmd) and re.search(r"\bmain\b|\bmaster\b", cmd):
            deny("Never push raw git to main. Pushing main deploys this public "
             "site via .github/workflows/pages.yml. Branch + PR; Kalpit merges.")
        branch_dir = git_effective_dir(cmd) \
            or os.environ.get("CLAUDE_PROJECT_DIR") or "."
        if re.search(r"\bgit\s+commit\b", cmd) \
                and current_branch(branch_dir) in ("main", "master"):
            deny("Never commit directly to main. This repo has no record lane "
             "and no record_commit.py: everything is branch + PR.")
        if re.search(r"\bgit\s+push\b", cmd) and re.search(r"\s(--force|-f)\b", cmd):
            deny("Force-push is blocked. Ask Kalpit explicitly.")
        if re.search(r"\bgit\s+branch\s+-D\b", cmd) \
                or (re.search(r"\bgit\s+push\b", cmd) and "--delete" in cmd):
            deny("Branch deletion is gated — ask Kalpit before deleting "
                 "branches (deletions are one of the four approval gates).")
    allow()


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        allow()
    tool = (data or {}).get("tool_name", "")
    ti = (data or {}).get("tool_input", {}) or {}
    try:
        if tool in ("Write", "Edit", "MultiEdit"):
            handle_edit(tool, ti)
        elif tool == "Bash":
            handle_bash(ti)
    except SystemExit:
        raise
    except Exception:
        allow()  # fail-open
    allow()


if __name__ == "__main__":
    main()
