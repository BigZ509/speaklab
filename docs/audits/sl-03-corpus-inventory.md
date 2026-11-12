# SL-03: corpus inventory and use-rights audit

Issue: [#10](https://github.com/BigZ509/speaklab/issues/10). Audit date: November 11, 2026.
Scope: the existing local corpus only. No mobile, speech-engine, backend,
authentication or infrastructure behavior changes. No transcription requests.

## Decision

This corpus is a candidate for a manually reviewed verbatim-transcription
benchmark. It is **not yet a gold-standard filler evaluation set**. Missing
references cannot support accuracy measurements; community validation does not
establish that every audible filler or repetition was preserved. No WER, CER,
filler precision/recall, or model-accuracy claim is made here.

## Identity and rights

Confirmed from the local datasheet and the
[official English release page](https://mozilladatacollective.com/datasets/cmu5nqn1h00vwmi07b4dbk085):

- Corpus: Mozilla Common Voice **Spontaneous Speech 5.0, English (`en`)**.
- Datasheet release identifier: `sps-corpus-5.0-2026-09-11`. The portal lists
  September 17, 2026 as its publication date; these are different dates.
- Local source metadata: `ss-corpus-en.tsv`, `ss-reported-audios-en.tsv`,
  `ss-corpus-en.qa-summary.json`, plus the release's `README.md`.
- Speech type: prompted spontaneous responses, as described by the corpus;
  this is a corpus-level description, not a per-clip listening annotation.
- The portal lists CC0-1.0 and ASR training/evaluation and language-learning
  applications as intended uses. It also explicitly forbids identifying
  speakers and re-hosting/re-sharing the dataset. CC0 alone must not be read
  as permission to upload this downloaded dataset to GitHub.

The local datasheet mentions CC0 and the speaker-identification restriction
but omits the portal's re-sharing restriction. The original download receipt,
accepted terms, archive checksum and download source have **not** been
verified. Identity matches metadata and published statistics; archive
authenticity is not independently established. The owner should retain the
download receipt and resolve any uncertainty about publishing derived indexes
or sending recordings to third-party services before doing either. This audit
does neither: only the synthetic template and aggregate statistics are committed.

## Reconciled inventory

The [machine-readable aggregate](../../benchmarks/inventory/common-voice-sps-5-en.json)
contains source metadata hashes, methodology and repeatable counts.

| Item | Confirmed count |
| --- | ---: |
| MP3 files present | 8,703 |
| Regular metadata rows / distinct recordings | 5,898 |
| Report rows | 2,938 |
| Distinct reported recordings | 2,805 |
| Regular/reported recording overlap | 0 |
| Audio without metadata / metadata without audio | 0 / 0 |
| Regular speaker IDs available | 642 |
| Regular duration from metadata | 18.60118 hours |
| Validated-reference duration from metadata | 8.39334 hours |

Thus `5,898 + 2,805 = 8,703`. Multiple reports on a clip are not extra
recordings. All reported recordings are excluded from evaluation candidates;
reported content can include privacy or moderation concerns and is not
reproduced in the outputs.

| Reference status in regular metadata | Clips |
| --- | ---: |
| Nonempty transcript and at least one approval vote | 2,474 |
| Nonempty transcript, no approval votes | 97 |
| No transcript | 3,327 |

These statuses follow the source's vote field and reconcile with its
datasheet. They are community-reference provenance, not independent gold
annotations. The supplied splits contain 1,569 train, 548 dev and 357 test
clips; 3,424 are unassigned.

Source quality tags flag 757 regular clips. There are 28 exact-byte duplicate
audio groups across all 8,703 files; 36 regular clips belong to duplicate
groups. These flags can overlap other exclusions and must not be added as
disjoint counts. Conservative screening leaves 2,035 validated regular clips
without source-quality or exact-duplicate flags, including 305 in `test`.
These are **review candidates**, not certified usable references.

Every metadata-recorded file exists and has a positive duration and speaker
ID in this local copy. Existence and a hash do not establish decodability,
intelligibility or correct language. Only the small sample below had its
container duration inspected; corrupt or mismatched content elsewhere remains
possible. Reported clips and missing references are unusable for this proposed
evaluation without separate remediation; quality-flagged clips need review.

## Verbatim and filler suitability

The [inspected Common Voice transcription guidance](https://commonvoice.mozilla.org/xh/guidelines?tab=spontaneous-speech)
asks contributors to retain repetitions, false starts and disfluencies, but
also permits a generic disfluency tag. That policy does not guarantee fidelity
for this release or preserve the exact identity of every hesitation sound.

Confirmed **textual screening signals** in regular references:

| Screening rule | Rows matching |
| --- | ---: |
| Whole-word `um`, `uh`, `erm`, `er` or `hmm`, case-insensitive | 480 |
| Adjacent identical word tokens, case-insensitive | 242 |
| Square-bracket or angle-bracket event text | 383 |

These counts overlap. They are not filler-event totals or audible labels.
The lexical rules are deliberately narrow: semantic fillers, phrase
repetitions, ambiguous words and omitted events require manual review.

The local QA summary reports `disfluency_applied: true` and
`disfluency_affected_rows: 55`. It also reports 757 problem clips while its
`problem_clips` array is empty. These are upstream processing claims, not
evidence that this audit validated those transformations. The processing code,
original pre-processing transcripts, and per-row transformation history are
unavailable here. Some references may retain lexical hesitations while others
use generic tags; they must not be treated as uniformly verbatim or uniformly
normalized. No event timestamps, reviewed filler classes, or completeness labels
are supplied in these TSVs.

Before a filler benchmark: listen, transcribe every audible hesitation and
repetition under a documented policy, add event timing/classes as needed, and
have another annotator check the references. Keep unverified cases separate.

## Leakage and speaker splits

- **Confirmed:** zero source speaker IDs span train/dev/test. Source IDs allow
  a speaker-disjoint split within this release. Exported local IDs are
  corpus-scoped SHA-256 values; they are grouping keys, not verified identities.
- **Confirmed:** zero exact-byte audio groups span the supplied splits.
  Byte hashes do not detect re-encoding, excerpts, near duplicates or acoustic
  similarity. No acoustic deduplication was performed.
- **Confirmed:** 66 case-folded reference-text groups and 298 prompt IDs span
  multiple splits. Common short responses can match without copied audio;
  shared prompts still limit claims about generalization to unseen questions.
- **Unknown:** training contamination for any ASR provider/model. Public
  availability does not establish a clean held-out set. Do not tune filler
  rules on the test set and then present it as an untouched evaluation.
- **Limitation:** a source client ID does not prove one real person per ID or
  prevent the same person using several IDs. No identification was attempted.

## Reproduction and verification

Python 3.10+ is sufficient; no packages, API keys or network are required:

```bash
python3 -m unittest discover -s benchmarks/scripts -p 'test_*.py'
python3 benchmarks/scripts/inventory_corpus.py \
  --corpus 'benchmarks/datasets/sps corpus 9-11' \
  --output benchmarks/results/sl-03-local \
  --sample-size 10 --seed sl-03-2026-11-11 --probe-sample
```

`--probe-sample` uses macOS `afinfo`; omit it on other systems. The inventory
still runs, with duration probes marked `not_run`. The tool does not install
software, decode/transcribe speech, upload data or call the app's backend.
These commands incur **zero OpenAI API usage**. A small paid-API request must
not be assumed free; paid transcription testing is outside this change.

Local outputs, ignored by Git:

- `manifest.jsonl`: one record per regular, reported or orphan recording,
  including source duration, language, speaker grouping, speech type,
  transcript provenance/status, source split, exact audio hash, textual
  screening signals and exclusion flags. Source transcript text is omitted.
- `review-sample.json`: ten regular, present, nonreported recordings selected
  by the lowest SHA-256 ranks of `seed:recording_id`. This is a deterministic
  pseudorandom sample, not selected for positive filler examples. Every row
  starts with `listening_review: not_reviewed`.
- `inventory.json`: aggregates only. This is the sole generated file copied
  into `benchmarks/inventory/` for review.

The checked-in [CSV template](../../benchmarks/manifests/template.csv) uses
only synthetic values and illustrates the core manifest fields. The CLI's
JSONL adds screening and file-integrity fields. `exclusions` is a JSON array
in JSONL; the CSV template uses a simple single-flag example. All durations are
milliseconds. A `validated` reference means nonempty text and positive source
votes; `audible_verbatim_status` remains `not_reviewed` until someone listens.

Actual checks on November 11:

- Focused synthetic-fixture suite passed 10/10, including malformed input,
  conflicting reports, unsafe paths/symlinks, missing metadata/audio, label
  status, leakage detection, reproducible artifacts and duration-probe failure.
- All 8,703 audio files were hashed locally. Repeat inventory runs used the
  same metadata and seed; the committed input hashes identify that local copy.
- An independent read of the TSV verified all ten sampled recording IDs,
  filenames, durations, language, derived speaker IDs, reference presence and
  splits against the generated manifest.
- `afinfo` read all ten sampled MP3 containers successfully. Their durations
  matched the source exactly (maximum difference: 0 ms). Four sampled rows
  have validated references; six have no reference.
- **No human listening review was performed.** Container duration checks do
  not verify audible words, filler preservation or full-file decoding.

To complete listening review, copy `review-sample.json` to
`listening-review.json` in the same ignored local directory first (rerunning
the tool overwrites its generated sample). For each sampled recording, play
the corresponding local file with a local player or `afplay`, inspect its
source TSV row, and record `verbatim`, `normalized`, `mismatch`, `unclear` or
`unlabeled`, plus filler/repetition observations and reviewer/date. Keep these
notes private, and commit only a sanitized aggregate conclusion. Do not score
the six unlabeled samples. Issue #10 stays open pending this listening evidence
and the download-terms confirmation.
