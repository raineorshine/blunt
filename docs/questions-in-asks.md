# Questions typed into an ask

A user who answers an ask with a question instead of a pick is owed an answer,
and a supernova session read "Why would we need to wait for all the lower
checks?" as a decision, built the opposite of its recommendation, and never
answered — two Stop rewrites later, still nothing. 121 of 1,985 asks in a sweep
came back with a question; one of them was the user complaining that another
session had done the same.

- **No Stop hook refuses it.** Finding the question is a string match on the
  tool result's `answers` and `annotations`; whether a reply answers it is not.
  A hook that blocks once to make the agent look would cost a round on every
  such turn, and the mod cannot hide a draft it has no text rule for, so an
  answered reply would show twice.
- **`answer-questions-in-asks.mjs` names it where the misread happens.** A
  `PostToolUse` hook on `AskUserQuestion` reads `tool_response` — the same
  `{ questions, answers, annotations }` the transcript stores as
  `toolUseResult` — and adds the questions as `additionalContext` beside the
  answer, with the instruction to answer them first in the final message.
- **Every Stop rewrite keeps the answer.** `lib/final-report.mjs` appends one
  line to every block's reason telling the rewrite to keep answers it owes, and
  quotes the questions asked back since the last typed prompt when there are any.
- **Its effect on the final message is untried.** 0.59.0 shipped from a
  supernova session, which refuses a live run, with the hook checked on piped
  fixtures only; a `--plugin-dir` run with and without it is still owed.
- **A quoted line in an answer is the agent's own words.** `> …` lines are
  skipped, so a user quoting the ask's text back is not read as asking it.
