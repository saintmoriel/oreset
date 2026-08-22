'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { listPrompts, createPrompt, updatePrompt, deletePrompt, type Prompt } from '@/lib/api/endpoints/prompts'
import { ApiError } from '@/lib/api/client'

export function PromptsForgeClient({ batchId }: { batchId: string }) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    listPrompts(batchId)
      .then((res) => setPrompts(res.prompts))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load prompts.'))
  }, [batchId])

  async function onAdd() {
    if (!newContent.trim()) return
    setAdding(true)
    setError(null)
    try {
      const { prompt } = await createPrompt(batchId, newContent.trim())
      setPrompts((p) => [...(p ?? []), prompt])
      setNewContent('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add that prompt.')
    } finally {
      setAdding(false)
    }
  }

  function startEdit(prompt: Prompt) {
    setEditingId(prompt.id)
    setEditContent(prompt.content)
  }

  async function saveEdit(id: string) {
    if (!editContent.trim()) return
    try {
      const { prompt } = await updatePrompt(id, editContent.trim())
      setPrompts((p) => (p ?? []).map((item) => (item.id === id ? prompt : item)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save that edit.')
    }
  }

  async function onDelete(id: string) {
    try {
      await deletePrompt(id)
      setPrompts((p) => (p ?? []).filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete that prompt.')
    }
  }

  if (error && !prompts) {
    return <p className="mt-6 text-body-sm text-destructive">{error}</p>
  }

  if (!prompts) {
    return (
      <div className="mt-6 flex justify-center py-10">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-4 text-caption text-destructive" role="alert">
          {error}
        </p>
      )}

      {prompts.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">No prompts authored yet.</p>
      ) : (
        <ol className="divide-y divide-border/70 border-y border-border/70">
          {prompts.map((prompt, i) => (
            <li key={prompt.id} className="flex items-start gap-3 py-3.5">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-caption font-semibold text-muted-foreground">
                {i + 1}
              </span>
              {editingId === prompt.id ? (
                <div className="flex-1 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-lg border border-accent/50 bg-background px-3 py-2 text-body-sm outline-none focus-visible:ring-3 focus-visible:ring-accent/20"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(prompt.id)}
                      className="inline-flex items-center gap-1 text-caption font-semibold text-success"
                    >
                      <Check className="size-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 text-caption font-semibold text-muted-foreground"
                    >
                      <X className="size-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-body-sm text-foreground">{prompt.content}</p>
                  <button
                    onClick={() => startEdit(prompt)}
                    aria-label="Edit prompt"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => onDelete(prompt.id)}
                    aria-label="Delete prompt"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 flex gap-2">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Add a new prompt…"
          rows={2}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-body-sm outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20"
        />
        <button
          onClick={onAdd}
          disabled={adding || !newContent.trim()}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-4" />
          Add
        </button>
      </div>
    </div>
  )
}
