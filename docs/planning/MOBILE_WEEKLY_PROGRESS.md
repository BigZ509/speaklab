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

## Visual QA attempt — blocked

- 2026-10-31: `xcrun simctl list devices available` failed because
  CoreSimulatorService/simdiskimaged was unavailable (`Connection refused`,
  no simulator device set). No iOS simulator screenshots can be claimed.
- Web fallback reached the actual Expo app at `http://localhost:8081/login`,
  but the authenticated Practice route is correctly guarded. No test account
  or safe fixture-login path is available, so recording/result screens cannot
  be inspected without credentials or an auth-bypass change (out of scope).
- Strongest non-device verification completed: TypeScript no-emit check; Expo
  lint with zero errors; 26 Node tests including recording submission,
  duplicate-submit protection, deterministic filler totals, and transcript
  selection rendering.
- Remaining acceptance evidence: authenticated iOS rendering at compact and
  large device sizes; live microphone/playback interaction; live Railway
  transcription validation. The last item is explicitly unverified.

## Development-only preview

- Added `app/week1-preview.tsx`, protected by `__DEV__` and redirecting to
  `/login` in production builds. It never invokes Firebase, the recording
  hook, or the Railway backend.
- The route labels itself `DEVELOPMENT PREVIEW · FIXTURES ONLY` and provides
  deterministic idle, recording, recorded, processing, results, empty,
  error, and permission-denied states.
- Route guard is regression-tested. TypeScript and 27 Node tests pass; Expo
  lint passes with zero errors.
- Web screenshot attempt remains blocked: this command environment terminates
  Expo dev-server processes after a command returns, and a detached attempt
  could not bind localhost (Chrome received `ERR_CONNECTION_REFUSED`).
  Therefore no screenshot or visual inspection is claimed from this preview.

## Native simulator retry

- Elevated `xcrun simctl list devices booted` verified iPhone 17, iOS 26.5
  (`2A06F270-C9C4-4A16-B067-B5D5B67A4A6F`) is booted.
- Expo launched the feature-worktree bundle on port 8082 and a direct
  `exp://192.168.1.28:8082/--/week1-preview` link reached the fixture screen.
- The preview’s accessible content confirms the development label, static
  prompt, and all fixture-state controls. However an Expo red error overlay
  from the existing `auth/invalid-api-key` configuration is rendered above it,
  repeatedly originating from `app/(tabs)/signup.tsx` importing Firebase.
- No screenshot evidence is claimed as a clean visual QA artifact because the
  overlay obstructs the fixture UI. Firebase configuration was not changed.

## SpeakLab 2.0 research sprint

- Completed three Mobbin research batches: speech/practice, consumer
  composition, and minimal expressive recording interfaces.
- Inspected and documented 16 verified iOS screen references across 15 apps
  (some references were previously verified in this Week 1 thread).
- Research-only stopping point reached: no additional application changes are
  authorized until the Phase 5 design-synthesis review.

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
