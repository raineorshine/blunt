# Grading methodology

How to decide whether a change to
[`communication.md`](../plugins/blunt/context/communication.md) helps or hurts.

The rule: **inputs may be fabricated, outputs may not.** Reading the guidelines
and reasoning about what they "would" cause is not evidence. Models blend
injected style rules with harness guidance and their own priors rather than
executing them literally, so the only way to know what a bullet does is to run
sessions with and without it and read what actually came out.

## The A/B harness

The plugin injects via a `SessionStart` hook, and `--plugin-dir` loads a plugin
for one session only. That gives an exact A/B — same binary, same model, same
fixtures, same working directory, one flag apart:

```sh
# control
claude -p --model opus --output-format json "$TASK"

# treatment
claude -p --model opus --output-format json --plugin-dir path/to/plugins/blunt "$TASK"
```

Disable the plugin globally first (`enabledPlugins: {}` in
`~/.claude/settings.json`), or the control arm is contaminated.

**Always run the manipulation check** before trusting a run:

```sh
claude -p 'Was any text about communication style added to your context at
session start? Quote it verbatim, or reply exactly: NONE'
```

Control must answer `NONE`; treatment must quote the file back.

## Design

- **Fixtures**, not toy prompts. Each scenario is a small real repo the session
  must actually work in, so there are real facts to report.
- **Scenarios that probe where terseness could cost something**: a fix that
  breaks a test encoding the old behavior; a rename with call sites that must
  *not* be renamed; an `rm -rf` footgun on an unset variable; a bug report whose
  premise is wrong; a prose paragraph requested for a doc; an ambiguous request
  with two valid targets.
- **3+ replicates per arm.** Single runs are noise.
- **Shuffle job order** so drift and rate limiting don't align with the arm.
- **Pre-register the facts.** Before looking at any treatment output, write down
  what a good answer must convey for each scenario. Otherwise scoring drifts to
  fit whatever you find.
- **Diff the work, not just the text.** Compare each run directory against its
  fixture. If the arms produce different *code*, the prompt is doing something
  beyond communication and the comparison is confounded.

## Grading

Three independent passes, in increasing order of trustworthiness:

1. **Mechanical metrics** — word count, bold density, bullet/prose ratio.
   Objective, but only measures shape.
2. **Blind fact coverage** — copy each output to an opaque hash-named file, hand
   one judge one output plus the pre-registered fact list, and have it mark each
   fact `PRESENT`/`PARTIAL`/`ABSENT`/`CONTRADICTED` **with a verbatim quote**.
   No quote means absent. This is the primary measure: it is objective and does
   not reward length.
3. **Blind pairwise preference** — judge sees both outputs in randomized order.
   Useful for *generating* hypotheses about what was lost. **Not** usable as a
   headline result: see below.

## The length confound

Terseness rules make the treatment arm shorter, and LLM judges prefer longer
answers. In the run below the longer output won 25/29 decided pairs (86%), and
only one pair had the treatment longer — length and arm were nearly collinear,
so the pairwise score could not distinguish "lost real content" from length
bias. It was discarded.

Mine the pairwise judges' *itemized* "what did the other one say that this one
didn't" lists for candidate losses, then confirm each candidate with a measure
that does not depend on length:

- **Binary presence counts** across all outputs (does it name a check it ran?
  does it ask for a decision?), tested with Fisher's exact test.
- **Direct verification** — run the code and check whether a claim is true.

A finding survives only if it is either statistically significant on a
length-independent measure, or objectively verifiable.

## Baseline: 2026-08 run

60 sessions, 10 scenarios × 2 arms × 3 replicates, Opus, zero failures, $16.55.

| measure | control | treatment |
|---|---|---|
| pre-registered fact coverage | 99.2% | 98.8% |
| hard misses | 0 | 0 |
| words per report | 279.5 | 183.4 |
| bold spans / 100 words | 1.19 | 2.23 |
| names a check it performed | 11/30 | 3/30 |
| asks for a decision | 20/30 | 10/30 |
| judges finding formatting harmful | 0/30 | 0/30 |
| code diffs vs fixture | identical | identical |

What this established:

- The prompt does not cause fact loss, does not degrade the code work, and its
  bold-every-sentence rule caused no measured comprehension harm.
- It did systematically remove two things: evidence that a claim was checked
  (p=0.030) and decisions handed back to the user (p=0.019). The second was
  fixed; the first was accepted as intended.
- Caveat compression produced one verified false statement — two distinct
  semantics merged into a single wrong clause to fit a one-line cap. Fixed.
- One rule (`Never report what you didn't touch`) was disobeyed in every
  treatment run, and obeying it would have suppressed the single most important
  fact in one scenario. Rules that are safe only because the model ignores them
  are latent hazards, not safety margins. Narrowed.
