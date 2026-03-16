FROM node:20-alpine

WORKDIR /app

# Copy root and package files
COPY package.json ./
COPY services/client-service/package.json ./services/client-service/

# Install dependencies
RUN npm install --workspace=services/client-service

# Copy service source
COPY services/client-service/ ./services/client-service/

WORKDIR /app/services/client-service

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "-p", "3000"]
