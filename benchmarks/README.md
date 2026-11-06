# Transcription Benchmarks

This directory holds reproducible evaluations for the transcription backend.

- `datasets/` — local audio fixtures; ignored by Git.
- `manifests/` — selected audio IDs and their reference transcripts.
- `scripts/` — automated evaluation scripts.
- `results/` — generated WER, CER, and latency reports.

Keep each manifest's audio identifier aligned with its local file in `datasets/`.
