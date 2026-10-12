import type { Register } from 'claude-code'

import { RULES } from '../rules/index.mjs'

type Message = { role: string; text: string }

const FEEDBACK = 'Stop hook feedback'

/** Index of the stored message this drawn block belongs to; past the end while it streams. */
const indexOf = (messages: readonly Message[], text: string) => {
  const head = text.trim().split('\n')[0].slice(0, 80)
  for (let i = messages.length - 1; i >= 0; i--)
    if (messages[i].role === 'assistant' && messages[i].text.includes(head)) return i
  return messages.length
}

/** Whether the message at `at` is a rewrite answering the rule's block, not a first draft. */
const answers = (messages: readonly Message[], at: number, blocked: string) => {
  for (let i = at - 1; i >= 0; i--) {
    const { role, text } = messages[i]
    if (role === 'user' && text.startsWith(FEEDBACK) && text.includes(blocked)) return true
    if (role === 'assistant' && text.trim()) return false
  }
  return false
}

export const register: Register = on => {
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.props.isSummary) return next(e)
    const broken = RULES.filter(rule => rule.offending(e.props.text).length > 0)
    if (broken.length === 0) return next(e)

    // A Stop hook refuses this reply unless it already answers that hook's
    // block; a refused reply is drawn as nothing, and its rewrite follows.
    const messages = (await $.session.messages()) as readonly Message[]
    const at = indexOf(messages, e.props.text)
    if (broken.every(rule => answers(messages, at, rule.blocked))) return next(e)
    return next({ ...e, props: { ...e.props, text: '' } })
  })
}
