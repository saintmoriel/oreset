# app/lms/calibration.py
from typing import Dict, Any
from pydantic import BaseModel


class LanguageCalibrationConfig(BaseModel):
    min_wpm: int
    max_wpm: int
    pause_threshold_sec: float


CALIBRATION_PLAYBOOK: Dict[str, LanguageCalibrationConfig] = {
    "somali": LanguageCalibrationConfig(min_wpm=110, max_wpm=150, pause_threshold_sec=1.2),
    "lingala": LanguageCalibrationConfig(min_wpm=100, max_wpm=145, pause_threshold_sec=1.1),
    "swahili": LanguageCalibrationConfig(min_wpm=120, max_wpm=160, pause_threshold_sec=1.0),
    "yoruba": LanguageCalibrationConfig(min_wpm=95, max_wpm=140, pause_threshold_sec=1.3),
}


class OperatorCalibrator:
    @staticmethod
    def evaluate_pace(language: str, word_count: int, duration_sec: float) -> Dict[str, Any]:
        lang_key = language.lower()
        config = CALIBRATION_PLAYBOOK.get(lang_key, CALIBRATION_PLAYBOOK["swahili"])
        
        wpm = (word_count / duration_sec) * 60 if duration_sec > 0 else 0
        is_compliant = config.min_wpm <= wpm <= config.max_wpm
        
        return {
            "language": lang_key,
            "calculated_wpm": round(wpm, 2),
            "target_range": [config.min_wpm, config.max_wpm],
            "pacing_compliant": is_compliant
        }