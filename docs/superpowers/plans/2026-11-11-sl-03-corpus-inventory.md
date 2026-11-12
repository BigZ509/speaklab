# SL-03 corpus inventory implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline.

**Goal:** Deliver the dataset inventory requested in issue #10 without uploading audio or invoking a transcription API.

**Architecture:** A standalone Python standard-library CLI inventories the existing English Common Voice Spontaneous Speech release. Full per-record metadata stays local; a synthetic manifest template, aggregate inventory and research report are checked in. No application, speech-engine, API, auth or infrastructure changes.

**Tech stack:** Python 3.10+, unittest, optional macOS afinfo for sample duration verification.

**Spec:** https://github.com/BigZ509/speaklab/issues/10 (user supplied and explicitly requested implementation).

## Global constraints

- Issue #10 research only; no future implementation-week journeys.
- Zero OpenAI/backend requests. No accuracy metrics or gold-label claims.
- No source audio, transcript text, report comments, demographics or original speaker identifiers in checked-in evidence.
- Verify release identity from the local datasheet; distinguish missing labels, reported clips, textual indicators and unverified audible annotations.
- Keep existing dataset ignores; add an explicit ignore for generated per-record audit artifacts.

## Approach

Use a local CLI and aggregate report. A manual spreadsheet would be harder to reproduce; an API evaluation would spend money and cannot establish reference quality. The CLI is an implementation choice within the supplied research specification. Use the existing checkout on a dedicated research branch so the ignored corpus remains available.

## Review focus

- Reported metadata may have multiple reports for one recording: count reports and unique recordings separately.
- Unlabeled and pending references cannot become validated evaluation data.
- Unsafe paths, malformed TSVs, unexpected releases and duplicate regular IDs must fail clearly.
- Speaker and exact-byte audio overlap must be assessed independently; neither proves absence of model-training contamination.
- A duration probe is not a listening review or a complete decode check.

### Task 1: Offline inventory and evidence

**Files:**
- Create: `benchmarks/scripts/inventory_corpus.py`, `benchmarks/scripts/test_inventory_corpus.py`
- Create: `benchmarks/manifests/template.csv`, `benchmarks/inventory/common-voice-sps-5-en.json`
- Create: `docs/audits/sl-03-corpus-inventory.md`
- Modify: `.gitignore`, `benchmarks/README.md`, `docs/planning/MOBILE_WEEKLY_PROGRESS.md`

**Interfaces:** CLI takes `--corpus`, `--output`, `--sample-size`, `--seed`, optional `--probe-sample`; outputs local `manifest.jsonl`, aggregate `inventory.json`, and local `review-sample.json`. Missing corpus metadata fails before writing results. Optional duration probes use only macOS afinfo. Listening status defaults to `not_reviewed`.

- [x] Write synthetic fixture tests for label status, reported-row deduplication, missing files/fields, leakage detection, unsafe paths, reproducibility and sanitized output.
- [x] Run tests and confirm failure before implementation.
- [x] Implement the CLI and make tests pass.
- [x] Run inventory on the actual local corpus and independently spot-check seeded sample entries against TSV metadata and audio durations.
- [x] Check in aggregate evidence and template; document confirmed facts, limitations, rights questions and reproducible local review commands.
- [x] Run focused tests, existing regression tests and diff/privacy checks; commit to the issue branch and open a linked PR with a teammate review request.

The user explicitly deferred audible-reference verification to issue #11's
listening/ASR comparison. Its status remains unverified in this inventory.
Leave issue #10 open during teammate review; do not claim listening was performed.

## Implementation evidence

- Ten Python tests pass, including the strict TSV parsing regression; all 36
  existing Node regressions also pass. Initial missing implementation and the
  permissive-parser regression were observed failing before their fixes.
- Fresh read-only reviewer found no Critical/Important issues and one parsing
  suggestion. The implementer treated silent row loss as material to an
  inventory and fixed it with a failing fixture followed by a green suite.
- Repeated real-corpus inventories reproduce the checked-in aggregate exactly;
  ten seeded MP3 duration checks match metadata with a maximum delta of 0 ms.
- Full manifest, review sample and raw corpus files are confirmed Git-ignored.
- Audible fidelity, model accuracy, download receipt/archive authenticity,
  legal interpretation, acoustic deduplication and actual speaker identity
  remain outside this automated verification. The report records these limits.
- Review submitted in [PR #30](https://github.com/BigZ509/speaklab/pull/30),
  with `RJelsewhere` requested. Issue #10 remains open during review.
