# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo config
COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY services/client-service/package.json ./services/client-service/

# Install dependencies
RUN npm install --workspace=services/client-service

# Copy source
COPY services/client-service/ ./services/client-service/

# Set env for build (if needed, but usually passed via compose)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app/services/client-service
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/services/client-service/package.json ./services/client-service/
COPY --from=builder /app/services/client-service/.next ./services/client-service/.next
COPY --from=builder /app/services/client-service/public ./services/client-service/public
COPY --from=builder /app/services/client-service/next.config.mjs ./services/client-service/

# Install production dependencies
RUN npm install --workspace=services/client-service --omit=dev

WORKDIR /app/services/client-service
EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "run", "start", "--", "-p", "3000"]
