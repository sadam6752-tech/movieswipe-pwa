# Design Document: Docker Publication for movieswipe-pwa

## Overview

This design document specifies the technical architecture for containerizing and publishing the movieswipe-pwa React PWA application as a Docker image. The solution provides an optimized, multi-architecture container that can be deployed on Docker Hub and Synology NAS environments.

### Key Design Goals

1. **Minimal Image Size**: Multi-stage build to reduce final image from ~500MB to <100MB
2. **Production Ready**: Nginx web server with PWA-optimized routing and caching
3. **Environment Flexibility**: Runtime configuration via environment variables
4. **Multi-Architecture Support**: ARM64 and x86-64 for Synology NAS compatibility
5. **Automated Publishing**: GitHub Actions CI/CD pipeline for Docker Hub
6. **Security First**: Non-root user, minimal dependencies, health checks
7. **Developer Experience**: Clear documentation and deployment instructions

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Hub Registry                       │
│  movieswipe-pwa:latest, movieswipe-pwa:1.0.0 (multi-arch)  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ docker pull
                         ▼
        ┌────────────────────────────────────┐
        │   Docker Container (Runtime)       │
        │  ┌──────────────────────────────┐  │
        │  │  Nginx Web Server (Port 3000)│  │
        │  │  - Serves React Build        │  │
        │  │  - SPA Routing (index.html)  │  │
        │  │  - PWA Support               │  │
        │  │  - Cache Headers             │  │
        │  │  - CORS Headers              │  │
        │  └──────────────────────────────┘  │
        │  ┌──────────────────────────────┐  │
        │  │  Health Check (curl)         │  │
        │  │  - Verifies Nginx responding │  │
        │  └──────────────────────────────┘  │
        └────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
   ┌─────────────┐              ┌──────────────────┐
   │ Synology    │              │ Docker Desktop   │
   │ NAS (ARM64) │              │ (x86-64)         │
   └─────────────┘              └──────────────────┘
```

### Build Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  GitHub Repository                           │
│  - Source Code                                               │
│  - Dockerfile                                                │
│  - nginx.conf                                                │
│  - .dockerignore                                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ git tag v1.0.0
                         ▼
        ┌────────────────────────────────────┐
        │  GitHub Actions Workflow           │
        │  (on: release)                     │
        └────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
   ┌─────────────────┐          ┌──────────────────┐
   │ Build ARM64     │          │ Build x86-64     │
   │ Image           │          │ Image            │
   └────────┬────────┘          └────────┬─────────┘
            │                           │
            └────────────┬──────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  Push to Docker Hub                │
        │  - movieswipe-pwa:1.0.0            │
        │  - movieswipe-pwa:latest           │
        │  - Multi-arch manifest             │
        └────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Multi-Stage Dockerfile

#### Builder Stage
- **Base Image**: `node:18-alpine` (lightweight Node.js)
- **Purpose**: Compile React application and dependencies
- **Operations**:
  - Install dependencies: `npm install`
  - Run TypeScript type checking: `tsc --noEmit`
  - Build React app: `npm run build`
  - Output: `/app/build` directory

#### Runtime Stage
- **Base Image**: `nginx:alpine` (lightweight web server)
- **Purpose**: Serve compiled React application
- **Operations**:
  - Copy build artifacts from builder
  - Copy nginx configuration
  - Create non-root user for security
  - Expose port 3000
  - Configure health check

### 2. Nginx Configuration

**File**: `/docker/movieswipe-pwa/nginx.conf`

**Key Features**:
- SPA routing: Non-existent files → `index.html`
- PWA support: Correct MIME types for manifest.json and service worker
- Cache headers: Static assets with versioning support
- CORS headers: For PWA resources
- Proxy headers: Support for HTTPS reverse proxy
- Gzip compression: For static assets

**Configuration Structure**:
```
http {
  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;
  
  server {
    listen 3000;
    root /usr/share/nginx/html;
    
    # PWA manifest
    location = /manifest.json {
      add_header Content-Type application/manifest+json;
      add_header Cache-Control "public, max-age=3600";
    }
    
    # Service worker
    location = /service-worker.js {
      add_header Content-Type application/javascript;
      add_header Cache-Control "public, max-age=0, must-revalidate";
    }
    
    # Static assets with versioning
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # SPA routing
    location / {
      try_files $uri $uri/ /index.html;
      add_header Cache-Control "public, max-age=0, must-revalidate";
    }
  }
}
```

### 3. Environment Variables

**Configuration Variables**:

| Variable | Default | Purpose | Example |
|----------|---------|---------|---------|
| `PORT` | 3000 | Web server port | 8080 |
| `PROXY_URL` | (none) | HTTPS proxy URL | https://proxy.example.com |
| `PROXY_PORT` | (none) | HTTPS proxy port | 8443 |
| `HEALTHCHECK_INTERVAL` | 30 | Health check interval (seconds) | 60 |
| `HEALTHCHECK_TIMEOUT` | 5 | Health check timeout (seconds) | 10 |
| `HEALTHCHECK_RETRIES` | 3 | Health check retries | 5 |

**Runtime Configuration**:
- Environment variables are passed at container startup
- Nginx configuration can be templated using `envsubst` if needed
- Application can read env vars from window context if needed

### 4. Health Check Configuration

**HEALTHCHECK Instruction**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD curl -f http://localhost:3000/ || exit 1
```

