# Deployment Guide: Synology NAS

This guide provides step-by-step instructions for deploying movieswipe-pwa on Synology NAS using Docker.

## Prerequisites

- Synology NAS with Docker support (Docker version 20.10+)
- Docker application installed on your NAS
- Network access to Docker Hub
- Basic familiarity with Synology DSM interface

## Deployment Methods

### Method 1: Docker GUI (Recommended for Beginners)

#### Step 1: Open Docker Application

1. Log in to Synology DSM
2. Click on the Docker icon in the main menu
3. Wait for Docker application to load

#### Step 2: Download Image from Registry

1. Click on **Registry** in the left sidebar
2. Search for `movieswipe-pwa` in the search box
3. Click on the image from the search results
4. Click **Download** button
5. Select the latest version (or specific version tag)
6. Wait for download to complete (this may take a few minutes)

#### Step 3: Create Container

1. Click on **Image** in the left sidebar
2. Find `movieswipe-pwa` in the image list
3. Click on it and select **Launch**
4. Configure container settings:
   - **Container Name**: `movieswipe-pwa` (or your preferred name)
   - **CPU Limit**: Leave as default or set to 50% if needed
   - **Memory Limit**: Set to at least 256MB (512MB recommended)
   - **Enable auto-restart**: Check this box for automatic restart on NAS reboot

#### Step 4: Configure Port Mapping

1. Click on the **Port Settings** tab
2. Configure port mapping:
   - **Local Port**: 3000 (or any available port on your NAS)
   - **Container Port**: 3000
   - **Type**: tcp
3. Click **Apply**

#### Step 5: Configure Environment Variables (Optional)

1. Click on the **Environment** tab
2. Add environment variables as needed:
   - `PORT=3000` (default)
   - `PROXY_URL=https://proxy.example.com` (if using proxy)
   - `PROXY_PORT=8443` (if using proxy)
3. Click **Apply**

#### Step 6: Start Container

1. Click **Next** to review settings
2. Click **Apply** to create and start the container
3. Wait for container to start (check status in Container list)

#### Step 7: Access Application

1. Open web browser on your computer
2. Navigate to: `http://[NAS-IP]:3000`
   - Replace `[NAS-IP]` with your NAS IP address
   - Example: `http://192.168.1.100:3000`
3. Application should load successfully

### Method 2: SSH Deployment (For Advanced Users)

#### Step 1: Connect via SSH

```bash
ssh admin@[NAS-IP]
```

#### Step 2: Pull Image

```bash
docker pull [namespace]/movieswipe-pwa:latest
```

#### Step 3: Run Container

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --restart unless-stopped \
  [namespace]/movieswipe-pwa:latest
```

#### Step 4: Verify Container is Running

```bash
docker ps | grep movieswipe-pwa
```

#### Step 5: Access Application

Open browser and navigate to: `http://[NAS-IP]:3000`

### Method 3: Docker Compose (For Advanced Users)

#### Step 1: Create docker-compose.yml

Create a file named `docker-compose.yml` on your NAS:

```yaml
version: '3.8'

services:
  movieswipe-pwa:
    image: [namespace]/movieswipe-pwa:latest
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

#### Step 2: Deploy with Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

#### Step 3: Verify Deployment

```bash
docker-compose ps
```

## Environment Variables

### Available Variables

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `PORT` | 3000 | Web server port | 8080 |
| `PROXY_URL` | (none) | HTTPS proxy URL | https://proxy.example.com |
| `PROXY_PORT` | (none) | HTTPS proxy port | 8443 |
| `HEALTHCHECK_INTERVAL` | 30 | Health check interval (seconds) | 60 |
| `HEALTHCHECK_TIMEOUT` | 5 | Health check timeout (seconds) | 10 |
| `HEALTHCHECK_RETRIES` | 3 | Health check retries | 5 |

### Setting Environment Variables in Docker GUI

1. In Container settings, click **Environment** tab
2. Click **Add** button
3. Enter variable name and value
4. Click **Apply**

### Setting Environment Variables via SSH

```bash
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  -e PORT=3000 \
  -e PROXY_URL=https://proxy.example.com \
  -e PROXY_PORT=8443 \
  [namespace]/movieswipe-pwa:latest
```

## Accessing the Application

### From Local Network

1. Open web browser
2. Navigate to: `http://[NAS-IP]:3000`
3. Application should load

### From Internet (Requires Port Forwarding)

1. Configure port forwarding on your router
2. Forward external port to NAS port 3000
3. Access via: `http://[YOUR-DOMAIN]:[EXTERNAL-PORT]`

### Troubleshooting Access Issues

**Issue**: Cannot access application
- **Solution**: Verify NAS IP address, check port mapping, verify container is running

**Issue**: Connection refused
- **Solution**: Check if container is running, verify port mapping is correct

**Issue**: Slow loading
- **Solution**: Check NAS CPU/memory usage, verify network connection

## Updating to New Version

### Method 1: Docker GUI

1. Click on **Image** in left sidebar
2. Find `movieswipe-pwa` image
3. Right-click and select **Delete**
4. Go to **Registry** and download new version
5. Create new container with updated image
6. Delete old container

### Method 2: SSH

