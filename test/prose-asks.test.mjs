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
  // A standing offer on the rest of a handoff (supernova, v0.59.0)
  [
    [
      'Still to do from the handoff:',
      '- Step 4, move in from the Mac. It needs Supernova.app and the Claude desktop app quit first.',
      '- Step 5, the iPhone app. It needs Xcode and an Apple Developer team.',
      '',
      'I can start step 4 whenever you say.',
    ].join('\n'),
    'I can start step 4 whenever you say.',
  ],
  // Standing offers from past final messages
  ['Ready when you are — I\'ll read the log once the window closes.', 'Ready when you are — I\'ll read the log once the window closes.'],
  ['Ready to start implementing whenever you are.', 'Ready to start implementing whenever you are.'],
  ['Still happy to run the monitor across the 30 PRs — just say which.', 'Still happy to run the monitor across the 30 PRs — just say which.'],
  [
    'Not committed — say the word and I\'ll commit the ministore fix.',
    'Not committed — say the word and I\'ll commit the ministore fix.',
  ],
  ["When you're ready, I'll start the recording.", "When you're ready, I'll start the recording."],
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
  // A standing-offer phrase that is not the ending
  ['Step 4 started when you said the word; just say so to stop it.', 'Step 4 moved your chats to the box.'].join('\n'),
  // A plain report, and an instruction to the user
  ['- Step 4 done: chats moved to the box.', '- Step 5 needs Xcode and an Apple Developer team.'].join('\n'),
  "Next time it breaks, just say so, ideally with the rough time.",
  'This session has no archive tool, so archive it from the sidebar whenever you like.',
  // The phrase quoted in inline code
  'The rule now refuses endings like `I can start step 4 whenever you say.`',
]

test('refuses a decision asked in prose', () => {
  for (const [message, line] of refused) assert.deepEqual(rule.offending(message), [line], message)
})

test('passes a question that offers no choice, or is not the ending', () => {
  for (const message of passed) assert.deepEqual(rule.offending(message), [], message)
})
