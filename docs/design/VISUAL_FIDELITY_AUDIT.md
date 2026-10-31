# Week 1 Visual Fidelity Audit

**Date:** 2026-10-31  
**Scope:** Week 1 presentation only. Recording, authentication, transcription,
and filler-analysis contracts are unchanged.

## Evidence inspected

- `docs/design/explorations/editorial-recording.png`
- `docs/design/explorations/editorial-results.png`
- `docs/design/explorations/instrument-recording.png`
- `docs/design/explorations/instrument-results.png`
- Native iPhone 17 fixture captures on this branch, including
  `native-preview-*-final.png`
- `docs/design/DESIGN_SYSTEM.md`, `docs/design/MOBBIN_RESEARCH.md`, and the
  approved Focused Practice Studio specification.

The concept images are visual references, not pixel specifications. In
particular, their pause, add-time, alternate-prompt, generic encouragement,
and fixed `00:42` duration affordances are not supported Week 1 features and
will not be copied into production.

## Highest-impact corrections

| Area | Reference character | Current native render | Why it matters | Correction |
| --- | --- | --- | --- | --- |
| Composition | The recorder is a dedicated stage: editorial context, large timer, rings, then one focal control. | Prompt, small timer, and 112px control are independent stacked blocks. | The act of recording does not feel intentional and elapsed time is visually secondary. | Add a shared recording-stage component that groups status, a large tabular timer, restrained rings, and a 128px control. Keep the existing real timer source. |
| Idle state | The instrument owns substantial but purposeful lower-screen space. | Idle has a small circular control floating under the prompt. | The next action is clear but the screen looks like a prototype rather than a practice instrument. | Use the same stage geometry in idle, with an editorial instruction and layered cobalt record affordance. |
| Prompt hierarchy | Editorial references use a quiet label, large serif question, and generous internal rhythm. | Prompt uses correct serif text but reads as a conventional white utility card. | The prompt should establish the calm, intentional session tone. | Make the prompt surface warmer, increase its horizontal/vertical rhythm, and use a small cobalt rule as an editorial anchor. |
| Active feedback | Timer is the visual centerpiece; rings signal capture without asserting audio amplitude. | `00:00` is a small title above the stop button. | A user needs a quick, high-confidence answer to “am I recording, and for how long?” | Promote timer to display scale, pair it with a text state, animate ring scale only when motion is allowed. |
| Review transition | The recording object remains a coherent part of the session before continuation. | Plain text links and a wide button appear below the unchanged prompt. | The transition loses the visual identity created in recording. | Give the review bar its own ruled/staged surface and preserve one dominant cobalt continuation. |
| Results hierarchy | Editorial heading opens the result; transcript is a quiet, generous reading surface and feedback is compact. | A bordered filler card is encountered before a similarly weighted transcript card. | Results feel like a metric panel with incidental text instead of a readable response review. | Add a results header, use a compact filler strip with factual counts, and increase transcript padding/line-height with a bounded long-text surface. |
| Filler details | One restrained treatment presents factual count and named phrases. | Warm-neutral chips are correct but card geometry gives the metric too much weight. | Metric feedback should support, not dominate, raw language. | Retain count and phrases, but tighten the summary surface and use a shared cobalt rule rather than dashboard-like card prominence. |
| Preview contamination | Product references contain no engineering controls. | `/week1-preview` puts red fixture text and eight selectors inside the frame. | It prevents honest product composition review. | Keep the fixture controls in a dev-only chooser route; introduce a dev-only `state` query mode that renders one labelled fixture state without chooser chrome. |

## Safe-area, accessibility, and constraints

- Current captures clear the Dynamic Island because `SafeAreaView` owns the
  top edge. The recovery must preserve that behavior.
- Numeric time uses tabular figures and must be announced as `Recording time
  MM:SS`; the large visual display may not replace the accessible label.
- Ring animation indicates application state only. It must not resemble an
  audio waveform, and it must remain still when reduced motion is enabled.
- Transcript remains selectable; a fixed max-height plus nested scrolling will
  make long responses readable without making the action disappear.
- Development fixtures remain guarded by `__DEV__`, do not use the recording
  hook, and never call Railway.

## Success standard

The updated native screen should visibly read as one product: ivory field,
editorial content, a cobalt instrument with spatial purpose, and results that
lead with the user’s transcript. This means correcting the stage proportions
and hierarchy before polishing small border or radius details.