**Behavior**:
- Checks every 30 seconds (configurable)
- Timeout of 5 seconds per check
- Marks unhealthy after 3 consecutive failures
- 10-second grace period on startup

---

## Data Models

### Docker Image Metadata

```
Image: movieswipe-pwa
Registry: Docker Hub
Namespace: [project-namespace]

Tags:
  - movieswipe-pwa:1.0.0 (version-specific)
  - movieswipe-pwa:latest (latest release)
  - movieswipe-pwa:1.0.0-arm64 (architecture-specific)
  - movieswipe-pwa:1.0.0-amd64 (architecture-specific)

Platforms:
  - linux/amd64 (x86-64)
  - linux/arm64 (ARM64 for Synology NAS)

Metadata:
  - Size: <100MB
  - Base Image: nginx:alpine
  - User: appuser (non-root)
  - Port: 3000
  - Health Check: Enabled
```

### Build Artifact Structure

```
/app/build/
├── index.html
├── manifest.json
├── service-worker.js
├── static/
│   ├── js/
│   │   ├── main.[hash].js
│   │   └── ...
│   ├── css/
│   │   ├── main.[hash].css
│   │   └── ...
│   └── media/
│       └── ...
└── favicon.ico
```

### Container Runtime Structure

```
/usr/share/nginx/html/
├── index.html
├── manifest.json
├── service-worker.js
├── static/
│   ├── js/
│   ├── css/
│   └── media/
└── favicon.ico

/etc/nginx/
├── nginx.conf
└── conf.d/
    └── default.conf

/home/appuser/
└── (non-root user home)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Image Size Constraint

*For any* built Docker image, the final image size should not exceed 100MB, ensuring efficient storage and deployment.

**Validates: Requirements 1.4**

### Property 2: Multi-Stage Build Separation

*For any* Docker build, the runtime stage should contain only compiled artifacts and runtime dependencies, with no build tools or development dependencies present.

**Validates: Requirements 1.3, 7.2**

### Property 3: Port Configuration Flexibility

*For any* container started with a PORT environment variable, the web server should listen on the specified port; if not provided, it should default to 3000.

**Validates: Requirements 3.4, 4.2**

### Property 4: SPA Routing Behavior

*For any* HTTP request to a non-existent file path, the web server should serve index.html to support single-page application routing.

**Validates: Requirements 4.3**

### Property 5: Static Asset Caching

*For any* static asset request (js, css, images), the response should include appropriate Cache-Control headers for cache busting and long-term caching.

**Validates: Requirements 4.5**

### Property 6: Multi-Architecture Support

*For any* release, the CI/CD pipeline should build and publish Docker images for both ARM64 and x86-64 architectures with a unified manifest.

**Validates: Requirements 6.3**

### Property 7: Build Reproducibility

*For any* Dockerfile, building the image multiple times with the same source code should produce identical image layers and checksums.

**Validates: Requirements 9.4**

### Property 8: PWA Service Worker Serving

*For any* request to service-worker.js, the response should include Content-Type: application/javascript and Cache-Control headers that prevent caching.

**Validates: Requirements 11.1, 11.2**

### Property 9: Manifest MIME Type

*For any* request to manifest.json, the response should include Content-Type: application/manifest+json.

**Validates: Requirements 11.2**

### Property 10: Health Check Responsiveness

*For any* running container, the health check should successfully verify that the web server is responding to HTTP requests within the configured timeout.

**Validates: Requirements 12.2**

### Property 11: Health Check Failure Detection

*For any* container where the web server is stopped or unresponsive, the health check should fail and mark the container as unhealthy.

**Validates: Requirements 12.3**

### Property 12: Non-Root User Execution

*For any* running container, the main process should execute as a non-root user (appuser) for security isolation.

**Validates: Requirements 7.1**

---

## Error Handling

### Build-Time Errors

**Scenario**: npm install fails due to missing dependencies
- **Handling**: Build fails with clear error message
- **Recovery**: Developer fixes package.json and rebuilds

**Scenario**: TypeScript compilation errors
- **Handling**: Build fails, errors displayed in build log
- **Recovery**: Developer fixes TypeScript errors and rebuilds

**Scenario**: Dockerfile syntax errors
- **Handling**: Docker build fails with syntax error
- **Recovery**: Developer fixes Dockerfile and rebuilds

### Runtime Errors

**Scenario**: Port already in use
- **Handling**: Container fails to start, error logged
- **Recovery**: Use different PORT environment variable or stop conflicting container

**Scenario**: Nginx configuration invalid
- **Handling**: Container fails to start, nginx error logged
- **Recovery**: Fix nginx.conf and rebuild image

**Scenario**: Health check fails
- **Handling**: Container marked as unhealthy
- **Recovery**: Check logs, verify web server is running, restart container

**Scenario**: Out of memory
- **Handling**: Container killed by Docker daemon
- **Recovery**: Increase container memory limit or optimize application

### CI/CD Errors

**Scenario**: Docker Hub authentication fails
- **Handling**: Build succeeds but push fails
- **Recovery**: Verify Docker Hub credentials in GitHub Secrets

**Scenario**: Multi-architecture build fails for one platform
- **Handling**: Build fails, error logged in GitHub Actions
- **Recovery**: Fix platform-specific issue and retry

**Scenario**: Image push timeout
- **Handling**: Push fails, retry mechanism activates
- **Recovery**: Check Docker Hub status, retry build

---

## Testing Strategy

### Unit Testing Approach

**Dockerfile Validation**:
- Verify Dockerfile syntax is valid
- Check that all required instructions are present (FROM, COPY, EXPOSE, HEALTHCHECK, USER)
- Verify base images are from trusted registries

**Nginx Configuration Validation**:
- Verify nginx.conf syntax is valid using `nginx -t`
- Check that all required location blocks are present
- Verify MIME types are correctly configured

**Build Artifact Verification**:
- Verify build artifacts exist in expected locations
- Check that no development dependencies are in runtime stage
- Verify image size is under 100MB

**Environment Variable Testing**:
- Test PORT variable with various values (3000, 8080, 9000)
- Test PROXY_URL and PROXY_PORT configuration
- Test health check interval configuration

**Deployment Testing**:
- Test container startup on Docker Desktop
- Test container startup on Synology NAS (if available)
- Test port mapping and network access
- Test volume mounting for persistent storage

### Property-Based Testing Approach

**Property Test Configuration**:
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: docker-movieswipe-pwa, Property {number}: {property_text}`

