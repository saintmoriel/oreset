'use client'

import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCw, FileImage, Bot } from 'lucide-react'

export function DocumentViewer({
  imageUrl,
  aiExtraction,
}: {
  imageUrl: string
  aiExtraction: string
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileImage className="size-3.5" />
            <span>Document</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              className="flex size-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="flex size-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex size-7 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"
            >
              <RotateCw className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-auto rounded-md bg-muted">
          <img
            src={imageUrl}
            alt="Case document"
            className="transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-accent mb-3">
          <Bot className="size-3.5" />
          <span>AI Extraction</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {aiExtraction}
        </p>
      </div>
    </div>
  )
}
