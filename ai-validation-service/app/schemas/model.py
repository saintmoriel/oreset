from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from app.core.taxonomy import ErrorCode


class SessionMetadata(BaseModel):
    session_id: str
    contributor_id: str
    language: str  # e.g., 'somali', 'lingala', 'swahili', 'yoruba'
    consent_given: bool
    consent_timestamp: Optional[str] = None
    target_prompt: str
    client_device: Optional[str] = "unknown"


class ErrorDetail(BaseModel):
    code: ErrorCode
    message: str
    details: Optional[Dict[str, float]] = None


class ValidationResult(BaseModel):
    is_valid: bool = Field(..., description="Overall pass/fail trigger for ingestion pipeline")
    error_codes: List[ErrorCode] = Field(default_factory=list)
    errors: List[ErrorDetail] = Field(default_factory=list)
    latency_ms: float


class CalibrationRequest(BaseModel):
    language: str
    word_count: int
    duration_sec: float


class CalibrationResponse(BaseModel):
    language: str
    calculated_wpm: float
    target_range: List[int]
    pacing_compliant: bool