**Property Tests to Implement**:

1. **Image Size Property Test**
   - Build image multiple times
   - Verify size is consistently under 100MB
   - Tag: `Feature: docker-movieswipe-pwa, Property 1: Image Size Constraint`

2. **Multi-Stage Build Property Test**
   - Inspect image layers
   - Verify no npm, node, or build tools in runtime stage
   - Tag: `Feature: docker-movieswipe-pwa, Property 2: Multi-Stage Build Separation`

3. **Port Configuration Property Test**
   - Start container with various PORT values
   - Verify web server listens on specified port
   - Tag: `Feature: docker-movieswipe-pwa, Property 3: Port Configuration Flexibility`

4. **SPA Routing Property Test**
   - Request non-existent paths
   - Verify index.html is served
   - Tag: `Feature: docker-movieswipe-pwa, Property 4: SPA Routing Behavior`

5. **Cache Headers Property Test**
   - Request static assets
   - Verify Cache-Control headers are present
   - Tag: `Feature: docker-movieswipe-pwa, Property 5: Static Asset Caching`

6. **Multi-Architecture Property Test**
   - Build for ARM64 and x86-64
   - Verify both architectures are in manifest
   - Tag: `Feature: docker-movieswipe-pwa, Property 6: Multi-Architecture Support`

