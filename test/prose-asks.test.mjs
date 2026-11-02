// Final messages run through the prose-asks rule. A message that ended on a
// decision asked in prose goes in `refused` with the line the rule should quote.
//
//   node --test

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rule } from '../plugins/blunt/hooks/rules/prose-asks.mjs'

const refused = [
  // Options as bullets, one recommended, the question last (supernova, v0.57.0)
  [
    [
      'The harvester can start from any of three places.',
      '',
      '- Session transcripts (recommended) — every report is already there.',
      '- The desktop app database — richer, but its schema moves.',
      '- A new hook — clean data, but only from now on.',
      '',
      'Which one should I build: transcripts, the database, or a hook?',
    ].join('\n'),
    'Which one should I build: transcripts, the database, or a hook?',
  ],
  // The question first, the options under it
  [
    ['**Which capture design do you want?**', '', '1. Polling (recommended)', '2. A hook', '3. Both'].join('\n'),
    '**Which capture design do you want?**',
  ],
  // A choice between alternatives with no bullets at all
  [
    'Want me to open an issue for those, or start on the merge?',
    'Want me to open an issue for those, or start on the merge?',
  ],
  ['Which publishing route do you want?', 'Which publishing route do you want?'],
]

const passed = [
  // A clarifying question offers nothing to pick
  'The flag is set in two places. Is the one in `.env` still read on startup?',
  // A single offer is not a choice
  'Want me to open a PR?',
  // A question that is not the ending
  'Which should I build? The ask above has the options; I went with transcripts.',
  // A report quoting the shape, in a fence and in inline code
  ['Refused samples:', '```', '- A (recommended)', 'Which should I build?', '```', 'Both block.'].join('\n'),
  'The rule now refuses `Which one should I build?` endings.',
  // Recommended bullets with no question after them
  ['- Fail fast (recommended) — refuse if it does not fit.', '- Truncate.'].join('\n'),
]

test('refuses a decision asked in prose', () => {
  for (const [message, line] of refused) assert.deepEqual(rule.offending(message), [line], message)
})

test('passes a question that offers no choice, or is not the ending', () => {
  for (const message of passed) assert.deepEqual(rule.offending(message), [], message)
})
