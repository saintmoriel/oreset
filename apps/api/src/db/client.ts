import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/env'
import * as schema from './schema'

// Standard Postgres wire protocol via node-postgres — works against local
// Postgres, Docker, Neon, Railway, RDS, or anything else speaking normal
// Postgres. apps/api is a persistent Express process (not an edge
// function), so there's no reason to depend on Neon's proprietary
// WebSocket-proxy driver, which only local Postgres can't speak.
const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })
