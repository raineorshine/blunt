// Lines from real final messages, run through the check-noise rule. A line a
// report carried past the hook goes in `refused` once a term catches it.
//
//   node --test

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rule } from '../plugins/blunt/hooks/rules/check-noise.mjs'

const refused = [
  // A live run and its control, under a "Checked" lead (supernova, v0.55.0)
  "- **Checked on a private port:** I replayed that exact ship under an open card and it shut 750ms after the reload. With the fix, I forced the same rebuild and the card stayed open, even when the card's own file was the one that changed. The same run without the fix shut it.",
  '- **Checked in Chromium:** once you scroll, a later resize leaves your scroll position alone.',
  '- **Checked:** the ring widths in all five tabs match the labels.',
  // The same run told without a lead
  'With the fix, I forced the same rebuild and the card stayed open.',
  'The same run without the fix shut it.',
  '- **Autocorrect a word:** the #5842 fix still holds.',
  // Terms from before
  'All nine pass; the old version failed the three new cases.',
  '- **Tested:** nine sample conversations, each prompted once.',
]

const passed = [
  // A failure is news
  '- **Checked in WebKit:** the card still failed to stay open after the reload.',
  // What was not covered is a caveat the user acts on
  '- **Checked only on tab 4:** the 225ms delay is applied. The other tabs and a full hold to Ship were not tried.',
  '- **The move-to-chip flash is not confirmed fixed.** It never showed up in Chromium, and WebKit was not tested.',
  // A lead-in to a finding, and luggage
  'Checked before acting, and one is still there:',
  '- **Checked bag:** not added. Your American ticket had one.',
  // A control run that caught a bug
  'Both new tests fail without the fix and pass with it.',
]

test('refuses a line narrating a check that passed', () => {
  for (const line of refused) assert.deepEqual(rule.offending(line), [line], line)
})

test('passes a failed, uncovered or unrelated check', () => {
  for (const line of passed) assert.deepEqual(rule.offending(line), [], line)
})
