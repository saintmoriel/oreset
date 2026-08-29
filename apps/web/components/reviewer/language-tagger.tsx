'use client'

import { useState } from 'react'
import { Plus, Tag, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LanguageSegment } from '@/lib/types/case'

const COMMON_LANGUAGES = [
  'Pidgin', 'Hausa', 'Yoruba', 'Igbo', 'Swahili', 'Twi',
  'Arabic', 'Amharic', 'Zulu', 'English', 'French',
]

export function LanguageTagger({
  segments,
  onChange,
}: {
  segments: LanguageSegment[]
  onChange: (segments: LanguageSegment[]) => void
}) {
  const [newLanguage, setNewLanguage] = useState('')

  function addSegment() {
    const lang = newLanguage.trim()
    if (!lang) return
    onChange([
      ...segments,
      { id: String(Date.now()), startIndex: 0, endIndex: 0, language: lang },
    ])
    setNewLanguage('')
  }

  function removeSegment(id: string) {
    onChange(segments.filter((s) => s.id !== id))
  }

  const usedLanguages = [...new Set(segments.map((s) => s.language))]
  const suggestions = COMMON_LANGUAGES.filter((l) => !usedLanguages.includes(l))

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
        <Tag className="size-3.5" />
        <span>Language Segments (code-switching)</span>
      </div>

      {segments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {segments.map((seg) => (
            <span
              key={seg.id}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
            >
              {seg.language}
              <button
                type="button"
                onClick={() => removeSegment(seg.id)}
                className="hover:text-copper-600"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSegment())}
            placeholder="Tag a language..."
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:border-accent"
            list="language-suggestions"
          />
          <datalist id="language-suggestions">
            {suggestions.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </div>
        <button
          type="button"
          onClick={addSegment}
          disabled={!newLanguage.trim()}
          className={cn(
            'flex size-8 items-center justify-center rounded-md border transition-colors',
            newLanguage.trim()
              ? 'border-accent text-accent hover:bg-accent/10'
              : 'border-border text-muted-foreground cursor-not-allowed',
          )}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
