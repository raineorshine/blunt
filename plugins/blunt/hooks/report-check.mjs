#!/usr/bin/env node
// Stop hook: refuses a final message that narrates git mechanics.
//
// The guideline that bans them has been in communication.md since v0.34 and is
// still disobeyed — a model weighs injected prose against its own pull to show
// the work, and a blunter wording only raises the estimate of how much the rule
// matters. This does not weigh anything: it reads the message that was just
// written, and exits 2 when a banned term is in it, which sends the reason back
// as feedback and lets the message be rewritten before the user sees it.
//
// The exception is encoded rather than judged. A rebase that is still
// unresolved, a fast-forward that failed, a conflict left in the tree — those
// are findings, and the rule has always said so. A line is allowed to carry a
// banned term when it also carries a word that says something is unresolved.
// That is coarse on purpose: it can be satisfied by saying what is broken, and
// a line with nothing broken in it has no business naming the mechanics.

import { readFileSync } from 'node:fs'

/** Terms that describe how the work reached its destination, not what landed. */
const MECHANICS = [
  /\brebas(e|ed|es|ing)\b/i,
  /\bfast[- ]forward(ed|s|ing)?\b/i,
  /\bff-only\b/i,
  /\bsquash(ed|es|ing)?\b/i,
  /\bcherry[- ]pick(ed|s|ing)?\b/i,
  /\bmerge commit\b/i,
  /\bmerge(d)? cleanly\b/i,
  /\bconflicts? (resolved|were resolved)\b/i,
  /\bresolved the conflicts?\b/i,
  /\bgit stash\b/i,
  /\bstashed\b/i,
  /\bworking tree (is )?clean\b/i,
  /\brounds? of (rebase|retry|retries)\b/i,
  /\brebase[- ]and[- ]retry\b/i,
  /\bretried the push\b/i,
]

/**
 * Words that make a line a finding rather than narration. Coarse by design —
 * the way past the block is to say what is still wrong, which is the one case
 * the rule was always meant to let through.
 */
const UNRESOLVED =
  /\b(unresolved|still|left behind|left alone|left in|failed|failing|refus(e|ed|es)|could not|cannot|blocked|abort(ed)?|stuck|needs|waiting on)\b/i

/** The text of the last thing this session said to the user, or ''. */
const lastAssistantText = transcriptPath => {
  let lines
  try {
    lines = readFileSync(transcriptPath, 'utf8').split('\n')
  } catch {
    // No transcript, nothing to check. A hook that cannot read is not a veto.
    return ''
  }
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].trim()) continue
    let entry
    try {
      entry = JSON.parse(lines[i])
    } catch {
      continue
    }
    // A subagent's report is not the message the user is about to read.
    if (entry.isSidechain) continue
    if (entry.type !== 'assistant') continue
    const content = entry.message?.content
    if (!Array.isArray(content)) continue
    const text = content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
    // Assistant turns that only called tools carry no text; keep looking back.
    if (text.trim()) return text
  }
  return ''
}

const input = JSON.parse(readFileSync(0, 'utf8'))

// Already blocked once this stop. Checking again is how a hook loops forever,
// and the rewrite has been asked for.
if (input.stop_hook_active) process.exit(0)

const text = lastAssistantText(input.transcript_path)

const offending = []
for (const line of text.split('\n')) {
  if (UNRESOLVED.test(line)) continue
  const hit = MECHANICS.find(re => re.test(line))
  if (hit) offending.push(line.trim())
}

if (offending.length === 0) process.exit(0)

console.error(
  [
    'Blocked: the report narrates git mechanics that went as planned.',
    '',
    ...offending.map(l => `  ${l}`),
    '',
    'Rewrite the final message without them. What landed is the report; how it',
    'got there is not. Keep the term only on a line that says what is still',
    'unresolved — a push that was refused, a merge left for someone else.',
    'Change nothing in the repository: this is the message, not the work.',
  ].join('\n'),
)
process.exit(2)
