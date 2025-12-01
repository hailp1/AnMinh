# ===================================
# Backend Dockerfile cho DMS System
# ===================================
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    postgresql-client

# Copy package files
COPY package*.json ./

# Install dependencies first (without prisma)
RUN npm ci --only=production --ignore-scripts || npm install --only=production --ignore-scripts

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate || echo "Prisma generate skipped"

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:5000/api || exit 1

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
