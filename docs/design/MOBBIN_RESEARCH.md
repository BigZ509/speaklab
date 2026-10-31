# Mobbin Research Log

## Connection status

Verified 2026-10-31: the Mobbin MCP search tool is available in this Codex
session. The following references came from live iOS searches and their
previews were inspected before being recorded below.

## Week 1: recording, transcription, feedback, and interview preparation

### Recording controls

- [Cal AI — listening state](https://mobbin.com/screens/cb89899b-0c1a-4ad3-84e3-cf70e47d5d89)
  (`cb89899b-0c1a-4ad3-84e3-cf70e47d5d89`): a deliberately sparse listening
  state uses one status label and two separated terminal actions: cancel and
  confirm.
- [Hinge — profile voice recording](https://mobbin.com/screens/40bb06ff-7de6-4c81-ba5c-51c7deb60971)
  (`40bb06ff-7de6-4c81-ba5c-51c7deb60971`): a contained recording canvas
  makes elapsed/maximum time and live waveform legible, with a single large
  stop button overlapping the canvas edge.
- [Facebook — video voiceover](https://mobbin.com/screens/f2fab00d-2f99-4bb0-9d9c-e9dd9daaae6c)
  (`f2fab00d-2f99-4bb0-9d9c-e9dd9daaae6c`): a bottom sheet preserves task
  context and gives one clear microphone control plus direct recording
  guidance.

### Transcription and feedback

- [Perplexity — transcript view](https://mobbin.com/screens/e134bf14-de4d-4b7e-ba33-2f638bb14d38)
  (`e134bf14-de4d-4b7e-ba33-2f638bb14d38`): transcript is the dominant,
  selectable content; a compact control row handles transcript mode and
  secondary actions without competing with reading.
- [pillowtalk — transcript/analysis switch](https://mobbin.com/screens/c77dc48d-562c-4778-8583-8a5d31f2b268)
  (`c77dc48d-562c-4778-8583-8a5d31f2b268`): a segmented control makes the
  relationship between raw transcript and interpretation explicit.
- [Future Pro — session feedback](https://mobbin.com/screens/ec61b19f-4a10-4455-8627-74f909b8d500)
  (`ec61b19f-4a10-4455-8627-74f909b8d500`): a single feedback task sits in a
  card with a clear primary action; detailed, flagged items remain below the
  fold instead of obscuring the main assessment.

### Interview preparation and competitor evidence

- [Mindtrip — start voice interview](https://mobbin.com/screens/175c31a8-920c-4424-8e2f-f2a0174e2aea)
  (`175c31a8-920c-4424-8e2f-f2a0174e2aea`): brief expectation-setting copy
  leads to one full-width “Start voice interview” CTA, with a lightweight
  exit and skip path.
- [Glassdoor — interview-answer prompt](https://mobbin.com/screens/91dae2ef-4a24-4428-9fee-5f5d02e09939)
  (`91dae2ef-4a24-4428-9fee-5f5d02e09939`): the question is immediately
  visible over interview media, demonstrating that prompt comprehension must
  stay primary during practice.
- [Speak — spoken-practice screen](https://mobbin.com/screens/ac7aead2-8257-40a8-94ef-ebeb9ee6c0d0)
  (`ac7aead2-8257-40a8-94ef-ebeb9ee6c0d0`): the verified speech-practice
  competitor keeps the scenario and prompt above one oversized microphone
  affordance, with an explicit correction status.

### Research limits

Named iOS searches for Yoodli and Orai did not return screens from those
products, so no claims about their interfaces are treated as verified
evidence. The references above inform patterns, not a visual or interaction
copying exercise.

## 2.0 deep research sprint — 2026-10-31

All entries below are inspected iOS Mobbin previews from three focused search
batches. Assessments of what would help SpeakLab are design judgments, not
claims about product outcomes. Motion is only noted when visible in a still
screen; none is inferred.

### Batch A — speech, learning, and practice

| App / inspected screen | Evidence | Concrete observation | SpeakLab lesson / do not copy |
| --- | --- | --- | --- |
| Speak — scenario speaking | [screen](https://mobbin.com/screens/ac7aead2-8257-40a8-94ef-ebeb9ee6c0d0) | Scenario/prompt is held above one oversized blue microphone; correction state is explicit. | Keep prompt and one dominant action; do not adopt the avatar-heavy scene. |
| Duolingo — repeat-after prompt | [screen](https://mobbin.com/screens/68634e56-78f8-484d-aedb-a2cb6117d216) | Large whitespace, one sentence card, progress line, and a single mic create an obvious sequence. | Use one focal action and stable prompt placement; do not import mascot gamification. |
| Hinge — voice-profile recording | [screen](https://mobbin.com/screens/40bb06ff-7de6-4c81-ba5c-51c7deb60971) | Editorial heading, prompt pill, timer/max duration, contained recording field, and stop control communicate task order. | Add timer and a purpose-built recording stage; do not copy its dating-brand typography. |
| Hinge — voice start state | [screen](https://mobbin.com/screens/afaa3a61-466e-4dae-b74c-7189d90d995f) | Empty dashed stage says “Tap to start recording”; mic overlaps the stage boundary. | A stateful stage can explain emptiness; avoid decorative dashed treatment if it weakens SpeakLab’s calm tone. |
| Google Lens — live translation | [screen](https://mobbin.com/screens/155aee95-7aec-4d7c-b026-52a3e8ecc729) | A simple live status sits over task context, with actions consolidated in a bottom sheet. | Reserve controls for the active task and keep secondary actions grouped. |
| Mindtrip — start voice interview | [screen](https://mobbin.com/screens/175c31a8-920c-4424-8e2f-f2a0174e2aea) | Brief expectation-setting leads directly to a wide “Start voice interview” action. | Intro copy earns its space when it removes uncertainty; avoid adding a separate preflight flow. |

### Batch B — exceptional consumer composition

| App / inspected screen | Evidence | Concrete observation | SpeakLab lesson / do not copy |
| --- | --- | --- | --- |
| WHOOP — breathing round | [screen](https://mobbin.com/screens/49be3a4c-ee84-4baf-b51e-bbb0b70723af) | Dark field, centered numeric focal point, restrained circular guide, and short imperative instruction make time tangible. | Timer can become the recording focal point; do not use dark/high-arousal fitness styling. |
| Insight Timer — meditation detail | [screen](https://mobbin.com/screens/c1125602-7f0f-4b26-b1bd-5b08186bce15) | Long text is treated as a calm reading surface with generous margins and one bottom action. | Transcript needs generous line height and one clear continuation action. |
| Jomo — session setup | [screen](https://mobbin.com/screens/96b3ed0e-8ec5-4c77-9a6d-c82d57209c6f) | Sheet composition separates title, suggestions, settings rows, and a single dark “Start” CTA. | Use staged grouping rather than a flat field of controls; no need to reproduce settings density. |
| Noom — soothing session | [screen](https://mobbin.com/screens/2e5a8e30-2953-42de-b84e-14fef814e161) | Limited palette, full-bleed soft image, centered title, thin progress line, and one play affordance. | A controlled accent and quiet negative space can carry identity; avoid imagery that competes with a practice prompt. |
| Perplexity — transcript view | [screen](https://mobbin.com/screens/e134bf14-de4d-4b7e-ba33-2f638bb14d38) | Transcript dominates; compact mode/action controls remain visually secondary. | Transcript is the result, not a metric accessory; no dashboard chrome. |
| Arc Search — spoken-result story | [screen](https://mobbin.com/screens/118587d9-3a9b-4692-8c14-3541bda31c47) | Saturated gradient only frames one focused story card and next action. | If color expands, use it to frame a single focus moment, not every surface. |

### Batch C — minimal expressive interfaces

| App / inspected screen | Evidence | Concrete observation | SpeakLab lesson / do not copy |
| --- | --- | --- | --- |
| Once — tape voice message | [screen](https://mobbin.com/screens/acddd278-9270-4590-b164-9cd8f5f391d2) | A tactile cassette image, clear quoted purpose, visible 0:04/0:15, waveform, and red stop point form a memorable recorder. | Make the recorder a composed object with timer/state; do not use nostalgia as an unrelated visual theme. |
| Givingli — voice note sheet | [screen](https://mobbin.com/screens/f600537f-30d4-48fe-b151-ad6c5df7ff3b) | Quiet sheet gives “Tap to Record” one clear focal position with a layered circular mic. | Layered ring treatment can give SpeakLab’s primary action depth without extra controls. |
| Claude — voice input | [screen](https://mobbin.com/screens/13cf4949-114a-4686-a9ef-9c80f694c801) | Nearly blank field concentrates attention on a single blue listening capsule plus settings/cancel endpoints. | Negative space works when state text makes it intentional; do not hide essential instruction. |
| pillowtalk — transcript / analysis | [screen](https://mobbin.com/screens/8dd9282d-511c-4aed-97cb-71a7e2fcf85b) | A two-option segmented control places raw transcript and interpretation at the top, while text remains highly readable. | Separate transcript from interpretation when both exist; Week 1 needs no invented analysis tab. |

### Comparison and synthesis

- **Typography:** best practice screens use a large task sentence or title,
  a compact contextual label, then normal-sized instructional text. SpeakLab’s
  current large title is useful, but its eyebrow needs safe-area clearance and
  lower emphasis. Hinge/Once use editorial display type; Insight Timer and
  Perplexity give long text generous readable measure.
- **Composition:** repeated practice uses a stable prompt zone plus a distinct
  action zone. Hinge’s contained stage, WHOOP’s centered timer, and Givingli’s
  layered mic each make the active task feel placed rather than dropped into
  empty space.
- **Color:** strong products restrict saturated color to a focal interaction
  or a single compositional field. SpeakLab’s cobalt should stay on the record
  and primary continuation controls; warm off-white should remain the resting
  surface.
- **Results:** Perplexity and pillowtalk make raw language the dominant
  artifact. SpeakLab should retain its transcript-first result, deterministic
  filler card, and avoid speculative scores or dashboards.
- **Motion:** still references do not prove motion behavior. The approved
  gentle timer/control pulse is appropriate as local state feedback, not an
  audio-reactive claim.

### Current Week 1 audit — five highest-impact weaknesses

1. **Unsafe header placement:** the native iPhone 17 capture showed the
   eyebrow under the Dynamic Island. This weakens legibility before the task
   begins. Hinge and WHOOP keep top controls clearly inside safe content; the
   applied safe-area wrapper corrects this without adding a feature.
2. **Unstructured recorder space:** the original idle view put a lone button
   below the prompt with no temporal or state structure. Hinge, WHOOP, and
   Givingli instead visually bind timer/status/control into one stage.
3. **Recording state did not expose elapsed time:** practice needs temporal
   orientation. Hinge and Once make elapsed/max time explicit; SpeakLab now
   uses real local elapsed duration, not a fixture value.
4. **Results risk reading as a small metric card plus incidental text:**
   Perplexity and pillowtalk demonstrate that transcript reading must lead.
   Keep filler feedback compact and transcript body at the approved 17px/25px.
5. **Unrelated starter tab chrome dilutes product identity:** native capture
   showed Home/Explore/signup tabs underneath the Practice screen. Jomo’s
   focused session sheet shows how one task benefits from a quieter shell.
   Isolate the development preview from starter navigation; do not change auth
   or production navigation architecture in this research phase.

### Ranked opportunities (research only)

1. **Composed recording stage** — high visual/usability impact, low-to-medium
   complexity, fully Week 1-compatible. Support: Hinge, WHOOP, Givingli,
   Once. Use timer/status/ring as one focal group.
2. **Editorial practice rhythm** — high relevance, low complexity. Support:
   Hinge, Insight Timer, Speak. Use clear display/title/body hierarchy and
   intentional negative space around the prompt.
3. **Transcript-as-artifact result** — high usability impact, low complexity.
   Support: Perplexity, pillowtalk, Insight Timer. Preserve readable text as
   the primary result and deterministic feedback as supporting context.

### Research limitations

- Named Yoodli, Orai, ELSA Speak, Headspace, Calm, Spotify, Airbnb, and
  Notion screens were not cited because this sprint did not verify an
  inspected relevant screen for them.
- Mobbin still images cannot substantiate interaction timing, haptics, or
  animation behavior.

## Research template

For each authorized journey, record:

- The design problem and target user task
- Verified product, Mobbin URL, and screen or flow identifier
- Layout, hierarchy, CTA, density, typography, spacing, and state findings
- At least two viable directions and their trade-offs
- The selected SpeakLab-specific direction, reasoning, and what is not copied

Do not add inferred observations as verified Mobbin findings.
