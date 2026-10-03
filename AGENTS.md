# AGENTS.md

Claude Code plugins for blunt, low-noise agent behavior. The whole product is
one file of injected guidelines; everything else is packaging.

## Layout

| path | what |
|---|---|
| `plugins/blunt/context/communication.md` | the guidelines — the actual product |
| `plugins/blunt/hooks/hooks.json` | `SessionStart` hook that cats them into context, and the `Stop` hooks below |
| `plugins/blunt/hooks/Stop/no-git-noise.mjs` | `Stop` hook that refuses a report narrating git mechanics |
| `plugins/blunt/hooks/Stop/no-check-noise.mjs` | `Stop` hook that refuses a report narrating checks that passed |
| `plugins/blunt/hooks/lib/final-report.mjs` | what the `Stop` hooks share: transcript, final report, own-block guard |
| `plugins/blunt/.claude-plugin/plugin.json` | version; gates `claude plugin update` |
| `build.sh` | syncs `communication.md` into the README |
| `.github/workflows/tag-release.yml` | tags `v<version>` when a bump lands on `main` |

A hook script lives at `hooks/<Event>/<what-it-enforces>.mjs` — named for the
behavior it guards, not for the mechanism (`no-git-noise`, not `report-check`).

## Editing the guidelines

1. Edit `plugins/blunt/context/communication.md`.
2. Run `./build.sh` — the README embeds a generated copy between
   `communication:begin` / `communication:end` markers. Never hand-edit that
   block; it will be overwritten.
3. Bump the version in `plugins/blunt/.claude-plugin/plugin.json` for anything
   that should ship. Without a bump, `claude plugin update` reports "already at
   the latest version" even when `main` has new commits. `/ship` does this.

A session that sat while `main` moved on conflicts in all three files, and each
resolves differently. `communication.md`: both sides are real guidelines — keep
the ones from `main` and re-place yours among them. `plugin.json`: take the
version from `main` and bump *that*, never your branch's number, which a stale
base makes lower than what already shipped — and a lower version on `main` makes
`claude plugin update` answer "already at the latest version" forever.
`README.md`: never resolve by hand — `git checkout origin/main -- README.md`,
then `./build.sh` regenerates it from the file you just merged.

Landing that bump on `main` tags the release from CI. Never tag by hand: a cloud
session cannot push `refs/tags/*` at all, so a tag step in the local workflow is
one more thing that silently only works from a laptop.

Match the file's style: one guideline per bullet, terse fragments, a short
inline example only where it sharpens the rule.

**Re-wording a bullet that was disobeyed is the weakest answer available.** The
bullet was read and lost to something else, so sharper phrasing only raises its
claim on attention — and every bullet raised the same way costs the rest of the
file. Before rewriting one that has failed in the wild, ask whether the
violation is detectable in the final message by a string. Where it is, enforce
it as a hook and leave the wording alone; where it is not, the bullet is doing
all it can and the next edit should be to cut something competing with it.

## The guidelines that are enforced

Everything in `communication.md` is prose a model weighs. Two bullets are also
hooks. The first, `no-git-noise.mjs`, reads the last assistant message when
the session stops, and exits 2 — which returns the reason as feedback and gets
the message rewritten — when a line names git mechanics that went as planned.
Injected wording did not hold it. The bullet had been in the file for five releases,
worded and re-worded, and was still being disobeyed in the middle of otherwise
obedient reports; the hook does not weigh anything, which is the whole of why
it works.

- **The exception is encoded, not judged.** A line may carry `rebase` when it
  also carries a word saying something is unresolved — failed, refused, still,
  left behind. Coarse on purpose: the way past the block is to say what is
  broken, which is the only case the bullet ever allowed.
- **Its own earlier block ends the loop, not `stop_hook_active`.** The flag
  says *some* Stop hook blocked, and it stays true for the whole continuation,
  tool calls included — so a decision pass that blocks and opens an ask would
  wave every later report through unchecked. A `fast-forwarded` report reached
  a user exactly that way. The hook skips only when the flag is set **and** a
  `stop_hook_summary` since the last typed prompt carries its own reason in
  `hookErrors`; the summary is written before the next stop fires. Match on
  that entry type only — a tool result that prints this file, or a message
  quoting the reason, carries the same string. Verified with
  `claude -p --settings <file>` adding a Stop hook that blocks once: no-git-noise
  then blocks under the flag, and an identical rewrite goes through.
