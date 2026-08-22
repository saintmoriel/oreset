import type { Request, Response } from 'express'
import { z } from 'zod'
import { MEDIA_TYPES } from '@oreset/shared'
import * as uploadsService from './uploads.service'
import { writeLocalUpload, readLocalUpload } from './local-disk-storage.provider'

const presignSchema = z.object({
  batchId: z.string().uuid(),
  mediaType: z.enum(MEDIA_TYPES),
  mimeType: z.string().min(1),
})

const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
}

export async function presign(req: Request, res: Response) {
  const body = presignSchema.parse(req.body)
  const result = await uploadsService.presignUpload({ ...body, contributorId: req.user!.sub })
  res.status(200).json(result)
}

export async function putLocal(req: Request, res: Response) {
  const key = req.params.key
  const body = req.body as Buffer
  if (!Buffer.isBuffer(body) || body.length === 0) {
    res.status(400).json({ error: { code: 'empty_body', message: 'No file data received.' } })
    return
  }
  await writeLocalUpload(key, body)
  res.status(200).json({ ok: true })
}

export async function getLocal(req: Request, res: Response) {
  const key = req.params.key
  const buffer = await readLocalUpload(key)
  const ext = key.split('.').pop() ?? ''
  res.setHeader('Content-Type', EXTENSION_CONTENT_TYPE[ext] ?? 'application/octet-stream')
  res.status(200).send(buffer)
}
