import { desc } from 'drizzle-orm'
import type { MediaType } from '@oreset/shared'
import { db } from '../../db/client'
import { campaigns, batches } from '../../db/schema'

export async function listCampaigns() {
  return db.query.campaigns.findMany({ orderBy: desc(campaigns.createdAt), with: { batches: true } })
}

export async function launchCampaign(input: {
  title: string
  mediaType: MediaType
  language?: string
  domain?: string
  itemCount: number
  payRateMinorUnits: number
  cohort?: string
  materials?: Record<string, unknown>
  createdBy: string
}) {
  // First transaction in the codebase: creates the campaign and its paired
  // batch atomically — both or neither, so Launch never leaves a campaign
  // with no batch (or vice versa) if something fails partway.
  return db.transaction(async (tx) => {
    const [campaign] = await tx
      .insert(campaigns)
      .values({
        title: input.title,
        status: 'live',
        mediaType: input.mediaType,
        language: input.language,
        domain: input.domain,
        payRateMinorUnits: input.payRateMinorUnits,
        cohort: input.cohort,
        materials: input.materials,
        createdBy: input.createdBy,
        launchedAt: new Date(),
      })
      .returning()

    const [batch] = await tx
      .insert(batches)
      .values({
        campaignId: campaign.id,
        type: input.mediaType,
        title: campaign.title,
        itemCount: input.itemCount,
        rateMinorUnits: input.payRateMinorUnits,
        status: 'available',
      })
      .returning()

    return { campaign, batch }
  })
}
