---
name: ship
description: Commit and push all changes, then update the installed blunt plugin. Use when the user says "ship" or invokes /ship.
---

# Ship

Run the whole sequence unattended. Never stop and ask the user to merge, tag, or update by hand.

1. `./build.sh`
2. Bump the minor version in `plugins/blunt/.claude-plugin/plugin.json`.
3. Commit all changes.
4. `git fetch origin && git rebase origin/main` — resolve any conflicts.
5. `git tag -a v<version> -m v<version>`
6. `git push --follow-tags` (add `--set-upstream origin <branch>` on the first push of a branch).
7. Land it on `main`: `git push origin HEAD:main`. The plugin marketplace serves `main`, so a release left on a branch has not shipped.
8. `claude plugin update blunt`
9. Print `🚀 Shipped`

If step 8 still reports the old version, the release did not land — say so instead of reporting success.

Report the commit subject, the new version, and whether the plugin updated.
Skip narration.
