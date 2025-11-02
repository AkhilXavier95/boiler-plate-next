# -----------------------------
# Stage 1: Dependencies
# -----------------------------
    FROM node:20-alpine AS deps

    # Add libc6 for better compatibility with native modules
    RUN apk add --no-cache libc6-compat
    
    WORKDIR /app
    
    # Copy and install dependencies
    COPY package.json package-lock.json* ./
    RUN npm ci  # Install all dependencies (including dev) for build
    
    
    # -----------------------------
    # Stage 2: Builder
    # -----------------------------
    FROM node:20-alpine AS builder
    
    WORKDIR /app
    
    # Copy installed node_modules
    COPY --from=deps /app/node_modules ./node_modules
    
    # Copy all source files
    COPY . .
    
    # Dummy env vars for Prisma + Next build
    ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
    ENV NEXTAUTH_SECRET="dummy-build-secret"
    ENV NEXTAUTH_URL="http://localhost:3000"
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # ✅ Generate Prisma client (without engines to reduce build size)
    # Using config file to respect prisma.config.ts settings
    RUN npx prisma generate --no-engine --config prisma.config.ts
    
    # ✅ Build Next.js (standalone output)
    # Note: npm run build will also run prisma generate, but it's idempotent
    RUN npm run build
    
    
    # -----------------------------
    # Stage 3: Runner
    # -----------------------------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV PORT=3000
    ENV HOSTNAME="0.0.0.0"
    
    # Create non-root user
    RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
    
    # Install only Prisma CLI globally for migration support
    RUN npm install -g prisma@^6.18.0
    
    # Copy files from builder
    COPY --from=builder --chown=nextjs:nodejs /app/public ./public
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    # Prisma schema and config for migrations
    # Note: Prisma Client is already included in .next/standalone/node_modules
    COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
    COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
    
    USER nextjs
    
    # Expose port
    EXPOSE 3000
    
    # Default command
    CMD ["node", "server.js"]
    