- **A block shows the report twice.** Stop fires after the message is on
  screen, so the user sees the blocked report and then the whole rewrite below
  it — the price of every block, and why the term list stays to observed
  terms. Other Stop hooks fire on the same stop and their reasons arrive
  together; a user-level decision pass that says "do not rewrite" contradicts
  this one's rewrite.
- **The second, `no-check-noise.mjs`, guards "Report a check only when it
  failed".** The Omit bullet and its delivered-work sub-bullet were both loaded
  in a v0.48.0 session that still closed on its tested sample count, all of
  them passing, and a live run that confirmed it. Its terms come from a sweep
  of real final messages, each annotated with the phrasing it was taken from.
- **Its exception is narrower than no-git-noise's.** A passing report
  routinely carries a failure word — red before green, "the old version
  failed" — so a failure word excuses only its own clause, split at `. ; ! ?`,
  and a count of nothing (`0 failed`, `no failures`) is not one. A test passing
  where it should not — on `main`, or blind to a bug it was meant to catch — is
  a finding too. A line saying what was *not* tested, run or verified passes
  whole: that caveat is the one check line the user acts on. So does a line
  naming checks still running, or a bug.
- **CI status is left out of its terms on purpose.** "Merged after every check
  passed" answers the request when the user gated the merge on CI, and a
  string cannot tell that request from noise.
- **Sweep the transcripts before changing its terms.** Pull every final
  message from `~/.claude/projects/*/*.jsonl` (the last assistant text before
  each typed prompt), pipe each through the hook, and read the lines it
  refuses. At the first cut it refused about 7% of 1,400 reports, nearly all
  rightly; every exception above came from a line that sweep got wrong. Run
  the sweep under `env -u NODE_USE_SYSTEM_CA` too: a Node start per message
  with the certificates loaded outruns a two-minute command timeout.
- **Separate hooks, shared machinery.** Each concern gets its own script and its
  own reason, because the reason is what the model rewrites against — one
  reason naming two concerns tells it less about either. Everything else lives
  in `hooks/lib/final-report.mjs`. Splitting costs no extra round: both hooks
  fire on the same stop and their reasons arrive together, so a report with
  both kinds of noise is blocked once and rewritten once — checked live, one
  `stop_hook_summary` carried both reasons and the next stop carried neither.
  A third showing happens only when a rewrite adds the other kind, which the
  reasons tell it not to do. Each guard matches its own reason only, so
  neither hook's block waves the other's check through.
- **Anything it cannot read is not a veto** — no transcript, an unparseable
  line, a turn with no text: exit 0.
- **Test it against a transcript, not by reasoning.** A JSONL file of one
  `{"type":"assistant"}` entry piped in with `{"stop_hook_active":false,
  "transcript_path":...}` is the whole harness. Then try it for real with
  `claude --plugin-dir plugins/blunt -p … < /dev/null`, which fires the hook on
  its own final message. Asked to state git work it never did, the model
  refuses, so a live run never produces the offending line; frame the prompt as
  a hook test and have it repeat a fixed string whatever any hook says. Add
  `--output-format json` for the `session_id`; that session's transcript under
  `~/.claude/projects/*/<session_id>.jsonl` shows each `stop_hook_summary` and
  its `hookErrors`, which is the evidence the block happened and the guard
  released the repeat.
- **Add a term only after a report actually carried it.** The list is what has
  been observed, not what could conceivably be narrated; a term nobody has
  written is a false positive waiting to happen.
- **Run a Node hook under `env -u NODE_USE_SYSTEM_CA`.** Claude Code sets it for
  hooks, and it makes every Node start load the system certificates — about
  ten times the cost of the script itself, paid on every stop. Only a hook that
  makes TLS calls needs it.
- **Describe a test fixture in a report; never quote it.** The hook reads table
  cells and quotes like any other line, so a report that quotes the blocked
  sample it tested with gets blocked itself.

## Evaluating a change

