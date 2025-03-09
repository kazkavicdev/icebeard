# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY .env.example ./.env
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R node:node /app/data

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --only=production
RUN npx prisma generate

USER node

EXPOSE 3000

CMD ["node", "server.js"] 