import { randomUUID } from 'node:crypto'
import type { MediaType } from '@oreset/shared'
import { env } from '../../config/env'
import { LocalDiskStorageProvider } from './local-disk-storage.provider'
import type { StorageProvider } from './storage.provider'

// Mirrors auth.service.ts's `const otpProvider: OtpProvider = new
// DevConsoleOtpProvider()` — provider selection stays a one-line switch,
// no separate config-file abstraction. R2StorageProvider isn't implemented
// yet; when it is, it plugs in here via @aws-sdk/client-s3 +
// @aws-sdk/s3-request-presigner, same interface, no other file changes.
const storageProvider: StorageProvider =
  env.STORAGE_PROVIDER === 'r2'
    ? (() => {
        throw new Error('R2StorageProvider not implemented yet — set STORAGE_PROVIDER=local')
      })()
    : new LocalDiskStorageProvider()

const EXTENSION_BY_MIME: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

function extensionFor(mimeType: string): string {
  return EXTENSION_BY_MIME[mimeType] ?? mimeType.split('/')[1]?.replace(/[^a-z0-9]/gi, '') ?? 'bin'
}

export async function presignUpload(input: {
  contributorId: string
  batchId: string
  mediaType: MediaType
  mimeType: string
}): Promise<{ uploadUrl: string; storageKey: string }> {
  const ext = extensionFor(input.mimeType)
  const storageKey = `contributors/${input.contributorId}/${input.batchId}/${randomUUID()}.${ext}`
  const uploadUrl = await storageProvider.createUploadUrl(storageKey, input.mimeType)
  return { uploadUrl, storageKey }
}

export async function getDownloadUrl(storageKey: string): Promise<string> {
  return storageProvider.createDownloadUrl(storageKey)
}

export async function deleteFile(storageKey: string): Promise<void> {
  return storageProvider.deleteFile(storageKey)
}
