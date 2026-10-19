# Hiding a refused reply

A Stop hook fires after the reply is on screen, so a block used to show the
user the refused draft, the "Hook re-prompted Claude" row, and then the whole
rewrite. `plugins/blunt/hooks/render/hide-refused-draft.tsx` fixes that in the
desktop app and the terminal — not in a cloud session, whatever app views it
(see [Cloud sessions](#cloud-sessions-nothing-asks-to-draw)). This file is how it got there, so the dead ends
are not retried.

## What works: a mod

A mod is a function-hook module named under `modules` in `hooks.json`, beside
the command hooks (the `plugin-authoring` skill prints its API and the path of
`claude-code.d.ts`). Its `ui.render` hook on `AssistantMessage` gets each
transcript block's drawn `text` and can hand the engine a rewritten one. The
drawing changes; the stored message, and what the model reads, does not.

- **A draft is told from its rewrite by the transcript.** Stop feedback is
  stored as a user message starting `Stop hook feedback:` with the hook's
  reason, and `$.session.messages()` returns `{ role, text }` rows. Walking back
  from the drawn message: that rule's feedback before any earlier reply with
  text means it is the rewrite, shown; otherwise it is a draft, drawn as
  nothing.
- **A message still streaming is not in `messages()` yet**, so it is treated as
  the newest row.
- **Imports never cross a symlink.** `claude plugin validate` refuses an import
  through one; every file the mod imports lives in the plugin. That is why the
  rules live in `hooks/rules/` with no Node imports.
- **Developing one:** write it under the session's `~/.claude/dev-mods/` folder,
  accept "Enable for this session" when the app asks about hot reloading, and
  each edit reloads when the turn ends. Delete the dev copy once the mod moves
  into the plugin, or a session runs both.

## Cloud sessions: nothing asks to draw

A cloud session shows the refused draft and the whole rewrite, on the iPhone
app and anywhere else it is viewed. The mod loads there and is never called.

- **A remote app draws through the engine only by asking.** It sends a
  `ui_attach` control request to join the roster, then a `ui_render` for each
  thing it draws; that ask is what raises `ui.render`. The types' "raised on
  every attached surface" means surfaces that attached this way.
- **A cloud session has no surface.** Its container runs Claude Code headless
  (`--sdk-url`, `--input-format=stream-json`, `--output-format=stream-json`);
  the apps draw the transcript from that event stream themselves. The debug
  log says `session.start: raised (surface none, not interactive)`, and the
  only control request that arrives is the one at startup — no `ui_attach`,
  no `ui_render` (Claude Code 2.1.300).
- **So no rewrite can show.** A probe mod's labelled `AssistantMessage`
  rewrite drew the original text on the iPhone, and its log of every
  `ui.render` call was never written.
- **Read the evidence from inside the session.** The engine's stdout and
  stderr, `--debug` included, go to `/tmp/claude-preload.out` in the
  container; a mod hooked on `ui.render` that is ever called gets a
  `hooks module <plugin> ui.render settled` line there.
- **A probe mod confirmed it with hot reloading on.** Its log got one line,
  `session.start surface=null surfaces=[]`, and nothing more through a turn
  typed in the iPhone app.
- **The fallback marks the rewrite instead.** A Stop hook sees
  `CLAUDE_CODE_REMOTE=true` in its environment, and there the block's reason
  asks for the rewrite to open with `TO PUT IT BLUNTLY…` on its own line, so
  the reader knows the reply above it is withdrawn. Checked with `claude -p
  --plugin-dir` in a cloud container: the rewrite opened with it.

## Dead ends

| Tried | Why it fails |
|---|---|
| Rewrite instruction asks for a throwaway tool call first, hoping the app folds the draft | The desktop app does not fold plain text that a tool call follows; only the hook's reason row shrank to one line. Whether the app folds text before an ask is unverified; communication.md dropped that claim in 0.54.0. |
| A `MessageDisplay` hook returning `displayContent: ""` | It runs in the desktop app, with `final: true` and the whole reply in `delta`, but the app draws the original, whether the hook returns `""` or a replacement (Claude desktop 2.31226.1, Claude Code 2.1.295). It works in the CLI and in `claude -p` output; there the streamed `stream_event` deltas still carry the draft. Bug report drafted in `~/.agents/docs/messagedisplay-desktop-bug-report.md`. |
| Rewrite only the changed lines | The noisy draft still shows. |
| Stop's `suppressOutput` | Documented as having no effect. |
| A `session.append` hook emptying the draft, for cloud sessions | It rewrites the stored row, so the model loses its draft and the Stop hooks read an empty reply and let it through; and an SDK stream may show the row before its rewrite anyway. |
| An `ANTHROPIC_BASE_URL` proxy, output styles | Both change what the model sees. |

## Verifying a display change

- **Headless proves nothing about display.** `claude -p` showed the fold
  instruction obeyed and the `MessageDisplay` draft dropped; neither held in the
  app. Settle display questions in the desktop app.
- **This session cannot screenshot the desktop app**: computer use is refused
  for Claude's own window. The user's screenshot is the evidence.
- **Hooks load at session start.** A hook added to settings mid-session never
  fires, but an already-registered script is re-read on every run, so editing
  the script (a log of stdin, a visible marker as the replacement) probes a
  live session.
- **A test chat can be driven from here:** create a folder whose
  `.claude/settings.local.json` loads the hook, offer it with `spawn_task`
  (`cwd` set to that folder; the user clicks the chip), then send it turns with
  `ccd_session_mgmt` `send_message` and poll its transcript.
- **Make the marker distinctive and visible**: a replacement string like
  `[redrawn by mod on desktop]` answers "did the app use it" in one look, where
  an empty replacement cannot tell "hidden" from "never ran".
