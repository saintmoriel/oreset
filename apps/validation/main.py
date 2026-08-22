"""Real (deterministic, not ML) validation microservice.

First non-Node runtime in the monorepo — deliberately outside the pnpm
workspace. Run with: uvicorn main:app --port 8001

apps/api/src/modules/validation/validation.service.ts calls POST /validate
over plain internal HTTP, falling back to its own lightweight stub if this
service isn't reachable (a real local-dev scenario — a developer has to
remember to start this as a separate process).
"""

import httpx
from fastapi import FastAPI
from pydantic import BaseModel

from checks import check_audio_bitrate_plausibility, check_image_integrity, check_magic_bytes

app = FastAPI()


class ValidateRequest(BaseModel):
    mediaType: str
    mimeType: str
    fileSizeBytes: int
    durationSeconds: float | None = None
    downloadUrl: str


class ValidateResponse(BaseModel):
    outcome: str  # "pass" | "fail"
    reason: str | None
    score: float


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/validate", response_model=ValidateResponse)
async def validate(req: ValidateRequest) -> ValidateResponse:
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(req.downloadUrl)
        resp.raise_for_status()
        data = resp.content

    ok, reason = check_magic_bytes(data, req.mimeType)
    if not ok:
        return ValidateResponse(outcome="fail", reason=reason, score=0.0)

    if req.mediaType == "image":
        ok, reason = check_image_integrity(data)
        if not ok:
            return ValidateResponse(outcome="fail", reason=reason, score=0.0)

    if req.mediaType == "audio":
        ok, reason = check_audio_bitrate_plausibility(req.fileSizeBytes, req.durationSeconds)
        if not ok:
            return ValidateResponse(outcome="fail", reason=reason, score=0.2)

    return ValidateResponse(outcome="pass", reason=None, score=0.95)
