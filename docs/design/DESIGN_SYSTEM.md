# SpeakLab Design System

## Status

Week 1 proposal, pending final screen-design approval. The selected visual
direction is **Focused Practice Studio**: calm, focused iOS practice with a
warm off-white surface, readable hierarchy, and a restrained cobalt/indigo
accent. It is informed by verified Mobbin research recorded in
`docs/design/MOBBIN_RESEARCH.md`; it does not copy another product.

## Current implementation inventory

- Typography: local form titles use 30px / 700; shared themed text defines
  16px body, 20px subtitle, and 32px title variants.
- Color: shared link text uses `#0a7ea4`; the Explore screen uses `#808080`.
- Layout: existing forms use simple flex rows, 8px gaps, and 8px input
  padding. No shared spacing scale or radius token exists.
- Components: reusable themed text/view and template navigation components
  exist; authentication and recording controls remain screen-local.

## Required design-system areas

Before creating a production UI pattern, document its semantic color role,
typography role, spacing, radius, states, accessibility behavior, and reuse
boundary here. Record decisions for buttons, cards, navigation, recording
controls, feedback, charts, loading/empty/error states, and motion.

## Week 1 proposed foundations

### Semantic color roles

| Role | Value | Intended use |
| --- | --- | --- |
| `surface.canvas` | `#F8F6F1` | Warm, low-glare app background |
| `surface.raised` | `#FFFFFF` | Cards and grouped content |
| `surface.subtle` | `#EEECE6` | Inactive controls and waveform track |
| `text.primary` | `#17171C` | Primary headings and essential content |
| `text.secondary` | `#5B5B66` | Supporting context and labels |
| `border.subtle` | `#DEDCD5` | Low-emphasis separation |
| `action.primary` | `#3346B8` | Primary action, selected state, record affordance |
| `action.onPrimary` | `#FFFFFF` | Content on primary actions |
| `status.success` | `#247A4A` | Completed submission only, always paired with text |
| `status.error` | `#B42318` | Recoverable failures and alerts |

Color is never the only state signal. Text labels, icons, control state, and
accessible announcements accompany all status changes.

### Typography, spacing, and shape

- `display`: 32px / 38px / 700 for the one page-level focus heading.
- `title`: 24px / 30px / 700 for screen and result-section headings.
- `body`: 17px / 25px / 400 for prompts and transcripts; this deliberately
  exceeds the existing 16px body for long-form readability.
- `label`: 14px / 20px / 600 for controls and metric labels.
- Spacing scale: 4, 8, 12, 16, 24, 32, 40px. Screen gutters are 20px;
  control groups use 12px or 16px gaps.
- Radius: 12px for cards and inputs; 16px for the question card; 999px only
  for circular record controls and status pills.
- Elevation: none by default. A 1px subtle border defines cards so hierarchy
  remains clear without decorative shadows.

### Reusable Week 1 components

| Component | Responsibility | Accessibility and state behavior |
| --- | --- | --- |
| `PracticePromptCard` | Shows the one static practice question and brief instruction | Semantic heading, readable body, no hidden interaction |
| `RecordingControl` | Starts/stops recording and presents elapsed time/waveform state | Minimum 56px target; label changes from “Start recording” to “Stop recording”; state announced politely |
| `RecordingReviewBar` | Replays, replaces, or submits a captured recording | Prevents unavailable actions; clear disabled labels and submitting status |
| `SubmissionState` | Processing, retryable error, permission-denied, and empty-response states | Uses alert semantics for errors and offers a single recovery action |
| `FeedbackSummary` | Presents deterministic filler count and a plain-language interpretation | Never presents invented coaching or an opaque score |
| `TranscriptPanel` | Shows returned transcript text in an easy-to-scan, selectable format | Body text at 17px+, labelled heading, empty state when text is unavailable |
| `MetricChip` | Compact labelled value for deterministic metrics | Text conveys meaning independent of color |

### Week 1 screen behavior proposal

1. **Practice prompt / idle recording**: a static interview question appears
   first, followed by a short instruction and one primary “Start recording”
   action. This reduces choice overload and makes the next action obvious.
2. **Recording**: the prompt remains visible while an elapsed timer, compact
   waveform, and one large stop action communicate that capture is active.
   Keeping the prompt in place supports memory without requiring navigation.
3. **Review and submit**: after recording, replay and replace are secondary;
   “Review my response” is the only primary action. The same area represents
   submitting progress without a disruptive new screen.
4. **Results**: a short “Practice review” heading leads with the deterministic
   filler-word count, then the selectable transcript. It is intentionally not
   a scorecard or a fabricated coaching report.

### States and motion

- Idle, recording, review-ready, submitting, success, retryable submission
  error, microphone permission denied, and empty transcript response all
  receive explicit copy and a recoverable next action.
- Recording uses a gentle, nonessential waveform/record-indicator animation;
  it respects reduced-motion preferences. Submission uses an inline progress
  indicator instead of a blocking modal.
- No chart is in scope for Week 1. Longitudinal performance metrics are
  deferred until genuine historical data is available.

### Reuse boundary and deferred work

These components and tokens serve the authenticated practice tab only in
Week 1. Question selection, interview simulations, scoring, trend charts,
generated coaching, new backend contracts, and speech-engine changes are
explicitly deferred.
