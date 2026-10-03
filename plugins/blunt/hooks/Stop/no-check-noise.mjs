#!/usr/bin/env node
// Stop hook: refuses a final message that narrates checks which passed.
//
// communication.md has said "Verification is assumed. Report a check only when
// it failed or changed what you did" for many releases, and extended it to the
// delivered work — and a report still closed on "All nine pass; the old version
// failed the three new cases. One live run confirmed it prompts once and then
// stops." Same failure as git mechanics, same answer: a hook does not weigh the
// rule against the pull to show the work. Working is what reporting a change
// already claims; only a failure is news.
//
// The exception is encoded, and it is narrower than no-git-noise's. A passing
// report routinely carries a failure word — red before green, "the old version
// failed" — so a failure word excuses only its own clause (split at . ; ! ?),
// and a count of nothing ("0 failed", "no failures") is not one. What a check
// did *not* cover is a caveat the user acts on, so a line saying something was
// not tested, not run or not verified passes whole, as does one naming checks
// still in flight.
//
// CI status is deliberately absent from the terms. "Merged after every check
// passed" answers the request when the user gated the merge on CI, and the hook
// cannot tell that request apart from noise.
//
// hooks.json runs this under `env -u NODE_USE_SYSTEM_CA`, as no-git-noise.

import { checkFinalReport } from '../lib/final-report.mjs'

/** Phrasings of a check that went as planned, each carried by a real report. */
const PASSED = [
  /\btests? (all |still |now )?pass(es|ed)?\b/i, // "38 tests pass", "the Editable tests still pass"
  /\ball (?!checks?\b|CI\b)\w+ (\w+ )?pass(es|ed)?\b/i, // "All nine pass", "all 4 url tests pass"
  /\b\d+ passing( tests?)?\b/i, // "12 passing tests"
  /\btests? passing\b/i, // "40 tests passing"
  /\b\d+ passed\b/i, // "1813 passed, 0 failed"
  /\b(lint|typecheck|type check|build)( and \w+)? pass(es|ed)?\b/i, // "Full lint passes", "build and tests pass"
  // "Gates pass.", "All gates green", "Full suite green" — but not "the gate passes facts"
  /\b(gates?|suite) (all )?(pass(es|ed)?|green)\b(?!\s+(?!on\b|in\b|for\b|here\b|locally\b)[a-z])/i,
  /\b(tsc|eslint|lint|typecheck|prettier)\b[^.;]*\bclean\b/i, // "`tsc` and eslint clean"
  /\bconfirmed it\b/i, // "One live run confirmed it prompts once"
  /\btested and working\b/i,
]

/** A line that opens on its verification: "- **Tested:** nine sample conversations". */
const VERIFICATION_LEAD = /^[\s>*-]*(tested|verified|verification)\b[^:]{0,40}:/i

/**
 * A failure in the same clause makes it news — unless it counts nothing — and so
 * does a test passing where it should not: "the archive test passes on main",
 * "both were invisible to 78 passing tests".
 */
const FAILED =
  /\b(fail(s|ed|ing|ures?)?|broke|broken|regress(ed|ion|es)?|flak(y|e|es))\b|\bon main\b|\binvisible to\b/i
const NO_FAILURES = /\b(0|zero|no|none|without)\s+(\w+\s+)?fail\w*/gi

/**
 * A line naming what was not covered, or what is still running, is a caveat; a
 * line about a bug is the finding itself.
 */
const UNVERIFIED = new RegExp(
  [
    String.raw`\b(not|never|wasn't|weren't|isn't|aren't|hasn't|haven't|didn't|did not|couldn't|could not|can't|cannot)\s+(\w+\s+)?(tested|verified|run|ran|re-run|measured|checked|exercised|covered)\b`,
    String.raw`\b(untested|unverified)\b`,
    String.raw`\bstill (running|pending|in progress)\b`,
    String.raw`\bwaiting (on|for)\b`,
    String.raw`\bbugs?\b`,
  ].join('|'),
  'i',
)

const offending = text => {
  const found = []
  for (const line of text.split('\n')) {
    if (UNVERIFIED.test(line)) continue
    const failed = c => FAILED.test(c.replace(NO_FAILURES, ''))
    if (VERIFICATION_LEAD.test(line) && !failed(line)) {
      found.push(line.trim())
      continue
    }
    const clauses = line.split(/[.;!?](?:\s|$)/)
    const passed = clauses.some(c => !failed(c) && PASSED.some(re => re.test(c)))
    if (passed) found.push(line.trim())
  }
  return found
}

checkFinalReport({
  // First line of the block reason; also how a later stop recognises the block.
  blocked: 'Blocked: the report narrates checks that passed.',
  offending,
  rewrite: [
    'Rewrite the final message without them. Working is what reporting the',
    'change already claims; a passing test, gate or live run adds nothing. Keep',
    'a check only where it failed, found a bug, or changed what you did — and',
    'say what it was not run against, where the user would act on that.',
    'Change nothing in the repository: this is the message, not the work.',
  ],
})
