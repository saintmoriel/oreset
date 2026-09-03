from typing import Optional, Tuple
import numpy as np
from app.core.taxonomy import ErrorCode, ERROR_DESCRIPTIONS
from app.schemas.model import ErrorDetail


class AcousticScanner:
    def __init__(self, min_snr_db: float = 12.0, max_clipping_ratio: float = 0.01):
        self.min_snr_db = min_snr_db
        self.max_clipping_ratio = max_clipping_ratio

    def scan(self, audio_data: np.ndarray, sample_rate: int) -> Tuple[bool, Optional[ErrorDetail]]:
        if len(audio_data) == 0:
            return False, ErrorDetail(
                code=ErrorCode.ERR_01,
                message="Acoustic check failed: Empty audio buffer.",
            )

        # 1. Clipping detection (Distortion)
        clipping_samples = np.sum(np.abs(audio_data) >= 0.99)
        clipping_ratio = clipping_samples / len(audio_data)
        if clipping_ratio > self.max_clipping_ratio:
            return False, ErrorDetail(
                code=ErrorCode.ERR_01,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_01] + " Audio distortion/clipping detected.",
                details={"clipping_ratio": float(clipping_ratio)},
            )

        # 2. Signal-to-Noise Ratio (SNR) estimation via Energy Framing
        frame_len = int(sample_rate * 0.025)
        hop_len = int(sample_rate * 0.010)
        frames = [
            audio_data[i : i + frame_len]
            for i in range(0, len(audio_data) - frame_len, hop_len)
        ]
        frame_energies = np.array([np.sum(f**2) for f in frames])

        if len(frame_energies) == 0 or np.max(frame_energies) == 0:
            return False, ErrorDetail(
                code=ErrorCode.ERR_01,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_01] + " Insufficient signal energy.",
            )

        # Top 10% frames as signal, bottom 10% as noise estimate
        signal_energy = np.mean(np.sort(frame_energies)[-max(1, int(len(frame_energies) * 0.1)):])
        noise_energy = np.mean(np.sort(frame_energies)[:max(1, int(len(frame_energies) * 0.1))])

        snr = 10 * np.log10((signal_energy + 1e-10) / (noise_energy + 1e-10))

        if snr < self.min_snr_db:
            return False, ErrorDetail(
                code=ErrorCode.ERR_01,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_01] + " High background noise level.",
                details={"snr_db": float(snr)},
            )

        return True, None