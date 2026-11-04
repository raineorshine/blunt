// The terms behind the Stop hook that refuses a final message that lists the files a change touched.
//
// A supernova report closed on a "**Files changed:**" heading over a File |
// Change table, one row per source file — `src/lib/dones.ts`, "New return
// rule; helpers to drop, encode and decode saved notes", and so on. The user
// never wants that: which files moved is implementation, not what changed for
// them. communication.md had invited it, naming "files and what they do" as an
// example of a table, and no bullet forbade it.
//
// Three shapes are refused, each the observed one or its plain variant:
// - a label line announcing a file list — a heading, a bold lead or a short line
//   ending in a colon, saying "Files changed", "Changed files", "Files touched",
//   "Changes by file" and the like;
// - a table whose header names a File or Path column;
// - three or more list items or table rows in a run, each led by a source path.
//
// The exception is a path the user has to open or type, which comes one at a
// time: a single item led by a path passes, and so does a path mid-sentence.
// Code fences and quoted lines are skipped.

const FENCE = /^\s*(```|~~~)/

/** "Files changed", "Changed files", "Files touched", "Changes by file", "Files:". */
const LABEL =
  /\b(files?|paths?)\s+(changed|touched|modified|edited|updated|added|created|affected|involved)\b|\b(changed|touched|modified|edited|updated|affected)\s+files?\b|\bchanges?\s+(by|per)\s+file\b|\bfile[- ]by[- ]file\b|^files?$/i

/** A line that labels what follows: a heading, a bold lead, or a short line ending in a colon. */
const labelText = line => {
  const heading = line.match(/^\s*#{1,6}\s+(.+?)\s*$/)
  if (heading) return heading[1].replace(/[*_:`]/g, '').trim()
  const bold = line.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)?\*\*(.+?)\*\*\s*:?\s*$/)
  if (bold) return bold[1].replace(/[:`]/g, '').trim()
  const colon = line.match(/^\s*(?:[-*+]\s+)?([^.;!?]{1,40}):\s*$/)
  if (colon) return colon[1].replace(/[*_`]/g, '').trim()
  return null
}

const TABLE = /^\s*\|.*\|\s*$/
const DIVIDER = /^\s*\|[\s:|-]+\|\s*$/
const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())

/** A header cell naming a file column: "File", "Files", "Path", "Source file". */
const FILE_COLUMN = /^(\*\*)?(source |changed )?(files?|paths?)(\*\*)?$/i

/**
 * A file path: a token ending in a file name with an extension, with or without
 * folders, in backticks, bold or a markdown link — `src/lib/dones.ts`,
 * `deploy/supernova.env.example`, `.claude/launch.json`, [page.tsx](…), demo.ts.
 * A folder (`~/projects`) or a branch name (`em/beautiful-bartik`) has no
 * extension and is not one. A path with a line number (`undo.ts:1039`) points
 * at code under review, not at a file the change touched, and passes.
 */
const PATH = /^[`[]?(?:[\w.@~-]+\/)*\.?[\w@-]+(?:\.[\w-]+)*\.[a-z][\w-]{0,9}[`\]]?(?![\w:/.])/i

/** A list item or table row's leading text, without its marker and bold. */
const lead = line => {
  if (TABLE.test(line)) return DIVIDER.test(line) ? null : cells(line)[0]
  const item = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.*)$/)
  return item ? item[1] : null
}
const ledByPath = text => text != null && PATH.test(text.trim().replace(/^(\*\*|_)/, ''))

const offending = text => {
  const found = []
  let fenced = false
  let run = []
  const flush = () => {
    if (run.length >= 3) found.push(...run)
    run = []
  }
  const lines = text.split('\n')
  for (const [i, line] of lines.entries()) {
    if (FENCE.test(line)) {
      fenced = !fenced
      flush()
      continue
    }
    if (fenced || /^\s*>/.test(line)) continue

    const label = labelText(line)
    if (label && LABEL.test(label)) {
      flush()
      found.push(line.trim())
      continue
    }

    if (TABLE.test(line) && DIVIDER.test(lines[i + 1] ?? '') && cells(line).some(c => FILE_COLUMN.test(c))) {
      flush()
      found.push(line.trim())
      continue
    }

    const l = lead(line)
    if (l === null && DIVIDER.test(line)) continue
    if (ledByPath(l)) run.push(line.trim())
    else if (l !== null || line.trim()) flush()
  }
  flush()
  return found
}

export const rule = {
  // First line of the block reason; also how a later stop recognises the block.
  blocked: 'Blocked: the report lists the files the change touched.',
  offending,
  rewrite: [
    'Rewrite the final message without the file list. Which files changed is',
    'implementation; say what changed for the user, in the product\'s terms —',
    '"done notes come back after a restart", not "`src/lib/dones.ts`: new return',
    'rule". Name a file only where the user has to open or type it.',
    'Change nothing in the repository: this is the message, not the work.',
  ],
}
