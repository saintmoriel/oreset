'use client'

import { useRef, useState } from 'react'
import { Save, Plus, X, Loader2, Camera, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describeError, fieldMessages } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import type { OperatorProfile, ProfileUpdateInput, OperatorLanguage, SecurityExperienceYears } from '@/lib/api/endpoints/operator'

const FLUENCY_OPTIONS = ['Native', 'Professional', 'Practical', 'Basic']
const AVAILABILITY_OPTIONS = ['Weekday daytime', 'Weekday evenings', 'Weekends', 'Full time']
const EXPERIENCE_OPTIONS: { value: SecurityExperienceYears; label: string }[] = [
  { value: 'none', label: 'No professional security testing yet' },
  { value: 'under_2', label: 'Under 2 years' },
  { value: '2_to_5', label: '2 to 5 years' },
  { value: 'over_5', label: 'Over 5 years' },
]

const INPUT = 'mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent'

// Resize any image to a 256px square JPEG in the browser so what we store
// is small and uniform. Returns a data URL.
async function toSquareDataUrl(file: File, size = 256): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)
  bitmap.close()
  // Step quality down until the payload is comfortably under the API limit.
  for (const q of [0.85, 0.75, 0.65, 0.55]) {
    const url = canvas.toDataURL('image/jpeg', q)
    if (url.length < 110_000) return url
  }
  return canvas.toDataURL('image/jpeg', 0.45)
}

function Completeness({ profile }: { profile: OperatorProfile }) {
  const complete = profile.missingRequired.length === 0
  return (
    <div className={cn('rounded-xl border p-5', complete ? 'border-success/30 bg-success/5' : 'border-warning/40 bg-warning/5')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-navy-900">{complete ? 'Profile complete' : 'Profile incomplete'}</p>
          <p className="mt-0.5 text-xs text-navy-500">
            {complete
              ? 'Lead auditors see a complete profile when assigning sensitive engagements.'
              : 'Required before you are assigned live engagements. Still missing:'}
          </p>
          {!complete && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {profile.missingRequired.map((m) => (
                <li key={m.key} className="rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-semibold text-warning">{m.label}</li>
              ))}
            </ul>
          )}
        </div>
        <span className="text-2xl font-bold tabular-nums text-navy-900">{profile.profileStrength}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-navy-100">
        <div className={cn('h-2 rounded-full transition-all duration-500', complete ? 'bg-success' : 'bg-warning')} style={{ width: `${profile.profileStrength}%` }} />
      </div>
    </div>
  )
}

function Req({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-navy-600">
      {children} <span className="text-destructive" title="Required">*</span>
    </label>
  )
}

