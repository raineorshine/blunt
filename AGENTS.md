# AGENTS.md

Claude Code plugins for blunt, low-noise agent behavior. The whole product is
one file of injected guidelines; everything else is packaging.

## Layout

| path | what |
|---|---|
| `plugins/blunt/context/communication.md` | the guidelines — the actual product |
| `plugins/blunt/hooks/hooks.json` | `SessionStart` hook that cats them into context, and the `Stop` hook below |
| `plugins/blunt/hooks/report-check.mjs` | `Stop` hook that refuses a report narrating git mechanics |
| `plugins/blunt/.claude-plugin/plugin.json` | version; gates `claude plugin update` |
| `build.sh` | syncs `communication.md` into the README |
| `.github/workflows/tag-release.yml` | tags `v<version>` when a bump lands on `main` |

## Editing the guidelines

1. Edit `plugins/blunt/context/communication.md`.
2. Run `./build.sh` — the README embeds a generated copy between
   `communication:begin` / `communication:end` markers. Never hand-edit that
   block; it will be overwritten.
3. Bump the version in `plugins/blunt/.claude-plugin/plugin.json` for anything
   that should ship. Without a bump, `claude plugin update` reports "already at
   the latest version" even when `main` has new commits. `/ship` does this.

Landing that bump on `main` tags the release from CI. Never tag by hand: a cloud
session cannot push `refs/tags/*` at all, so a tag step in the local workflow is
one more thing that silently only works from a laptop.

Match the file's style: one guideline per bullet, terse fragments, a short
inline example only where it sharpens the rule.

## The one guideline that is enforced

Everything in `communication.md` is prose a model weighs. One bullet is also a
hook: `report-check.mjs` reads the last assistant message when the session
stops, and exits 2 — which returns the reason as feedback and gets the message
rewritten — when a line names git mechanics that went as planned. Injected
wording did not hold it. The bullet had been in the file for five releases,
worded and re-worded, and was still being disobeyed in the middle of otherwise
obedient reports; the hook does not weigh anything, which is the whole of why
it works.

- **The exception is encoded, not judged.** A line may carry `rebase` when it
  also carries a word saying something is unresolved — failed, refused, still,
  left behind. Coarse on purpose: the way past the block is to say what is
  broken, which is the only case the bullet ever allowed.
- **`stop_hook_active` ends the loop.** A second stop is let through, so a
  rewrite the hook still dislikes reaches the user rather than spinning.
- **Anything it cannot read is not a veto** — no transcript, an unparseable
  line, a turn with no text: exit 0.
- **Test it against a transcript, not by reasoning.** A JSONL file of one
  `{"type":"assistant"}` entry piped in with `{"stop_hook_active":false,
  "transcript_path":...}` is the whole harness. Then try it for real with
  `claude --plugin-dir plugins/blunt -p`, which fires the hook on its own final
  message.
- **Add a term only after a report actually carried it.** The list is what has
  been observed, not what could conceivably be narrated; a term nobody has
  written is a false positive waiting to happen.

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
