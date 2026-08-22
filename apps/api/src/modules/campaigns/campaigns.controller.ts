import type { Request, Response } from 'express'
import { z } from 'zod'
import { MEDIA_TYPES } from '@oreset/shared'
import * as campaignsService from './campaigns.service'
import { writeAuditLog } from '../../lib/audit'

const createCampaignSchema = z.object({
  title: z.string().min(1),
  mediaType: z.enum(MEDIA_TYPES),
  language: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  itemCount: z.number().int().positive(),
  payRateMinorUnits: z.number().int().nonnegative(),
  cohort: z.string().min(1).optional(),
  materials: z.record(z.unknown()).optional(),
})

export async function list(_req: Request, res: Response) {
  const campaigns = await campaignsService.listCampaigns()
  res.status(200).json({ campaigns })
}

export async function create(req: Request, res: Response) {
  const body = createCampaignSchema.parse(req.body)
  const { campaign, batch } = await campaignsService.launchCampaign({
    ...body,
    createdBy: req.user!.sub,
  })

  // Written after the transaction resolves, not inside it — writeAuditLog
  // uses the module-level db, not a tx handle, so it can't participate in
  // the same transaction anyway.
  await writeAuditLog({
    actorId: req.user!.sub,
    actorLabel: req.user!.sub,
    actorRole: req.user!.staffRole ?? 'staff',
    action: 'campaign.launched',
    resourceType: 'campaign',
    resourceId: campaign.id,
    metadata: { batchId: batch.id, title: campaign.title },
  })

  res.status(201).json({ campaign, batch })
}
