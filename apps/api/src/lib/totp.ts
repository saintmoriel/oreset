import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from '../config/env'

// Time-based one-time passwords (RFC 6238), 6 digits, 30 second step,
// HMAC-SHA1, which is what Google Authenticator, Authy, 1Password and
// Microsoft Authenticator all expect. No dependency.

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_SECONDS = 30
const DIGITS = 6

export function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    value = (value << 5) | BASE32.indexOf(ch)
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

export function generateSecret(): string {
  return base32Encode(randomBytes(20))
}

function hotp(secretBase32: string, counter: number): string {
  const key = base32Decode(secretBase32)
  const msg = Buffer.alloc(8)
  msg.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  msg.writeUInt32BE(counter >>> 0, 4)
  const digest = createHmac('sha1', key).update(msg).digest()
  const offset = digest[digest.length - 1] & 0xf
  const code =
    ((digest[offset] & 0x7f) << 24) | ((digest[offset + 1] & 0xff) << 16) | ((digest[offset + 2] & 0xff) << 8) | (digest[offset + 3] & 0xff)
  return String(code % 10 ** DIGITS).padStart(DIGITS, '0')
}

export function currentCode(secretBase32: string, at = Date.now()): string {
  return hotp(secretBase32, Math.floor(at / 1000 / STEP_SECONDS))
}

// Accept the current step and one either side, which tolerates clock drift
// of up to 30 seconds on the phone.
export function verifyCode(secretBase32: string, code: string, at = Date.now()): boolean {
  const cleaned = code.replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleaned)) return false
  const counter = Math.floor(at / 1000 / STEP_SECONDS)
  for (const delta of [0, -1, 1]) {
    const expected = hotp(secretBase32, counter + delta)
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(cleaned))) return true
  }
  return false
}

export function otpauthUrl(secretBase32: string, accountName: string, issuer = 'Oreset'): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`
}

// Secrets at rest are encrypted with a key derived from the token secret,
// so a database dump alone does not yield working authenticator seeds.
function encryptionKey(): Buffer {
  return createHash('sha256').update(`totp:${env.ACCESS_TOKEN_SECRET}`).digest()
}

export function encryptSecret(secretBase32: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const enc = Buffer.concat([cipher.update(secretBase32, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64url')}.${enc.toString('base64url')}.${tag.toString('base64url')}`
}

export function decryptSecret(stored: string): string {
  const [ivB, encB, tagB] = stored.split('.')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivB, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagB, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encB, 'base64url')), decipher.final()]).toString('utf8')
}

// Recovery codes: ten, shown once, stored hashed. Format xxxx-xxxx.
export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const raw = randomBytes(5).toString('hex') // 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`
  })
}

export function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(code.replace(/\s+/g, '').toLowerCase()).digest('hex')
}

// A short-lived token proving the password step passed, so the code step
// can finish the sign-in without re-sending the password.
const MFA_TOKEN_TTL_MS = 5 * 60 * 1000

export function signMfaToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + MFA_TOKEN_TTL_MS, purpose: 'mfa' })).toString('base64url')
  const sig = createHmac('sha256', `mfa:${env.ACCESS_TOKEN_SECRET}`).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyMfaToken(token: string): { sub: string } | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', `mfa:${env.ACCESS_TOKEN_SECRET}`).update(payload).digest('base64url')
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub: string; exp: number; purpose: string }
    if (data.purpose !== 'mfa' || data.exp < Date.now()) return null
    return { sub: data.sub }
  } catch {
    return null
  }
}
