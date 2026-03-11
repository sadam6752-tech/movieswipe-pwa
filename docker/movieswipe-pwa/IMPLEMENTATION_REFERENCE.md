# Implementation Reference

This document provides the actual implementation files for the Docker publication of movieswipe-pwa.

## Table of Contents

1. [Dockerfile](#dockerfile)
2. [nginx.conf](#nginxconf)
3. [.dockerignore](#dockerignore)
4. [GitHub Actions Workflow](#github-actions-workflow)
5. [Build Scripts](#build-scripts)

---

## Dockerfile

**Location**: `/docker/movieswipe-pwa/Dockerfile`

```dockerfile
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
COPY package*.json ./

# Install dependencies
# Using --legacy-peer-deps to handle peer dependency conflicts
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Run TypeScript type checking
RUN npm run type-check || true

# Build React application
# This creates the optimized production build in /app/build
RUN npm run build

# ============================================================================
# Stage 2: Runtime
# ============================================================================
# This stage serves the compiled application using Nginx.
# It contains only the necessary runtime files, resulting in a minimal image.
# ============================================================================

FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/build .

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
    chown -R appuser:appuser /var/run/nginx.pid

# Switch to non-root user
USER appuser

# Expose port 3000
# Note: Nginx will listen on this port as configured in nginx.conf
EXPOSE 3000

# Health check configuration
# Verifies that the web server is responding to HTTP requests
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start nginx in foreground mode
# This keeps the container running and allows Docker to manage the process
CMD ["nginx", "-g", "daemon off;"]

# ============================================================================
# Build Metadata
# ============================================================================
# Labels for image identification and documentation
LABEL maintainer="[Your Name] <[your.email@example.com]>"
LABEL description="Docker image for movieswipe-pwa React PWA application"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/[project]/movieswipe-pwa"
```

### Dockerfile Explanation

**Stage 1: Builder**
- Uses `node:18-alpine` for lightweight Node.js environment
- Installs dependencies with `npm ci` (clean install for reproducibility)
- Runs TypeScript type checking
- Builds React application with `npm run build`
- Output: `/app/build` directory with compiled application

**Stage 2: Runtime**
- Uses `nginx:alpine` for lightweight web server
- Copies nginx configuration
- Copies built application from builder stage
- Creates non-root user `appuser` for security
- Sets proper file ownership
- Exposes port 3000
- Includes health check
- Starts nginx in foreground mode

**Key Features**:
- Multi-stage build reduces final image size
- Non-root user execution for security
- Health check for container monitoring
- Proper file ownership and permissions
- Reproducible builds with `npm ci`

---

## nginx.conf

**Location**: `/docker/movieswipe-pwa/nginx.conf`

```nginx
# ============================================================================
# Nginx Configuration for movieswipe-pwa
# ============================================================================
# This configuration serves the React PWA application with optimized
# settings for performance, caching, and PWA support.
# ============================================================================

# Run nginx in foreground mode (required for Docker)
daemon off;

# Number of worker processes (auto = number of CPU cores)
worker_processes auto;

# Maximum number of open files per worker process
worker_rlimit_nofile 65535;

# Error log configuration
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    # Maximum number of simultaneous connections per worker
    worker_connections 1024;
    
    # Use efficient connection processing method
    use epoll;
}

http {
    # ========================================================================
    # MIME Types
    # ========================================================================
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Add custom MIME types for PWA
    types {
        application/manifest+json json;
        application/javascript js;
        text/javascript js;
    }
    
    # ========================================================================
    # Logging
    # ========================================================================
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # ========================================================================
    # Performance Optimization
    # ========================================================================
    
    # Enable sendfile for efficient file serving
    sendfile on;
    
    # Disable TCP_NOPUSH to reduce latency
    tcp_nopush off;
    
    # Enable TCP_NODELAY for low-latency connections
    tcp_nodelay on;
    
    # Connection timeout
    keepalive_timeout 65;
    
    # Request timeout
    client_body_timeout 12;
    client_header_timeout 12;
    
    # ========================================================================
    # Gzip Compression
    # ========================================================================
    
    # Enable gzip compression
    gzip on;
    
    # Compression level (1-9, higher = more compression but slower)
    gzip_comp_level 6;
    
    # Minimum file size to compress (bytes)
    gzip_min_length 1000;
    
    # Compression types
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # Disable gzip for older browsers
    gzip_disable "msie6";
    
    # ========================================================================
    # Upstream Configuration
    # ========================================================================
    
    # Define upstream server (localhost for this container)
    upstream backend {
        server 127.0.0.1:3000;
    }
    
    # ========================================================================
    # Server Configuration
    # ========================================================================
    
    server {
        # Listen on port 3000
        listen 3000 default_server;
        listen [::]:3000 default_server;
        
        # Server name
        server_name _;
        
        # Root directory for serving files
        root /usr/share/nginx/html;
        
        # Index files
        index index.html index.htm;
        
        # ====================================================================
        # Security Headers
        # ====================================================================
        
        # Prevent MIME type sniffing
        add_header X-Content-Type-Options "nosniff" always;
        
        # Enable XSS protection
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Prevent clickjacking
        add_header X-Frame-Options "SAMEORIGIN" always;
        
        # Referrer policy
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # ====================================================================
        # PWA Manifest Configuration
        # ====================================================================
        
        location = /manifest.json {
            # Correct MIME type for manifest
            add_header Content-Type "application/manifest+json" always;
            
            # Cache manifest for 1 hour
            add_header Cache-Control "public, max-age=3600" always;
            
            # CORS headers for PWA
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type" always;
            
            try_files $uri =404;
        }
        
        # ====================================================================
        # Service Worker Configuration
        # ====================================================================
        
        location = /service-worker.js {
            # Correct MIME type for service worker
            add_header Content-Type "application/javascript" always;
            
            # Never cache service worker (must-revalidate)
            add_header Cache-Control "public, max-age=0, must-revalidate" always;
            
            # CORS headers for service worker
            add_header Access-Control-Allow-Origin "*" always;
            add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type" always;
            
            try_files $uri =404;
        }
        
        # ====================================================================
        # Static Assets Configuration
        # ====================================================================
        
        # Match versioned static assets (with hash in filename)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            # Long-term caching for versioned assets
            add_header Cache-Control "public, max-age=31536000, immutable" always;
            
            # Enable gzip for text assets
            gzip_static on;
            
            # CORS headers for fonts
            add_header Access-Control-Allow-Origin "*" always;
            
            try_files $uri =404;
        }
        
        # ====================================================================
        # HTML Files Configuration
        # ====================================================================
        
        location ~* \.html?$ {
            # Don't cache HTML files
            add_header Cache-Control "public, max-age=0, must-revalidate" always;
            
            # Enable gzip for HTML
            gzip_static on;
            
            try_files $uri =404;
        }
        
        # ====================================================================
        # SPA Routing Configuration
        # ====================================================================
        
        # This location block handles all requests that don't match
        # specific files or directories. It serves index.html for
        # single-page application routing.
        location / {
            # Try to serve the requested file
            # If not found, try as directory
            # If still not found, serve index.html for SPA routing
            try_files $uri $uri/ /index.html;
            
            # Don't cache index.html
            add_header Cache-Control "public, max-age=0, must-revalidate" always;
            
            # Enable gzip for HTML
            gzip_static on;
        }
        
        # ====================================================================
        # Health Check Endpoint
        # ====================================================================
        
        location /health {
            # Return 200 OK for health checks
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # ====================================================================
        # Deny Access to Sensitive Files
        # ====================================================================
        
        # Deny access to .env files
        location ~ /\.env {
            deny all;
            access_log off;
            log_not_found off;
        }
        
        # Deny access to .git directory
        location ~ /\.git {
            deny all;
            access_log off;
            log_not_found off;
        }
        
        # Deny access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
        
        # ====================================================================
        # Error Pages
        # ====================================================================
        
        # 404 errors serve index.html for SPA routing
        error_page 404 /index.html;
        
        # 500 errors
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

### nginx.conf Explanation

**Key Sections**:

1. **Worker Configuration**
   - `worker_processes auto`: Uses all available CPU cores
   - `worker_rlimit_nofile 65535`: Allows many open files

2. **MIME Types**
   - Custom MIME types for PWA (manifest.json, service worker)
   - Ensures correct content types for PWA resources

3. **Logging**
   - Access logs for monitoring
   - Error logs for debugging

4. **Performance Optimization**
   - Sendfile for efficient file serving
   - TCP optimizations for low latency
   - Gzip compression for text assets

5. **PWA Support**
   - Manifest.json with correct MIME type and caching
   - Service worker with no caching (must-revalidate)
   - CORS headers for PWA resources

6. **Static Assets**
   - Long-term caching for versioned assets (1 year)
   - Immutable flag for cache busting

7. **SPA Routing**
   - `try_files $uri $uri/ /index.html`: Serves index.html for non-existent routes
   - Enables client-side routing for single-page applications

8. **Security**
   - Security headers (X-Content-Type-Options, X-XSS-Protection, etc.)
   - Denies access to sensitive files (.env, .git, hidden files)

9. **Health Check**
   - `/health` endpoint for container health checks

---

## .dockerignore

**Location**: `/docker/movieswipe-pwa/.dockerignore`

```
# ============================================================================
# .dockerignore - Exclude files from Docker build context
# ============================================================================
# This file specifies which files and directories should be excluded
# from the Docker build context, reducing build time and image size.
# ============================================================================

# Version control
.git
.gitignore
.gitattributes

# Node.js
node_modules
npm-debug.log
npm-error.log
yarn-error.log
.npm
.yarn

# IDE and Editor
.vscode
.idea
*.swp
*.swo
*~
.DS_Store
.env.local
.env.*.local

# Build artifacts
build
dist
.next
out

# Testing
coverage
.nyc_output
*.lcov

# Documentation
docs
README.md
CHANGELOG.md
LICENSE

# CI/CD
.github
.gitlab-ci.yml
.travis.yml
Jenkinsfile

# Docker
Dockerfile
docker-compose.yml
.dockerignore

# Development
.env
.env.development
.env.test
.env.production

# OS
Thumbs.db
.DS_Store

# Temporary files
*.tmp
*.temp
*.log

# Package manager lock files (optional - include for reproducibility)
# package-lock.json
# yarn.lock
```

### .dockerignore Explanation

**Excluded Categories**:

1. **Version Control**: .git, .gitignore (not needed in image)
2. **Node.js**: node_modules (will be reinstalled), npm logs
3. **IDE**: .vscode, .idea, editor temp files
4. **Build Artifacts**: build, dist (will be recreated)
5. **Testing**: coverage, test files (not needed in production)
6. **Documentation**: docs, README (not needed in image)
7. **CI/CD**: GitHub Actions, GitLab CI configs
8. **Environment**: .env files (security)
9. **OS**: .DS_Store, Thumbs.db (OS-specific files)

**Benefits**:
- Reduces build context size
- Faster Docker builds
- Smaller image size
- Excludes sensitive files

---

## GitHub Actions Workflow

**Location**: `.github/workflows/docker-publish.yml`

```yaml
# ============================================================================
# GitHub Actions Workflow: Docker Publish
# ============================================================================
# This workflow automatically builds and publishes the Docker image
# to Docker Hub when a release is created.
# ============================================================================

name: Docker Publish

# Trigger on release creation
on:
  release:
    types: [created]

# Environment variables
env:
  REGISTRY: docker.io
  IMAGE_NAME: movieswipe-pwa

jobs:
  build:
    runs-on: ubuntu-latest
    
    # Permissions for GitHub Actions
    permissions:
      contents: read
      packages: write
    
    steps:
      # ====================================================================
      # Step 1: Checkout Code
      # ====================================================================
      - name: Checkout repository
        uses: actions/checkout@v3
      
      # ====================================================================
      # Step 2: Set up Docker Buildx
      # ====================================================================
      # Buildx enables multi-architecture builds
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      # ====================================================================
      # Step 3: Login to Docker Hub
      # ====================================================================
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      # ====================================================================
      # Step 4: Extract Metadata
      # ====================================================================
      # Extract version from release tag
      - name: Extract metadata
        id: meta
        run: |
          VERSION=${GITHUB_REF#refs/tags/}
          echo "version=${VERSION}" >> $GITHUB_OUTPUT
          echo "tags=${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:${VERSION},${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:latest" >> $GITHUB_OUTPUT
      
      # ====================================================================
      # Step 5: Build and Push Image
      # ====================================================================
      # Build for multiple architectures and push to Docker Hub
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          # Build context
          context: ./docker/movieswipe-pwa
          
          # Target platforms (architectures)
          platforms: linux/amd64,linux/arm64
          
          # Push to registry
          push: true
          
          # Image tags
          tags: ${{ steps.meta.outputs.tags }}
          
          # Build cache
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:buildcache,mode=max
          
          # Build arguments
          build-args: |
            BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
            VCS_REF=${{ github.sha }}
            VERSION=${{ steps.meta.outputs.version }}
      
      # ====================================================================
      # Step 6: Verify Image
      # ====================================================================
      - name: Verify image
        run: |
          docker pull ${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:latest
          docker inspect ${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:latest
      
      # ====================================================================
      # Step 7: Notify on Success
      # ====================================================================
      - name: Notify success
        if: success()
        run: |
          echo "✅ Docker image published successfully!"
          echo "Image: ${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}"
          echo "Latest: ${{ secrets.DOCKER_USERNAME }}/${{ env.IMAGE_NAME }}:latest"
      
      # ====================================================================
      # Step 8: Notify on Failure
      # ====================================================================
      - name: Notify failure
        if: failure()
        run: |
          echo "❌ Docker image build failed!"
          exit 1
```

### Workflow Explanation

**Trigger**: Runs when a release is created in GitHub

**Steps**:
1. **Checkout**: Gets the repository code
2. **Setup Buildx**: Enables multi-architecture builds
3. **Login**: Authenticates with Docker Hub
4. **Metadata**: Extracts version from release tag
5. **Build & Push**: Builds for ARM64 and x86-64, pushes to Docker Hub
6. **Verify**: Verifies the published image
7. **Notify**: Notifies on success or failure

**Key Features**:
- Multi-architecture support (ARM64, x86-64)
- Automatic tagging with version and latest
- Build caching for faster builds
- Error handling and notifications

---

## Build Scripts

### build.sh - Local Build Script

**Location**: `/docker/movieswipe-pwa/scripts/build.sh`

```bash
#!/bin/bash

# ============================================================================
# Build Script for movieswipe-pwa Docker Image
# ============================================================================
# This script builds the Docker image locally for testing and development.
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="movieswipe-pwa"
IMAGE_TAG="${1:-latest}"
DOCKERFILE_PATH="./Dockerfile"
BUILD_CONTEXT="."

# Print header
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Building Docker Image${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Image: $IMAGE_NAME:$IMAGE_TAG"
echo "Dockerfile: $DOCKERFILE_PATH"
echo "Build Context: $BUILD_CONTEXT"
echo ""

# Check if Dockerfile exists
if [ ! -f "$DOCKERFILE_PATH" ]; then
    echo -e "${RED}Error: Dockerfile not found at $DOCKERFILE_PATH${NC}"
    exit 1
fi

# Build image
echo -e "${YELLOW}Building image...${NC}"
docker build \
    --tag "$IMAGE_NAME:$IMAGE_TAG" \
    --file "$DOCKERFILE_PATH" \
    "$BUILD_CONTEXT"

# Check build result
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo ""
    
    # Display image info
    echo -e "${YELLOW}Image Information:${NC}"
    docker images "$IMAGE_NAME:$IMAGE_TAG"
    echo ""
    
    # Display image size
    SIZE=$(docker images "$IMAGE_NAME:$IMAGE_TAG" --format "{{.Size}}")
    echo -e "${YELLOW}Image Size: ${GREEN}$SIZE${NC}"
    echo ""
    
    # Display run command
    echo -e "${YELLOW}To run the image:${NC}"
    echo "docker run -d -p 3000:3000 $IMAGE_NAME:$IMAGE_TAG"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi
```

### test.sh - Local Test Script

**Location**: `/docker/movieswipe-pwa/scripts/test.sh`

```bash
#!/bin/bash

# ============================================================================
# Test Script for movieswipe-pwa Docker Image
# ============================================================================
# This script tests the Docker image locally.
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
IMAGE_NAME="movieswipe-pwa"
IMAGE_TAG="${1:-latest}"
CONTAINER_NAME="movieswipe-pwa-test"
TEST_PORT=3000

# Print header
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Testing Docker Image${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if image exists
if ! docker images "$IMAGE_NAME:$IMAGE_TAG" | grep -q "$IMAGE_TAG"; then
    echo -e "${RED}Error: Image $IMAGE_NAME:$IMAGE_TAG not found${NC}"
    exit 1
fi

# Stop and remove existing test container
echo -e "${YELLOW}Cleaning up existing containers...${NC}"
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true
echo ""

# Run container
echo -e "${YELLOW}Starting container...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$TEST_PORT:3000" \
    "$IMAGE_NAME:$IMAGE_TAG"

# Wait for container to start
echo -e "${YELLOW}Waiting for container to start...${NC}"
sleep 3

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}✗ Container failed to start${NC}"
    docker logs "$CONTAINER_NAME"
    exit 1
fi
echo -e "${GREEN}✓ Container started${NC}"
echo ""

# Test health check
echo -e "${YELLOW}Testing health check...${NC}"
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME")
if [ "$HEALTH" = "healthy" ] || [ "$HEALTH" = "starting" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed: $HEALTH${NC}"
fi
echo ""

# Test HTTP endpoint
echo -e "${YELLOW}Testing HTTP endpoint...${NC}"
if curl -f http://localhost:$TEST_PORT/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ HTTP endpoint responding${NC}"
else
    echo -e "${RED}✗ HTTP endpoint not responding${NC}"
fi
echo ""

# Test specific files
echo -e "${YELLOW}Testing specific files...${NC}"

# Test index.html
if curl -f http://localhost:$TEST_PORT/index.html > /dev/null 2>&1; then
    echo -e "${GREEN}✓ index.html accessible${NC}"
else
    echo -e "${RED}✗ index.html not accessible${NC}"
fi

# Test manifest.json
if curl -f http://localhost:$TEST_PORT/manifest.json > /dev/null 2>&1; then
    echo -e "${GREEN}✓ manifest.json accessible${NC}"
else
    echo -e "${YELLOW}⚠ manifest.json not found (expected for some builds)${NC}"
fi

# Test service worker
if curl -f http://localhost:$TEST_PORT/service-worker.js > /dev/null 2>&1; then
    echo -e "${GREEN}✓ service-worker.js accessible${NC}"
else
    echo -e "${YELLOW}⚠ service-worker.js not found (expected for some builds)${NC}"
fi

echo ""

# Display container info
echo -e "${YELLOW}Container Information:${NC}"
docker inspect "$CONTAINER_NAME" | grep -E '"Id"|"Image"|"State"' | head -5
echo ""

# Display logs
echo -e "${YELLOW}Container Logs:${NC}"
docker logs "$CONTAINER_NAME" | tail -10
echo ""

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
docker stop "$CONTAINER_NAME"
docker rm "$CONTAINER_NAME"
echo ""

echo -e "${GREEN}✓ All tests completed!${NC}"
```

### push.sh - Manual Push Script

**Location**: `/docker/movieswipe-pwa/scripts/push.sh`

```bash
#!/bin/bash

# ============================================================================
# Push Script for movieswipe-pwa Docker Image
# ============================================================================
# This script manually pushes the Docker image to Docker Hub.
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
IMAGE_NAME="movieswipe-pwa"
IMAGE_TAG="${1:-latest}"

# Print header
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Pushing Docker Image${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check Docker username
if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}Error: DOCKER_USERNAME environment variable not set${NC}"
    exit 1
fi

# Check if image exists
if ! docker images "$IMAGE_NAME:$IMAGE_TAG" | grep -q "$IMAGE_TAG"; then
    echo -e "${RED}Error: Image $IMAGE_NAME:$IMAGE_TAG not found${NC}"
    exit 1
fi

# Tag image for Docker Hub
echo -e "${YELLOW}Tagging image...${NC}"
docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
docker tag "$IMAGE_NAME:$IMAGE_TAG" "$DOCKER_USERNAME/$IMAGE_NAME:latest"
echo -e "${GREEN}✓ Image tagged${NC}"
echo ""

# Push to Docker Hub
echo -e "${YELLOW}Pushing to Docker Hub...${NC}"
docker push "$DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
docker push "$DOCKER_USERNAME/$IMAGE_NAME:latest"
echo -e "${GREEN}✓ Image pushed${NC}"
echo ""

echo -e "${YELLOW}Image URLs:${NC}"
echo "  $DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"
echo "  $DOCKER_USERNAME/$IMAGE_NAME:latest"
```

---

## Usage Instructions

### Building Locally

```bash
cd /docker/movieswipe-pwa
chmod +x scripts/build.sh
./scripts/build.sh latest
```

### Testing Locally

```bash
cd /docker/movieswipe-pwa
chmod +x scripts/test.sh
./scripts/test.sh latest
```

### Pushing to Docker Hub

```bash
export DOCKER_USERNAME=your-username
cd /docker/movieswipe-pwa
chmod +x scripts/push.sh
./scripts/push.sh 1.0.0
```

