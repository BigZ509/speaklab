# Focused Practice Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved, accessible Week 1 single-surface practice experience using existing recording, transcription, and filler-analysis behavior.

**Architecture:** Presentation-only tokens and components live under `components/practice`; `RecordButton` becomes the stateful composition boundary over the existing recording hook. The hook, API service, auth, and speech engine retain their contracts. Node-based component harness tests validate rendered state and interaction affordances; device/simulator inspection validates iOS layout.

**Tech Stack:** Expo 54, React Native 0.81, Expo Router, TypeScript, `expo-audio`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-31-focused-practice-studio-design.md`

## Global Constraints

- Preserve existing authentication, recording, transcription, and deterministic filler-analysis behavior.
- Do not change backend APIs or speech-engine algorithms.
- Keep a single stateful Practice experience with one static prompt; no Week 2 work.
- Do not generate coaching, scores, or unlabelled fake results.
- Make all controls accessible, state labels explicit, and touch targets at least 56px where specified.
- Use no new dependencies.

## Review Focus

- Permission denial: the user gets a visible recovery path rather than an alert-only dead end (Task 3 test).
- Empty successful transcript: the results screen labels the absence and offers a next action without fake feedback (Task 3 test).
- Submission in flight: record/replay/submit actions cannot duplicate or replace work while processing (Task 3 test).
- Long transcript: readable selectable body text wraps without clipping at narrow widths (Task 4 rendered inspection).
- Existing hook contract: starting a new recording clears prior result data and does not alter deterministic filler output (Task 3 regression suite).

---

### Task 1: Design tokens and pure feedback helpers

**Files:**
- Create: `components/practice/tokens.ts`
- Create: `components/practice/feedback.ts`
- Create: `scripts/practice-ui.test.cjs`

**Interfaces:**
- Produces `practiceTokens` and `countFillerOccurrences(fillerResults)` for all later presentation components.

- [x] Write failing tests for total filler count and zero-result wording.
- [x] Run `node --test scripts/practice-ui.test.cjs` and verify failure because helpers do not exist.
- [x] Implement immutable semantic tokens and the pure filler count helper without altering analysis data.
- [x] Run the focused test and verify pass.
- [x] Commit the tested token/helper foundation.

### Task 2: Reusable Focused Practice presentation components

**Files:**
- Create: `components/practice/practice-prompt-card.tsx`
- Create: `components/practice/recording-control.tsx`
- Create: `components/practice/recording-review-bar.tsx`
- Create: `components/practice/submission-state.tsx`
- Create: `components/practice/feedback-summary.tsx`
- Create: `components/practice/transcript-panel.tsx`
- Modify: `scripts/practice-ui.test.cjs`

**Interfaces:**
- Consumes: `practiceTokens`, `countFillerOccurrences`.
- Produces presentational components with explicit props for state, callbacks, transcript, and deterministic fillers.

- [ ] Write failing render tests for labels, disabled controls, filler count, selectable transcript, and empty-transcript copy.
- [ ] Run the focused test and verify failure.
- [ ] Implement minimal accessible presentational components and styles matching approved token roles.
- [ ] Run the focused test and verify pass.
- [ ] Commit reusable presentation components and tests.

### Task 3: Existing-hook integration and authorized states

**Files:**
- Modify: `components/recording/record-button.tsx`
- Modify: `hooks/use-audio-recording.ts` only if a UI-required permission state can be exposed without changing recording behavior.
- Modify: `scripts/practice-ui.test.cjs`
- Modify: `scripts/submission.test.cjs`

**Interfaces:**
- Consumes current `useAudioRecording()` values plus presentation components.
- Produces a single stateful practice composition for idle, recording, review, submitting, success, error, permission-denied, and empty-response states.

- [ ] Write failing integration tests for static prompt, start/stop labels, duplicate-submit disabling, retry state, permission-denied UI state, and success/empty results.
- [ ] Run targeted tests and verify they fail for missing UI behavior.
- [ ] Compose the approved single-surface UI around the existing hook; expose only the minimal permission state necessary for recovery.
- [ ] Run `node --test scripts/practice-ui.test.cjs scripts/submission.test.cjs` and verify pass.
- [ ] Commit integrated Week 1 state handling.

### Task 4: Practice-tab composition, visual inspection, and regression verification

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/_layout.tsx` only for approved Practice naming/icon behavior.
- Modify: `docs/planning/MOBILE_WEEKLY_PROGRESS.md`
- Modify: `scripts/practice-ui.test.cjs` if a regression is found.

**Interfaces:**
- Consumes the integrated recording composition.
- Produces the authenticated Practice entry surface and evidence log.

- [ ] Write a failing test for the Practice tab’s screen-level composition if required by implementation.
- [ ] Implement the smallest route/layout change that embeds the single stateful practice experience.
- [ ] Run all Node regression tests, lint, and TypeScript/build checks appropriate to the project.
- [ ] Render and inspect idle, recording, review/submitting, success, error, permission-denied, and empty-result states at two iOS sizes where available; make only approved-scope refinements.
- [ ] Record screenshots, visual findings, refinements, verification output, and blockers in weekly progress.
- [ ] Commit verified UI and evidence.

## Self-review

- Spec coverage: Tasks 1–4 map to tokens, reusable components, existing-hook integration, all required states, testing, rendering, and progress evidence. Backend, speech-engine, future-week features, and fake coaching are excluded.
- Interface consistency: Task 1 helpers/tokens feed Task 2; Task 2 props feed Task 3; Task 3 composition feeds Task 4.
- Review-focus coverage: Tasks 3 and 4 include the identified permission, empty, in-flight, existing-contract, and narrow-layout cases.
- Proportion: the plan specifies interfaces, state coverage, and checks without prescribing component internals.
