// Lines from real final messages, run through the git-noise rule.
//
//   node --test

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rule } from '../plugins/blunt/hooks/rules/git-noise.mjs'

test('refuses mechanics that went as planned', () => {
  const line = 'Main moved twice during the ship. The rebase was clean.'
  assert.deepEqual(rule.offending(line), [line])
})

test('passes a learning about the workflow (supernova, v0.55.0)', () => {
  const line = "📚 main's reflog dates every fast-forward that moved the live slot, each carrying all its commits (`docs/diagnosing-a-hang.md:17`)"
  assert.deepEqual(rule.offending(line), [])
})
