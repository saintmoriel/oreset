import { createHash, randomBytes } from 'node:crypto'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/client'
import { apiTokens } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { TOKEN_PREFIX } from '../../middleware/auth'

export const TOKEN_SCOPES = ['regressions:read', 'findings:read', 'scenarios:read'] as const

export async function listTokens(userId: string) {
  const rows = await db.query.apiTokens.findMany({
    where: eq(apiTokens.userId, userId),
    orderBy: desc(apiTokens.createdAt),
  })
  return rows.map(({ tokenHash: _hash, ...t }) => t)
}

export async function createToken(userId: string, input: { name: string; expiresInDays?: number }) {
  const active = await db.query.apiTokens.findMany({
    where: and(eq(apiTokens.userId, userId), isNull(apiTokens.revokedAt)),
    columns: { id: true },
  })
  if (active.length >= 10) throw new HttpError(409, 'too_many_tokens', 'You already have 10 active tokens. Revoke one first.')

  const secret = `${TOKEN_PREFIX}${randomBytes(24).toString('base64url')}`
  const [row] = await db
    .insert(apiTokens)
    .values({
      userId,
      name: input.name,
      tokenPrefix: secret.slice(0, 12),
      tokenHash: createHash('sha256').update(secret).digest('hex'),
      scopes: [...TOKEN_SCOPES],
      expiresAt: input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 86_400_000) : null,
    })
    .returning()

  await writeAuditLog({
    actorId: userId,
    actorLabel: userId,
    actorRole: 'buyer',
    action: 'api_token.created',
    resourceType: 'api_token',
    resourceId: row.id,
    metadata: { name: input.name, expiresAt: row.expiresAt },
  })

  const { tokenHash: _hash, ...token } = row
  // The only time the plaintext ever leaves the server.
  return { token, secret }
}

export async function revokeToken(userId: string, tokenId: string) {
  const row = await db.query.apiTokens.findFirst({ where: and(eq(apiTokens.id, tokenId), eq(apiTokens.userId, userId)) })
  if (!row) throw new HttpError(404, 'not_found', 'Token not found.')
  if (row.revokedAt) return row

  const [updated] = await db.update(apiTokens).set({ revokedAt: new Date() }).where(eq(apiTokens.id, tokenId)).returning()
  await writeAuditLog({
    actorId: userId,
    actorLabel: userId,
    actorRole: 'buyer',
    action: 'api_token.revoked',
    resourceType: 'api_token',
    resourceId: tokenId,
  })
  return updated
}
