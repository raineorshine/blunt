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
