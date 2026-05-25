# Moody — Multi-stage Dockerfile
FROM node:20-alpine AS /Users/nisrinaayz/Downloads/face-head-bandage.pngbase
WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy application source
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY .env* ./

# Create uploads directory
RUN mkdir -p uploads

# Expose app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/quote || exit 1

# Start backend server
CMD ["node", "backend/server.js"]