7. **Build Reproducibility Property Test**
   - Build image multiple times
   - Compare image checksums
   - Tag: `Feature: docker-movieswipe-pwa, Property 7: Build Reproducibility`

8. **Service Worker MIME Type Property Test**
   - Request service-worker.js
   - Verify Content-Type header
   - Tag: `Feature: docker-movieswipe-pwa, Property 8: PWA Service Worker Serving`

9. **Manifest MIME Type Property Test**
   - Request manifest.json
   - Verify Content-Type header
   - Tag: `Feature: docker-movieswipe-pwa, Property 9: Manifest MIME Type`

10. **Health Check Success Property Test**
    - Start container
    - Verify health check passes
    - Tag: `Feature: docker-movieswipe-pwa, Property 10: Health Check Responsiveness`

11. **Health Check Failure Property Test**
    - Stop web server
    - Verify health check fails
    - Tag: `Feature: docker-movieswipe-pwa, Property 11: Health Check Failure Detection`

12. **Non-Root User Property Test**
    - Inspect running container
    - Verify process runs as appuser
    - Tag: `Feature: docker-movieswipe-pwa, Property 12: Non-Root User Execution`

### Integration Testing

**Docker Hub Integration**:
- Verify image can be pulled from Docker Hub
- Verify image runs correctly after pull
- Verify tags are correctly applied

**Synology NAS Integration**:
- Deploy image on Synology NAS via Docker GUI
- Verify container starts and serves application
- Verify port mapping works correctly
- Verify volume mounting works

**CI/CD Integration**:
- Verify GitHub Actions workflow triggers on release
- Verify build completes successfully
- Verify image is pushed to Docker Hub
- Verify tags are correctly applied

---

## Directory Structure

```
/docker/movieswipe-pwa/
├── Dockerfile                 # Multi-stage Docker build
├── .dockerignore              # Build context optimization
├── nginx.conf                 # Nginx web server configuration
├── docker-compose.yml         # Local development (optional)
├── README.md                  # Docker Hub README
├── DEPLOYMENT.md              # Synology NAS deployment guide
└── scripts/
    ├── build.sh               # Local build script
    ├── test.sh                # Local testing script
    └── push.sh                # Manual push script (for testing)
```

---

## Dockerfile Strategy

### Layer Optimization

**Goal**: Minimize image size and build time through efficient layer caching

**Strategy**:
1. **Base Image**: Use `node:18-alpine` for builder (minimal)
2. **Dependency Layer**: Copy package.json first, install dependencies
3. **Source Layer**: Copy source code after dependencies
4. **Build Layer**: Run build process
5. **Runtime Base**: Use `nginx:alpine` (minimal)
6. **Runtime Setup**: Copy artifacts, configure nginx, create user
7. **Health Check**: Add health check instruction

**Caching Benefits**:
- If package.json unchanged, dependency layer is cached
- If source code unchanged, build layer is cached
- Rebuilds are fast when only source changes

### Security Considerations

1. **Non-Root User**: Create `appuser` for running nginx
2. **Minimal Base Images**: Use Alpine Linux for smaller attack surface
3. **No Build Tools**: Remove npm, node, build tools from runtime
4. **Read-Only Filesystem**: Consider read-only root filesystem option
5. **Regular Updates**: Use latest Alpine and nginx versions

