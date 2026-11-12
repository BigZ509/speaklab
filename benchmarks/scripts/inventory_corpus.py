#!/usr/bin/env python3
"""Offline inventory for Common Voice Spontaneous Speech 5.0 English.

No API clients, credentials, transcription, or network access are used.
Outputs omit source text, report reasons/comments, demographics and client IDs.
Per-record outputs are still local-only: do not redistribute the source dataset.
"""
import argparse
from collections import Counter
import csv
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess

RELEASE = "sps-corpus-5.0-2026-09-11"
SOURCE = "https://mozilladatacollective.com/datasets/cmu5nqn1h00vwmi07b4dbk085"
MAIN_FILE = "ss-corpus-en.tsv"
REPORT_FILE = "ss-reported-audios-en.tsv"
COMMON_FIELDS = {
    "client_id",
    "audio_id",
    "audio_file",
    "duration_ms",
    "language",
}
MAIN_FIELDS = COMMON_FIELDS | {
    "transcription",
    "votes",
    "split",
    "quality_tags",
    "prompt_id",
}
SPLITS = {"train", "dev", "test"}


def hash_text(value):
    # Hash text so we can compare grouping keys without saving the original text.
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def get_recording_id(audio_file):
    return audio_file.removeprefix("spontaneous-speech-en-").removesuffix(".mp3")


def hash_file(path):
    # Reading small blocks avoids loading a whole recording into memory.
    # Equal hashes identify identical bytes, not similar speech or re-encoded audio.
    hasher = hashlib.sha256()
    with path.open("rb") as source:
        block = source.read(1024 * 1024)
        while block:
            hasher.update(block)
            block = source.read(1024 * 1024)
    return hasher.hexdigest()


def read_rows(path, required):
    # A TSV is a table whose columns are separated by tabs. Strict parsing keeps
    # an unfinished quote from silently joining several recordings into one row.
    with path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source, delimiter="\t", strict=True)
        headers = reader.fieldnames or []
        if not required.issubset(headers) or len(set(headers)) != len(headers):
            raise ValueError(f"{path.name}: missing or duplicate required columns")
        rows = list(reader)
        for line, row in enumerate(rows, 2):
            if None in row or any(v is None for v in row.values()):
                raise ValueError(f"{path.name}: malformed row {line}")
            if not re.fullmatch(r"spontaneous-speech-en-[0-9]+\.mp3", row["audio_file"]):
                raise ValueError(f"{path.name}: unsafe or unexpected audio_file at row {line}")
            if row["audio_file"] != f"spontaneous-speech-en-{row['audio_id']}.mp3":
                raise ValueError(f"{path.name}: audio_id/audio_file mismatch at row {line}")
        return rows


def duration_ms(value):
    try:
        number = int(value)
        if number > 0:
            return number
        return None
    except ValueError:
        return None


def text_indicators(text):
    # These patterns only inspect written references. They do not listen to audio
    # or run the app's filler analyzer, so they cannot confirm audible fillers.
    words = re.findall(r"\b[\w']+\b", text.lower())
    repeated_word = False
    for index in range(1, len(words)):
        if words[index - 1] == words[index]:
            repeated_word = True
            break

    return {
        "textual_filled_pause": bool(re.search(r"\b(?:um|uh|erm|er|hmm)\b", text, re.I)),
        "textual_repetition": repeated_word,
        "textual_event_tag": bool(re.search(r"\[[^\]]+\]|<[^>]+>", text)),
    }


def get_reference_status(text, votes):
    # "Validated" means the dataset contains an approval vote. It does not mean
    # we checked the words against the recording or approved them as gold labels.
    if not text:
        return "missing"
    if votes > 0:
        return "validated"
    return "pending"


def add_split_group(groups, key, split):
    if not key:
        return
    if key not in groups:
        groups[key] = set()
    groups[key].add(split)


def cross_split_groups(groups):
    # A key in more than one split can leak information from training into testing.
    count = 0
    for splits in groups.values():
        if len(splits) > 1:
            count += 1
    return count


