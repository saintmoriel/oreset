'use client'

import { useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, ShieldCheck, ShieldOff } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { describeError } from '@/lib/api/client'
import { disableMfa, enableMfa, getMfaStatus, regenerateRecoveryCodes, startMfaSetup, type MfaStatus } from '@/lib/api/endpoints/auth'

const INPUT = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent'
const PRIMARY = 'inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60'
const SECONDARY = 'inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-60'

// Shared by the staff console now; the tester portal reuses it when its
// security page lands.
export function TwoFactorPanel() {
  const [status, setStatus] = useState<MfaStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setStatus(await getMfaStatus())
    } catch (err) {
      setError(describeError(err, 'Could not load your security settings.'))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error) return <p className="cx-body mt-6 text-destructive" role="alert">{error}</p>
  if (!status) return <p className="cx-body mt-6 text-navy-400">Loading…</p>

  return status.enabled ? <EnabledView status={status} onChanged={load} /> : <SetupView onEnabled={load} />
}

function SetupView({ onEnabled }: { onEnabled: () => Promise<void> }) {
  const [step, setStep] = useState<'idle' | 'scan' | 'done'>('idle')
  const [secret, setSecret] = useState('')
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [recovery, setRecovery] = useState<string[] | null>(null)

  async function start() {
    setBusy(true)
    try {
      const res = await startMfaSetup()
      setSecret(res.secret)
      setQr(await QRCode.toDataURL(res.otpauthUrl, { margin: 1, width: 220 }))
      setStep('scan')
    } catch (err) {
      toast.error('Could not start', describeError(err, 'Try again.'))
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    setBusy(true)
    try {
      const res = await enableMfa(code)
      setRecovery(res.recoveryCodes)
      setStep('done')
      toast.success('Two-factor is on', 'Save your recovery codes somewhere safe.')
    } catch (err) {
      toast.error('Code not accepted', describeError(err, 'Try the current code.'))
    } finally {
      setBusy(false)
    }
  }

  if (step === 'done' && recovery) {
    return (
      <div className="mt-6 space-y-6">
        <RecoveryCodes codes={recovery} />
        <button className={PRIMARY} onClick={() => void onEnabled()}>I have saved them</button>
      </div>
    )
  }

  if (step === 'scan') {
    return (
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="cx-card p-6">
          <p className="cx-label text-navy-400">Step 1</p>
          <p className="cx-body mt-1 font-medium text-navy-900">Scan this with your authenticator app</p>
          <p className="cx-meta mt-1 text-navy-500">Google Authenticator, Microsoft Authenticator, Authy or 1Password all work.</p>
          {qr && <img src={qr} alt="QR code for your authenticator app" className="mt-4 rounded-md border border-border bg-white p-2" width={220} height={220} />}
          <details className="mt-3">
            <summary className="cx-meta cursor-pointer text-navy-500">Cannot scan? Enter the key by hand</summary>
            <div className="mt-2 flex items-center gap-2">
              <code className="cx-mono-meta rounded bg-navy-50 px-2 py-1 text-navy-800 break-all">{secret}</code>
              <button
                type="button"
                className="text-navy-400 hover:text-accent"
                aria-label="Copy key"
                onClick={() => navigator.clipboard.writeText(secret).then(() => toast.success('Copied', 'Key copied to clipboard.'))}
              >
                <Copy className="size-4" />
              </button>
            </div>
          </details>
        </div>
        <div className="cx-card p-6">
          <p className="cx-label text-navy-400">Step 2</p>
          <p className="cx-body mt-1 font-medium text-navy-900">Enter the six-digit code the app shows</p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123 456"
            className={`${INPUT} mt-4 font-mono text-lg tracking-widest`}
          />
          <div className="mt-4 flex gap-2">
            <button className={PRIMARY} onClick={confirm} disabled={busy || code.replace(/\s/g, '').length < 6}>
              {busy ? 'Checking…' : 'Turn on two-factor'}
              {!busy && <ShieldCheck className="size-4" />}
            </button>
            <button className={SECONDARY} onClick={() => setStep('idle')} disabled={busy}>Cancel</button>
          </div>
          <p className="cx-meta mt-3 text-navy-400">Nothing changes until a code is accepted, so you cannot lock yourself out by stopping here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cx-card mt-6 flex flex-wrap items-center justify-between gap-4 border-warning/40 bg-warning/5 p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"><ShieldOff className="size-5" /></span>
        <div>
          <p className="cx-body font-medium text-navy-900">Two-factor authentication is off</p>
          <p className="cx-meta mt-0.5 text-navy-500">Takes about a minute. You will need your phone with an authenticator app installed.</p>
        </div>
      </div>
      <button className={PRIMARY} onClick={start} disabled={busy}>{busy ? 'Starting…' : 'Set up now'}</button>
    </div>
  )
}

function EnabledView({ status, onChanged }: { status: MfaStatus; onChanged: () => Promise<void> }) {
  const [mode, setMode] = useState<'idle' | 'regen' | 'disable'>('idle')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [recovery, setRecovery] = useState<string[] | null>(null)

  async function regen() {
    setBusy(true)
    try {
      const res = await regenerateRecoveryCodes(code)
      setRecovery(res.recoveryCodes)
      setCode('')
      toast.success('New recovery codes', 'The old ones no longer work.')
    } catch (err) {
      toast.error('Not accepted', describeError(err, 'Try the current code.'))
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    if (!confirm('Turn off two-factor authentication? Your account will be protected by password alone.')) return
    setBusy(true)
    try {
      await disableMfa(code, password)
      toast.success('Two-factor is off', 'Turn it back on as soon as you can.')
      setMode('idle')
      setCode('')
      setPassword('')
      await onChanged()
    } catch (err) {
      toast.error('Not accepted', describeError(err, 'Check the code and password.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="cx-card flex flex-wrap items-center justify-between gap-4 border-success/40 bg-success/5 p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"><ShieldCheck className="size-5" /></span>
          <div>
            <p className="cx-body font-medium text-navy-900">Two-factor authentication is on</p>
            <p className="cx-meta mt-0.5 text-navy-500">
              Since {status.enabledAt ? new Date(status.enabledAt).toLocaleDateString() : 'recently'}. {status.recoveryCodesLeft ?? 0} recovery codes left.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className={SECONDARY} onClick={() => { setMode('regen'); setRecovery(null) }}>New recovery codes</button>
          <button className={SECONDARY} onClick={() => setMode('disable')}>Turn off</button>
        </div>
      </div>

      {mode === 'regen' && (
        <div className="cx-card p-6">
          {recovery ? (
            <>
              <RecoveryCodes codes={recovery} />
              <button className={`${PRIMARY} mt-4`} onClick={() => { setMode('idle'); void onChanged() }}>I have saved them</button>
            </>
          ) : (
            <>
              <p className="cx-body font-medium text-navy-900">Enter a current code to generate new recovery codes</p>
              <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123 456" className={`${INPUT} mt-3 max-w-xs font-mono tracking-widest`} />
              <div className="mt-3 flex gap-2">
                <button className={PRIMARY} onClick={regen} disabled={busy || code.length < 6}>{busy ? 'Working…' : 'Generate'}</button>
                <button className={SECONDARY} onClick={() => setMode('idle')}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'disable' && (
        <div className="cx-card border-destructive/30 p-6">
          <p className="cx-body font-medium text-navy-900">Turn off two-factor</p>
          <p className="cx-meta mt-1 text-navy-500">Needs a current code (or a recovery code) and your password, so an open session alone cannot do it.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className={`${INPUT} font-mono tracking-widest`} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={INPUT} />
          </div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex h-10 items-center rounded-md bg-destructive px-4 text-sm font-semibold text-white disabled:opacity-60" onClick={disable} disabled={busy || code.length < 6 || !password}>
              {busy ? 'Working…' : 'Turn off'}
            </button>
            <button className={SECONDARY} onClick={() => setMode('idle')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  return (
    <div className="cx-card border-accent/40 bg-accent/5 p-6">
      <p className="cx-label text-accent">Recovery codes. Shown once.</p>
      <p className="cx-body mt-1 text-navy-800">
        If you lose your phone, one of these signs you in instead of the app code. Each works once. Store them in your password manager or print them; we cannot show them again.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {codes.map((c) => (
          <code key={c} className="cx-mono-meta rounded bg-white px-2 py-1.5 text-center text-navy-900 border border-border">{c}</code>
        ))}
      </div>
      <button
        type="button"
        className={`${SECONDARY} mt-4`}
        onClick={() => navigator.clipboard.writeText(codes.join('\n')).then(() => toast.success('Copied', 'All codes copied to clipboard.'))}
      >
        <Copy className="size-4" /> Copy all
      </button>
    </div>
  )
}
