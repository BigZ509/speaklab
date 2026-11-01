# Focused Practice Studio — Week 1 Design Proposal

## Intent

Give an authenticated SpeakLab user one calm, legible path from a static
practice prompt to recording, submission, and a readable transcript with
deterministic filler feedback. Visual polish serves task completion: users
always know the current recording state, their next action, and where to find
their actual words.

## Goals

- Preserve current recording, authentication, transcription, and deterministic
  filler analysis behavior.
- Replace the current bare recording controls with accessible reusable UI.
- Make the transcript the primary result artifact and filler feedback a
  clearly labelled secondary insight.
- Handle every authorized Week 1 state: idle, recording, ready for review,
  submitting, success, error, permission denied, and empty response.

## Non-goals

- Question selection, score trends, interview simulation, generated coaching,
  backend work, speech-engine modifications, or any Week 2 work.
- Invented result values. Development fixtures, if needed for visual testing,
  must be labelled as fixtures and never presented as user analysis.

## Evidence and selected direction

The selected direction is Focused Practice Studio. Verified references and
observations are in `docs/design/MOBBIN_RESEARCH.md`:

- Hinge and Speak support a persistent prompt plus one dominant voice action.
- Cal AI supports a sparse, unambiguous active-recording state.
- Perplexity and pillowtalk support transcript-first reading and a clear
  distinction between transcript and analysis.
- Mindtrip supports a concise expectation-setting introduction before a voice
  task; Future Pro supports progressive detail rather than front-loading
  feedback density.

## Screen layouts and navigation

The existing authenticated tab remains the Week 1 entry point. No new tab or
backend route is required.

1. **Practice screen, stateful single surface**
   - Header: `SpeakLab` and `Practice response`.
   - Static prompt card: “Tell me about a time you had to explain a complex
     idea clearly.” with concise preparation guidance.
   - State region: idle record action; live elapsed/waveform/stop action;
     review controls; or inline submitting/error/permission content.
   - This avoids navigation churn during a short task and preserves context.
2. **Result section, revealed after successful submission**
   - Heading: `Practice review`.
   - Filler feedback card: count and direct deterministic sentence only.
   - Transcript panel: selectable returned transcript, with a labelled empty
     result if the transcript is blank.
   - `Practice again` returns the surface to the idle recording state.

## Component architecture

`PracticeSessionScreen` composes `PracticePromptCard`, `RecordingControl`,
`RecordingReviewBar`, `SubmissionState`, `FeedbackSummary`, and
`TranscriptPanel`. Presentation components receive state and callbacks from
the existing recording hook; they do not add network requests or analysis.
Tokens are defined in the Week 1 foundations section of `DESIGN_SYSTEM.md`.

## Approaches considered

1. **Focused Practice Studio (selected)** — transcript-first, one dominant
   action, and restrained metrics. Best for first-session confidence and the
   existing deterministic result contract.
2. **Performance dashboard** — score, trend, and dense metrics. Rejected for
   Week 1 because it implies historical data and can make practice feel
   evaluative rather than usable.
3. **Conversation simulation** — immersive scenario controls. Rejected for
   Week 1 because it broadens scope and competes with prompt and transcript
   clarity.

## Implementation order, after final approval

1. Create the token module and focused reusable presentational components.
2. Assemble the static-prompt practice screen around the existing recording
   hook, preserving its API and state transitions.
3. Implement all authorized loading, permission, error, and empty states.
4. Add fixture-backed focused component/state tests without changing backend
   contracts or speech-engine behavior.
5. Render on iOS-capable tooling, inspect against the approved mockup,
   refine layout/accessibility, and rerun tests.
6. Record rendered-inspection and test evidence in `MOBILE_WEEKLY_PROGRESS`.

## Acceptance criteria

- A user can start, stop, replay, replace, and submit a recording with clear,
  accessible labels and touch targets.
- Submission cannot be duplicated; existing error/retry behavior remains.
- Recording state is visually and programmatically clear without relying on
  color alone.
- Transcript content is selectable, readable, and prioritized over metrics.
- Filler feedback is deterministic and clearly identified; no fake coaching
  is shown.
- Permission-denied, loading, error, and empty-response states offer plain
  recovery paths.
- No authentication, backend API, or speech-engine contract changes occur.
- Tests pass and actual rendered UI has been inspected before completion.

## Open implementation details

- The user must grant final approval of this proposal before application code
  is written.
- The existing SDK/device compatibility risk remains: Expo SDK 54 does not
  match the installed iPhone Expo Go SDK 58. Render verification will use a
  compatible simulator/development build if available; this proposal does not
  authorize an SDK upgrade.
