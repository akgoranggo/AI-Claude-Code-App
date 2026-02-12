# Build stage
FROM node:20-alpine AS builder

# Build argument for application version (defaults to 1.0.0)
ARG APP_VERSION=1.0.0

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Pass build arg to production stage
ARG APP_VERSION=1.0.0

WORKDIR /app

# Set environment variable for application version
ENV APP_VERSION=${APP_VERSION}

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install curl for health checks (not included in alpine by default)
RUN apk add --no-cache curl

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check using readiness endpoint (includes database connectivity)
# Increased start-period to allow time for database connection setup
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health/ready || exit 1

# Start the application
CMD ["node", "dist/index.js"]
