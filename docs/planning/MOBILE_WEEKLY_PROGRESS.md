# Mobile Weekly Progress

## Current authorization

- Active week: **Week 1 — baseline and contract**
- Authorized Mobile Engineer B scope: question selection and fixture-driven
  recording/results UI with explicit idle, recording, submitting, success,
  error, permission-denied, and empty-response states.
- Current task: research iOS recording and transcription-results interfaces
  before substantial UI changes.

## Week 1 research status

- Mobbin MCP is verified working through live iOS screen searches on
  2026-10-31. Reference URLs and inspected observations are recorded in
  `docs/design/MOBBIN_RESEARCH.md`.
- Research covers recording, transcript, feedback, and interview-preparation
  experiences. A direct speech-practice reference is available from Speak;
  named searches for Yoodli and Orai did not yield those products, so they
  are not cited as evidence.
- Next decision: review and select the Week 1 visual/interaction direction
  before implementation. No production screen changes have started.

## Week 1 proposed design (pending final approval)

- Selected direction: **Focused Practice Studio** — warm off-white surfaces,
  strong readable typography, a cobalt/indigo primary action, and restrained
  feedback presentation.
- Design-system proposal: `docs/design/DESIGN_SYSTEM.md`.
- Full scope, architecture, implementation order, and acceptance criteria:
  `docs/superpowers/specs/2026-10-31-focused-practice-studio-design.md`.
- Interactive visual preview: `docs/design/focused-practice-studio-preview.html`.
- No application code has been changed for this proposal; final design approval
  is the gate before implementation.

## Week 1 implementation in progress

- Dedicated worktree: `/private/tmp/speaklab-week1-focused-practice-studio` on
  `feat/week1-focused-practice-studio`; the original `main` checkout remains
  untouched.
- Implemented: semantic practice tokens, deterministic filler-count helpers,
  reusable prompt/recording/review/submission/feedback/transcript components,
  and single-surface practice-tab composition using the existing hook.
- Existing local hook changes on `main` (logging and safer URI capture) were
  intentionally not transferred because this UI does not depend on them.
- Verification so far: TypeScript check, focused practice tests, and existing
  submission tests pass. Rendered iOS inspection remains required before the
  Week 1 completion claim.

## Initial repository condition

- Expo Router application with authentication routes, tab navigation, login
  and signup forms, and a recording/submission interface.
- Firebase Auth and Firestore are configured in the mobile app.
- Recording uses `expo-audio`; submission targets a Railway transcription
  endpoint.
- Existing tests are Node-based regression scripts in `scripts/`.

## Risks and blockers

- No connected Mobbin research tool is available in this session.
- The transcription endpoint has recently returned HTTP 404 and requires
  backend-owner confirmation before transcript UI can be verified end to end.
- The project uses Expo SDK 54 while the installed iPhone Expo Go is SDK 58;
  physical-device testing requires an SDK upgrade or a compatible development
  build.
- Current visual styling is largely local and lacks documented shared tokens.

## Log format for an authorized week

Record approved scope, references, selected direction, planned tasks,
implementation and iteration evidence, files changed, visual inspection,
tests, blockers, review questions, and deferred work.
