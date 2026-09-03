from typing import Optional, Tuple
import torch
from silero_vad import load_silero_vad, get_speech_timestamps
from app.core.taxonomy import ErrorCode, ERROR_DESCRIPTIONS
from app.schemas.model import ErrorDetail
import numpy as np


class TruncationDetector:
    def __init__(self, edge_tolerance_ms: float = 100.0):
        self.model = load_silero_vad()
        self.edge_tolerance_ms = edge_tolerance_ms

    def detect(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Tuple[bool, Optional[ErrorDetail]]:
        tensor_audio = torch.from_numpy(audio_data).float()
        
        # Silero VAD requires mono tensor normalized to [-1, 1]
        speech_timestamps = get_speech_timestamps(
            tensor_audio,
            self.model,
            sampling_rate=sample_rate,
            return_seconds=False
        )

        if not speech_timestamps:
            return False, ErrorDetail(
                code=ErrorCode.ERR_03,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_03] + " No speech detected.",
            )

        total_samples = len(audio_data)
        tolerance_samples = int((self.edge_tolerance_ms / 1000.0) * sample_rate)
        
        # Check end of recording truncation
        last_speech_end = speech_timestamps[-1]["end"]
        if (total_samples - last_speech_end) < tolerance_samples:
            return False, ErrorDetail(
                code=ErrorCode.ERR_03,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_03] + " Audio cut off abruptly at the end.",
                details={"trailing_buffer_samples": float(total_samples - last_speech_end)},
            )

        return True, None