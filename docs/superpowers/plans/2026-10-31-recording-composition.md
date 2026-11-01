# Recording Composition Recovery

**Goal:** Deliver the approved Instrument + Editorial recording composition in the iPhone 17 Simulator, with two actual screenshot iterations.
**Architecture:** Share a presentational PracticeSession between the authenticated recorder and development fixture route. Keep useAudioRecording, results, submission and auth unchanged. Native iOS Didot supplies the timer and Georgia supplies prompt typography; no font substitution or dependency is needed on iPhone.
**Spec:** User's Recording Screen Visual Fidelity Recovery request; approved `instrument-recording.png` and `editorial-recording.png`.
**Execution:** Inline, authorized to implement and commit without another approval round. This plan supersedes the recording portion of the previous recovery plan; results work is excluded.

## Preserve
- Static question, idle/start/active/stop/review/submission/error/permission behavior and elapsed seconds.
- Existing hook, backend, Firebase and navigation architecture.
- Development state chooser, production redirect, and fixture labelling in evidence filenames/docs.
- Results components and their tokens remain untouched.

## Five moves
1. Replace the competing large session title with a restrained practice label.
2. Make the prompt a compact editorial reading surface; remove its repeated instruction during capture.
3. Enlarge the tabular serif timer to the primary type scale, including a stable idle 00:00.
4. Compose three cobalt rings around a large blue control; show a stop glyph and explicit Stop recording label during capture.
5. Share the product layout with a development-only clean capture mode that removes fixture chrome.

## Tasks
- [x] Recompose `tokens.ts`, `practice-prompt-card.tsx`, `recording-control.tsx`; add `practice-session.tsx`; wire it in `record-button.tsx` and `week1-preview.tsx`.
- [x] Replace brittle visual-size source assertions with component behavior tests: elapsed boundary, start/stop callbacks, reduced-motion, production guard, clean preview transitions. Use existing Node harness; no dependency changes.
- [x] Capture first native fixture recording; compare scale, rings, prompt and spacing to concept; correct and capture again. Inspect idle, recorded, permission, error and processing states; inspect large text and reduced motion when possible.
- [x] Save real-image comparison board, update design-system/evidence and weekly progress; run TypeScript, lint, full established suite and production preview exclusion check; commit on existing branch only.

## Review focus
- Timer at 59/60/61 seconds and long duration; one labelled start/stop target.
- Reduced motion never starts the decorative pulse; asynchronous preference lookup starts conservatively.
- Narrow and enlarged-text layouts scroll without clipping actions.
- Preview query selects initial state but buttons still transition; fixture capture chrome never enters production.
- Live and fixture screen use identical presentation; fixture evidence cannot prove microphone or Railway behavior.

## Evidence ledger
- Baseline: clean feature worktree at 579c19b; four mandatory images inspected.
- Mobbin: one narrow Givingli voice recording query, two images inspected. Layered mic example: https://mobbin.com/screens/f600537f-30d4-48fe-b151-ad6c5df7ff3b. No broad research, new concepts or unsupported controls.
- Implementation choices: native iOS Georgia, React Native Views and Animated rings, existing callbacks. These are presentation decisions within the authorized scope.

- Final continuation: TypeScript and lint exited 0, 34/34 regression tests passed; fresh settled iPhone 17 recording capture and comparison saved. No additional UI correction was needed. See MOBILE_WEEKLY_PROGRESS.md for final evidence and live-verification limits.
