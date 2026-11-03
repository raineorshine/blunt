#!/usr/bin/env node
// PostToolUse hook on AskUserQuestion: when the user answered with a question
// instead of a pick, says so beside the answer. The misread happens here — a
// question typed into "Other" reads like a decision, and the work starts — so
// this is where the reminder lands, not at the final message, where whether a
// reply answers a question is not something a string can tell.
//
// hooks.json runs this under `env -u NODE_USE_SYSTEM_CA`, like the Stop hooks.

import { readFileSync } from 'node:fs'
import { askedBack } from '../lib/asked-back.mjs'

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}
const questions = askedBack(input.tool_response)
if (questions.length === 0) process.exit(0)

const additionalContext = [
  'The user answered this ask with a question, not a pick:',
  '',
  ...questions.map(q => `  ${q}`),
  '',
  'It is a direct question. Answer it — in the final message, before any report',
  'of work — even if the answer settles what to build. Where it overturns your',
  'recommendation, say what the recommendation got wrong.',
].join('\n')

console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } }))
