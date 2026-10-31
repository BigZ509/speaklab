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

## Editorial implementation visual QA

- Native iPhone 17 preview was reopened successfully via the development-only
  route. The actual fixture idle and results screens were inspected.
- Findings: safe-area spacing clears the Dynamic Island; serif headings create
  a distinct editorial hierarchy; the prompt card reads as a coherent surface;
  filler breakdown retains factual counts; transcript remains the dominant
  result artifact. Preview-state selector and fixture label are development
  tooling, not production UI.
- Screenshots: `docs/design/explorations/native-preview-idle-after.png` and
  `docs/design/explorations/native-preview-results-after.png`. The idle
  capture was taken while Expo Go was opening and is not accepted as final
  UI evidence; the results capture is a valid fixture-only native render.
- Validation after editorial refinement: TypeScript no-emit passed, Expo lint
  passed with zero errors, and 28 Node tests passed.

## Final native verification — iPhone 17 (2026-10-31)

- Relaunched the development-only preview from this feature worktree on the
  booted iPhone 17 simulator (iOS 26.5) and waited until the Expo opening
  transition had cleared before each capture.
- Valid, settled SpeakLab fixture captures are saved as:
  - `docs/design/explorations/native-preview-idle-final.png`
  - `docs/design/explorations/native-preview-recording-final.png`
  - `docs/design/explorations/native-preview-recorded-final.png`
  - `docs/design/explorations/native-preview-results-final.png`
- Each capture visibly contains the `DEVELOPMENT PREVIEW · FIXTURES ONLY`
  label and the SpeakLab practice surface; none is an Expo loading screen or
  error overlay. These are fixture demonstrations, not live backend results.
- Visual inspection findings: the content clears the Dynamic Island; cards,
  controls, and primary action remain inside the viewport; serif display text
  is consistent across practice and review; and transcript and filler content
  remain readable. The state-picker chips are intentionally isolated to the
  development preview and are not part of the production practice experience.
- No genuine visual or functional defect was found in this final pass, so no
  production UI change was made.
- The preview remains development-only: `app/week1-preview.tsx` returns a
  `Redirect` before rendering fixtures when `__DEV__` is false. Its existing
  regression test covers the explicit guard. A fresh `NODE_ENV=production`
  iOS Expo export completed successfully; its generated output contains no
  `DEVELOPMENT PREVIEW` or `FIXTURES ONLY` fixture label.
- Deferred live verification: microphone permission/capture, native playback,
  and a successful Railway transcription request remain unverified. The
  fixture preview intentionally cannot exercise them and must not be used as
  evidence that they work.

## Week 1 visual-fidelity recovery — iPhone 17 (2026-10-31)

- Visual-fidelity audit: `docs/design/VISUAL_FIDELITY_AUDIT.md`. It compares
  the inspected Editorial and Recording Instrument concept files against the
  prior native capture, identifies composition as the primary issue, and
  excludes unsupported reference affordances such as pause, add time,
  alternate prompts, and generic coaching.
- Recovery implementation: a 56px tabular timer and 128px cobalt recorder are
  composed as one stage with three state-distinct concentric rings. The ring
  pulse is state-only (not audio-reactive) and is disabled when reduced motion
  is enabled. Prompt, review, results header, factual filler summary, and
  bounded selectable transcript surfaces now use the same editorial rules,
  spacing, geometry, and cobalt accent.
- Development preview separation: `/week1-preview?state=<fixture>` is a
  development-only, control-free screenshot mode. It remains labelled
  `DEVELOPMENT PREVIEW · FIXTURES ONLY`; the unparameterized route retains
  the state selector. Fixtures never invoke Firebase, the recording hook, or
  Railway, and `__DEV__` still redirects in production.
- Native, settled, control-free fixture captures from the booted iPhone 17
  iOS 26.5 simulator are saved as `native-recovery-idle.png`,
  `native-recovery-recording.png`, `native-recovery-recorded.png`,
  `native-recovery-processing.png`, `native-recovery-results.png`,
  `native-recovery-error.png`, and `native-recovery-permission.png` under
  `docs/design/explorations/`. Each is 1206×2622.
- Before saving, the Simulator accessibility tree was checked for expected
  SpeakLab fixture content rather than an Expo loading screen or error overlay.
  Recording and results inspection confirmed Dynamic Island clearance, visible
  ring contrast, a central timer/control stage, and readable actual transcript
  and factual filler content.
- Actual-image comparison boards are `recording-fidelity-comparison.svg` and
  `results-fidelity-comparison.svg`, arranged as Reference concept | Previous
  native | Updated native. They link only inspected reference PNGs and real
  Simulator PNGs; no generated image is represented as a native capture.
- A second-size attempt used the available iPhone 17e (1170×2532). It booted,
  but opening the Expo deep link failed with
  `LSApplicationWorkspaceErrorDomain` code `115` because the device has no
  `exp://` handler. Installing Expo Go or a development build is outside this
  Week 1 authorization, so no 17e application screenshot is claimed.
- Remaining unverified integrations are unchanged: live microphone permission
  and capture, native playback, and a successful Railway transcription request
  were not exercised by fixture rendering.

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

## Recording Composition Recovery — final verification (2026-10-31)

- Scope: Week 1 recording presentation only, on the existing isolated
  `feat/week1-focused-practice-studio` worktree. No results-screen, backend,
  authentication, speech-engine, or navigation changes in this recovery.
- The live recorder and development preview share `PracticeSession`, the compact
  serif prompt, and `RecordingControl`. The timer uses native iOS Didot at
  128px/136px; concentric rings are 340/268/210px around a 164px cobalt action.
  The timer remains display-sized at large accessibility settings while labels
  and prompt text scale. Status text can wrap. Motion starts conservatively
  and follows the system reduced-motion preference.
- Fresh final native capture: `docs/design/explorations/native-fixture-recording-final.png`,
  captured from the fully loaded iPhone 17 (iOS 26.5) after restarting Expo Go.
  The development-only URL is `/week1-preview?state=recording&capture=1`.
  Fixture controls and banner are absent in this explicitly requested capture
  mode; the ordinary preview retains its developer controls and production
  continues to redirect before rendering fixtures.
- Visually compared the final capture with `instrument-recording.png`.
  The large high-contrast timer, cobalt center, three ring layers, restrained
  context label, and open recording stage retain the approved direction.
  Remaining deliberate differences: the real practice question appears above
  the timer, a square Stop action replaces the concept's microphone while
  recording, and unsupported Pause/Add time controls are omitted. The native
  canvas is warm off-white rather than the concept's gray field.
- Earlier actual native refinement captures remain available as
  `native-fixture-recording-pass1.png` and `native-fixture-recording-pass2.png`.
  The refreshed `recording-composition-comparison.png` contains the supplied
  concept phone region, old native capture, and final native capture with
  original aspect ratios. `recording-before-after.html` embeds both native
  images for standalone viewing.
- Fresh verification: `npx tsc --noEmit` exited 0; `npm run lint` exited 0;
  `node --test scripts/submission.test.cjs scripts/remaining.test.cjs scripts/practice-ui.test.cjs`
  passed 34/34 tests with zero failures. Tests include timer minute boundaries,
  start/stop callbacks, reduced-motion preference changes, clean preview
  transition, production preview redirect, and existing submission regressions.
- Existing production iOS export completed successfully and contained zero
  development fixture-label/error-marker matches. Final continuation made no
  product code changes after the fresh verification.
- Evidence limit: native fixtures prove presentation and fixture transitions.
  Live microphone permission/capture/playback and a successful Railway request
  remain unverified. There is no remaining blocker to reviewing the recording
  screen's visual composition.
