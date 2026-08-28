// The one signature mark in this app: a small stamped-ring device, reserved
// strictly for moments that are genuinely, verifiably true (a qa_approved
// submission, a paid payout) — never applied decoratively. Its negative,
// the Void mark, reuses the same ring geometry crossed out, for the one
// place this app needs to say "this is definitely not real" (the sign-in
// page's dev-mode OTP code).
function SealRing({ tone }: { tone: 'seal' | 'void' }) {
  const isVoid = tone === 'void'
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={isVoid ? 'text-warning' : 'text-accent'}
    >
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2.2" />
      <circle cx="14" cy="14" r="8.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {isVoid ? (
        <path d="M9.5 9.5l9 9M18.5 9.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path
          d="M10 14.2l2.6 2.6L18.5 11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function VerificationSeal({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <SealRing tone="seal" />
      <span className="cx-tag text-accent">{label}</span>
    </span>
  )
}

export function VoidMark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <SealRing tone="void" />
      <span className="cx-tag text-warning">{label}</span>
    </span>
  )
}
