# AGENTS.md

Claude Code plugins for blunt, low-noise agent behavior. The whole product is
one file of injected guidelines; everything else is packaging.

## Layout

| path | what |
|---|---|
| `plugins/blunt/context/communication.md` | the guidelines — the actual product |
| `plugins/blunt/hooks/hooks.json` | `SessionStart` hook that cats them into context |
| `plugins/blunt/.claude-plugin/plugin.json` | version; gates `claude plugin update` |
| `build.sh` | syncs `communication.md` into the README |
| `docs/grading-methodology.md` | how to evaluate a change to the guidelines |

## Editing the guidelines

1. Edit `plugins/blunt/context/communication.md`.
2. Run `./build.sh` — the README embeds a generated copy between
   `communication:begin` / `communication:end` markers. Never hand-edit that
   block; it will be overwritten.
3. Bump the version in `plugins/blunt/.claude-plugin/plugin.json` for anything
   that should ship. Without a bump, `claude plugin update` reports "already at
   the latest version" even when `main` has new commits. `/ship` does this.

Match the file's style: one guideline per bullet, terse fragments, a short
inline example only where it sharpens the rule.

## Evaluating a change

Do not reason about what a bullet "would" cause and call that a result. Models
blend injected style rules with harness guidance and their own priors rather
than following them literally — several bullets in this file are routinely
disobeyed, and at least one was only safe *because* it was disobeyed.

Run a real A/B instead: `--plugin-dir` loads the plugin for a single session, so
a control and treatment run differ by exactly one flag. Fabricate the inputs;
never fabricate the outputs.

See [`docs/grading-methodology.md`](docs/grading-methodology.md) for the harness,
the manipulation check, blind grading, the length confound that invalidates naive
pairwise scoring, and the current baseline numbers.

## Testing your own output

The guidelines are injected into your session too. When they are active, they
govern the last message before control returns to the user — not your
narration between tool calls, which stays fully detailed.

## Reporting

Do not state "restart to apply" after a plugin update. The version bump is the
outcome; the restart is `claude plugin update`'s own advice.

## Session titles

The chat sidebar shows a status dot (running / awaiting input / idle) and a branch glyph for
worktree sessions; neither can be set from here — `set_session_title` takes a title string and
nothing else. So a **single leading emoji on the title** is the only lever, and it is spent on
what the app cannot know: where the work stands.

| Prefix | Means |
|---|---|
| ✏️ | drafting a guideline change — edited, not yet graded |
| 🧪 | A/B run done and the change beat its control — shippable without re-running |
| 🚀 | shipping to `main`, or shipped |
| 🚙 | parked: the work is sound and waiting on the user (a decision, a grading batch) |
| 🪦 | dead end — the change did not beat its control; kept for the finding, not to resume |
| 📚 | extracting learnings into AGENTS.md or `docs/`, or done extracting them |

**Never mention a prefix in the response** — not what it was set to, not that it was already right,
not that it was left alone. It is sidebar state; say nothing about it unless asked.

These are **stages, not flags**: exactly one prefix at a time, and setting a new one replaces
whatever was there. Set a prefix **optimistically** — when the stage *starts*, not when it succeeds —
and correct it if the stage falls over. A title that only becomes true at the end is blank for the
whole stretch the sidebar is there to describe. Only one reads cleanly at sidebar width, and 🚀 after
🧪 is noise — the later stage implies the earlier.

The lifecycle ✏️ → 🧪 → 🚀 is set by skills where one owns the stage (`update` sets ✏️ before it
edits; `ship` sets 🚀 before it builds and puts it back if the push fails), so it stays true on its
own. 🧪 is set by hand, and only after a real A/B — never off reasoning about what a bullet would
cause. 📚 is set by hand the moment the `learn` skill is invoked — before reading anything or making
any edit. The rest are set by hand when they apply, and nothing reconciles a title against reality —
an abandoned session keeps whatever prefix it had. 🚙 in particular is worth setting before handing
back a grading batch: the idle dot cannot tell "waiting on you" from "given up on".
