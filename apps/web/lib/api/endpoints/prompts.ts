import { apiFetch } from '../client'

export type Prompt = {
  id: string
  batchId: string
  content: string
  order: number
  createdAt: string
}

export function listPrompts(batchId: string) {
  return apiFetch<{ prompts: Prompt[] }>(`/api/v1/prompts/batch/${batchId}`)
}

export function createPrompt(batchId: string, content: string) {
  return apiFetch<{ prompt: Prompt }>(`/api/v1/prompts/batch/${batchId}`, {
    method: 'POST',
    body: { content },
  })
}

export function updatePrompt(id: string, content: string) {
  return apiFetch<{ prompt: Prompt }>(`/api/v1/prompts/${id}`, {
    method: 'PATCH',
    body: { content },
  })
}

export function deletePrompt(id: string) {
  return apiFetch<void>(`/api/v1/prompts/${id}`, { method: 'DELETE' })
}