export function ProfileTab({ profile, onSave }: { profile: OperatorProfile; onSave: (data: ProfileUpdateInput) => Promise<void> }) {
  const app = profile.application
  const fileRef = useRef<HTMLInputElement>(null)

  const [avatar, setAvatar] = useState<string | null>(profile.user.avatarDataUrl)
  const [avatarChanged, setAvatarChanged] = useState(false)
  const [displayName, setDisplayName] = useState(profile.user.displayName ?? '')
  const [username, setUsername] = useState(profile.user.username ?? '')
  const [phone, setPhone] = useState(profile.user.phone ?? '')
  const [location, setLocation] = useState(app?.location ?? '')
  const [languages, setLanguages] = useState<OperatorLanguage[]>(app?.languages ?? [])
  const [dialect, setDialect] = useState(app?.dialect ?? '')
  const [years, setYears] = useState<SecurityExperienceYears | ''>(app?.securityExperienceYears ?? '')
  const [experience, setExperience] = useState(app?.experience ?? '')
  const [tools, setTools] = useState(app?.tools ?? '')
  const [portfolioUrl, setPortfolioUrl] = useState(app?.portfolioUrl ?? '')
  const [availability, setAvailability] = useState<string[]>(app?.availability ?? [])

  const [newLang, setNewLang] = useState('')
  const [newFluency, setNewFluency] = useState('Professional')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Not an image', 'Choose a JPEG, PNG or WebP photo.')
      return
    }
    try {
      const url = await toSquareDataUrl(file)
      setAvatar(url)
      setAvatarChanged(true)
    } catch {
      toast.error('Could not read that image', 'Try a different file.')
    }
  }

  function addLanguage() {
    const lang = newLang.trim()
    if (!lang || languages.some((l) => l.language.toLowerCase() === lang.toLowerCase())) return
    setLanguages([...languages, { language: lang, fluency: newFluency }])
    setNewLang('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await onSave({
        ...(avatarChanged ? { avatarDataUrl: avatar } : {}),
        displayName: displayName.trim() || undefined,
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        languages: languages.length > 0 ? languages : undefined,
        dialect: dialect.trim(),
        securityExperienceYears: years || undefined,
        experience: experience.trim(),
        tools: tools.trim(),
        portfolioUrl: portfolioUrl.trim(),
        availability,
      })
      setAvatarChanged(false)
      toast.success('Profile saved', 'Your changes are live.')
    } catch (err) {
      const fields = fieldMessages(err)
      setErrors(fields)
      const message = describeError(err, 'Could not save your profile.')
      toast.error('Not saved', message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Completeness profile={profile} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo and identity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Who you are</p>
          <p className="mt-0.5 text-xs text-navy-400">A real photo of you is required. Clients never see it; lead auditors and Trust and Safety do.</p>

          <div className="mt-4 flex flex-wrap items-start gap-5">
            <div className="flex flex-col items-center gap-2">
              <div className="relative size-24 overflow-hidden rounded-full border border-border bg-navy-50">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Your profile photo" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-navy-300"><Camera className="size-7" /></div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
              <div className="flex gap-1.5">
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-navy-700 hover:bg-navy-50">
                  {avatar ? 'Change' : 'Add photo'}
                </button>
                {avatar && (
                  <button type="button" onClick={() => { setAvatar(null); setAvatarChanged(true) }} aria-label="Remove photo" className="rounded-md border border-border px-2 py-1 text-navy-400 hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div>
                <Req>Full name</Req>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={INPUT} placeholder="As on your ID" />
                {errors.displayName && <p className="mt-1 text-xs text-destructive">{errors.displayName}</p>}
              </div>
              <div>
                <Req>Username</Req>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={`${INPUT} font-mono`}
                  placeholder="zeroday_ng"
                  pattern="[a-z0-9_]{3,24}"
                />
                <p className="mt-1 text-[11px] text-navy-400">3 to 24 characters: lowercase letters, digits, underscores. How other testers see you.</p>
                {errors.username && <p className="mt-1 text-xs text-destructive">{errors.username}</p>}
              </div>
              <div>
                <Req>Phone or WhatsApp</Req>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} placeholder="+234..." />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Req>Location</Req>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className={INPUT} placeholder="City, country" />
              </div>
              <div>
                <label className="text-xs font-medium text-navy-600">Email</label>
                <input value={profile.user.email ?? ''} disabled className={`${INPUT} cursor-not-allowed bg-navy-50 text-navy-400`} />
              </div>
              <div>
                <label className="text-xs font-medium text-navy-600">Tester code</label>
                <input value={profile.user.operatorCode ?? ''} disabled className={`${INPUT} cursor-not-allowed bg-navy-50 font-mono text-navy-400`} />
              </div>
            </div>
          </div>
        </div>

        {/* Security background */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Security and AI testing background</p>
          <p className="mt-0.5 text-xs text-navy-400">What lead auditors read when matching you to an engagement.</p>

          <div className="mt-4 space-y-4">
            <div>
              <Req>Years of professional security testing</Req>
              <select value={years} onChange={(e) => setYears(e.target.value as SecurityExperienceYears | '')} className={INPUT}>
                <option value="">Select</option>
                {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <Req>Your experience</Req>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={4} className={`${INPUT} resize-none`} placeholder="What you have tested, for whom, what you found. Bug bounty handles and CTF results count." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-navy-600">Tools and techniques</label>
                <input value={tools} onChange={(e) => setTools(e.target.value)} className={INPUT} placeholder="Burp, custom scripts, Garak, manual only" />
              </div>
              <div>
                <label className="text-xs font-medium text-navy-600">Portfolio, GitHub, HackerOne or LinkedIn</label>
                <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className={INPUT} placeholder="https://" />
                {errors.portfolioUrl && <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="rounded-xl border border-border bg-card p-5">
          <Req>Languages you can test in</Req>
          <p className="mt-0.5 text-xs text-navy-400">Agents behave differently across languages. English plus anything else you speak well.</p>

          {languages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-700">
                  {lang.language}
                  <span className="text-navy-400">({lang.fluency})</span>
                  <button type="button" onClick={() => setLanguages(languages.filter((_, j) => j !== i))} className="hover:text-destructive" aria-label={`Remove ${lang.language}`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              placeholder="Add a language"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-navy-300 focus-visible:border-accent"
            />
            <select value={newFluency} onChange={(e) => setNewFluency(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-700 outline-none focus-visible:border-accent">
              {FLUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <button
              type="button"
              onClick={addLanguage}
              disabled={!newLang.trim()}
              className={cn('flex size-9 items-center justify-center rounded-md border transition-colors', newLang.trim() ? 'border-accent text-accent hover:bg-accent/10' : 'cursor-not-allowed border-border text-navy-300')}
              aria-label="Add language"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-navy-600">Dialect or regional variant</label>
            <input value={dialect} onChange={(e) => setDialect(e.target.value)} className={INPUT} placeholder="Kano Hausa, Warri Pidgin" />
          </div>
        </div>

        {/* Availability */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Availability</p>
          <p className="mt-0.5 text-xs text-navy-400">Engagements run one to two weeks; most testers work a few evenings per engagement.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {AVAILABILITY_OPTIONS.map((slot) => (
              <label key={slot} className={cn('flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors', availability.includes(slot) ? 'border-accent/50 bg-accent/5 text-navy-900' : 'border-border bg-background text-navy-600 hover:border-navy-200')}>
                <input type="checkbox" checked={availability.includes(slot)} onChange={() => setAvailability((p) => (p.includes(slot) ? p.filter((s) => s !== slot) : [...p, slot]))} className="size-4 accent-accent" />
                {slot}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 text-xs text-navy-400">
            {profile.missingRequired.length === 0 ? <CheckCircle2 className="size-3.5 text-success" /> : <AlertCircle className="size-3.5 text-warning" />}
            Fields marked * are required.
          </p>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
