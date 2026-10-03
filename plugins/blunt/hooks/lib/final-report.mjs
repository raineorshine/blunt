// Machinery shared by the Stop hooks that refuse a final report: reading the
// transcript, finding the message the user is about to read, and the guard that
// stops a hook from blocking its own rewrite forever. Each hook keeps its own
// terms, its own exception and its own reason — a reason is what the model
// rewrites against, and one reason per concern keeps the instruction sharp.

import { readFileSync } from 'node:fs'

/** The transcript as lines, or [] when it cannot be read. */
const readTranscript = transcriptPath => {
  try {
    return readFileSync(transcriptPath, 'utf8').split('\n')
  } catch {
    // No transcript, nothing to check. A hook that cannot read is not a veto.
    return []
  }
}

/** True for a prompt the user typed, as opposed to a tool result or hook feedback. */
const isUserPrompt = entry => {
  if (entry.type !== 'user' || entry.isMeta || entry.isSidechain) return false
  const content = entry.message?.content
  if (typeof content === 'string') return true
  return Array.isArray(content) && content.some(b => b.type === 'text')
}

/**
 * Whether the hook whose reason starts with `blocked` already blocked since the
 * user last typed, read from the stop_hook_summary entries, whose hookErrors
 * carry each blocking hook's stderr.
 */
const blockedThisTurn = (lines, blocked) => {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].trim()) continue
    let entry
    try {
      entry = JSON.parse(lines[i])
    } catch {
      continue
    }
    if (isUserPrompt(entry)) return false
    // Only hook records count: a tool result that prints a hook file, or a
    // message quoting the reason, carries the same string.
    if (
      entry.type === 'system' &&
      entry.subtype === 'stop_hook_summary' &&
      (entry.hookErrors ?? []).some(e => String(e).includes(blocked))
    )
      return true
  }
  return false
}

/** The text of the last thing this session said to the user, or ''. */
const lastAssistantText = lines => {
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

/**
 * Run one Stop hook: hand the final report to `offending`, which returns the
 * lines to refuse, and exit 2 with `blocked` and `rewrite` when there are any.
 */
export const checkFinalReport = ({ blocked, offending, rewrite }) => {
  let input
  try {
    input = JSON.parse(readFileSync(0, 'utf8'))
  } catch {
    process.exit(0)
  }
  const lines = readTranscript(input.transcript_path)

  // stop_hook_active says *some* Stop hook blocked earlier in this
  // continuation, and stays true through every tool call after it — another
  // hook's block (a decision pass that opens an ask) would otherwise wave every
  // later report through unchecked. Skip only when the block was this hook's
  // own: checking again is how a hook loops forever, and the rewrite has been
  // asked for.
  if (input.stop_hook_active && blockedThisTurn(lines, blocked)) process.exit(0)

  const found = offending(lastAssistantText(lines))
  if (found.length === 0) process.exit(0)

  console.error([blocked, '', ...found.map(l => `  ${l}`), '', ...rewrite].join('\n'))
  process.exit(2)
}
