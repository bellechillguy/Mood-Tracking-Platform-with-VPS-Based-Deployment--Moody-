# Moody — Multi-stage Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy application source (node_modules dari host diabaikan via .dockerignore)
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY uploads/ ./uploads/ 
COPY .env* ./

# Force rebuild native addons untuk Linux (fix: macOS-compiled binaries di node_modules)
RUN cd backend && npm rebuild better-sqlite3

# Create uploads directory
RUN mkdir -p uploads
# Create persistent data directory for the SQLite DB
RUN mkdir -p /app/data

# Expose app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/quote || exit 1

# Start backend server
CMD ["node", "backend/server.js"]