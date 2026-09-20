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
6. `git push` (add `--set-upstream origin <branch>` on the first push of a branch).
7. Land it on `main`. The plugin marketplace serves `main`, so a release left on a
   branch has not shipped.
   - Locally: `git push origin HEAD:main`.
   - From a cloud session that is refused: open a PR for the branch and merge it
     with the GitHub tools. Rebase-merge, to keep `main` linear.
8. Confirm the tag. `.github/workflows/tag-release.yml` tags `v<version>` when the
   version bump lands on `main`; never tag by hand.
   `git fetch origin --tags --force && git tag -l v<version>` — retry for up to a
   minute while Actions runs.
9. `claude plugin marketplace update blunt && claude plugin update blunt` — without the
   marketplace refresh, the cached listing reports the pre-push version as latest.
10. Print `🚀 Shipped`

If step 9 still reports the old version, the release did not land — say so instead of reporting success.
If step 8 finds no tag, say which version is untagged; do not report a clean ship.

If the push fails, put the prefix back to what it was.

Report the commit subject, the new version, and whether the plugin updated.
Skip narration.
