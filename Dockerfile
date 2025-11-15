# Backend Dockerfile cho An Minh Business System
FROM node:18-alpine AS backend

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (use npm install to respect updated lock state)
RUN npm install --omit=dev --ignore-scripts

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]

