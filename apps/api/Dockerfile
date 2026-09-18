# Oreset API. Build from the repository root:
#   docker build -f apps/api/Dockerfile -t oreset-api .
# Railway, Render, and Fly all accept this file as-is.

# ---------- build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# argon2 compiles a native module; these are its build tools.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
# Pinned to the version that wrote pnpm-lock.yaml. pnpm 12 changed where
# workspace settings live and rejects this lockfile under --frozen-lockfile.
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

# Workspace manifests first so the install layer caches across code changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @oreset/shared --filter @oreset/api

COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @oreset/shared build && pnpm --filter @oreset/api build

# ---------- run ----------
FROM node:22-bookworm-slim
WORKDIR /app/apps/api
ENV NODE_ENV=production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages/shared/package.json /app/packages/shared/package.json
COPY --from=build /app/packages/shared/dist /app/packages/shared/dist
COPY --from=build /app/packages/shared/node_modules /app/packages/shared/node_modules
COPY --from=build /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
# migrate.js reads ./src/db/migrations relative to the working directory.
COPY --from=build /app/apps/api/src/db/migrations ./src/db/migrations

EXPOSE 4000
# Migrate, make sure an admin exists, then serve. Each step is idempotent.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/bootstrap-admin.js && node dist/index.js"]

# deploy trigger: 2026-09-18T15:00Z
