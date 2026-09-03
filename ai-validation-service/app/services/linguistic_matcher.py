# app/services/linguistic_matcher.py
import difflib
from typing import Optional, Tuple
from app.core.taxonomy import ErrorCode, ERROR_DESCRIPTIONS
from app.schemas.model import ErrorDetail


class LinguisticMatcher:
    def __init__(self, similarity_threshold: float = 0.85):
        self.similarity_threshold = similarity_threshold

    def match(self, hypothesis_text: str, target_prompt: str) -> Tuple[bool, Optional[ErrorDetail]]:
        # Normalized character/word similarity match
        norm_hyp = " ".join(hypothesis_text.lower().strip().split())
        norm_target = " ".join(target_prompt.lower().strip().split())

        ratio = difflib.SequenceMatcher(None, norm_hyp, norm_target).ratio()
        if ratio < self.similarity_threshold:
            return False, ErrorDetail(
                code=ErrorCode.ERR_02,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_02],
                details={"similarity_score": float(ratio)},
            )
        return True, None