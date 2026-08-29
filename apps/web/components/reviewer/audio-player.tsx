'use client'

import { useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AudioPlayer({
  audioUrl,
  transcript,
  aiInterpretation,
  onReplay,
}: {
  audioUrl: string
  transcript: string
  aiInterpretation: string
  onReplay?: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  function replay() {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play()
    setIsPlaying(true)
    onReplay?.()
  }

  function cycleSpeed() {
    const speeds = [0.75, 1, 1.25, 1.5]
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length]
    setPlaybackRate(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setProgress(pct || 0)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * audioRef.current.duration
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
          <Volume2 className="size-3.5" />
          <span>Audio Input</span>
        </div>

        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground hover:bg-copper-600"
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={replay}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
          </button>

          <div
            className="relative flex-1 h-2 rounded-full bg-border cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            type="button"
            onClick={cycleSpeed}
            className="rounded border border-border px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Original Transcript</p>
          <p className="text-sm leading-relaxed text-foreground">{transcript}</p>
        </div>
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs font-medium text-accent mb-2">AI Interpretation</p>
          <p className="text-sm leading-relaxed text-foreground">{aiInterpretation}</p>
        </div>
      </div>
    </div>
  )
}
