// Questions the user typed back into an AskUserQuestion answer — the "Other"
// text or a note — instead of picking an option. A supernova session read "Why
// would we need to wait for all the lower checks?" as a decision, built the
// opposite of its own recommendation, and its final message never answered.
// 121 of 1,985 asks in a sweep came back with a question like that.
//
// No Node imports: the Stop hooks and the PostToolUse hook both read it.

/** The sentences of an answer that end in a question mark; quoted lines are the agent's own words. */
const questionsIn = text =>
  String(text)
    .split('\n')
    .filter(line => !/^\s*>/.test(line))
    .flatMap(line => line.match(/[^.?!]*\?+/g) ?? [])
    .map(q => q.trim())
    .filter(q => /\w/.test(q))

/** Questions in an AskUserQuestion result: `{ answers, annotations }`, as the tool returns it. */
export const askedBack = result => {
  if (!result || typeof result !== 'object') return []
  const answers = Object.values(result.answers ?? {})
  const notes = Object.values(result.annotations ?? {}).map(a => a?.notes ?? '')
  return [...answers, ...notes].flatMap(questionsIn)
}
