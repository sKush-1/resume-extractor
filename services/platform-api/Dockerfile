FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy service package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Expose port
EXPOSE 4000

# Start with tsx for development
CMD ["pnpm", "dev"]
