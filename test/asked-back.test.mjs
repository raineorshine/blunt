// AskUserQuestion results run through askedBack. An answer that typed a
// question back instead of picking goes in `asked` with the questions it holds.
//
//   node --test

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { askedBack } from '../plugins/blunt/hooks/lib/asked-back.mjs'

const result = (answer, notes) => ({
  questions: [{ question: 'Q' }],
  answers: { Q: answer },
  ...(notes === undefined ? {} : { annotations: { Q: { notes } } }),
})

const asked = [
  // The "Other" text that went unanswered (supernova, v0.58.0)
  [
    result(
      'Wouldn’t a passing top PR mean all PRs below it passed, since the top PR is stacked on everything below? Why would we need to wait for all the lower checks?',
    ),
    [
      'Wouldn’t a passing top PR mean all PRs below it passed, since the top PR is stacked on everything below?',
      'Why would we need to wait for all the lower checks?',
    ],
  ],
  // A pick with a question in its note
  [result('Top’s checks only', 'Curious why you didn’t suggest a database?'), ['Curious why you didn’t suggest a database?']],
  // A quoted line is the agent's own words; the question under it is the user's
  [
    result('> How much coupling is worth buying?\n\nI don’t understand. Simplify it for me. What do you mean?'),
    ['What do you mean?'],
  ],
]

const passed = [
  result('Wait on their checks (Recommended)'),
  result('Refresh on a new request only.'),
  result('Leave the default', ''),
  undefined,
  'The user answered: "Q"="Why?"',
]

test('finds a question typed back into an ask', () => {
  for (const [r, questions] of asked) assert.deepEqual(askedBack(r), questions)
})

test('passes a pick and anything that is not an ask result', () => {
  for (const r of passed) assert.deepEqual(askedBack(r), [])
})
