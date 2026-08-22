# apps/validation

Real (deterministic, not ML) content-signature/integrity checking against
actual file bytes. Not a trained model — see the docstring in `main.py` and
the Phase 4 plan for the honest scope boundary.

## Run locally

```
cd apps/validation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8001
```

`apps/api` calls this at `VALIDATION_SERVICE_URL` (defaults to
`http://localhost:8001`) and gracefully falls back to its own lightweight
stub if this isn't running — starting this service is optional for local
dev, not required.

## What it checks

- Magic-byte signature match against the declared `mimeType` (both media
  types) — catches corruption or a mismatched declared type.
- Image integrity via Pillow's `Image.verify()` (image only) — catches
  truncated/corrupt images for real.
- Audio bitrate plausibility: file size vs. declared duration should fall
  in a plausible compressed-speech range (audio only). Full audio decoding
  would need ffmpeg/PyAV — out of scope, a documented limitation.
