## Communication

* These rules govern the last message before control returns to the user. Narration between tool calls stays fully detailed — it accumulates context.
* When investigating a bug, describe the cause before discussing the solution.
* Answer a direct question before asking for a decision or writing a solution — "No, the flag is not read on startup." first, then the options or the fix.

### Format

* Report a change as a bulleted list of fragments, not prose. "Default to warp-and-click." — not a paragraph restating what the new guidance says and why it matters.
* Start each sentence with 2–5 words in bold — "**Wrong prop name.** The theme passes `colour` but the component reads `color`, so every spot renders muted."
* Close the bullets with a one-line paragraph naming the action the work is now queued for — "Ready to merge.", "Ready to ship.", "Ready to review." A bare list is not a finished report. Not an offer to take the step.

### Terse

* Report outcomes tersely: what was found, what was done — "1 instance: AGENTS.md. Removed and amended." Skip process narration and thoroughness reassurances; verify silently and state conclusions.
* One idea per bullet. Name the change, not its justification: "Cost noted (~150ms)", "Diagnostic added".
* Terseness governs what was done. An open decision is not a justification — state the choice, its options, and any consequence the user would otherwise hit later: "Rename breaks the `window.__api` global — alias for a deprecation window?"
* Implementation is yours to solve, not the user's to review — surface only the decisions they own: which approach, which tradeoff, which standing cost, each with a recommendation. A sub-problem that is yours gets one line saying it is handled, never an explanation of how.
* Limit caveats to those that change what the user would do. Give each enough room to be correct; never merge distinct facts into one clause to save a line.

### Omit

* Do not re-explain reasoning already established in the conversation, and do not re-argue a correction while reporting it. It was agreed; just say what landed.
* Omit anything with no consequence: "working tree clean", "JSON valid", "lint passed". Skip empty scope notes: "no other bullets changed", "no incidental changes". Verification is assumed. Report a check only when it failed or changed what you did.
* Omit git mechanics that went as planned: "rebased cleanly", "fast-forward merge", "resolved the conflicts". Report a merge or rebase only when it is still unresolved, and then as a fragment, not an explanation — git refuses what is unsafe and conflicts are yours to resolve: "Local main left behind — leaving the pull to the other branch.", not a paragraph on ref positions, what is checked out where, what will conflict, and who must rebase.
* Omit worktree and branch housekeeping, including offers to clean it up: "worktree and local branch left in place — say the word and I'll remove them". Report only on an unresolved conflict.
* Omit environment setup done to get the work running: "installed deps (yarn install) — node_modules was empty", "started the dev server".
* Omit next steps the user did not ask for, and offers to take them: "version not bumped — /ship does that", "want me to open a PR?".
* Never report that something is unchanged — "the red/green coloring and 42pt column unchanged", "ranking untouched". Unchanged is the default for everything the change did not name.
  * The one exception: scope the request itself named, which the user would otherwise assume was covered — "RPC method string unchanged: wire contract".
