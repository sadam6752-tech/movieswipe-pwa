# ============================================================================
# Stage 1: Builder
# ============================================================================
# This stage compiles the React application and installs dependencies.
# It uses Node.js Alpine for a lightweight build environment.
# ============================================================================

FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY movieswipe-pwa/package*.json ./

# Install dependencies
# Using --legacy-peer-deps to handle peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY movieswipe-pwa/ .

# Build React application
# This creates the optimized production build in /app/dist
RUN npm run build

# ============================================================================
# Stage 2: Runtime
# ============================================================================
# This stage serves the compiled application using Nginx.
# It contains only the necessary runtime files, resulting in a minimal image.
# ============================================================================

FROM nginx:alpine

# Install bash and utilities for interactive shell access
RUN apk add --no-cache bash curl wget

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy nginx configuration (replaces default)
COPY docker/movieswipe-pwa/nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist .

# Copy scripts and dependencies for data synchronization
COPY --from=builder /app/scripts /app/scripts
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules

# Create data directory for sync operations
RUN mkdir -p /app/public/data

# Create non-root user for security
# This prevents the container from running as root
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set ownership of nginx directories to appuser
RUN chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid && \
    chown -R appuser:appuser /app

# Copy entrypoint script and set permissions (before switching user)
COPY docker/movieswipe-pwa/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && \
    chown appuser:appuser /entrypoint.sh

# Switch to non-root user
USER appuser

# Expose port 3000
# Note: Nginx will listen on this port as configured in nginx.conf
EXPOSE 3000

# Health check configuration
# Verifies that the web server is responding to HTTP requests
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Use entrypoint script for flexible execution
ENTRYPOINT ["/entrypoint.sh"]

# Start nginx in foreground mode
# This keeps the container running and allows Docker to manage the process
CMD ["nginx", "-g", "daemon off;"]

# ============================================================================
# Build Metadata
# ============================================================================
# Labels for image identification and documentation
LABEL maintainer="sadam6752-tech <sadam6752@gmail.com>"
LABEL description="Docker image for movieswipe-pwa React PWA application"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/sadam6752-tech/movieswipe-pwa"