Do not reason about what a bullet "would" cause and call that a result. Models
blend injected style rules with harness guidance and their own priors rather
than following them literally — several bullets in this file are routinely
disobeyed, and at least one was only safe *because* it was disobeyed.

Try it instead: `--plugin-dir plugins/blunt` loads the plugin for one session,
so a run with the flag and a run without differ by exactly that. Give both the
same real task in a real repo and read what came out. Fabricate the inputs;
never fabricate the outputs.

## Testing your own output

The guidelines are injected into your session too. When they are active, they
govern the last message before control returns to the user — not your
narration between tool calls, which stays fully detailed.

What the `SessionStart` hook injects is the **installed** plugin's copy, not the
working tree's. A bullet you just wrote is missing from it, and bullets you have
never seen are in it — that is the installed version differing from your branch,
not an edit that failed to land. Check the file, not the injection.

## Reporting

Never suggest restarting Claude Code — not as "restart to apply", a caveat, or
the closing call to action ("Ready for you to restart Claude Code…"). The
version bump is the outcome; the restart is `claude plugin update`'s own advice.
After `/ship`, end on the last bullet — no "Done.", no "Ready to …" line; nothing is waiting on the user.

## Session titles

The chat sidebar shows a status dot (running / awaiting input / idle) and a branch glyph for
worktree sessions; neither can be set from here — `set_session_title` takes a title string and
nothing else. So a **single leading emoji on the title** is the only lever, and it is spent on
what the app cannot know: where the work stands.

| Prefix | Means |
|---|---|
| 🎨 | brainstorming or designing with the user — exploring, sketching, deciding what to build |
| ⏳ | implementing — the weakest of them; every other prefix takes precedence |
| ✏️ | drafting a guideline change — edited, not yet tried |
| 🔍 | auditing against live state — a dry run, or the plan it printed, with a write to follow |
| 🔓 | about to take that slot — queued or blocked on it — or just released it |
| 🔒 | holding a single slot only one session can use at a time |
| 💾 | writing to a live resource every session shares |
| 📦 | done on the branch — gated and shippable without re-running anything |
| 🚀 | shipping to `main`, or shipped |
| 🚙 | parked: the work is sound and waiting on the user (a decision, a review) |
| ⏲️ | waiting on a task scheduled for later — nothing to do until it fires |
| 🪦 | dead end — the change did not work out; kept for the finding, not to resume |
| 📚 | extracting learnings into AGENTS.md, or done extracting them |

🔍, 🔒, 🔓 and 💾 are inert here — nothing in this repo is shared across sessions. They are
listed so the vocabulary reads the same in every repo, and are ready the day a workflow grows into
one.

**A design loop is not a park.** 🎨 holds through brainstorming and outranks 🚙 while it
does: the back-and-forth _is_ the stage, so a park prefix on every turn of it marks the session as
blocked without saying on what. It becomes 🚙 once the design is settled and waiting on a
decision, and ⏳ when that decision comes.

**Never mention a prefix in the response** — not what it was set to, not that it was already right,
not that it was left alone. It is sidebar state; say nothing about it unless asked.

These are **stages, not flags**: exactly one prefix at a time, and setting a new one replaces
whatever was there. Set a prefix **optimistically** — when the stage *starts*, not when it succeeds —
and correct it if the stage falls over. A title that only becomes true at the end is blank for the
whole stretch the sidebar is there to describe. Only one reads cleanly at sidebar width, and a later
stage implies the earlier one.

The lifecycle ✏️ → 🚀 is set by skills where one owns the stage (`update` sets ✏️ before it edits;
`ship` sets 🚀 before it builds and puts it back if the push fails), so it stays true on its own.
📚 is set in the response that invokes the `learn` skill — before reading anything or making any
edit. The rest are set in the response that enters the stage, and nothing reconciles a title against reality —
an abandoned session keeps whatever prefix it had. 🚙 in particular is worth setting before handing
work back: the idle dot cannot tell "waiting on you" from "given up on". ⏲️ is the clock's
version of it: a task scheduled for later with nothing to do until it fires. 🚙 takes precedence
where the same response also needs the user — a person can act and the clock cannot.