```bash
# Stop and remove old container
docker stop movieswipe-pwa
docker rm movieswipe-pwa

# Pull new image
docker pull [namespace]/movieswipe-pwa:latest

# Run new container
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --restart unless-stopped \
  [namespace]/movieswipe-pwa:latest
```

### Method 3: Docker Compose

```bash
# Pull new image
docker-compose pull

# Restart with new image
docker-compose up -d
```

## Monitoring Container

### Check Container Status

**Via Docker GUI**:
1. Click on **Container** in left sidebar
2. Find `movieswipe-pwa` in the list
3. Check status (should be "Running")

**Via SSH**:
```bash
docker ps | grep movieswipe-pwa
```

### View Container Logs

**Via Docker GUI**:
1. Click on **Container** in left sidebar
2. Right-click on `movieswipe-pwa`
3. Select **View Log**

**Via SSH**:
```bash
docker logs movieswipe-pwa
docker logs -f movieswipe-pwa  # Follow logs in real-time
```

### Check Health Status

**Via SSH**:
```bash
docker inspect --format='{{.State.Health.Status}}' movieswipe-pwa
```

## Troubleshooting

### Container Won't Start

**Symptoms**: Container status shows "Exited" or "Stopped"

**Solutions**:
1. Check logs: `docker logs movieswipe-pwa`
2. Verify port 3000 is not in use: `netstat -an | grep 3000`
3. Check NAS has sufficient memory
4. Try restarting container

### Application Loads Slowly

**Symptoms**: Page takes long time to load

**Solutions**:
1. Check NAS CPU usage (may be overloaded)
2. Check network connection speed
3. Check if other containers are consuming resources
4. Increase container memory limit

### Cannot Access Application

**Symptoms**: Connection refused or timeout

**Solutions**:
1. Verify container is running: `docker ps`
2. Verify port mapping: `docker port movieswipe-pwa`
3. Check NAS firewall settings
4. Verify NAS IP address is correct
5. Try accessing from different device

### Health Check Failing

**Symptoms**: Container marked as unhealthy

**Solutions**:
1. Check if web server is responding: `curl http://localhost:3000`
2. Check container logs for errors
3. Verify port mapping is correct
4. Restart container

### Out of Memory

**Symptoms**: Container crashes or becomes unresponsive

**Solutions**:
1. Increase container memory limit
2. Stop other containers to free memory
3. Check for memory leaks in application logs
4. Restart container

## Performance Tuning

### Recommended Settings for Synology NAS

**For DS918+ or similar (4GB RAM)**:
- CPU Limit: 50%
- Memory Limit: 512MB
- Port: 3000

**For DS220+ or similar (2GB RAM)**:
- CPU Limit: 25%
- Memory Limit: 256MB
- Port: 3000

**For DS420+ or similar (4GB RAM)**:
- CPU Limit: 50%
- Memory Limit: 512MB
- Port: 3000

### Optimization Tips

1. **Enable auto-restart**: Ensures container restarts after NAS reboot
2. **Set memory limit**: Prevents container from consuming all NAS memory
3. **Monitor logs**: Check logs regularly for errors or warnings
4. **Update regularly**: Keep image updated for performance improvements
5. **Clean up old images**: Remove unused images to save storage space

## Backup and Recovery

### Backup Container Configuration

**Via Docker GUI**:
1. Note down all environment variables
2. Note down port mapping
3. Note down volume mounts (if any)

**Via SSH**:
```bash
docker inspect movieswipe-pwa > movieswipe-pwa-backup.json
```

### Restore Container

**Via SSH**:
```bash
# Stop and remove old container
docker stop movieswipe-pwa
docker rm movieswipe-pwa

# Run new container with same configuration
docker run -d \
  --name movieswipe-pwa \
  -p 3000:3000 \
  --restart unless-stopped \
  [namespace]/movieswipe-pwa:latest
```

## Security Considerations

### Network Security

1. **Firewall**: Configure NAS firewall to restrict access if needed
2. **Port Forwarding**: Only enable if necessary for external access
3. **HTTPS**: Use reverse proxy for HTTPS support
4. **Authentication**: Consider adding authentication layer

### Container Security

1. **Regular Updates**: Keep image updated for security patches
2. **Resource Limits**: Set CPU and memory limits
3. **Restart Policy**: Enable auto-restart for reliability
4. **Logging**: Monitor logs for suspicious activity

## Support and Resources

### Getting Help

1. Check logs: `docker logs movieswipe-pwa`
2. Review troubleshooting section above
3. Check Docker Hub repository for issues
4. Contact project maintainers

### Useful Commands

```bash
# View container status
docker ps -a

# View container details
docker inspect movieswipe-pwa

# View container logs
docker logs movieswipe-pwa

# Stop container
docker stop movieswipe-pwa

# Start container
docker start movieswipe-pwa

# Restart container
docker restart movieswipe-pwa

# Remove container
docker rm movieswipe-pwa

# View image details
docker images

# Remove image
docker rmi [namespace]/movieswipe-pwa:latest
```

### Additional Resources

- [Synology Docker Documentation](https://kb.synology.com/en-us/DSM/help/Docker/docker_container)
- [Docker Documentation](https://docs.docker.com/)
- [movieswipe-pwa GitHub Repository](https://github.com/[project]/movieswipe-pwa)

