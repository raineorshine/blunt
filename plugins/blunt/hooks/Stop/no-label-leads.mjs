#!/usr/bin/env node
// Stop hook: refuses a final message whose bold lead poses a question.
//
// communication.md says the bold lead "states the line's content, never labels
// it", and names question-shaped leads as labels in a bullet of their own — and
// a report still went out with "Where it goes:", "Separate hook or folded in:"
// and "What it starts from:" on three bullets in a row. A lead that asks what,
// why or where promises the content instead of being it, and the reader has to
// get to the end of the line to learn anything.
//
// No exception is encoded, not even for a lead that is a whole sentence: "What
// landed is the report." blocks too. Coarse on purpose — a "has a verb" escape
// would have let all the observed cases through, since "Where it goes" has one
// — and the way past is a one-word rephrase: "The report is what landed."
// A colon is not the test either; "Note:" and "Root cause:" are left alone.
//
// Only a lead counts: a bold span at the start of a line, after any list
// marker. Code fences and quoted lines are skipped, and a span opened inside a
// code span never starts the line, so it is never seen.
//
// hooks.json runs this under `env -u NODE_USE_SYSTEM_CA`, as no-git-noise.

import { checkFinalReport } from '../lib/final-report.mjs'

/** A bold span leading a line or list item; group 1 is its text. */
const LEAD = /^\s*(?:[-*+]\s+|\d+[.)]\s+)?\*\*(.+?)\*\*/

/**
 * Question words a real report opened a bold lead with. "When" is absent on
 * purpose: reports use it for a condition ("When the send fails:"), not a label.
 */
const QUESTION = /^(what|why|where|how|which|who)\b/i

const FENCE = /^\s*(```|~~~)/

const offending = text => {
  const found = []
  let fenced = false
  for (const line of text.split('\n')) {
    if (FENCE.test(line)) {
      fenced = !fenced
      continue
    }
    if (fenced || /^\s*>/.test(line)) continue
    const lead = line.match(LEAD)?.[1].trim()
    if (lead && QUESTION.test(lead)) found.push(`**${lead}**`)
  }
  return found
}

checkFinalReport({
  // First line of the block reason; also how a later stop recognises the block.
  blocked: 'Blocked: a bold lead poses a question instead of stating the line.',
  offending,
  rewrite: [
    'Turn each into the sentence it stands for — the answer, not the question:',
    '"**Where it goes:**" becomes "**It goes in blunt, beside the git-noise',
    'check.**". A lead is read alone; it has to say something by itself.',
    'Change nothing in the repository: this is the message, not the work.',
  ],
})
