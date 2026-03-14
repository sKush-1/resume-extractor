FROM node:20-alpine

WORKDIR /app

# Copy monorepo root and package files
COPY package.json ./
COPY packages/ ./packages/
COPY services/api-gateway/package.json ./services/api-gateway/

# Install dependencies
RUN npm install --workspace=services/api-gateway

# Copy service source
COPY services/api-gateway/ ./services/api-gateway/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["node", "services/api-gateway/src/index.js"]
