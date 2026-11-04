// Lines from real final messages, run through the file-lists rule. A list a
// report carried past the hook goes in `refused` with the lines the rule quotes.
//
//   node --test

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rule } from '../plugins/blunt/hooks/rules/file-lists.mjs'

const refused = [
  // A heading over a File | Change table (supernova, v0.58.0)
  [
    [
      'Done notes now come back after a restart.',
      '',
      '**Files changed:**',
      '',
      '| File | Change |',
      '|---|---|',
      '| `src/lib/dones.ts` | New return rule; helpers to drop, encode and decode saved notes |',
      '| `src/lib/returnsFile.ts` (new) | Reads and saves the file |',
      '| `.claude/launch.json` | The worktree preview gets a scratch copy of the file |',
    ].join('\n'),
    [
      '**Files changed:**',
      '| File | Change |',
      '| `src/lib/dones.ts` | New return rule; helpers to drop, encode and decode saved notes |',
      '| `src/lib/returnsFile.ts` (new) | Reads and saves the file |',
      '| `.claude/launch.json` | The worktree preview gets a scratch copy of the file |',
    ],
  ],
  // A bullet per file, each led by its path in bold (em)
  [
    [
      '- **`src/actions/pinAll.ts`** (new, 64 lines) — the whole three-way branch as a pure reducer.',
      '- **`src/commands/pinAll.ts`** — 121 → 45 lines, with no business logic left.',
      '- **`src/selectors/isChildrenPinned.ts`** (new, 10 lines) — this read already existed privately.',
    ].join('\n'),
    null,
  ],
  // Leads that are markdown links to the file (em)
  [
    [
      '- **[testflight.yml](.github/workflows/testflight.yml) builds, signs and uploads the app.**',
      '- **[Info.plist](ios/App/App/Info.plist) declares the app\'s encryption exempt.**',
      '- **[README.md](README.md) lists the four secrets** in a new TestFlight section.',
    ].join('\n'),
    null,
  ],
  // The file column on the right (em)
  ['| Change | File |\n|---|---|\n| Drops the retry | `src/retry.ts` |', ['| Change | File |']],
  ['### Changes by file', null],
]

const passed = [
  // One path the user has to open
  '- **Open `~/.claude/settings.json`** and add the key under `env`.',
  'The fix is in `src/lib/dones.ts`, and done notes now come back after a restart.',
  // Folders and branch names are not files
  '- **`~/projects` (218 GB):** mostly `node_modules` folders.\n- **`~/.nvm` (44 GB):** old Node versions.\n- **`~/Documents` (70 GB):** not broken down yet.',
  '| chronicle/sidebar-menu | 51d | Push |\n| em/beautiful-bartik | 61d | Push |\n| em/ios-profile | 53d | Push |',
  // Code under review, by line
  '| `src/a.ts:61` | x |\n| `src/b.rs:128` | y |\n| `docs/c.md:224` | z |',
  // Two items are not a run
  '- `a.ts` — x\n- `b.ts` — y',
  // A quoted fixture
  '```\n**Files changed:**\n| File | Change |\n|---|---|\n```',
]

test('refuses a list of the files a change touched', () => {
  for (const [message, lines] of refused) {
    const expected = lines ?? message.split('\n').map(l => l.trim()).filter(Boolean)
    assert.deepEqual(rule.offending(message), expected, message)
  }
})

test('passes a single path, a folder, a branch or a quoted fixture', () => {
  for (const message of passed) assert.deepEqual(rule.offending(message), [], message)
})
