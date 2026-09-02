# app/api/routes.py
import json
import time
import io
import tempfile
import os
import numpy as np
import librosa
from pydub import AudioSegment
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
import whisper

from app.schemas.model import SessionMetadata, ValidationResult, ErrorDetail, CalibrationRequest, CalibrationResponse
from app.services.compliance_checker import ComplianceChecker
from app.services.acoustic_scanner import AcousticScanner
from app.services.truncation_detector import TruncationDetector
from app.services.linguistic_matcher import LinguisticMatcher
from app.lms.calibration import OperatorCalibrator

router = APIRouter()
acoustic_scanner = AcousticScanner()
truncation_detector = TruncationDetector()
linguistic_matcher = LinguisticMatcher()

# Load whisper model (tiny is fast for testing/initial dev, can be changed later)
try:
    whisper_model = whisper.load_model("tiny")
except Exception as e:
    print(f"Failed to load whisper model: {e}")
    whisper_model = None

@router.post("/validate-audio", response_model=ValidationResult)
async def validate_audio(
    metadata_json: str = Form(..., description="JSON-serialized SessionMetadata"),
    file: UploadFile = File(...)
):
    start_time = time.perf_counter()
    errors: list[ErrorDetail] = []

    # 1. Parse and Validate Metadata (ERR-04 short-circuit)
    try:
        raw_meta = json.loads(metadata_json)
        metadata = SessionMetadata(**raw_meta)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Malformed metadata payload: {str(e)}"
        )

    valid_comp, comp_err = ComplianceChecker.validate(metadata)
    if not valid_comp:
        elapsed = (time.perf_counter() - start_time) * 1000
        return ValidationResult(
            is_valid=False,
            error_codes=[comp_err.code],
            errors=[comp_err],
            latency_ms=round(elapsed, 2)
        )

    # 2. Decode and Resample Audio
    try:
        audio_bytes = await file.read()
        audio_buffer = io.BytesIO(audio_bytes)
        
        try:
            # Try loading with pydub first (better M4A support)
            audio_segment = AudioSegment.from_m4a(audio_buffer)
            
            # Convert to numpy array
            audio_data = np.array(audio_segment.get_array_of_samples(), dtype="float32")
            
            # Normalize to [-1, 1] range
            audio_data = audio_data / 32768.0
            
            # Handle stereo -> mono conversion if needed
            if audio_segment.channels > 1:
                audio_data = audio_data.reshape((-1, audio_segment.channels))
                audio_data = audio_data.mean(axis=1)
            
            sr = audio_segment.frame_rate
            
            # Resample to 16kHz if needed
            if sr != 16000:
                audio_data = librosa.resample(audio_data, orig_sr=sr, target_sr=16000)
                sr = 16000
        except Exception as pydub_error:
            # Fallback: try with librosa using a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
            
            try:
                audio_data, sr = librosa.load(tmp_path, sr=None, mono=True)
                # Resample to 16kHz if needed
                if sr != 16000:
                    audio_data = librosa.resample(audio_data, orig_sr=sr, target_sr=16000)
                    sr = 16000
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or unreadable audio format: {str(e)}"
        )

    # 3. Acoustic Quality Gate (ERR-01)
    valid_ac, ac_err = acoustic_scanner.scan(audio_data, sr)
    if not valid_ac and ac_err:
        errors.append(ac_err)

    # 4. Truncation Quality Gate (ERR-03)
    valid_tr, tr_err = truncation_detector.detect(audio_data, sr)
    if not valid_tr and tr_err:
        errors.append(tr_err)

    # 5. Linguistic Mismatch Gate (ERR-02)
    if whisper_model is not None:
        try:
            # Whisper expects 16kHz float32 numpy array, which we already have!
            result = whisper_model.transcribe(audio_data)
            hypothesis_text = result["text"]
            valid_ling, ling_err = linguistic_matcher.match(hypothesis_text, metadata.target_prompt)
            if not valid_ling and ling_err:
                errors.append(ling_err)
        except Exception as e:
            print(f"Whisper transcription failed: {e}")

    elapsed = (time.perf_counter() - start_time) * 1000
    return ValidationResult(
        is_valid=len(errors) == 0,
        error_codes=[e.code for e in errors],
        errors=errors,
        latency_ms=round(elapsed, 2)
    )

@router.post("/calibrate-operator", response_model=CalibrationResponse)
async def calibrate_operator(request: CalibrationRequest):
    result = OperatorCalibrator.evaluate_pace(
        language=request.language,
        word_count=request.word_count,
        duration_sec=request.duration_sec
    )
    return CalibrationResponse(**result)