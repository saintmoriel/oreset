from enum import Enum


class ErrorCode(str, Enum):
    ERR_01 = "ERR-01"  # Acoustic/Environmental noise (traffic, static, distortion)
    ERR_02 = "ERR-02"  # Linguistic mismatch (pronunciation, misreads)
    ERR_03 = "ERR-03"  # Truncation/Trailing-off (unnatural cutoff, fatigue)
    ERR_04 = "ERR-04"  # Compliance/Metadata anomalies (missing consent, invalid logs)


ERROR_DESCRIPTIONS = {
    ErrorCode.ERR_01: "Acoustic anomaly detected: excessive background noise, static, or distortion.",
    ErrorCode.ERR_02: "Linguistic mismatch: audio does not match target script or language constraints.",
    ErrorCode.ERR_03: "Truncation detected: phrasing cut off abruptly or unnatural trailing-off.",
    ErrorCode.ERR_04: "Compliance violation: missing consent headers or malformed session metadata.",
}