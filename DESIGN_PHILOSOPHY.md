# Datum: design philosophy

**Companion to:** `DESIGN_SYSTEM.md`, which specifies what Datum is: tokens, verified ratios, component rules. This document argues why, including the part of the argument that is about you rather than about typography.
**Written:** 30 July 2026.

---

## 0. What this document is for

`DESIGN_SYSTEM.md` is a specification, and a specification's job is to be followed without requiring the reader to re-derive it, so it states tokens and ratios and leaves the reasoning out. A developer implementing `--color-paper: #f5f2ec` does not need a paragraph on why cream reads as more honest than white. You do, though, because a design system that outlives its author's memory of deciding it erodes one exception at a time, and an exception is easiest to refuse when the reasoning behind the rule is written down rather than half remembered at 11pm.

The second half of this document is more direct: an interpretation of your personality, built from what you have actually written and shipped rather than from a personality-test vocabulary, and an account of how specific traits produced specific design decisions. Some of it you will recognize immediately. Some of it is inference rather than restatement, and it is marked as such, because a document that argues for evidence over assertion should not exempt itself from its own standard.

---

## 1. Provenance, in full

The first draft of Datum was derived from two reference sites, [sethring.com](https://sethring.com/) and [infantree.com](https://infantree.com/): warm cream backgrounds, an amber and olive accent family, an eccentric editorial serif, generous texture and grain. The appeal was real and worth naming rather than dismissing in hindsight. Both sites read as warm and human rather than as generic SaaS product marketing, which is the correct instinct to start from, because the alternative (a blue-and-white template with a rounded-corner card grid) is the visual language of a thousand indistinguishable portfolios and would have buried the actual work under the least interesting possible frame.

What that first draft got wrong was not the warmth. It was the source. Both reference sites are the output of people whose job is branding, and their visual choices are calibrated to read as a certain kind of confident: eccentric, textured, a little precious about its own craft. That is an earned voice for a branding studio. It is not your voice, and the mismatch would have shown up exactly where it mattered most, because a portfolio whose own design contradicts the values stated in its content is a worse portfolio than a plain one. You write "honest limits" sections into every project template and refuse to claim working authentication on code where the auth is commented out. A site borrowing branding-agency polish to sit above that content would have been the one dishonest thing on the page.

The revision keeps what was never actually borrowed, cream paper and generous spacing, because warmth was the right call independent of where it came from, and retires what was, the olive and amber palette, the Fraunces serif, the texture. In their place: one instrument color rather than a palette, a superfamily built for the relationship between people and machines rather than an editorial serif, and surfaces with zero texture rather than grain. Section 2 of this document argues why those specific replacements, rather than some other equally warm alternative, are the ones that fit. Section 2.6 returns to the fact of the revision itself, because discarding a finished first draft once it is recognized as someone else's answer is itself part of the personality this document is trying to describe.

---

## 2. Reading the evidence

Six traits, each with the evidence that supports it and the design decision it produced. The evidence is drawn from what you have actually written: `about.mdx`, the comments inside `bootstrap.mjs`, the reasoning in `COOKBOOK.md` and `PORTFOLIO_PLAN.md`, and the standing rules in the Job Search `CLAUDE.md`. None of it is invented, and where a connection to a design choice is an inference rather than something you stated outright, it is flagged.

### 2.1 An instrumentation sensibility, carried up the stack

Your first engineering work was reading pH and conductivity probes over FTDI serial, pushing a reference temperature to each probe before reading it because uncompensated pH drifts with water temperature, and fanning the readings out to several sinks so that losing one did not lose the data. That is a specific, physical relationship to measurement: a value is not trustworthy until you know what distorted it and where else it is recorded. The same relationship shows up in the aircraft project (a Rust scraper into Postgres behind a typed API, built, in your own words, "because I wanted a pipeline that was real rather than illustrative") and in the photography site's EXIF discipline. The home page headline, "Sensors first. Then products. Then platforms," states the arc directly, and `PORTFOLIO_PLAN.md` orders the project index by relevance to the target role rather than by chronology, which means the arc was curated deliberately rather than left as an accident of a resume.

This is where the system's name and its central visual motif both come from, and neither is decorative. A datum, in weight-and-balance, is the reference line an aircraft's every measurement is taken from: a fixed point, not a flourish. The datum tick on a section rule and the data plate under a figure are that same object, a reference mark and a nameplate, applied to a website instead of an airframe. A generic "accent bar" would have done the job typographically. It would not have been true of you, and choosing the metaphor that is actually true rather than the one that merely works is the point.

### 2.2 Verification over vibes

Stated directly, in `about.mdx`: "I prefer boring tooling, and I would rather check something than reason about it." The design system takes that literally rather than as a figure of speech. Every foreground and background color pair in Section 1.2 of `DESIGN_SYSTEM.md` carries a computed WCAG ratio, dated, rather than an assertion that the palette "looks readable." `bootstrap.mjs` separates "verified by running" from "verified by research" as two distinct categories with two distinct dates, rather than a single undifferentiated claim of correctness. The content schema's `verified` flag is rendered on the page itself, in the data plate, rather than kept as an internal note, because a claim that is only checkable by you is not actually checkable.

The consequence for the design system is that almost nothing in it is allowed to rest on taste alone once a measurement is available. Where taste is unavoidable (the exact shade of orange, the exact type scale) it says so, and where it is not, a number replaces the adjective.

### 2.3 Documentation as identity, not overhead

"I have kept daily engineering notes for about a decade, which mostly means the write-up already exists by the time someone asks for it," from `about.mdx`, describes a habit, not a chore. Every file in this repository argues at length for its own decisions rather than simply stating them: `bootstrap.mjs`'s comments explain a specific historical bug for nearly every non-obvious line, `COOKBOOK.md` numbers and justifies each stack choice individually, and `REPO_LAYOUT.md` documents a mistake it is actively fixing rather than silently correcting it. Writing this document, and `VOICE.md` alongside it, is the same habit applied one level up: turning a design system that could have stayed implicit into something a future reader, including future you, can check against.

The direct consequence on the site is that the colophon is a first-class route rather than a footer afterthought, described in `PORTFOLIO_PLAN.md` as "the page that converts engineers." For most portfolios a build-notes page is trivia. For this one it is evidence of exactly the habit that makes the rest of the claims credible, which is why it gets a real page rather than a paragraph.

### 2.4 Calibration over inflation

"I live in Munich on an EU Blue Card. English is native, German is A0, and there is no point dressing that up," from `about.mdx`, is a small sentence doing a large amount of work: a fact that is mildly unflattering for a Munich-based job search is stated flatly rather than softened. The Job Search `CLAUDE.md` states the same instinct as a rule rather than a habit: "Be blunt about weak positioning," "Do not provide generic encouragement or filler," "If evidence is weak, either omit the claim or phrase it conservatively." `PORTFOLIO_PLAN.md` excludes testimonials, a skills-percentage chart, and an empty blog, and records the reason for each exclusion rather than just the decision, which is the same pattern again: a claim that cannot be checked is worse than no claim.

This is the trait with the most direct visual consequence, covered in full in Section 3, because a job-search site exists specifically to sell you and this trait is a standing discomfort with selling by tone rather than by substance. The honest-limits section mandated in every project template, "rusti_aircraft_api states that auth is scaffolded but commented out and not claimed," is this value made structural rather than optional.

### 2.5 Constraints as a tool, not a tax

`COOKBOOK.md` enables the React Compiler from the first commit specifically because waiting would mean building three months of manual-memoization habits and then unlearning them, and states plainly that every `"use client"` directive "should be defensible in a sentence. If you cannot defend it, the boundary is in the wrong place." `DESIGN_SYSTEM.md` describes its own accent rule the same way: solid orange fails contrast at body text size, so the system uses an outlined placard instead of a filled pill, and says so approvingly rather than apologetically: "The constraint produced a better component, which is usually what constraints do."

That sentence could be the thesis of the entire visual language. Near-zero radii, one accent moment per view, no gradients, no filled buttons in orange: none of this is austerity for its own sake. It is the same instinct that treats a hard technical limit as an opportunity to find the actually-correct answer, applied to pixels instead of code.

### 2.6 Discarding the wrong answer, including your own

`REPO_LAYOUT.md` opens by describing a real, already-shipped mistake (content split across two directories, one of them dead) and fixes it in place rather than working around it or leaving a comment for later. The palette revision described in Section 1 of this document is the same move at a larger scale: a finished first draft, built from real reference sites, retired once it was recognized as someone else's answer rather than yours. `REPO_LAYOUT.md`'s closing principle on the wider `~/dev` directory, "revisit only if the file starts drifting between projects, and treat that drift as the signal rather than guessing in advance," states the underlying rule: change happens on evidence of an actual problem, not on a hunch, but once the evidence exists, the fix is not gentle about it.

The inference here, flagged as inference rather than restatement: this is very likely also why the system reads as confident about being austere rather than tentative about it. A person who is comfortable discarding their own finished work on evidence is also comfortable committing fully to what replaces it.

---

The instinct these six traits share is the same one operating at different altitudes. Your own writing rules are a formal, numbered specification for something as soft as personal prose voice, complete with a final checklist. `DESIGN_SYSTEM.md` is the same kind of specification for pixels, down to a WCAG ratio recomputed on a specific date. This document, and `VOICE.md` beside it, are the specification one level up again: the reasoning behind the reasoning. None of these are natural places to stop and write things down. You do it anyway, which is the trait underneath all six of the others.

---

## 3. What the system refuses to be, and the tension that resolves

Name the tension directly rather than stepping around it: a job-search portfolio exists to sell you, and selling is the one register everything in Section 2 argues against. The system resolves this by relocating the persuasion rather than removing it. It does not stop being persuasive. It stops being persuasive through tone and becomes persuasive through evidence instead, which is a real design decision with real consequences, not a hedge.

What that decision bans, specifically: gradients, glassmorphism, soft shadows standing in for depth, filled pill badges, exclamation points, and hedge-free superlatives ("world-class," "expert," "passionate"). Also banned for the identical reason: testimonials, a skills-percentage chart, and a blog launched empty, all three explicitly excluded in `PORTFOLIO_PLAN.md` with the reason recorded alongside the decision. Every item on that list asks a viewer to believe something. Everything that replaces it asks a viewer to check something instead: a repo link, a computed ratio, a stated limit, a real last-verified date. The colophon is the clearest proof the resolution actually works, because a page whose entire content is "here is exactly how this was built, including the parts that are not finished" is more persuasive to the audience that matters (senior engineers and hiring managers who have already been burned by inflated portfolios) than confident copy would be, precisely because it can be checked rather than merely believed.

---

## 4. Per-site application, argued rather than tabulated

`DESIGN_SYSTEM.md` Section 7 tables the differences between the three sites. The reasoning behind the table:

`aircraft` runs at application density and spends orange only on state (favourites, optimistic updates), never on brand, because it is not selling anything. It is a working tool, and a tool that looks like an advertisement for itself would be a worse tool. `photography` defaults to dark, and not simply because dark themes suit a gallery: photographs read truer against near-black chrome than against warm cream, which would tint every image before a viewer judges its actual colour, and EXIF captions set in mono against dark chrome read as a contact sheet rather than as a web page decoration. `portfolio` sits in the middle, the warmest and most editorial of the three, because it is the one site whose actual job is persuasion, and Section 3 of this document is the argument for why it can afford the most deliberately designed register of the three without becoming the thing it refuses to be: the persuasion still runs through evidence, so the warmth is allowed to be visible rather than having to hide itself as neutrality.

---

## 5. A note on drift

If a future revision of `DESIGN_SYSTEM.md` contradicts a claim made here, the token file wins, because a spec that has been implemented and verified is truer than a paragraph that has not been revisited since. Update this document in the same commit where possible. `REPO_LAYOUT.md` already named the general failure mode once: a file that looks authoritative but silently is not costs more than having no file at all. That applies to prose as much as it applies to a tsconfig.
