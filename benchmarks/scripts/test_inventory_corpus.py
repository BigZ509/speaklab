"""Synthetic fixtures only; no recordings, credentials, or network needed."""
import csv
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

# Load the script directly because it is a standalone tool, not an app package.
SCRIPT_PATH = Path(__file__).with_name("inventory_corpus.py")
SPEC = importlib.util.spec_from_file_location("inventory", SCRIPT_PATH)
inventory = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(inventory)

MAIN = [
    "client_id", "audio_id", "audio_file", "duration_ms", "language",
    "transcription", "votes", "split", "quality_tags", "prompt_id",
]
REPORTED = [
    "client_id", "audio_id", "audio_file", "duration_ms", "language",
    "reason", "comment",
]


class InventoryTests(unittest.TestCase):
    def setUp(self):
        # Each test gets its own temporary corpus, removed when the test ends.
        # These fixtures never read the user's real recordings.
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "audios").mkdir()
        (self.root / "README.md").write_text(inventory.RELEASE)

    def row(self, number, **changes):
        # Start with an unlabeled clip. Each test overrides only what it needs.
        row = {
            "client_id": "private-speaker",
            "audio_id": str(number),
            "audio_file": f"spontaneous-speech-en-{number}.mp3",
            "duration_ms": "1000",
            "language": "English",
            "transcription": "",
            "votes": "0",
            "split": "",
            "quality_tags": "",
            "prompt_id": "1",
        }
        row.update(changes)
        return row

    def write(self, main, reports=()):
        tables = [
            ("ss-corpus-en.tsv", MAIN, main),
            ("ss-reported-audios-en.tsv", REPORTED, reports),
        ]
        for name, fields, rows in tables:
            with (self.root / name).open("w", newline="") as f:
                writer = csv.DictWriter(f, fields, delimiter="\t", extrasaction="ignore")
                writer.writeheader()
                writer.writerows(rows)
        for row in [*main, *reports]:
            if "/" not in row["audio_file"]:
                # Fake file bytes are enough for presence and hash checks.
                # No actual speech is created or submitted to a service.
                audio_path = self.root / "audios" / row["audio_file"]
                audio_path.write_bytes(b"synthetic-" + row["audio_id"].encode())

    def test_labels_reports_and_privacy(self):
        self.write(
            [
                self.row(1, transcription="Um I I PRIVATE-TEXT", votes="1", split="test"),
                self.row(2),
                self.row(3, transcription="pending"),
            ],
            [self.row(4, comment="PRIVATE-COMMENT"), self.row(4)],
        )
        records, summary, sample = inventory.audit(self.root, 10, "seed")
        self.assertEqual(summary["counts"]["audio_files"], 4)
        self.assertEqual(summary["counts"]["report_rows"], 2)
        self.assertEqual(summary["counts"]["reported_recordings"], 1)
        self.assertEqual(
            summary["reference_status"],
            {"missing": 1, "pending": 1, "validated": 1},
        )
        self.assertEqual(records[0]["reference_status"], "validated")
        self.assertTrue(records[0]["textual_filled_pause"])
        self.assertTrue(records[0]["textual_repetition"])
        self.assertEqual(records[3]["exclusions"], ["reported", "missing_reference"])
        for record in records:
            self.assertEqual(record["audible_verbatim_status"], "not_reviewed")
        exported = json.dumps([records, summary, sample])
        for secret in ["private-speaker", "PRIVATE-TEXT", "PRIVATE-COMMENT"]:
            self.assertNotIn(secret, exported)

    def test_leakage_and_missing_data(self):
        self.write([
            self.row(1, transcription="same", votes="1", split="train"),
            self.row(2, transcription="same", votes="1", split="test"),
            self.row(3, client_id="", duration_ms="nan", language=""),
        ])
        # Put identical bytes in train and test to simulate a leaked recording.
        first_audio = self.root / "audios" / "spontaneous-speech-en-1.mp3"
        second_audio = self.root / "audios" / "spontaneous-speech-en-2.mp3"
        second_audio.write_bytes(first_audio.read_bytes())
        (self.root / "audios" / "spontaneous-speech-en-3.mp3").unlink()
        records, summary, _ = inventory.audit(self.root, 10, "seed")
        self.assertEqual(summary["leakage"]["speakers_in_multiple_splits"], 1)
        self.assertEqual(summary["leakage"]["exact_audio_groups_in_multiple_splits"], 1)
        self.assertEqual(summary["leakage"]["reference_text_groups_in_multiple_splits"], 1)
        self.assertEqual(records[0]["exact_audio_duplicate_count"], 2)
        self.assertIn("duplicate_audio", records[0]["exclusions"])
        self.assertIn("missing_audio", records[2]["exclusions"])
        self.assertIn("invalid_duration", records[2]["exclusions"])
        self.assertIn("missing_speaker", records[2]["exclusions"])
        self.assertIn("unexpected_language", records[2]["exclusions"])

    def test_repeatable_sample_and_orphan_reconciliation(self):
        self.write([self.row(i) for i in range(1, 15)])
        (self.root / "audios" / "spontaneous-speech-en-99.mp3").write_bytes(b"orphan")
        a = inventory.audit(self.root, 4, "seed")
        b = inventory.audit(self.root, 4, "seed")
        self.assertEqual(a, b)
        self.assertEqual(len(a[2]), 4)
        self.assertEqual(a[1]["counts"]["orphan_audio_files"], 1)
        self.assertIn("missing_metadata", a[0][-1]["exclusions"])

    def test_rejects_unsafe_paths_duplicates_and_unexpected_release(self):
        self.write([self.row(1, audio_file="../secret.mp3")])
        with self.assertRaisesRegex(ValueError, "audio_file"):
            inventory.audit(self.root, 1, "seed")
        self.write([self.row(1), self.row(1)])
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            inventory.audit(self.root, 1, "seed")
        (self.root / "README.md").write_text("different corpus")
        with self.assertRaisesRegex(ValueError, "release"):
            inventory.audit(self.root, 1, "seed")

    def test_missing_required_columns_and_invalid_votes_fail(self):
        self.write([self.row(1, votes="-1")])
        with self.assertRaisesRegex(ValueError, "votes"):
            inventory.audit(self.root, 1, "seed")
        (self.root / "ss-corpus-en.tsv").write_text("audio_id\n1\n")
        with self.assertRaisesRegex(ValueError, "columns"):
            inventory.audit(self.root, 1, "seed")

    def test_reported_overlap_is_excluded_even_with_validated_reference(self):
        self.write([self.row(1, transcription="reference", votes="1", split="test")], [self.row(1)])
        records, summary, sample = inventory.audit(self.root, 1, "seed")
        self.assertEqual(len(records), 1)
        self.assertIn("reported", records[0]["exclusions"])
        self.assertEqual(summary["counts"]["main_reported_overlap"], 1)
        self.assertEqual(sample, [])

    def test_cli_writes_repeatable_artifacts_without_source_text(self):
        self.write([self.row(1, transcription="PRIVATE-TEXT", votes="1", split="test")])
        output = self.root / "output"
        command = [
            sys.executable, str(SCRIPT_PATH),
            "--corpus", str(self.root),
            "--output", str(output),
            "--sample-size", "1",
        ]
        first = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(first.returncode, 0, first.stderr)
        snapshot = {p.name: p.read_bytes() for p in output.iterdir()}
        second = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertEqual(snapshot, {p.name: p.read_bytes() for p in output.iterdir()})
        self.assertNotIn("PRIVATE-TEXT", str(snapshot))
        self.assertEqual(json.loads(first.stdout)["verification"]["api_requests"], 0)

    def test_malformed_rows_conflicting_reports_and_symlinks_fail(self):
        self.write([self.row(1)])
        with (self.root / "ss-corpus-en.tsv").open("a") as file:
            file.write("incomplete\trow\n")
        with self.assertRaisesRegex(ValueError, "malformed"):
            inventory.audit(self.root)
        self.write([self.row(1)], [self.row(2), self.row(2, duration_ms="2000")])
        with self.assertRaisesRegex(ValueError, "Conflicting"):
            inventory.audit(self.root)
        self.write([self.row(1)])
        audio = self.root / "audios" / "spontaneous-speech-en-1.mp3"
        audio.unlink()
        audio.symlink_to(self.root / "README.md")
        with self.assertRaisesRegex(ValueError, "symlinks"):
            inventory.audit(self.root)

    def test_duration_probe_distinguishes_mismatch_and_read_failure(self):
        sample = []
        for index in range(3):
            sample.append({
                "audio_file": f"spontaneous-speech-en-{index + 1}.mp3",
                "duration_ms": 1000,
            })
        # Supply fake afinfo results so these tests also run outside macOS.
        responses = [
            subprocess.CompletedProcess([], 0, "estimated duration: 1.000000 sec"),
            subprocess.CompletedProcess([], 0, "estimated duration: 2.000000 sec"),
            subprocess.CompletedProcess([], 1, ""),
        ]
        with (
            patch.object(inventory.shutil, "which", return_value="/usr/bin/afinfo"),
            patch.object(inventory.subprocess, "run", side_effect=responses),
        ):
            inventory.probe_sample(self.root, sample)
        self.assertEqual([r["duration_probe"] for r in sample], ["matches_within_100ms", "needs_review", "failed"])
        self.assertEqual(sample[1]["duration_difference_ms"], 1000)

    def test_unterminated_quote_cannot_silently_swallow_recordings(self):
        self.write([self.row(1), self.row(2)])
        source = self.root / "ss-corpus-en.tsv"
        text = source.read_text()
        # Leave a quote open in the last column. A permissive parser would
        # accidentally consume the next recording as part of this field.
        text = text.replace("\t1\n", '\t"unfinished\n', 1)
        source.write_text(text)
        with self.assertRaises((ValueError, csv.Error)):
            inventory.audit(self.root)
        output = self.root / "output"
        result = subprocess.run(
            [sys.executable, str(SCRIPT_PATH), "--corpus", str(self.root), "--output", str(output)],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("Inventory failed:", result.stderr)
        self.assertNotIn("Traceback", result.stderr)
        self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()
