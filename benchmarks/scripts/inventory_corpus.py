#!/usr/bin/env python3
"""Offline inventory for Common Voice Spontaneous Speech 5.0 English.

No API clients, credentials, transcription, or network access are used.
Outputs omit source text, report reasons/comments, demographics and client IDs.
Per-record outputs are still local-only: do not redistribute the source dataset.
"""
import argparse
from collections import Counter, defaultdict
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
COMMON_FIELDS = {"client_id", "audio_id", "audio_file", "duration_ms", "language"}
MAIN_FIELDS = COMMON_FIELDS | {"transcription", "votes", "split", "quality_tags", "prompt_id"}
SPLITS = {"train", "dev", "test"}


def digest(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def read_rows(path, required):
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
        return number if number > 0 else None
    except ValueError:
        return None


def text_indicators(text):
    # These are lexical screening signals, never audible event annotations.
    words = re.findall(r"\b[\w']+\b", text.lower())
    return {
        "textual_filled_pause": bool(re.search(r"\b(?:um|uh|erm|er|hmm)\b", text, re.I)),
        "textual_repetition": any(a == b for a, b in zip(words, words[1:])),
        "textual_event_tag": bool(re.search(r"\[[^\]]+\]|<[^>]+>", text)),
    }


def cross_split_groups(groups):
    return sum(len(splits) > 1 for splits in groups.values())


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
    if len({r["audio_id"] for r in main}) != len(main):
        raise ValueError("Duplicate regular recording IDs")
    report_counts = Counter(r["audio_file"] for r in reports)
    # Multiple reports are allowed, but conflicting recording metadata is not.
    report_by_file = {}
    main_by_file = {r["audio_file"]: r for r in main}
    for row in reports:
        previous = report_by_file.get(row["audio_file"]) or main_by_file.get(row["audio_file"])
        if previous and any(row[k] != previous[k] for k in COMMON_FIELDS):
            raise ValueError("Conflicting reported recording metadata")
        report_by_file[row["audio_file"]] = row
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

    speakers, audio_groups, text_groups, prompts = (defaultdict(set) for _ in range(4))
    all_audio_hashes = Counter()
    records = []
    all_names = set(main_by_file) | set(report_by_file) | set(audio_files)
    for name in sorted(all_names, key=lambda n: int(n.removeprefix("spontaneous-speech-en-").removesuffix(".mp3"))):
        is_main = name in main_by_file
        row = main_by_file.get(name) or report_by_file.get(name) or {}
        text = row.get("transcription", "").strip()
        votes_text = row.get("votes", "0")
        if not re.fullmatch(r"[0-9]+", votes_text):
            raise ValueError("Invalid votes in regular metadata")
        votes = int(votes_text)
        status = ("validated" if votes > 0 else "pending") if text else "missing"
        split = row.get("split", "")
        if split and split not in SPLITS:
            raise ValueError("Unexpected source split")
        client_id = row.get("client_id", "").strip()
        speaker = digest(RELEASE + ":en:" + client_id) if client_id else None
        duration = duration_ms(row.get("duration_ms", ""))
        path = audio_files.get(name)
        audio_hash = None
        if path:
            with path.open("rb") as audio:
                hasher = hashlib.sha256()
                for block in iter(lambda: audio.read(1024 * 1024), b""):
                    hasher.update(block)
            audio_hash = hasher.hexdigest()
            all_audio_hashes[audio_hash] += 1
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
            exclusions.append("missing_reference" if not text else "pending_reference")
        tags = sorted(set(filter(None, row.get("quality_tags", "").split("|"))))
        if tags:
            exclusions.append("source_quality_flag")
        if is_main and split:
            if speaker:
                speakers[speaker].add(split)
            if audio_hash:
                audio_groups[audio_hash].add(split)
            if text:
                text_groups[digest(text.casefold())].add(split)
            if row.get("prompt_id"):
                prompts[row["prompt_id"]].add(split)
        records.append({
            "recording_id": row.get("audio_id") or name.removeprefix("spontaneous-speech-en-").removesuffix(".mp3"),
            "audio_file": name,
            "corpus_release": RELEASE,
            "duration_ms": duration,
            "duration_provenance": "source_metadata" if duration else "unknown",
            "language": "en" if row.get("language") == "English" else None,
            "speaker_id": speaker,
            "speaker_id_provenance": "corpus_scoped_sha256_of_source_client_id" if speaker else "missing",
            "speech_type": "prompted_spontaneous" if row else "unknown",
            "metadata_source": MAIN_FILE if is_main else REPORT_FILE if row else None,
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
        count = all_audio_hashes[record["audio_sha256"]] if record["audio_sha256"] else 0
        record["exact_audio_duplicate_count"] = count
        if count > 1:
            record["exclusions"].append("duplicate_audio")
    regular = [r for r in records if r["metadata_source"] == MAIN_FILE]
    summary = {
        "schema_version": 1,
        "corpus": {"name": "Mozilla Common Voice Spontaneous Speech English", "release": RELEASE, "source": SOURCE, "language": "en", "license": "CC0-1.0", "redistribution": "source_portal_forbids_rehosting_or_resharing", "download_receipt_verified": False},
        "counts": {
            "audio_files": len(audio_files), "ignored_non_mp3_entries": ignored_files,
            "regular_metadata_rows": len(main), "report_rows": len(reports),
            "reported_recordings": len(report_counts),
            "main_reported_overlap": len(set(main_by_file) & set(report_counts)),
            "reported_only_recordings": len(set(report_counts) - set(main_by_file)),
            "orphan_audio_files": len(set(audio_files) - set(main_by_file) - set(report_counts)),
            "metadata_recordings_without_audio": sum(not r["audio_present"] for r in records),
            "regular_speakers": len({r["speaker_id"] for r in regular if r["speaker_id"]}),
            "regular_duration_ms": sum(r["duration_ms"] or 0 for r in regular),
            "validated_duration_ms": sum(r["duration_ms"] or 0 for r in regular if r["reference_status"] == "validated"),
        },
        "reference_status": dict(sorted(Counter(r["reference_status"] for r in regular).items())),
        "source_splits": dict(sorted(Counter(r["source_split"] or "unassigned" for r in regular).items())),
        "regular_exclusions": dict(sorted(Counter(x for r in regular for x in r["exclusions"]).items())),
        "textual_indicators_regular_rows": {key: sum(r[key] for r in regular) for key in ("textual_filled_pause", "textual_repetition", "textual_event_tag")},
        "leakage": {
            "speakers_in_multiple_splits": cross_split_groups(speakers),
            "exact_audio_groups_in_multiple_splits": cross_split_groups(audio_groups),
            "reference_text_groups_in_multiple_splits": cross_split_groups(text_groups),
            "prompts_in_multiple_splits": cross_split_groups(prompts),
            "exact_duplicate_audio_groups_all_files": sum(n > 1 for n in all_audio_hashes.values()),
            "model_training_contamination": "unknown",
        },
        "verification": {"method": "metadata_and_exact_file_hashes", "sample_seed": seed, "requested_sample_size": sample_size, "sampling": "lowest_sha256_of_seed_and_recording_id_over_present_nonreported_regular_audio", "audible_review": "not_performed", "accuracy_metrics": "not_computed", "api_requests": 0},
    }
    candidates = [r for r in regular if r["audio_present"] and not r["report_count"]]
    sample = sorted(candidates, key=lambda r: digest(seed + ":" + r["recording_id"]))[:sample_size]
    return records, summary, [dict(r, listening_review="not_reviewed", duration_probe="not_run") for r in sample]


def probe_sample(corpus, sample):
    """Check container-reported durations, not full decode or audible fidelity."""
    executable = shutil.which("afinfo")
    if not executable:
        raise ValueError("--probe-sample requires macOS afinfo; omit it on other platforms")
    for row in sample:
        result = subprocess.run([executable, str(Path(corpus) / "audios" / row["audio_file"])], capture_output=True, text=True, timeout=20)
        match = re.search(r"estimated duration:\s*([0-9.]+) sec", result.stdout)
        if result.returncode or not match:
            row["duration_probe"] = "failed"
            continue
        measured = round(float(match.group(1)) * 1000)
        row["probed_duration_ms"] = measured
        row["duration_difference_ms"] = measured - row["duration_ms"] if row["duration_ms"] is not None else None
        row["duration_probe"] = "matches_within_100ms" if row["duration_difference_ms"] is not None and abs(row["duration_difference_ms"]) <= 100 else "needs_review"


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
        summary["verification"]["duration_probe_results"] = dict(sorted(Counter(r["duration_probe"] for r in sample).items()))
        summary["input_sha256"] = {name: hashlib.sha256((args.corpus / name).read_bytes()).hexdigest() for name in ("README.md", MAIN_FILE, REPORT_FILE)}
        args.output.mkdir(parents=True, exist_ok=True)
        (args.output / "manifest.jsonl").write_text("".join(json.dumps(r, sort_keys=True) + "\n" for r in records), encoding="utf-8")
        for filename, value in [("inventory.json", summary), ("review-sample.json", sample)]:
            (args.output / filename).write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(json.dumps(summary, indent=2, sort_keys=True))
    except (OSError, ValueError, csv.Error, subprocess.TimeoutExpired) as error:
        parser.exit(2, f"Inventory failed: {error}\n")


if __name__ == "__main__":
    main()
