# Stop hook terms

What each `Stop` hook refuses, its exception, and the sweep of real final
messages behind them. How the hooks share machinery, and how to change or test
them, is in [AGENTS.md](../AGENTS.md#stop-hooks).

#### no-git-noise

- **The exception is encoded, not judged.** A line may carry `rebase` when it
  also carries a word saying something is unresolved — failed, refused, still,
  left behind. Coarse on purpose: the way past the block is to say what is
  broken, which is the only case the bullet ever allowed.
- **A 📚 line passes.** A learning written into the docs is about the repo's
  workflow, not this session's git work; all 20 the sweep refused were that.
  A cause line naming another session's push ("a ship fast-forwarded main")
  is still refused — no string separates it from narration.

#### no-check-noise

- **Wording alone did not hold it.** The Omit bullet and its delivered-work
  sub-bullet were both loaded in a v0.48.0 session that still closed on its
  tested sample count, all of them passing, and a live run that confirmed it.
  Its terms come from a sweep of real final messages, each annotated with the
  phrasing it was taken from. At the first cut it refused about 7% of 1,400
  reports, nearly all rightly; every exception below came from a line that
  sweep got wrong.
- **Its exception is narrower than no-git-noise's.** A passing report
  routinely carries a failure word — red before green, "the old version
  failed" — so a failure word excuses only its own clause, split at `. ; ! ?`,
  and a count of nothing (`0 failed`, `no failures`) is not one. A test passing
  where it should not — on `main`, or blind to a bug it was meant to catch — is
  a finding too. A line saying what was *not* tested, run or verified passes
  whole: that caveat is the one check line the user acts on. So does a line
  naming checks still running, or a bug.
- **CI status is left out of its terms on purpose.** "Merged after every check
  passed" answers the request when the user gated the merge on CI, and a
  string cannot tell that request from noise.
- **A live run told as a story is a passing check too.** A v0.55.0 report
  passed a bullet led by **Checked on a private port:** that replayed the bug,
  ran it with the fix and ran a control without. A `Checked …:` lead now counts
  as a verification lead when its result follows on the same line — "Checked
  before acting, and one is still there:" introduces a finding, and "Checked
  bag:" is luggage — and "with the fix … stayed", "the same run without the
  fix" and "fix holds" are terms. "Not tried" joins the uncovered caveats.

#### no-label-leads

- **Wording alone did not hold it.** A report closed on three question-shaped
  leads in a row while both bullets naming that shape were loaded.
- **It refuses a bold span leading a line or list item whose text starts with
  what, why, where, how, which or who** — the words a sweep of real final
  messages found opening label leads. "When" is left out: reports open
  conditions with it.
- **It has no exception, not even a whole sentence.** A "has a verb" escape
  would have passed the observed leads, which carry verbs; the way past is a
  rephrase that puts the answer first. A colon rule was rejected as
  over-broad, so a label with no question word — one of the three observed
  leads — still goes through. At the first cut it refused about 5% of 1,400
  reports.

#### no-prose-asks

- **It replaced an exception, not a wording.** The ask-tool bullet let a
  decision needing more background go in a closing message of prose options;
  a supernova session took it for a three-way build choice, and the user wanted
  no exception. The bullet now says how to fit background into the ask.
- **Only the ending counts.** The last prose line must be a question, with
  nothing after it but list items, so options listed under the question are
  caught too. Fences, quoted lines and inline code are skipped.
- **A question alone is not a decision.** It must also offer a choice: a list
  item marked `(recommended)`, a "which … should / do you / would you"
  question, or a "should I / want me to / would you prefer … or …" question. A
  clarifying question and a one-option offer pass.
- **At the first cut it refused about 1.3% of 12,300 reports,** nearly all
  "Want me to X, or Y?" endings — choices the user would rather click.
- **A standing offer is a decision too.** A last prose line handing the
  go-ahead back — "say the word", "just say which|when", "ready when you are",
  "whenever you say|are|'re ready", "when you're ready … I'll" — is refused
  whether or not it is a question. A supernova session ended a handoff on "I can
  start step 4 whenever you say." with step 4 needing two apps quit first. Only
  the last line counts. "Just say so" is an instruction, not an offer, and
  "whenever you like" was only seen telling the user to do something. "Let me
  know when" never ended a report, so it is not a term. The rewrite drops an
  offer of work nobody asked for instead of asking it.
- **The standing offers added 14 refusals across 2,566 reports,** every one an
  offer.
