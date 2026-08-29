'use client'

import type { CaseInput } from '@/lib/types/case'
import { AudioPlayer } from './audio-player'
import { TextComparison } from './text-comparison'
import { DocumentViewer } from './document-viewer'
import { ConversationView } from './conversation-view'

export function MediaPanel({
  input,
  onReplay,
}: {
  input: CaseInput
  onReplay?: () => void
}) {
  switch (input.type) {
    case 'audio':
      return (
        <AudioPlayer
          audioUrl={input.audioUrl}
          transcript={input.transcript}
          aiInterpretation={input.aiInterpretation}
          onReplay={onReplay}
        />
      )
    case 'text':
      return (
        <TextComparison
          originalText={input.originalText}
          aiInterpretation={input.aiInterpretation}
        />
      )
    case 'document':
      return (
        <DocumentViewer
          imageUrl={input.imageUrl}
          aiExtraction={input.aiExtraction}
        />
      )
    case 'conversation':
      return (
        <ConversationView
          turns={input.turns}
          aiDecisionSummary={input.aiDecisionSummary}
        />
      )
  }
}
