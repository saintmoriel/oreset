import { promises as fs } from 'node:fs'
import path from 'node:path'
import { env } from '../../config/env'
import { HttpError } from '../../middleware/error-handler'
import type { StorageProvider } from './storage.provider'

const UPLOADS_DIR = path.join(process.cwd(), '.uploads')

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
// contributors/{uuid}/{uuid}/{uuid}.{ext} — matches the key shape minted by
// uploads.service.ts. Validated before any disk access, independent of how
// hard the key already is to guess — defense in depth against traversal.
const KEY_PATTERN = new RegExp(`^contributors/${UUID}/${UUID}/${UUID}\\.[a-z0-9]+$`)

function assertValidKey(key: string): void {
  if (!KEY_PATTERN.test(key)) {
    throw new HttpError(400, 'invalid_key', 'Invalid storage key.')
  }
}

export async function writeLocalUpload(key: string, body: Buffer): Promise<void> {
  assertValidKey(key)
  const filePath = path.join(UPLOADS_DIR, key)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, body)
}

export async function readLocalUpload(key: string): Promise<Buffer> {
  assertValidKey(key)
  const filePath = path.join(UPLOADS_DIR, key)
  try {
    return await fs.readFile(filePath)
  } catch {
    throw new HttpError(404, 'not_found', 'File not found.')
  }
}

// Local-only helper, not part of StorageProvider — mirrors how
// DevConsoleOtpProvider has plumbing (console.log) that OtpProvider's
// interface doesn't need to know about.
export class LocalDiskStorageProvider implements StorageProvider {
  async createUploadUrl(key: string): Promise<string> {
    return `${env.API_PUBLIC_URL}/api/v1/uploads/local/${key}`
  }

  async createDownloadUrl(key: string): Promise<string> {
    return `${env.API_PUBLIC_URL}/api/v1/uploads/local/${key}`
  }

  async deleteFile(key: string): Promise<void> {
    assertValidKey(key)
    const filePath = path.join(UPLOADS_DIR, key)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      // Already gone (e.g. a re-run sweep) — not an error condition.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
    }
  }
}
