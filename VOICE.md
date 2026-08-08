# Voice

**Companion to:** `DESIGN_SYSTEM.md` §6 (Microcopy), which is this document's one-paragraph summary, and `DESIGN_PHILOSOPHY.md`, which argues the personality this voice is built from.
**Scope:** prose and copy on the portfolio site itself. Not the resume variants, which the Job Search `CLAUDE.md` governs under a different, ATS-facing set of rules, and not correspondence, which follows your own writing rules directly. All three are siblings rather than the same document three times: one set of values, aimed at three different registers.
**Written:** 30 July 2026.

---

## 0. Where this voice comes from, and where it differs

Your own writing rules already specify most of what follows: state the controlling claim directly, fold concession into the claim itself rather than hedging in front of it, assert personal judgment flatly, reserve hedging for genuinely ambiguous material, no contractions, "because" for causation, "however" and "although" for a turn into complication or concession. That ruleset also names its own gap: its context table covers academic writing, technical explanation, email and memo, professional chat, informal messages, executive summaries, instructions, and reflective or narrative writing, and then states a residual rule for anything else: apply the core voice and sentence rules, follow the target format's own structural convention, and do not invent warmth, humor, or slang beyond what is specified. A public marketing and portfolio site is exactly that uncovered case, so this document is the residual rule worked out in full rather than left implicit.

In practice the site's copy splits across two of the registers your ruleset already names, depending on which part of the page you are reading. The first-person narrative passages, `/about` and the reflective parts of the colophon, are reflective and narrative: direct first person, plain stated judgment, hedging reserved for genuinely uncertain claims. Everything structural, buttons, errors, empty states, navigation, data plates, project claims, reads as technical explanation or instructions: point first, short, causal, no subordination for its own sake. That split is intentional. `/about` sounds like you talking. A button label sounds like a tool labeling itself. Both are correct, and neither should sound like the other.

---

## 1. The non-negotiables

These apply everywhere on the site, in every register, with no exception:

No contractions, anywhere, including casual-reading pages like `/about`. No exclamation points. Sentence case everywhere, including headings and button labels; never title case. No filler enthusiasm and no unsolicited encouragement in interface copy: a save either succeeded, in which case it says "Saved," or it did not, in which case the error rules in Section 2.6 apply. Numbers stay exactly as precise as the source material, never rounded or swapped for convenience: the home page intro says "a decade," counting from entering the field in 2016, while the figure that belongs anywhere precision matters, starting with the CV, is "~9 years," measured instead from the first paid engineering role in 2017. The two are not interchangeable even though both are defensible, because they answer slightly different questions. Every claim about your work carries a checkable anchor, a repo link, a named mechanism, or an explicit "not yet measured" placeholder, rather than resting on an adjective alone. No stock evaluative phrasing: "it's worth noting that," "overall, this demonstrates," and similar filler do not appear in copy any more than they should appear in speech to you directly.

---

## 2. Register by content type

### 2.1 Hero and headline

Point first, no subordinate clauses, twelve words or fewer, per the constraint `PORTFOLIO_PLAN.md` already sets. The model is already written: "Sensors first. Then products. Then platforms." Three words, three words, two words. The rhythm is the argument for breadth. A sentence that instead claimed "I have broad experience across hardware and software" would be asserting the same fact and proving none of it, which is the exact failure mode Section 3 of `DESIGN_PHILOSOPHY.md` names.

### 2.2 Supporting prose: `/about`, colophon, intros

First person, direct, judgments stated flatly with no disclaimer in front of them. This is the one place on the site built for the long cumulative sentence, one main clause carrying two or three subordinate clauses toward a concrete payoff, followed by something short to close it. The model is already written, in `about.mdx`: "I prefer boring tooling, and I would rather check something than reason about it." A flat opinion, no "I could be wrong, but," no "I tend to." A hedged rewrite, "I tend to lean toward simpler tools where possible," would violate your own rule against softening a stated personal judgment, and it would also be a worse sentence.

### 2.3 Project claims: one sentence, sourced

