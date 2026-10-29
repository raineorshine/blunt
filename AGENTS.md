# AGENTS.md

Claude Code plugins for blunt, low-noise agent behavior.

**The guidelines are not injected for now.** `hooks.json` has no
`SessionStart` hook and no `no-label-leads` entry, and `rules/index.mjs` leaves
label-leads out: newer models write naturally on their own, so the plugin is down
to the two noise hooks while that is tried. The files stay; restoring those three
entries brings the guidelines and the bold-lead hook back.

## Layout

| path | what |
|---|---|
| `plugins/blunt/context/communication.md` | the guidelines — the actual product |
| `plugins/blunt/hooks/hooks.json` | the `Stop` hooks below; a `SessionStart` hook that cats the guidelines into context when they are injected |
| `plugins/blunt/hooks/Stop/no-git-noise.mjs` | `Stop` hook that refuses a report narrating git mechanics |
| `plugins/blunt/hooks/Stop/no-check-noise.mjs` | `Stop` hook that refuses a report narrating checks that passed |
| `plugins/blunt/hooks/Stop/no-label-leads.mjs` | `Stop` hook that refuses a bold lead posing a question |
| `plugins/blunt/hooks/rules/` | each `Stop` hook's terms, exception and reason, with no Node imports so the mod can load them |
| `plugins/blunt/hooks/render/hide-refused-draft.tsx` | mod that draws a reply the `Stop` hooks will refuse as nothing, so only the rewrite shows |
| `plugins/blunt/hooks/lib/final-report.mjs` | what the `Stop` hooks share: transcript, final report, own-block guard |
| `test/` | real report lines each rule must refuse or pass; `node --test` |
| `plugins/blunt/.claude-plugin/plugin.json` | version; gates `claude plugin update` |
| `build.sh` | syncs `communication.md` into the README |
| `.github/workflows/tag-release.yml` | tags `v<version>` when a bump lands on `main` |
| `.claude/skills/` | `/update` edits the guidelines, `/ship` releases, `/ship-at-end` does both |

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

Landing that bump on `main` tags the release from CI. Never tag by hand: a cloud
session cannot push `refs/tags/*` at all, so a tag step in the local workflow is
one more thing that silently only works from a laptop. The workflow needs the
repo's Settings > Actions > General > Workflow permissions on "Read and write";
on the read-only default its tag push fails with a 403.

A bump on `main` reaches cloud sessions by itself: the environment's settings
list this repo under `extraKnownMarketplaces`, so each container clones `main`
when it starts. A session started five minutes after 0.53.0 merged loaded
0.53.0. A copy synced to a claude.ai account (Customize > Plugins > Add >
Manage marketplaces) is another matter: the repo has no webhook, so that copy
re-syncs only on "Check for updates". One account sat on 0.32.0 for two weeks
with "Sync automatically" on, and desktop sessions have loaded that copy over
the local install.

Match the file's style: one guideline per bullet, terse fragments, a short
inline example only where it sharpens the rule.

