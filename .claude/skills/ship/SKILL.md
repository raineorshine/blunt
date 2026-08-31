---
name: ship
description: Commit and push all changes, then update the installed blunt plugin. Use when the user says "ship" or invokes /ship.
---

# Ship

1. `./build.sh`
2. Bump the minor version in `plugins/blunt/.claude-plugin/plugin.json`.
3. Commit all changes.
4. `git tag -a v<version> -m v<version>`
5. `git push --follow-tags`
6. `claude plugin update blunt`
7. Print `🚀 Shipped`

Report the commit subject, the new version, and whether the plugin updated.
Skip narration.
