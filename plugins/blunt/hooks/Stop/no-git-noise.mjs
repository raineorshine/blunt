#!/usr/bin/env node
// Stop hook: refuses a final message that narrates git mechanics. The terms, and why
// they are what they are, live in ../rules/git-noise.mjs, shared with the mod that
// hides a refused reply in the desktop app.
//
// hooks.json runs this under `env -u NODE_USE_SYSTEM_CA`: Claude Code sets it for
// hooks, and it makes every Node start load the system certificates, ten times
// the cost of a script that never touches the network.

import { checkFinalReport } from '../lib/final-report.mjs'
import { rule } from '../rules/git-noise.mjs'

checkFinalReport(rule)