**Re-wording a bullet that was disobeyed is the weakest answer available.** The
bullet was read and lost to something else, so sharper phrasing only raises its
claim on attention — and every bullet raised the same way costs the rest of the
file. Before rewriting one that has failed in the wild, ask whether the
violation is detectable in the final message by a string. Where it is, enforce
it as a hook (see [Stop hooks](#stop-hooks)) and leave the wording alone; where
it is not, the bullet is doing all it can and the next edit should be to cut
something competing with it.

**A bullet obeyed into bad behavior is fixed at its premise.** When a reply
misbehaves, trace it to the bullet behind it first: a claim that text before an
ask goes unread made asks carry tables, then whole reports once tables were
banned. A mechanism claim given as a reason drives behavior past its literal
instruction — remove it, or verify it in the app it describes.

### Resolving a stale branch

A session that sat while `main` moved on conflicts in `communication.md`,
`plugin.json` and `README.md`, and each resolves differently.

- **`communication.md`:** both sides are real guidelines — keep the ones from
  `main` and re-place yours among them.
- **`plugin.json`:** take the version from `main` and bump *that*, never your
  branch's number, which a stale base makes lower than what already shipped —
  and a lower version on `main` makes `claude plugin update` answer "already at
  the latest version" forever.
- **`README.md`:** never resolve by hand — `git checkout origin/main --
  README.md`, then `./build.sh` regenerates it from the file you just merged.

## Stop hooks

Everything in `communication.md` is prose a model weighs. Three bullets are also
enforced: a `Stop` hook reads the last assistant message when the session stops,
and exits 2 — which returns the reason as feedback and gets the message
rewritten — when a line breaks the bullet. Injected wording did not hold the
first of them: the git-mechanics bullet had been in the file for five releases,
worded and re-worded, and was still being disobeyed in the middle of otherwise
obedient reports. A hook does not weigh anything, which is the whole of why it
works.

| hook | guards the bullet | refuses a line that |
|---|---|---|
| `no-git-noise.mjs` | "Handle fetch, rebase, pull and merge silently" | names git mechanics that went as planned |
| `no-check-noise.mjs` | "Report a check only when it failed" | narrates checks that passed |
| `no-label-leads.mjs` | "The bold lead states the line's content, never labels it" | leads with a bold question |

Each hook's terms, its exception, and the sweeps they came from are in
[docs/stop-hook-terms.md](docs/stop-hook-terms.md).

### Shared machinery

The terms, the exception and the reason live in `hooks/rules/<rule>.mjs`,
exported as `rule = { blocked, offending, rewrite }` — the reason's first line,
a function returning the lines to refuse, and the rewrite instruction — and
listed in `rules/index.mjs`. Everything else lives in `hooks/lib/final-report.mjs`:
a new hook is a stub calling `checkFinalReport(rule)`, with its own entry
beside the others in `hooks.json`'s `Stop` hooks, prefixed like them. Keep
`blocked` distinct from every other hook's: the guard below finds it by substring.

- **Separate hooks, one reason each.** The reason is what the model rewrites
  against, and one reason naming two concerns tells it less about either.
  Splitting costs no extra round: the hooks fire on the same stop and their
  reasons arrive together, so a report with two kinds of noise is blocked once
  and rewritten once — checked live, one `stop_hook_summary` carried both
  reasons and the next stop carried neither. A third showing happens only when
  a rewrite adds the other kind, which the reasons tell it not to do.
- **A refused report is hidden, not shown twice.** Stop fires after the
  message is on screen, so `render/hide-refused-draft.tsx`, a mod (a
  `ui.render` hook named under `modules` in `hooks.json`), draws a reply that
  breaks a rule as nothing until that rule's feedback precedes it. Drawing
  only: the model keeps the original. A cloud session never calls it — no app
  viewing one asks the engine to draw — so there the user sees both, and
  `lib/final-report.mjs`, on `CLAUDE_CODE_REMOTE=true`, has the rewrite open
  with `TO PUT IT BLUNTLY…` to mark it as the one that stands. It imports `rules/index.mjs`, so a rule
  file importing anything from Node breaks it. Mechanism, dead ends and how to
  verify a display change — in the desktop app; `claude -p` passed both dead
  ends — are in [docs/hiding-refused-replies.md](docs/hiding-refused-replies.md).
- **The block's reason still quotes the refused lines** in the "Hook
  re-prompted Claude" row, collapsed by default in the desktop app. A
  user-level Stop hook's reason arrives alongside, and a decision pass that
  says "do not rewrite" contradicts this one's rewrite.
- **A hook's own earlier block ends the loop, not `stop_hook_active`.** The flag
  says *some* Stop hook blocked, and it stays true for the whole continuation,
  tool calls included — so a decision pass that blocks and opens an ask would
  wave every later report through unchecked. A `fast-forwarded` report reached
  a user exactly that way. A hook skips only when the flag is set **and** a
  `stop_hook_summary` since the last typed prompt carries its own reason in
  `hookErrors`; the summary is written before the next stop fires. Match on
  that entry type only — a tool result that prints the hook file, or a message
  quoting the reason, carries the same string. Each guard matches its own
  reason only, so no hook's block waves another's check through. Verified with
  `claude -p --settings <file>` adding a Stop hook that blocks once:
  no-git-noise then blocks under the flag, and an identical rewrite goes
  through.
- **The message judged is the input's `last_assistant_message`,** with the
  transcript as the fallback. The transcript can lag the stop by one message:
  a supernova report passed its own stop, and the next stop was blocked on
  that report's lines while the reply it stopped carried none of them — 10 of
  312 past blocks quoted an earlier message than the one they stopped. A
  throwaway Stop hook under `claude -p --settings` that saves its stdin shows
  the whole input.
- **Anything a hook cannot read is not a veto** — no transcript, an
  unparseable line, a turn with no text: exit 0.
- **Run a Node hook under `env -u NODE_USE_SYSTEM_CA`.** Claude Code sets it for
  hooks, and it makes every Node start load the system certificates — about
  ten times the cost of the script itself, paid on every stop. Only a hook that
  makes TLS calls needs it.

### Changing a hook's terms

- **Add a term only after a report actually carried it.** The list is what has
  been observed, not what could conceivably be narrated; a term nobody has
  written is a false positive waiting to happen.
- **Sweep the transcripts first.** Pull every final message from
  `~/.claude/projects/*/*.jsonl` (the last assistant text before each typed
  prompt), pipe each through the hook, and read the lines it refuses. Run the
  sweep under `env -u NODE_USE_SYSTEM_CA` too: a Node start per message with
  the certificates loaded outruns a two-minute command timeout — or import the
  rule and call `offending` on each message, which needs no Node start at all.
- **Diff the refused lines before and after the edit, both ways.** Lines added
  are new refusals, each to read; lines removed are refusals the edit lost.

### Testing a hook

- **Add the line a report carried past it to `test/`,** and run a bare `node
  --test` from the root: `node --test test/` runs the folder as one file and
  fails.
- **Test it against a transcript, not by reasoning.** A JSONL file of one
  `{"type":"assistant"}` entry piped in with `{"stop_hook_active":false,
  "transcript_path":...}` is the whole harness; add `last_assistant_message`
  to test the message that is stopping rather than the transcript's last.
- **Then try it for real** with `claude --plugin-dir plugins/blunt -p … <
  /dev/null`, which fires the hook on its own final message. Asked to state git
  work it never did, the model refuses, so a live run never produces the
  offending line; frame the prompt as a hook test and have it repeat a fixed
  string whatever any hook says. Add `--output-format json` for the
  `session_id`; that session's transcript under
  `~/.claude/projects/*/<session_id>.jsonl` shows each `stop_hook_summary` and
  its `hookErrors`, which is the evidence the block happened and the guard
  released the repeat.
- **Test the guard with four transcripts, whatever the hook.** Under
  `stop_hook_active:true`: its own reason in a `stop_hook_summary` after the
  last typed prompt passes; another hook's reason there, its own reason before
  that prompt, or its reason quoted in an assistant message still blocks. The
  guard lives in `lib/final-report.mjs`, so the same four catch a regression in
  any hook.
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

`claude -p` has no ask tool, even with `--allowedTools AskUserQuestion`: the
options come out as prose. A headless run checks the text before an ask, never
the ask's layout or how the desktop app draws it.

## Testing your own output

The guidelines are injected into your session too. When they are active, they
govern the last message before control returns to the user — not your
narration between tool calls, which stays fully detailed.

What the `SessionStart` hook injects is the **installed** plugin's copy, not the
working tree's. A bullet you just wrote is missing from it, and bullets you have
never seen are in it — that is the installed version differing from your branch,
not an edit that failed to land. Check the file, not the injection.

## Reporting

Never suggest restarting Claude Code; that is `claude plugin update`'s own advice.
After `/ship`, end on the last bullet — no "Done.", no "Ready to …" line; nothing is waiting on the user.

## Session titles

The chat sidebar shows a status dot (running / awaiting input / idle) and a branch glyph for
worktree sessions; neither can be set from here — `set_session_title` (the desktop app's
`mcp__ccd_session_mgmt__set_session_title`, or in a cloud session
`mcp__claude-code-remote__set_session_title` with the `ccr.id` that
`mcp__claude-code-remote__get_session` returns) takes a title string and nothing else. So a **single leading emoji on the title** is the only lever, and it is spent on
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

The rest of the convention — precedence, never mentioning a prefix, one stage at a time —
is the global session-titles glossary; this section names only the local half.

The lifecycle ✏️ → 🚀 is set by skills where one owns the stage (`update` sets ✏️ before it edits;
`ship` sets 🚀 before it builds and puts it back if the push fails), so it stays true on its own.
📚 is set in the response that invokes the `learn` skill — before reading anything or making any
edit. The rest are set in the response that enters the stage, and nothing reconciles a title against reality —
an abandoned session keeps whatever prefix it had. 🚙 in particular is worth setting before handing
work back: the idle dot cannot tell "waiting on you" from "given up on". ⏲️ is the clock's
version of it: a task scheduled for later with nothing to do until it fires. 🚙 takes precedence
where the same response also needs the user — a person can act and the clock cannot.
