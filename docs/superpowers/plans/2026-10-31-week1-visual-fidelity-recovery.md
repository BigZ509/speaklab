# Week 1 Visual Fidelity Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved Week 1 Editorial Practice Studio + Recording
Instrument visual direction visible in the real React Native practice UI while
preserving all existing Week 1 behavior.

**Architecture:** Recompose the existing presentational layer around a reusable
recording stage and results header. The existing `useAudioRecording` hook
continues to provide state, callbacks, and real elapsed seconds. The dev-only
preview retains deterministic fixtures but gains a control-free state-render
mode for visual evidence.

**Tech Stack:** Expo Router, React Native, `Animated`, React Native safe-area
context, TypeScript, established Node regression scripts.

**Spec:** `docs/superpowers/specs/2026-10-31-focused-practice-studio-design.md`
and `docs/design/VISUAL_FIDELITY_AUDIT.md`.

## Global Constraints

- Work only on `feat/week1-focused-practice-studio`; do not modify main.
- Do not change Firebase auth, backend contracts, speech-engine logic, or
  navigation unrelated to the presentation of Week 1 practice.
- No dependencies, fake production feedback, pause/resume, add-time, new
  prompts, performance scores, or future-week features.
- Fixture-only presentation remains behind `__DEV__`; it never invokes the
  recording hook or Railway.
- Respect safe areas, accessible labels, 56px+ touch targets, reduced motion,
  and selectable transcript text.

## Review Focus

- A live timer crossing one minute must preserve tabular alignment and accurate
  `MM:SS` accessible copy; cover static formatter/markup evidence in the
  recording-control test.
- Reduced-motion must not start a decorative recorder animation; cover the
  opt-out path in component-source regression evidence.
- A long transcript must remain readable and scrollable without pushing the
  primary continuation below its bounded surface; cover max-height/scroll
  markup evidence.
- A preview deep link with a fixture `state` must hide chooser controls but
  still expose a clear fixture-only label; cover route-source evidence.
- Production builds must still redirect preview access before fixtures render;
  retain the existing guard test and run a production export.

### Task 1: Record composition and regression expectations

**Files:**
- Modify: `components/practice/tokens.ts`
- Modify: `components/practice/recording-control.tsx`
- Modify: `scripts/practice-ui.test.cjs`

**Interfaces:**
- Consumes: `isRecording: boolean`, `elapsedSeconds: number`, and `onPress`.
- Produces: `RecordingControl` with one accessible Start/Stop action and real
  elapsed time.

- [x] **Step 1: Write failing source-level tests** for a display-size timer,
  tabular numeric formatting, a reduced-motion branch, and ring layers.
- [x] **Step 2: Run `node --test scripts/practice-ui.test.cjs`** and verify it
  fails before the composition is added.
- [x] **Step 3: Implement the shared recording-stage visual tokens and update
  `RecordingControl`** to compose label, large timer, non-audio ring layers,
  and a 128px accessible control using the supplied props.
- [x] **Step 4: Run the focused test** and verify it passes.

### Task 2: Editorial session and results composition

**Files:**
- Modify: `components/practice/practice-prompt-card.tsx`
- Modify: `components/practice/recording-review-bar.tsx`
- Modify: `components/practice/feedback-summary.tsx`
- Modify: `components/practice/transcript-panel.tsx`
- Modify: `components/recording/record-button.tsx`
- Test: `scripts/practice-ui.test.cjs`

**Interfaces:**
- Consumes: existing prompt, `FillerResults | null`, transcript string, and
  existing recording callbacks.
- Produces: coherent product states without changing recording/submission API.

- [x] **Step 1: Write failing tests** for an editorial results heading,
  factual filler phrase/count breakdown, and a bounded selectable transcript.
- [x] **Step 2: Run the focused test** and verify it fails.
- [x] **Step 3: Recompose the presentation components** using centralized
  tokens: quiet prompt label/rule, staged review actions, compact factual
  feedback, and transcript reading surface.
- [x] **Step 4: Run the focused test** and verify it passes.

### Task 3: Isolated fixture screenshot mode

**Files:**
- Modify: `app/week1-preview.tsx`
- Test: `scripts/practice-ui.test.cjs`

**Interfaces:**
- Consumes: development-only Expo Router query `state?: PreviewState`.
- Produces: chooser mode at `/week1-preview` and control-free presentation mode
  at `/week1-preview?state=<fixture>` while `__DEV__` is true.

- [x] **Step 1: Write failing source-level tests** for query-state rendering,
  control-free preview mode, and retained production redirect.
- [x] **Step 2: Run the focused test** and verify it fails.
- [x] **Step 3: Implement the smallest safe preview split** that keeps state
  controls only in chooser mode and uses deterministic fixture data.
- [x] **Step 4: Run the focused test** and verify it passes.

### Task 4: Render, refine, and verify

**Files:**
- Create: `docs/design/explorations/recording-fidelity-comparison.png`
- Create: `docs/design/explorations/results-fidelity-comparison.png`
- Create: settled native fixture captures under `docs/design/explorations/`
- Modify: `docs/planning/MOBILE_WEEKLY_PROGRESS.md`

- [x] **Step 1: Launch the iPhone 17 Expo preview**, use the isolated fixture
  state URLs, and save idle, recording, recorded, processing, results, error,
  and permission captures after the opening transition is gone.
- [x] **Step 2: Inspect idle, recording, and results against the four approved
  references**, correcting only demonstrated hierarchy, overflow, safe-area,
  or accessibility defects.
- [x] **Step 3: Build actual-image comparison boards** labelled Reference,
  Previous Native, and Updated Native for recording and results; do not pass
  generated imagery off as simulator evidence.
- [x] **Step 4: Run full verification**:
  `npx tsc --noEmit`, `npm run lint`, and
  `node --test scripts/submission.test.cjs scripts/remaining.test.cjs scripts/practice-ui.test.cjs`.
- [x] **Step 5: Export with `NODE_ENV=production`**, verify no preview label
  appears in output, document native/fixture limits, and commit the recovery
  artifacts on the feature branch.

## Self-review

- The plan maps every recovery requirement to either the recording stage,
  editorial results components, preview separation, or native verification.
- It deliberately does not reproduce unsupported reference affordances or
  introduce an architectural dependency.
- Tests cover state semantics that visual screenshots alone cannot prove;
  native captures cover hierarchy and safe-area fidelity.