---

## Nginx Configuration Details

### SPA Routing Configuration

```nginx
location / {
  try_files $uri $uri/ /index.html;
  add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

**Behavior**:
- Try to serve requested file
- If not found, try as directory
- If still not found, serve index.html
- Prevents 404 errors for SPA routes

### PWA Support Configuration

```nginx
# Manifest
location = /manifest.json {
  add_header Content-Type application/manifest+json;
  add_header Cache-Control "public, max-age=3600";
}

# Service Worker
location = /service-worker.js {
  add_header Content-Type application/javascript;
  add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

**Behavior**:
- Manifest cached for 1 hour
- Service worker never cached (must-revalidate)
- Correct MIME types for PWA functionality

### Cache Busting Configuration

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**Behavior**:
- Static assets cached for 1 year
- Immutable flag prevents revalidation
- Works with versioned filenames (main.abc123.js)

---

## CI/CD Workflow

### GitHub Actions Workflow

**File**: `.github/workflows/docker-publish.yml`

**Trigger**: On release creation

**Steps**:
1. Checkout code
2. Set up Docker Buildx (multi-architecture support)
3. Login to Docker Hub
4. Build and push image for ARM64
5. Build and push image for x86-64
6. Create multi-architecture manifest
7. Tag with version and latest
8. Notify on failure

**Configuration**:
```yaml
name: Docker Publish

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./docker/movieswipe-pwa
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/movieswipe-pwa:${{ github.event.release.tag_name }}
            ${{ secrets.DOCKER_USERNAME }}/movieswipe-pwa:latest
```

---

## Deployment Instructions

### Docker Desktop Deployment

```bash
# Pull image
docker pull [namespace]/movieswipe-pwa:latest

# Run container
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  [namespace]/movieswipe-pwa:latest

# Access application
open http://localhost:3000
```

### Synology NAS Deployment

**Via Docker GUI**:
1. Open Docker application
2. Go to Registry
3. Search for `movieswipe-pwa`
4. Download image
5. Go to Container
6. Create new container from image
7. Configure port mapping (3000:3000)
8. Start container
9. Access via http://nas-ip:3000

**Via SSH**:
```bash
docker pull [namespace]/movieswipe-pwa:latest
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  [namespace]/movieswipe-pwa:latest
```

### Environment Variable Configuration

**Docker Desktop**:
```bash
docker run -d \
  --name movieswipe-pwa \
  -p 8080:3000 \
  -e PORT=3000 \
  -e PROXY_URL=https://proxy.example.com \
  -e PROXY_PORT=8443 \
  [namespace]/movieswipe-pwa:latest
```

**Synology NAS**:
1. Create container
2. Go to Environment tab
3. Add environment variables
4. Start container

---

## Security Considerations

### Image Security

1. **Non-Root User**: Container runs as `appuser` (UID 1000)
2. **Minimal Base Images**: Alpine Linux reduces attack surface
3. **No Development Tools**: npm, node, build tools removed from runtime
4. **Regular Updates**: Base images updated regularly for security patches
5. **Signed Images**: Consider image signing for production

### Runtime Security

1. **Read-Only Root Filesystem**: Consider `--read-only` flag
2. **Resource Limits**: Set memory and CPU limits
3. **Network Policies**: Restrict network access if needed
4. **Secrets Management**: Use Docker secrets for sensitive data
5. **Logging**: Enable container logging for audit trails

### Build Security

1. **Dependency Scanning**: Scan npm dependencies for vulnerabilities
2. **Image Scanning**: Scan final image for vulnerabilities
3. **Build Secrets**: Use GitHub Secrets for Docker Hub credentials
4. **Signed Commits**: Require signed commits for releases
5. **Code Review**: Require review before release

---

## Monitoring and Observability

### Health Checks

**HEALTHCHECK Instruction**:
- Interval: 30 seconds (configurable)
- Timeout: 5 seconds
- Retries: 3
- Start period: 10 seconds

**Monitoring**:
```bash
docker inspect --format='{{.State.Health.Status}}' movieswipe-pwa
```

### Logging

**Container Logs**:
```bash
docker logs movieswipe-pwa
docker logs -f movieswipe-pwa  # Follow logs
```

**Nginx Access Logs**:
- Logged to stdout for Docker log collection
- Can be aggregated with ELK, Splunk, etc.

### Metrics

**Potential Metrics**:
- Container CPU usage
- Container memory usage
- HTTP request count
- HTTP response times
- Cache hit ratio
- Health check status

---

## Maintenance and Updates

### Image Updates

**Process**:
1. Update source code
2. Create release in GitHub
3. GitHub Actions automatically builds and pushes
4. Image available on Docker Hub with new tag

**Pulling Updates**:
```bash
docker pull [namespace]/movieswipe-pwa:latest
docker stop movieswipe-pwa
docker rm movieswipe-pwa
docker run -d --name movieswipe-pwa -p 3000:3000 [namespace]/movieswipe-pwa:latest
```

### Base Image Updates

**Process**:
1. Monitor Alpine Linux and nginx releases
2. Update Dockerfile with new base image versions
3. Test locally
4. Create release to trigger CI/CD
5. Verify image works on Docker Hub and Synology NAS

### Dependency Updates

**Process**:
1. Run `npm update` or `npm audit fix`
2. Test application locally
3. Commit changes
4. Create release
5. CI/CD automatically builds and publishes

---

## Documentation

### README.md (Docker Hub)

**Contents**:
- Quick start instructions
- Environment variables documentation
- Deployment instructions for Docker Desktop
- Deployment instructions for Synology NAS
- Troubleshooting section
- Links to detailed documentation

### DEPLOYMENT.md (Synology NAS)

**Contents**:
- Step-by-step Synology NAS deployment
- Screenshots of Docker GUI
- SSH deployment instructions
- Port mapping configuration
- Volume mounting for persistent storage
- Accessing the application
- Troubleshooting common issues
- Updating to new versions

### DEVELOPMENT.md (Local Development)

**Contents**:
- Building image locally
- Running container locally
- Testing locally
- Debugging tips
- Contributing guidelines

---

## Known Limitations and Future Improvements

### Current Limitations

1. **Single Port**: Currently only supports port 3000 (configurable via PORT env var)
2. **No Database**: Application is stateless, no persistent data storage
3. **No SSL/TLS**: HTTPS must be handled by reverse proxy
4. **No Load Balancing**: Single container instance

### Future Improvements

1. **Docker Compose**: Multi-container setup with reverse proxy
2. **Kubernetes Support**: Helm charts for Kubernetes deployment
3. **SSL/TLS Support**: Built-in HTTPS support
4. **Caching Layer**: Redis for application caching
5. **Monitoring**: Prometheus metrics and Grafana dashboards
6. **Auto-Scaling**: Kubernetes horizontal pod autoscaling
7. **Blue-Green Deployment**: Zero-downtime deployments

---

## References and Resources

### Docker Documentation
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

### Nginx Documentation
- [Nginx Official Documentation](https://nginx.org/en/docs/)
- [Nginx SPA Configuration](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

### PWA Documentation
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Synology NAS
- [Synology Docker Support](https://www.synology.com/en-us/dsm/packages/Docker)
- [Synology NAS Docker Guide](https://kb.synology.com/en-us/DSM/help/Docker/docker_container)

### GitHub Actions
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build and Push Action](https://github.com/docker/build-push-action)

---

## Appendix: Configuration Examples

### Example 1: Basic Deployment

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  movieswipe-pwa:latest
```

### Example 2: Custom Port

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 8080:3000 \
  -e PORT=3000 \
  movieswipe-pwa:latest
```

### Example 3: With Proxy Configuration

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PROXY_URL=https://proxy.example.com \
  -e PROXY_PORT=8443 \
  movieswipe-pwa:latest
```

### Example 4: With Volume Mounting

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -v /data/movieswipe-pwa:/data \
  movieswipe-pwa:latest
```

### Example 5: Docker Compose

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - PROXY_URL=https://proxy.example.com
      - PROXY_PORT=8443
    volumes:
      - /data/movieswipe-pwa:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

