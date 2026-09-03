from typing import Optional, Tuple
from app.core.taxonomy import ErrorCode, ERROR_DESCRIPTIONS
from app.schemas.model import ErrorDetail, SessionMetadata


class ComplianceChecker:
    @staticmethod
    def validate(metadata: SessionMetadata) -> Tuple[bool, Optional[ErrorDetail]]:
        if not metadata.consent_given or not metadata.consent_timestamp:
            return False, ErrorDetail(
                code=ErrorCode.ERR_04,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_04] + " Missing contributor consent.",
            )

        if not metadata.session_id or not metadata.contributor_id:
            return False, ErrorDetail(
                code=ErrorCode.ERR_04,
                message=ERROR_DESCRIPTIONS[ErrorCode.ERR_04] + " Invalid session identifiers.",
            )

        return True, None