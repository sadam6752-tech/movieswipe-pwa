# Configuration Examples

This document provides practical examples for configuring and deploying movieswipe-pwa in various scenarios.

## Table of Contents

1. [Basic Deployment](#basic-deployment)
2. [Custom Port Configuration](#custom-port-configuration)
3. [Proxy Configuration](#proxy-configuration)
4. [Docker Compose Examples](#docker-compose-examples)
5. [Synology NAS Examples](#synology-nas-examples)
6. [Reverse Proxy Setup](#reverse-proxy-setup)
7. [Advanced Configurations](#advanced-configurations)

---

## Basic Deployment

### Docker Desktop - Minimal Setup

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  movieswipe-pwa:latest
```

**Access**: http://localhost:3000

### Docker Desktop - With Auto-Restart

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

**Features**:
- Container automatically restarts on Docker daemon restart
- Container restarts if it crashes

### Docker Desktop - With Resource Limits

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --memory 512m \
  --cpus 0.5 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

**Resource Limits**:
- Memory: 512MB
- CPU: 50% of one core

---

## Custom Port Configuration

### Map to Port 8080

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 8080:3000 \
  movieswipe-pwa:latest
```

**Access**: http://localhost:8080

### Map to Port 80 (HTTP)

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 80:3000 \
  movieswipe-pwa:latest
```

**Access**: http://localhost

**Note**: Requires root/admin privileges on Linux

### Map to Port 443 (HTTPS)

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 443:3000 \
  movieswipe-pwa:latest
```

**Note**: Use with reverse proxy for actual HTTPS support

### Multiple Port Mappings

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -p 8080:3000 \
  movieswipe-pwa:latest
```

**Access**: 
- http://localhost:3000
- http://localhost:8080

---

## Proxy Configuration

### HTTPS Proxy Setup

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PROXY_URL=https://proxy.example.com \
  -e PROXY_PORT=8443 \
  movieswipe-pwa:latest
```

**Configuration**:
- Proxy URL: https://proxy.example.com
- Proxy Port: 8443

### HTTP Proxy Setup

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PROXY_URL=http://proxy.example.com \
  -e PROXY_PORT=8080 \
  movieswipe-pwa:latest
```

### Proxy with Authentication

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PROXY_URL=https://user:password@proxy.example.com \
  -e PROXY_PORT=8443 \
  movieswipe-pwa:latest
```

### Corporate Proxy Setup

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PROXY_URL=https://corporate-proxy.internal.com \
  -e PROXY_PORT=3128 \
  -e HTTP_PROXY=https://corporate-proxy.internal.com:3128 \
  -e HTTPS_PROXY=https://corporate-proxy.internal.com:3128 \
  movieswipe-pwa:latest
```

---

## Docker Compose Examples

### Basic Docker Compose

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa
    ports:
      - "3000:3000"
    restart: unless-stopped
```

**Usage**:
```bash
docker-compose up -d
docker-compose down
```

### Docker Compose with Environment Variables

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
      - PROXY_URL=https://proxy.example.com
      - PROXY_PORT=8443
      - HEALTHCHECK_INTERVAL=30
      - HEALTHCHECK_TIMEOUT=5
      - HEALTHCHECK_RETRIES=3
    restart: unless-stopped
```

### Docker Compose with Resource Limits

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
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Docker Compose with Volume Mounting

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa
    ports:
      - "3000:3000"
    volumes:
      - /data/movieswipe-pwa:/data
      - /config/movieswipe-pwa:/config
    restart: unless-stopped
```

### Docker Compose with Health Checks

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### Docker Compose with Logging

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa
    ports:
      - "3000:3000"
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Complete Docker Compose Example

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
      - PROXY_URL=https://proxy.example.com
      - PROXY_PORT=8443
      - HEALTHCHECK_INTERVAL=30
      - HEALTHCHECK_TIMEOUT=5
      - HEALTHCHECK_RETRIES=3
    volumes:
      - /data/movieswipe-pwa:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Synology NAS Examples

### Synology NAS - Basic Deployment

```bash
docker pull movieswipe-pwa:latest
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

**Access**: http://[NAS-IP]:3000

### Synology NAS - Custom Port

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 8080:3000 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

**Access**: http://[NAS-IP]:8080

### Synology NAS - With Resource Limits

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --memory 512m \
  --cpus 0.5 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

### Synology NAS - With Volume Mounting

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -v /volume1/docker/movieswipe-pwa:/data \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

### Synology NAS - With Proxy Configuration

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PROXY_URL=https://proxy.example.com \
  -e PROXY_PORT=8443 \
  --restart unless-stopped \
  movieswipe-pwa:latest
```

### Synology NAS - Docker Compose

Create `/volume1/docker/movieswipe-pwa/docker-compose.yml`:

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
    volumes:
      - /volume1/docker/movieswipe-pwa/data:/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

Then run:
```bash
cd /volume1/docker/movieswipe-pwa
docker-compose up -d
```

---

## Reverse Proxy Setup

### Nginx Reverse Proxy

```nginx
upstream movieswipe_pwa {
    server localhost:3000;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://movieswipe_pwa;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Nginx with HTTPS

```nginx
upstream movieswipe_pwa {
    server localhost:3000;
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    location / {
        proxy_pass http://movieswipe_pwa;
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
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]
</VirtualHost>
```

### Apache with HTTPS

```apache
<VirtualHost *:80>
    ServerName example.com
    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/example.com.crt
    SSLCertificateKeyFile /etc/ssl/private/example.com.key
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

### Traefik Reverse Proxy

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/traefik.yml
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"

  movieswipe-pwa:
    image: movieswipe-pwa:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.movieswipe.rule=Host(`example.com`)"
      - "traefik.http.routers.movieswipe.entrypoints=web"
      - "traefik.http.services.movieswipe.loadbalancer.server.port=3000"
```

---

## Advanced Configurations

### Multi-Container Setup with Docker Compose

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
    networks:
      - movieswipe-network

  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - movieswipe-pwa
    restart: unless-stopped
    networks:
      - movieswipe-network

networks:
  movieswipe-network:
    driver: bridge
```

### Development Setup with Hot Reload

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa-dev
    ports:
      - "3000:3000"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - NODE_ENV=development
    restart: unless-stopped
```

### Production Setup with Monitoring

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
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "10"

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: unless-stopped
```

### Backup and Recovery Setup

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: movieswipe-pwa:latest
    container_name: movieswipe-pwa
    ports:
      - "3000:3000"
    volumes:
      - movieswipe-data:/data
    restart: unless-stopped

  backup:
    image: alpine:latest
    container_name: movieswipe-backup
    volumes:
      - movieswipe-data:/data
      - ./backups:/backups
    command: |
      sh -c "while true; do
        tar -czf /backups/movieswipe-$(date +%Y%m%d-%H%M%S).tar.gz /data
        find /backups -name 'movieswipe-*.tar.gz' -mtime +7 -delete
        sleep 86400
      done"
    restart: unless-stopped

volumes:
  movieswipe-data:
```

---

## Troubleshooting Configuration Issues

### Port Already in Use

**Problem**: `docker: Error response from daemon: driver failed programming external connectivity on endpoint`

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Use different port
docker run -d -p 8080:3000 movieswipe-pwa:latest
```

### Out of Memory

**Problem**: Container crashes or becomes unresponsive

**Solution**:
```bash
# Increase memory limit
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --memory 1g \
  movieswipe-pwa:latest
```

### Health Check Failing

**Problem**: Container marked as unhealthy

**Solution**:
```bash
# Check logs
docker logs movieswipe-pwa

# Verify connectivity
docker exec movieswipe-pwa curl http://localhost:3000

# Restart container
docker restart movieswipe-pwa
```

### Proxy Connection Issues

**Problem**: Cannot connect through proxy

**Solution**:
```bash
# Verify proxy settings
docker exec movieswipe-pwa env | grep PROXY

# Test proxy connectivity
docker exec movieswipe-pwa curl -x $PROXY_URL:$PROXY_PORT http://example.com
```

