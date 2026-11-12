# Transcription Benchmarks

This directory holds dataset research and reproducible evaluations for the
transcription backend. An inventory is not an accuracy evaluation.

- `datasets/` — local audio fixtures; ignored by Git.
- `manifests/` — a synthetic manifest template; no source transcripts.
- `inventory/` — sanitized aggregate corpus evidence.
- `scripts/` — local research and evaluation tools.
- `results/` — generated outputs; directories ending in `-local` are ignored.

Keep each manifest's audio identifier aligned with its local file in `datasets/`.

## SL-03 offline corpus inventory

```bash
python3 -m unittest discover -s benchmarks/scripts -p 'test_*.py'
python3 benchmarks/scripts/inventory_corpus.py \
  --corpus 'benchmarks/datasets/sps corpus 9-11' \
  --output benchmarks/results/sl-03-local --probe-sample
```

Requires Python 3.10+. Omit `--probe-sample` outside macOS (it uses `afinfo`).
No API keys, packages or network are needed; the script cannot submit a
transcription request. It produces a complete local manifest, a seeded review
sample and an aggregate inventory. Do not commit or upload the full manifest,
source transcripts, reports or audio. Current source portal terms forbid
re-hosting/re-sharing the dataset and identifying speakers.

See [the audit](../docs/audits/sl-03-corpus-inventory.md) for confirmed counts,
rights evidence, schema details, limitations and the pending listening check.
