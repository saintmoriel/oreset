import type { MediaType } from '@oreset/shared'
import { apiFetch, ApiError } from '../client'

export function presignUpload(input: { batchId: string; mediaType: MediaType; mimeType: string }) {
  return apiFetch<{ uploadUrl: string; storageKey: string }>('/api/v1/uploads', {
    method: 'POST',
    body: input,
  })
}

// Deliberately not routed through apiFetch — apiFetch always JSON-encodes
// its body, which is wrong for a raw binary PUT. Also has to look
// identical whether uploadUrl is the local dev endpoint or a real future
// R2 presigned URL — a plain fetch is exactly what a presigned PUT needs.
export async function uploadFile(uploadUrl: string, blob: Blob): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': blob.type || 'application/octet-stream' },
  })
  if (!res.ok) {
    throw new ApiError(res.status, 'upload_failed', 'Upload failed. Please try again.')
  }
}
