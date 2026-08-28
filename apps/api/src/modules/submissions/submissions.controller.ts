import type { Request, Response } from 'express'
import { z } from 'zod'
import { MEDIA_TYPES } from '@oreset/shared'
import * as submissionsService from './submissions.service'

const createSubmissionSchema = z.object({
  batchId: z.string().uuid(),
  consentRecordId: z.string().uuid(),
  mediaType: z.enum(MEDIA_TYPES),
  storageKey: z.string().min(1),
  fileSizeBytes: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  durationSeconds: z.number().nonnegative().optional(),
  imageMetadata: z.record(z.unknown()).optional(),
  capturedAt: z.coerce.date(),
  deviceInfo: z.record(z.unknown()),
  geoLocation: z.record(z.unknown()).optional(),
})

export async function create(req: Request, res: Response) {
  const body = createSubmissionSchema.parse(req.body)
  const result = await submissionsService.createSubmission({
    ...body,
    contributorId: req.user!.sub,
  })
  res.status(201).json(result)
}

export async function listMine(req: Request, res: Response) {
  const submissions = await submissionsService.listMySubmissions(req.user!.sub)
  res.status(200).json({ submissions })
}
