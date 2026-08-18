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
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid environment configuration:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment configuration — see errors above')
  }
  return parsed.data
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === 'production'
