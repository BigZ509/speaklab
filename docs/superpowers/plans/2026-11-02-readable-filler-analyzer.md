# Readable Filler Analyzer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `speechEngine/fillers.ts` in the project's original straightforward style while preserving its current filler-analysis behavior.

**Architecture:** Keep the existing exported `fillerAnalyzer` contract and filler sets. Move normalization, result insertion, obvious-filler detection, and ambiguous-phrase detection into small named helper functions using ordinary loops and conditionals.

**Tech Stack:** TypeScript, Node's built-in test runner, Expo React Native codebase.

**Spec:** User request to restore the filler function to their readable coding style without breaking current behavior.

## Global Constraints

- Preserve Week 1 filler-analysis behavior and the `Map<string, Occurence[]>` return shape.
- Preserve punctuation/case normalization, timestamps, adjacent obvious-filler context, and full multi-word phrase matching.
- Do not change speech-engine rules, backend APIs, or unrelated files.

## Review Focus

- Obvious fillers remain recorded individually, including repeated occurrences.
- Ambiguous single words remain ignored unless adjacent to an obvious filler.
- Multi-word ambiguous phrases are recorded once with the full timestamp range.
- Punctuation and casing do not alter matches or timestamps.

### Task 1: Characterize and rewrite the filler analyzer

**Files:**
- Modify: `speechEngine/fillers.ts`
- Test: `scripts/remaining.test.cjs`

**Interfaces:**
- Consumes: `TranscriptResults` with timestamped words.
- Produces: existing `fillerAnalyzer(transcript)` result map.

- [ ] Run the focused filler regression tests to establish the current behavior.
- [ ] Add or retain focused assertions for repeated obvious fillers, contextual ambiguous words, full phrases, and normalization.
- [ ] Rewrite the implementation with named helpers and simple loops while preserving the existing contract.
- [ ] Run the focused tests and the complete available regression suite.
- [ ] Record the evidence in `docs/planning/MOBILE_WEEKLY_PROGRESS.md`.