Third person or no person at all; this is technical-explanation register, so lead with the claim and use "because" for mechanism rather than for justification. The model, already decided in `PORTFOLIO_PLAN.md`: "Concurrent async scraping pipeline with backpressure, graceful shutdown, and rate-limit-aware retry." Notice what is absent: no adjective is standing in for a mechanism it has not named. Nothing here reads "robust" or "powerful" or "scalable," because every word names something a reviewer could open the repository and go check.

### 2.4 Honest limits

This is the section most portfolios get wrong by instinct, so name the failure before showing the pattern. The ordinary move is to bury a limitation in future tense: "authentication is planned for an upcoming release." Here it is stated in the same flat register as any other fact, no apology in front of it and no redeeming clause after it. The models are already decided in `PORTFOLIO_PLAN.md`: "auth is scaffolded but commented out and not claimed," and, for the chat feature, "std TCP, not WebSockets." The shape is always the same: name the limit, name the actual current state, stop. A sentence that adds "but this is easy to fix" or "for now" is doing exactly the softening this section exists to refuse.

### 2.5 Data plates and captions

Mono, terse, and not a sentence, because a caption is a nameplate rather than a claim and should not apologize for being one. The model, from `DESIGN_SYSTEM.md`: `X-T5 · 23mm · f/8 · 1/250 · ISO 160 · 2026-07-29`. No verb, no article, no punctuation beyond the separators. If a caption needs a verb to make sense, it is carrying more than a caption should.

### 2.6 UI microcopy: buttons, errors, empty states, navigation

Short and imperative, the instructions register, which is the one place subordination should drop out almost entirely. Buttons open with a verb: "View the work," never "Click here to view the work" or the passive "The work can be viewed here." Errors state what happened and then what to do about it, in that order, one plain sentence each, with no apology theater in front of either clause. Applying that rule to a build failure produces something in this shape: "The build could not read `content/cv.mdx`. Check the frontmatter against the schema in `src/lib/content/schema.ts`," rather than "Oops, something went wrong." Empty states say what belongs in the empty space and how to fill it, in one sentence: "No posts yet. Add one under `content/posts`." Neither of these two examples is copy that exists in the app today; they illustrate the rule rather than quote a screen, and should be treated as a pattern to build toward rather than as text already shipped.

### 2.7 System pages: 404, robots stance, license note

One line, on voice, no exception. The 404 line is already decided: "No entry at this datum." It is worth noticing why this particular sentence earns its place rather than merely fitting the rule: it reads as a dry joke only to someone who already knows what a datum is, it is also a literally true statement (there is genuinely no reference point at this URL), and it does all of that without an exclamation point, a shrug emoji, or the word "oops."

---

## 3. Contrast, to make the difference concrete

| Instead of (the brochure register) | The site's register |
|---|---|
| "Passionate full-stack engineer with a proven track record of delivering high-impact solutions!" | "Sensors first. Then products. Then platforms." |
| "Expertly architected a robust, scalable platform" | "Architected Borealis, a framework-agnostic Lit and Web Components platform adopted by four to five product teams across Next.js, Svelte, React, Vue, and .NET" |
| "Authentication coming soon!" | "Auth is scaffolded but commented out and not claimed." |
| "Successfully saved!" | "Saved." |
| "Oops, something went wrong. Please try again." | States what failed and what to do next, in that order, and stops there. |

Every row on the left asks a reader to believe something. Every row on the right gives a reader something to check instead, which is the entire argument of `DESIGN_PHILOSOPHY.md` §3 restated at the sentence level.

---

## 4. Final check before publishing any new copy

Read it aloud before it ships. If a contraction, an exclamation point, or title case slipped in anywhere, including a button label, fix it before anything else.

Take every claim about your work and ask whether a reader could verify it from something linked on the same page. If not, cut the claim or mark it unverified rather than leaving it to stand on tone.

Take every limitation you already know about and ask whether it is worse to state it or worse to let a reviewer find it first. It is almost always worse to let them find it first, and stating it plainly is what makes the rest of the page believable.

Find every adjective doing a mechanism's job and replace it with the mechanism: not "robust," but what specifically makes it hold up under failure.

Read the sentence back as if the reader already dislikes portfolio sites and has seen a hundred of them. That reader, skeptical by default and unmoved by tone, is the actual audience this voice is built for.
