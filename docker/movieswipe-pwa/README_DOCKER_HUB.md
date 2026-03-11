# movieswipe-pwa Docker Image

A lightweight, production-ready Docker image for the movieswipe-pwa React Progressive Web Application.

## Quick Start

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  movieswipe-pwa:latest
```

Then open your browser to `http://localhost:3000`

## Features

- ✅ **Multi-Stage Build**: Optimized image size (<100MB)
- ✅ **PWA Ready**: Full Progressive Web App support
- ✅ **Production Web Server**: Nginx with optimized configuration
- ✅ **Multi-Architecture**: Supports ARM64 and x86-64
- ✅ **Health Checks**: Built-in container health monitoring
- ✅ **Security**: Runs as non-root user
- ✅ **Environment Configuration**: Flexible runtime configuration
- ✅ **Synology NAS Compatible**: Works on Synology NAS with Docker support

## Supported Tags

- `latest` - Latest stable release
- `1.0.0`, `1.0.1`, etc. - Version-specific tags
- `1.0.0-arm64`, `1.0.0-amd64` - Architecture-specific tags

## Platforms

- `linux/amd64` (x86-64)
- `linux/arm64` (ARM64 for Synology NAS)

## Environment Variables

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Web server port |
| `PROXY_URL` | (none) | HTTPS proxy URL |
| `PROXY_PORT` | (none) | HTTPS proxy port |
| `HEALTHCHECK_INTERVAL` | 30 | Health check interval (seconds) |
| `HEALTHCHECK_TIMEOUT` | 5 | Health check timeout (seconds) |
| `HEALTHCHECK_RETRIES` | 3 | Health check retries |

### Example with Environment Variables

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 8080:3000 \
  -e PORT=3000 \
  -e PROXY_URL=https://proxy.example.com \
  -e PROXY_PORT=8443 \
  movieswipe-pwa:latest
```

## Port Mapping

The container exposes port 3000 by default. Map it to any available port on your host:

```bash
# Map to port 8080
docker run -d -p 8080:3000 movieswipe-pwa:latest

# Map to port 80
docker run -d -p 80:3000 movieswipe-pwa:latest
```

## Volume Mounting

Mount volumes for persistent storage or configuration:

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -v /data/movieswipe-pwa:/data \
  movieswipe-pwa:latest
```

## Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

Then run:

```bash
docker-compose up -d
```

## Synology NAS Deployment

### Via Docker GUI

1. Open Docker application on your Synology NAS
2. Go to **Registry** and search for `movieswipe-pwa`
3. Download the image
4. Go to **Image** and click **Launch**
5. Configure:
   - Container Name: `movieswipe-pwa`
   - Port Mapping: Local Port 3000 → Container Port 3000
   - Memory Limit: 512MB (recommended)
6. Click **Apply** to start

### Via SSH

```bash
docker pull movieswipe-pwa:latest
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

Then access at: `http://[NAS-IP]:3000`

For detailed Synology NAS deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## Health Checks

The container includes built-in health checks:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' movieswipe-pwa

# View health check details
docker inspect movieswipe-pwa | grep -A 10 "Health"
```

## Logs

View container logs:

```bash
# View logs
docker logs movieswipe-pwa

# Follow logs in real-time
docker logs -f movieswipe-pwa

# View last 100 lines
docker logs --tail 100 movieswipe-pwa
```

## Container Management

```bash
# Stop container
docker stop movieswipe-pwa

# Start container
docker start movieswipe-pwa

# Restart container
docker restart movieswipe-pwa

# Remove container
docker rm movieswipe-pwa

# View container details
docker inspect movieswipe-pwa

# View running containers
docker ps

# View all containers
docker ps -a
```

## Image Information

```bash
# View image details
docker inspect movieswipe-pwa:latest

# View image size
docker images movieswipe-pwa

# View image history
docker history movieswipe-pwa:latest
```

## Updating

### Pull Latest Image

```bash
docker pull movieswipe-pwa:latest
```

### Update Running Container

```bash
# Stop and remove old container
docker stop movieswipe-pwa
docker rm movieswipe-pwa

