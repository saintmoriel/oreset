import { createHash } from 'node:crypto'
import { db } from '../../db/client'
import { consentRecords, type ConsentRecord } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'

const CONSENT_TEXT_VERSION = 'v1'

type RecordConsentInput = {
  contributorId: string
  batchId?: string
  ip?: string
}

export async function recordConsent(input: RecordConsentInput): Promise<ConsentRecord> {
  const consentedAt = new Date()

  // sha256 of the material facts of this consent event — the cryptographic
  // fingerprint from the compliance brief, binding consent permanently to
  // this session at the moment of opt-in.
  const consentHash = createHash('sha256')
    .update(`${input.contributorId}|${input.batchId ?? ''}|${CONSENT_TEXT_VERSION}|${consentedAt.toISOString()}`)
    .digest('hex')

  const [record] = await db
    .insert(consentRecords)
    .values({
      contributorId: input.contributorId,
      batchId: input.batchId,
      consentTextVersion: CONSENT_TEXT_VERSION,
      consentedAt,
      consentHash,
      ip: input.ip,
    })
    .returning()

  await writeAuditLog({
    actorId: input.contributorId,
    actorLabel: input.contributorId,
    actorRole: 'Contributor',
    action: 'consent.recorded',
    resourceType: 'consent_record',
    resourceId: record.id,
  })

  return record
}
