'use client'

import { useState } from 'react'
import { Save, Plus, X, Loader2, Upload, FileText, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import type { OperatorProfile, ProfileUpdateInput, OperatorLanguage } from '@/lib/api/endpoints/operator'

const FLUENCY_OPTIONS = ['Native', 'Fluent', 'Conversational', 'Basic']
const EDUCATION_OPTIONS = [
  'Secondary school (SSCE/WAEC)',
  'OND / NCE',
  'HND',
  "Bachelor's degree",
  "Master's degree",
  'PhD',
  'Other',
]
const ENGLISH_OPTIONS = ['Native speaker', 'Fluent', 'Intermediate', 'Basic']
const AVAILABILITY_OPTIONS = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Weekends']

function ProfileStrength({ value }: { value: number }) {
  const label =
    value === 100 ? 'Complete' : value >= 75 ? 'Strong' : value >= 50 ? 'Getting there' : 'Getting Started'
  const color =
    value === 100
      ? 'bg-success text-success'
      : value >= 75
        ? 'bg-accent text-accent'
        : value >= 50
          ? 'bg-warning text-warning'
          : 'bg-navy-300 text-navy-500'

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-navy-900">Profile Strength</p>
          <p className="text-xs text-navy-400 mt-0.5">
            How complete your profile looks when reviewers are being assigned work.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums text-navy-900">{value}%</span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
              color.split(' ')[0] + '/10',
              color.split(' ')[1],
            )}
          >
            {label}
          </span>
        </div>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-navy-100">
        <div
          className={cn('h-2 rounded-full transition-all duration-500', color.split(' ')[0])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function ProfileTab({
  profile,
  onSave,
}: {
  profile: OperatorProfile
  onSave: (data: ProfileUpdateInput) => Promise<void>
}) {
  const app = profile.application

  const [displayName, setDisplayName] = useState(profile.user.displayName ?? '')
  const [location, setLocation] = useState(app?.location ?? '')
  const [languages, setLanguages] = useState<OperatorLanguage[]>(app?.languages ?? [])
  const [dialect, setDialect] = useState(app?.dialect ?? '')
  const [academicBackground, setAcademicBackground] = useState(app?.academicBackground ?? '')
  const [englishProficiency, setEnglishProficiency] = useState(app?.englishProficiency ?? '')
  const [availability, setAvailability] = useState<string[]>(app?.availability ?? [])
  const [experience, setExperience] = useState(app?.experience ?? '')

  const [documents, setDocuments] = useState<{ name: string; size: number; file: File }[]>([])
  const [newLang, setNewLang] = useState('')
  const [newFluency, setNewFluency] = useState('Fluent')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function addLanguage() {
    const lang = newLang.trim()
    if (!lang) return
    if (languages.some((l) => l.language.toLowerCase() === lang.toLowerCase())) return
    setLanguages([...languages, { language: lang, fluency: newFluency }])
    setNewLang('')
  }

  function removeLanguage(index: number) {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  function toggleAvailability(slot: string) {
    setAvailability((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]))
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newDocs = Array.from(files).map((file) => ({ name: file.name, size: file.size, file }))
    setDocuments((prev) => [...prev, ...newDocs])
    e.target.value = ''
  }

  function removeDocument(index: number) {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await onSave({
        displayName: displayName.trim() || undefined,
        location: location.trim() || undefined,
        languages: languages.length > 0 ? languages : undefined,
        dialect: dialect.trim() || undefined,
        academicBackground: academicBackground || undefined,
        englishProficiency: englishProficiency || undefined,
        availability: availability.length > 0 ? availability : undefined,
        experience: experience.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProfileStrength value={profile.profileStrength} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Profile</p>
          <p className="text-xs text-navy-400 mt-0.5">Update your display name and personal details.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-navy-600">Full name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Email address</label>
              <input
                value={profile.user.email ?? ''}
                disabled
                className="mt-1 w-full rounded-md border border-border bg-navy-50 px-3 py-2 text-sm text-navy-400 cursor-not-allowed"
              />
              <p className="text-[11px] text-navy-400 mt-1">
                Email cannot be changed here. Contact an administrator if you need to update it.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent"
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Operator code</label>
              <input
                value={profile.user.operatorCode ?? ''}
                disabled
                className="mt-1 w-full rounded-md border border-border bg-navy-50 px-3 py-2 text-sm font-mono text-navy-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Languages</p>
          <p className="text-xs text-navy-400 mt-0.5">
            Languages you speak and can verify AI decisions in.
          </p>

          {languages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {languages.map((lang, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-700"
                >
                  {lang.language}
                  <span className="text-navy-400">({lang.fluency})</span>
                  <button type="button" onClick={() => removeLanguage(i)} className="hover:text-destructive">
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
              placeholder="Add a language..."
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-navy-300 focus-visible:border-accent"
            />
            <select
              value={newFluency}
              onChange={(e) => setNewFluency(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-700 outline-none focus-visible:border-accent"
            >
              {FLUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addLanguage}
              disabled={!newLang.trim()}
              className={cn(
                'flex size-9 items-center justify-center rounded-md border transition-colors',
                newLang.trim()
                  ? 'border-accent text-accent hover:bg-accent/10'
                  : 'border-border text-navy-300 cursor-not-allowed',
              )}
            >
              <Plus className="size-4" />
            </button>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-navy-600">Dialect / regional variant</label>
            <input
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent"
              placeholder="e.g. Kano Hausa, Oyo Yoruba"
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-navy-600">English proficiency</label>
            <select
              value={englishProficiency}
              onChange={(e) => setEnglishProficiency(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-700 outline-none focus-visible:border-accent"
            >
              <option value="">Select proficiency</option>
              {ENGLISH_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Education & Experience */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Education & Experience</p>
          <p className="text-xs text-navy-400 mt-0.5">Your background helps us assign appropriate case types.</p>

          <div className="mt-4">
            <label className="text-xs font-medium text-navy-600">Highest education level</label>
            <select
              value={academicBackground}
              onChange={(e) => setAcademicBackground(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-700 outline-none focus-visible:border-accent"
            >
              <option value="">Select education level</option>
              {EDUCATION_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-navy-600">Relevant experience</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent resize-none"
              placeholder="Describe any relevant experience with language work, translation, QA, or review..."
            />
          </div>
        </div>

        {/* Supporting Documents */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Supporting Documents</p>
          <p className="text-xs text-navy-400 mt-0.5">
            Upload your resume, educational certificates, or other supporting documents.
          </p>

          {documents.length > 0 && (
            <div className="mt-3 space-y-2">
              {documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="size-4 shrink-0 text-accent" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-navy-400">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(i)}
                    className="shrink-0 rounded p-1 text-navy-400 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-accent/50 hover:bg-accent/5">
            <Upload className="size-5 text-navy-400" />
            <div>
              <p className="text-sm font-medium text-accent">Upload document</p>
              <p className="text-[11px] text-navy-400 mt-0.5">PDF, DOC, or image up to 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileSelect}
            />
          </label>
          <p className="text-[11px] text-navy-400 mt-2">
            Document upload storage will be connected in the next update. Files selected here are staged locally.
          </p>
        </div>

        {/* Availability */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-navy-900">Availability</p>
          <p className="text-xs text-navy-400 mt-0.5">When are you typically available for review work?</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {AVAILABILITY_OPTIONS.map((slot) => (
              <label
                key={slot}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors',
                  availability.includes(slot)
                    ? 'border-accent/50 bg-accent/5 text-navy-900'
                    : 'border-border bg-background text-navy-600 hover:border-navy-200',
                )}
              >
                <input
                  type="checkbox"
                  checked={availability.includes(slot)}
                  onChange={() => toggleAvailability(slot)}
                  className="size-4 accent-accent"
                />
                {slot}
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {success && <p className="text-sm text-success">Profile saved successfully.</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
