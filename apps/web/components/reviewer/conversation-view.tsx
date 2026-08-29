'use client'

import { Bot, User, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversationTurn } from '@/lib/types/case'

export function ConversationView({
  turns,
  aiDecisionSummary,
}: {
  turns: ConversationTurn[]
  aiDecisionSummary: string
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4 max-h-[400px] overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground mb-4">Conversation Thread</p>

        <div className="space-y-3">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={cn(
                'flex gap-3 rounded-lg p-3',
                turn.role === 'customer' && 'bg-secondary/60',
                turn.role === 'ai' && 'bg-accent/5 border border-accent/20',
                turn.role === 'agent' && 'bg-muted',
                turn.isDecisionPoint && 'ring-2 ring-warning/50',
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card border border-border">
                {turn.role === 'customer' && <User className="size-3.5 text-muted-foreground" />}
                {turn.role === 'ai' && <Bot className="size-3.5 text-accent" />}
                {turn.role === 'agent' && <User className="size-3.5 text-foreground" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase text-muted-foreground">
                    {turn.role === 'customer' ? 'Customer' : turn.role === 'ai' ? 'AI System' : 'Agent'}
                  </span>
                  {turn.language && (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {turn.language}
                    </span>
                  )}
                  {turn.isDecisionPoint && (
                    <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                      <AlertTriangle className="size-2.5" />
                      Decision point
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{turn.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-accent mb-2">
          <Bot className="size-3.5" />
          <span>AI Decision Summary</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">{aiDecisionSummary}</p>
      </div>
    </div>
  )
}
