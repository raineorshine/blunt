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
