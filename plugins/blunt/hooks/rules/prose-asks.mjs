// The terms behind the Stop hook that refuses a final message that ends on a decision asked in prose.
//
// communication.md says to surface every decision through the ask tool, and for
// a while it allowed one exception: a decision needing more background than a
// question and three options can carry went in a closing message, the options
// as bullets with one marked (recommended) and the question last. A supernova
// session took that exception for a three-way build choice, and the user had to
// type the answer the tool would have made a click. The exception is gone; this
// keeps the shape from coming back.
//
// Only the ending counts: the last prose line must be a question, with nothing
// after it but list items, so options listed under the question are caught too.
// A question alone is not a decision — "Is the flag read on startup?" offers
// nothing to pick — so the message must also offer a choice: a list item marked
// (recommended), or a question that asks which, or asks the user to pick
// between alternatives joined by "or". An offer with one option ("Want me to
// open a PR?") is not a choice, and is another bullet's business.
//
// A standing offer is the other shape: the last prose line hands the go-ahead
// back — "I can start step 4 whenever you say." A supernova session ended a
// handoff that way, steps 1–3 done and step 4 needing two apps quit first;
// whether and when to start it was the user's call, and the tool makes it a
// click. It need not be a question, so it is matched by its phrase, and only on
// the last prose line, so a report that uses the words mid-message passes. The
// phrases are the ones a sweep of past final messages found ending one; "say
// the word if you want that posted" is an offer of work nobody asked for, which
// the rewrite says to drop rather than ask.
//
// Code fences, quoted lines and inline code are skipped, so a report quoting
// the rule or a test fixture is not taken for an ask.

const FENCE = /^\s*(```|~~~)/
const ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/

/** An option marked as the recommended one. */
const RECOMMENDED = /\(recommended\)/i

/** A question that asks the user to pick, by "which" or between alternatives. */
const CHOICE = [
  /\bwhich\b[^?]*\b(should|shall|do you|would you|want|prefer|go with|pick)\b/i,
  /\b(should I|shall I|do you want|would you (like|prefer)|want me to|prefer)\b[^?]*\bor\b/i,
]

/** A last line that hands the go-ahead back to the user. */
const STANDING_OFFER = [
  /\bsay the word\b/i,
  /\bjust say (?:which|when)\b/i,
  /\bready when you are\b/i,
  /\bwhenever you(?:'re| are)?\s+(?:say|are|ready)\b/i,
  /\b(?:when|once) you(?:'re| are) ready\b[^.]*\bI(?:'ll| will| can)\b/i,
]

/** The message's lines a reader sees as prose: no fences, quotes or inline code. */
const proseLines = text => {
  const lines = []
  let fenced = false
  for (const line of text.split('\n')) {
    if (FENCE.test(line)) {
      fenced = !fenced
      continue
    }
    if (fenced || /^\s*>/.test(line)) continue
    const bare = line.replace(/`[^`]*`/g, '').trim()
    if (bare) lines.push({ line: line.trim(), bare })
  }
  return lines
}

const offending = text => {
  const lines = proseLines(text)
  const last = lines.at(-1)
  if (last && STANDING_OFFER.some(re => re.test(last.bare))) return [last.line]
  let i = lines.length - 1
  while (i >= 0 && ITEM.test(lines[i].bare)) i--
  if (i < 0) return []
  const question = lines[i]
  if (!/\?[*_)]*$/.test(question.bare)) return []
  const items = lines.filter(l => ITEM.test(l.bare))
  const recommended = items.some(l => RECOMMENDED.test(l.bare))
  if (recommended || CHOICE.some(re => re.test(question.bare))) return [question.line]
  return []
}

export const rule = {
  // First line of the block reason; also how a later stop recognises the block.
  blocked: 'Blocked: the report ends on a decision asked in prose.',
  offending,
  rewrite: [
    'Ask it with AskUserQuestion instead: three options, one marked',
    'recommended, each description giving its consequence in one sentence.',
    'Put the background in the question and the descriptions, or keep a short',
    'report before the call and repeat its key facts in the question — text',
    'before a tool call collapses in the desktop app. Drop the prose options',
    'and the closing question from the message.',
    'A standing offer ("whenever you say", "say the word") on work the user',
    'asked for is a go-ahead to ask the same way: start now (saying what it',
    'disrupts), later, or something else. An offer of work nobody asked for',
    'is dropped, not asked.',
    'Change nothing in the repository: this is the message, not the work.',
  ],
}