def audit(corpus, sample_size=10, seed="sl-03-2026-11-11"):
    corpus = Path(corpus).resolve()
    if RELEASE not in (corpus / "README.md").read_text(encoding="utf-8"):
        raise ValueError("Unexpected corpus release; this tool requires " + RELEASE)
    if not (corpus / "audios").is_dir():
        raise ValueError("Missing audios directory")
    if sample_size < 0:
        raise ValueError("sample_size must be nonnegative")
    main = read_rows(corpus / MAIN_FILE, MAIN_FIELDS)
    reports = read_rows(corpus / REPORT_FILE, COMMON_FIELDS)
    main_by_file = {}
    recording_ids = set()
    for row in main:
        if row["audio_id"] in recording_ids:
            raise ValueError("Duplicate regular recording IDs")
        recording_ids.add(row["audio_id"])
        main_by_file[row["audio_file"]] = row

    # One recording can have several reports. Keep the report count separate
    # from the recording count so we do not inflate the size of the corpus.
    report_counts = Counter()
    report_by_file = {}
    for row in reports:
        name = row["audio_file"]
        report_counts[name] += 1
        previous = report_by_file.get(name) or main_by_file.get(name)
        if previous and any(row[k] != previous[k] for k in COMMON_FIELDS):
            raise ValueError("Conflicting reported recording metadata")
        report_by_file[name] = row

    # File checks use only the local audios folder. Nothing is uploaded.
    audio_files = {}
    ignored_files = 0
    for path in sorted((corpus / "audios").iterdir()):
        if path.suffix.lower() != ".mp3":
            ignored_files += 1
            continue
        if path.is_symlink() or not path.is_file():
            raise ValueError("Audio symlinks and non-files are unsupported")
        if not re.fullmatch(r"spontaneous-speech-en-[0-9]+\.mp3", path.name):
            raise ValueError("Unexpected local audio_file name")
        audio_files[path.name] = path

    speakers = {}
    audio_groups = {}
    text_groups = {}
    prompts = {}
    all_audio_hashes = Counter()
    records = []
    # Include both metadata tables and the actual files. This also catches files
    # with no metadata and metadata entries whose audio is missing.
    all_names = set(main_by_file) | set(report_by_file) | set(audio_files)
    sorted_names = sorted(all_names, key=lambda name: int(get_recording_id(name)))
    for name in sorted_names:
        is_main = name in main_by_file
        row = main_by_file.get(name) or report_by_file.get(name) or {}
        text = row.get("transcription", "").strip()
        votes_text = row.get("votes", "0")
        if not re.fullmatch(r"[0-9]+", votes_text):
            raise ValueError("Invalid votes in regular metadata")
        votes = int(votes_text)
        status = get_reference_status(text, votes)
        split = row.get("split", "")
        if split and split not in SPLITS:
            raise ValueError("Unexpected source split")
        client_id = row.get("client_id", "").strip()
        # Use a release-specific grouping key instead of exporting the source
        # client ID. This groups rows; it does not identify or verify a person.
        speaker = None
        if client_id:
            speaker = hash_text(RELEASE + ":en:" + client_id)
        duration = duration_ms(row.get("duration_ms", ""))
        path = audio_files.get(name)
        audio_hash = None
        if path:
            audio_hash = hash_file(path)
            all_audio_hashes[audio_hash] += 1

        # A recording can have several exclusion reasons. These counts overlap;
        # they are not separate groups that can be added together.
        exclusions = []
        if name in report_counts:
            exclusions.append("reported")
        if not row:
            exclusions.append("missing_metadata")
        if not path:
            exclusions.append("missing_audio")
        elif path.stat().st_size == 0:
            exclusions.append("empty_audio")
        if duration is None:
            exclusions.append("invalid_duration")
        if row.get("language") != "English":
            exclusions.append("unexpected_language")
        if not speaker:
            exclusions.append("missing_speaker")
        if status != "validated":
            if not text:
                exclusions.append("missing_reference")
            else:
                exclusions.append("pending_reference")
        # The source separates quality tags with |. Ignore blank entries and
        # keep each tag once so one recording is not counted twice for a tag.
        tag_names = set()
        for tag in row.get("quality_tags", "").split("|"):
            if tag:
                tag_names.add(tag)
        tags = sorted(tag_names)
        if tags:
            exclusions.append("source_quality_flag")
        if is_main and split:
            # Inspect the supplied splits without assigning or changing them.
            add_split_group(speakers, speaker, split)
            add_split_group(audio_groups, audio_hash, split)
            if text:
                add_split_group(text_groups, hash_text(text.casefold()), split)
            add_split_group(prompts, row.get("prompt_id"), split)

        metadata_source = None
        if is_main:
            metadata_source = MAIN_FILE
        elif row:
            metadata_source = REPORT_FILE

        # Keep provenance and review status in every record. Reference text,
        # report comments, demographics and original speaker IDs are omitted.
        records.append({
            "recording_id": row.get("audio_id") or get_recording_id(name),
            "audio_file": name,
            "corpus_release": RELEASE,
            "duration_ms": duration,
            "duration_provenance": "source_metadata" if duration else "unknown",
            "language": "en" if row.get("language") == "English" else None,
            "speaker_id": speaker,
            "speaker_id_provenance": "corpus_scoped_sha256_of_source_client_id" if speaker else "missing",
            "speech_type": "prompted_spontaneous" if row else "unknown",
            "metadata_source": metadata_source,
            "reference_provenance": "common_voice_community_transcription" if text else "none",
            "reference_status": status,
            "reference_votes": votes,
            "source_split": split or None,
            "quality_tags": tags,
            "report_count": report_counts[name],
            "audio_present": bool(path),
            "audio_sha256": audio_hash,
            **text_indicators(text),
            "audible_verbatim_status": "not_reviewed",
            "filler_event_labels": "unavailable",
            "exclusions": exclusions,
        })
    for record in records:
        count = 0
        if record["audio_sha256"]:
            count = all_audio_hashes[record["audio_sha256"]]
        record["exact_audio_duplicate_count"] = count
        if count > 1:
            record["exclusions"].append("duplicate_audio")
    regular = []
    for record in records:
        if record["metadata_source"] == MAIN_FILE:
            regular.append(record)

    # Only regular metadata contributes to reference coverage and source splits.
    # Reported and orphan recordings still appear in the complete local manifest.
    reference_counts = Counter()
    split_counts = Counter()
    exclusion_counts = Counter()
    regular_speakers = set()
    regular_duration = 0
    validated_duration = 0
    missing_audio = 0
    indicator_counts = {
        "textual_filled_pause": 0,
        "textual_repetition": 0,
        "textual_event_tag": 0,
    }
    for record in regular:
        reference_counts[record["reference_status"]] += 1
        split_counts[record["source_split"] or "unassigned"] += 1
        for reason in record["exclusions"]:
            exclusion_counts[reason] += 1
        if record["speaker_id"]:
            regular_speakers.add(record["speaker_id"])
        regular_duration += record["duration_ms"] or 0
        if record["reference_status"] == "validated":
            validated_duration += record["duration_ms"] or 0
        for indicator in indicator_counts:
            if record[indicator]:
                indicator_counts[indicator] += 1

    for record in records:
        if not record["audio_present"]:
            missing_audio += 1

    duplicate_groups = 0
    for count in all_audio_hashes.values():
        if count > 1:
            duplicate_groups += 1

    summary = {
        "schema_version": 1,
        "corpus": {
            "name": "Mozilla Common Voice Spontaneous Speech English",
            "release": RELEASE,
            "source": SOURCE,
            "language": "en",
            "license": "CC0-1.0",
            "redistribution": "source_portal_forbids_rehosting_or_resharing",
            "download_receipt_verified": False,
        },
        "counts": {
            "audio_files": len(audio_files),
            "ignored_non_mp3_entries": ignored_files,
            "regular_metadata_rows": len(main),
            "report_rows": len(reports),
            "reported_recordings": len(report_counts),
            "main_reported_overlap": len(set(main_by_file) & set(report_counts)),
            "reported_only_recordings": len(set(report_counts) - set(main_by_file)),
            "orphan_audio_files": len(set(audio_files) - set(main_by_file) - set(report_counts)),
            "metadata_recordings_without_audio": missing_audio,
            "regular_speakers": len(regular_speakers),
            "regular_duration_ms": regular_duration,
            "validated_duration_ms": validated_duration,
        },
        "reference_status": dict(sorted(reference_counts.items())),
        "source_splits": dict(sorted(split_counts.items())),
        "regular_exclusions": dict(sorted(exclusion_counts.items())),
        "textual_indicators_regular_rows": indicator_counts,
        "leakage": {
            "speakers_in_multiple_splits": cross_split_groups(speakers),
            "exact_audio_groups_in_multiple_splits": cross_split_groups(audio_groups),
            "reference_text_groups_in_multiple_splits": cross_split_groups(text_groups),
            "prompts_in_multiple_splits": cross_split_groups(prompts),
            "exact_duplicate_audio_groups_all_files": duplicate_groups,
            "model_training_contamination": "unknown",
        },
        "verification": {
            "method": "metadata_and_exact_file_hashes",
            "sample_seed": seed,
            "requested_sample_size": sample_size,
            "sampling": "lowest_sha256_of_seed_and_recording_id_over_present_nonreported_regular_audio",
            "audible_review": "not_performed",
            "accuracy_metrics": "not_computed",
            "api_requests": 0,
        },
    }

    # The seed gives each recording a repeatable selection order. Include unlabeled
    # clips so the review exposes missing references too, rather than hiding them.
    def sample_order(record):
        return hash_text(seed + ":" + record["recording_id"])

    candidates = []
    for record in regular:
        if record["audio_present"] and not record["report_count"]:
            candidates.append(record)

    selected = sorted(candidates, key=sample_order)[:sample_size]
    sample = []
    for record in selected:
        review_record = record.copy()
        review_record["listening_review"] = "not_reviewed"
        review_record["duration_probe"] = "not_run"
        sample.append(review_record)

    return records, summary, sample


