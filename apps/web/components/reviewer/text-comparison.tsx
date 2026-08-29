'use client'

import { FileText, Bot } from 'lucide-react'

export function TextComparison({
  originalText,
  aiInterpretation,
}: {
  originalText: string
  aiInterpretation: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
          <FileText className="size-3.5" />
          <span>Original Input</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {originalText}
        </p>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-accent mb-3">
          <Bot className="size-3.5" />
          <span>AI Interpretation</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {aiInterpretation}
        </p>
      </div>
    </div>
  )
}