# Pull new image
docker pull movieswipe-pwa:latest

# Run new container
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  movieswipe-pwa:latest
```

### Update with Docker Compose

```bash
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Container Won't Start

**Check logs**:
```bash
docker logs movieswipe-pwa
```

**Common issues**:
- Port already in use: Use different port mapping
- Insufficient memory: Increase container memory limit
- Image not found: Pull image first with `docker pull movieswipe-pwa:latest`

### Cannot Access Application

**Verify container is running**:
```bash
docker ps | grep movieswipe-pwa
```

**Check port mapping**:
```bash
docker port movieswipe-pwa
```

**Test connectivity**:
```bash
curl http://localhost:3000
```

### Health Check Failing

**Check health status**:
```bash
docker inspect --format='{{.State.Health.Status}}' movieswipe-pwa
```

**View detailed health info**:
```bash
docker inspect movieswipe-pwa | grep -A 10 "Health"
```

**Restart container**:
```bash
docker restart movieswipe-pwa
```

### High Memory Usage

**Check memory usage**:
```bash
docker stats movieswipe-pwa
```

**Solutions**:
- Increase container memory limit
- Restart container
- Check application logs for memory leaks

## Security

### Best Practices

1. **Keep image updated**: Regularly pull latest image for security patches
2. **Use specific versions**: Use version tags instead of `latest` for production
3. **Resource limits**: Set CPU and memory limits
4. **Network isolation**: Use Docker networks for multi-container setups
5. **Secrets management**: Use Docker secrets for sensitive data

### Non-Root User

The container runs as non-root user `appuser` (UID 1000) for security.

### Image Scanning

The image is regularly scanned for vulnerabilities. Check Docker Hub for security scan results.

## Performance

### Recommended Settings

**Development**:
- CPU: No limit
- Memory: 256MB
- Port: 3000

**Production**:
- CPU: 50-100%
- Memory: 512MB-1GB
- Port: 3000 (behind reverse proxy)

### Optimization Tips

1. Use specific version tags instead of `latest`
2. Set appropriate resource limits
3. Use reverse proxy for HTTPS
4. Enable gzip compression (enabled by default)
5. Use CDN for static assets

## Architecture

### Multi-Stage Build

The image uses a multi-stage build process:

1. **Builder Stage**: Compiles React application using Node.js
2. **Runtime Stage**: Serves compiled application using Nginx

This approach minimizes final image size to <100MB.

### Base Images

- **Builder**: `node:18-alpine` (lightweight Node.js)
- **Runtime**: `nginx:alpine` (lightweight web server)

## PWA Support

The image is fully compatible with Progressive Web Apps:

- ✅ Service Worker support
- ✅ Manifest.json serving
- ✅ Offline capabilities
- ✅ Installability
- ✅ Cache busting support

## CORS and Headers

The image includes proper headers for PWA functionality:

- `Content-Type: application/manifest+json` for manifest.json
- `Content-Type: application/javascript` for service worker
- `Cache-Control` headers for cache management
- CORS headers for cross-origin requests

## Reverse Proxy Configuration

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://movieswipe-pwa:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apache Reverse Proxy

```apache
<VirtualHost *:80>
    ServerName example.com
    ProxyPreserveHost On
    ProxyPass / http://movieswipe-pwa:3000/
    ProxyPassReverse / http://movieswipe-pwa:3000/
</VirtualHost>
```

## License

See LICENSE file in the repository.

## Support

For issues, questions, or contributions:

- GitHub Issues: [movieswipe-pwa/issues](https://github.com/[project]/movieswipe-pwa/issues)
- Docker Hub: [movieswipe-pwa](https://hub.docker.com/r/[namespace]/movieswipe-pwa)
- Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)

## Changelog

### Version 1.0.0

- Initial release
- Multi-stage Docker build
- Nginx web server configuration
- PWA support
- Multi-architecture support (ARM64, x86-64)
- Health checks
- Synology NAS compatibility

## Contributing

Contributions are welcome! Please see CONTRIBUTING.md for guidelines.

## Acknowledgments

- Built with React
- Served with Nginx
- Containerized with Docker
- Deployed on Docker Hub