def probe_sample(corpus, sample):
    """Check container-reported durations, not full decode or audible fidelity."""
    executable = shutil.which("afinfo")
    if not executable:
        raise ValueError("--probe-sample requires macOS afinfo; omit it on other platforms")
    for row in sample:
        audio_path = Path(corpus) / "audios" / row["audio_file"]
        result = subprocess.run(
            [executable, str(audio_path)],
            capture_output=True,
            text=True,
            timeout=20,
        )
        match = re.search(r"estimated duration:\s*([0-9.]+) sec", result.stdout)
        if result.returncode or not match:
            row["duration_probe"] = "failed"
            continue
        measured = round(float(match.group(1)) * 1000)
        row["probed_duration_ms"] = measured
        difference = None
        if row["duration_ms"] is not None:
            difference = measured - row["duration_ms"]
        row["duration_difference_ms"] = difference

        # This tolerance compares file-container metadata only. Matching durations
        # still cannot tell us whether the transcript preserves audible speech.
        if difference is not None and abs(difference) <= 100:
            row["duration_probe"] = "matches_within_100ms"
        else:
            row["duration_probe"] = "needs_review"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("benchmarks/results/sl-03-local"))
    parser.add_argument("--sample-size", type=int, default=10)
    parser.add_argument("--seed", default="sl-03-2026-11-11")
    parser.add_argument("--probe-sample", action="store_true")
    args = parser.parse_args()
    try:
        records, summary, sample = audit(args.corpus, args.sample_size, args.seed)
        if args.probe_sample:
            probe_sample(args.corpus, sample)
        summary["verification"]["sample_size"] = len(sample)
        probe_counts = Counter()
        for row in sample:
            probe_counts[row["duration_probe"]] += 1
        summary["verification"]["duration_probe_results"] = dict(sorted(probe_counts.items()))

        # Save input fingerprints so a later run can confirm it used the same
        # metadata files, without putting their private contents in the report.
        input_hashes = {}
        for name in ("README.md", MAIN_FILE, REPORT_FILE):
            input_hashes[name] = hash_file(args.corpus / name)
        summary["input_sha256"] = input_hashes

        # JSONL stores one recording per line. Only the aggregate inventory is
        # intended for check-in; the full manifest and review sample stay local.
        args.output.mkdir(parents=True, exist_ok=True)
        manifest_path = args.output / "manifest.jsonl"
        with manifest_path.open("w", encoding="utf-8") as manifest:
            for record in records:
                manifest.write(json.dumps(record, sort_keys=True) + "\n")
        for filename, value in [("inventory.json", summary), ("review-sample.json", sample)]:
            content = json.dumps(value, indent=2, sort_keys=True) + "\n"
            (args.output / filename).write_text(content, encoding="utf-8")
        print(json.dumps(summary, indent=2, sort_keys=True))
    except (OSError, ValueError, csv.Error, subprocess.TimeoutExpired) as error:
        parser.exit(2, f"Inventory failed: {error}\n")


if __name__ == "__main__":
    main()
