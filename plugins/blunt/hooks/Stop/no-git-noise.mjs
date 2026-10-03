#!/usr/bin/env node
// Stop hook: refuses a final message that narrates git mechanics.
//
// The guideline that bans them has been in communication.md since v0.34 and is
// still disobeyed — a model weighs injected prose against its own pull to show
// the work, and a blunter wording only raises the estimate of how much the rule
// matters. This does not weigh anything: it reads the message that was just
// written, and exits 2 when a banned term is in it, which sends the reason back
// as feedback and gets the message rewritten. The user has already seen the
// blocked one — Stop fires after it is displayed — so the rewrite follows it.
//
// The exception is encoded rather than judged. A rebase that is still
// unresolved, a fast-forward that failed, a conflict left in the tree — those
// are findings, and the rule has always said so. A line is allowed to carry a
// banned term when it also carries a word that says something is unresolved.
// That is coarse on purpose: it can be satisfied by saying what is broken, and
// a line with nothing broken in it has no business naming the mechanics.
//
// hooks.json runs this under `env -u NODE_USE_SYSTEM_CA`. Claude Code sets that
// variable for its hooks, and it makes Node load the system certificates on
// every start — ~280ms against ~25ms without it, on every stop, for a script
// that never touches the network. Keep the prefix.

import { checkFinalReport } from '../lib/final-report.mjs'

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

checkFinalReport({
  // First line of the block reason; also how a later stop recognises the block.
  blocked: 'Blocked: the report narrates git mechanics that went as planned.',
  offending: text =>
    text
      .split('\n')
      .filter(line => !UNRESOLVED.test(line) && MECHANICS.some(re => re.test(line)))
      .map(line => line.trim()),
  rewrite: [
    'Rewrite the final message without them. What landed is the report; how it',
    'got there is not. Keep the term only on a line that says what is still',
    'unresolved — a push that was refused, a merge left for someone else.',
    'Change nothing in the repository: this is the message, not the work.',
  ],
})
