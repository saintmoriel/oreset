import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ACCESS_TOKEN_SECRET: z.string().min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  // Comma-separated list of allowed origins for CORS (the apps/web origin(s)).
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  STORAGE_PROVIDER: z.enum(['local', 'r2']).default('local'),
  // Base URL this server is reachable at — used to build absolute
  // local-upload PUT/GET URLs. Left unset by default and derived from PORT
  // below, so it can't silently drift out of sync with the port actually
  // in use (a hardcoded static default here was a real footgun once).
  API_PUBLIC_URL: z.string().optional(),
  // Real (deterministic, not ML) validation microservice — see apps/validation.
  // Falls back to the local stub if this isn't reachable, so local dev works
  // without remembering to start a second process.
  VALIDATION_SERVICE_URL: z.string().default('http://localhost:8001'),
  // Business/legal policy number this scaffold cannot responsibly invent —
  // a clearly-labeled placeholder, same spirit as Foundry's placeholder
  // lesson content.
  MEDIA_RETENTION_DAYS: z.coerce.number().default(90),
  PAYMENT_PROVIDER: z.enum(['dev-stub', 'paystack', 'flutterwave']).default('dev-stub'),
  FLW_SECRET_KEY: z.string().optional(),
  FLW_WEBHOOK_HASH: z.string().optional(),
})

export type Env = z.infer<typeof envSchema> & { API_PUBLIC_URL: string }

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid environment configuration:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment configuration — see errors above')
  }
  return {
    ...parsed.data,
    API_PUBLIC_URL: parsed.data.API_PUBLIC_URL ?? `http://localhost:${parsed.data.PORT}`,
  }
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === 'production'
