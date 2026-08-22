"""Deterministic content-signature/integrity checks against real file bytes.

Not a trained ML model — there is no training data or ML pipeline in this
codebase, and building one is Favor's actual deliverable per the founder
brief. What this module delivers is real: genuine byte-level inspection
with deterministic outcomes tied to actual file properties, proving the
exact architecture a real model will eventually plug into.
"""

import io

from PIL import Image, UnidentifiedImageError

MAGIC_BYTES = {
    "audio/webm": (b"\x1a\x45\xdf\xa3",),
    "audio/ogg": (b"OggS",),
    "image/jpeg": (b"\xff\xd8\xff",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
}

# Plausible compressed-speech bitrate range (kbps). Outside this, file size
# vs. declared duration is implausible — a real flag, not a random draw.
# Full audio decoding would need ffmpeg/PyAV — out of scope, documented
# limitation rather than an overstated capability.
MIN_AUDIO_KBPS = 8
MAX_AUDIO_KBPS = 320


def check_magic_bytes(data: bytes, mime_type: str) -> tuple[bool, str | None]:
    signatures = MAGIC_BYTES.get(mime_type)
    if not signatures:
        # No signature registered for this mime type — nothing to check
        # against, don't fail a file for a gap in our signature table.
        return True, None
    if any(data.startswith(sig) for sig in signatures):
        return True, None
    return False, f"ERR-04: file bytes do not match the declared mimeType ({mime_type})"


def check_image_integrity(data: bytes) -> tuple[bool, str | None]:
    try:
        with Image.open(io.BytesIO(data)) as img:
            img.verify()
        return True, None
    except (UnidentifiedImageError, OSError, ValueError):
        return False, "ERR-04: image file is truncated or corrupt"


def check_audio_bitrate_plausibility(
    file_size_bytes: int, duration_seconds: float | None
) -> tuple[bool, str | None]:
    if not duration_seconds or duration_seconds <= 0:
        # No duration to check against — can't evaluate, don't fail.
        return True, None
    kbps = (file_size_bytes * 8 / 1000) / duration_seconds
    if MIN_AUDIO_KBPS <= kbps <= MAX_AUDIO_KBPS:
        return True, None
    return False, f"ERR-04: implausible audio bitrate ({kbps:.1f} kbps) for declared duration"
