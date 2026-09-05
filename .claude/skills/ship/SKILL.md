---
name: ship
description: Commit and push all changes, then update the installed blunt plugin. Use when the user says "ship" or invokes /ship.
---

# Ship

Run the whole sequence unattended. Never stop and ask the user to merge, tag, or update by hand.

1. Set the session title prefix to 🚀 (see Session titles in AGENTS.md). Say nothing about it.
2. `./build.sh`
3. Bump the minor version in `plugins/blunt/.claude-plugin/plugin.json`.
4. Commit all changes.
5. `git fetch origin && git rebase origin/main` — resolve any conflicts.
6. `git tag -a v<version> -m v<version>`
7. `git push --follow-tags` (add `--set-upstream origin <branch>` on the first push of a branch).
8. Land it on `main`: `git push origin HEAD:main`. The plugin marketplace serves `main`, so a release left on a branch has not shipped.
9. `claude plugin update blunt`
10. Print `🚀 Shipped`

If step 9 still reports the old version, the release did not land — say so instead of reporting success.

If the push fails, put the prefix back to what it was.

Report the commit subject, the new version, and whether the plugin updated.
Skip narration.
