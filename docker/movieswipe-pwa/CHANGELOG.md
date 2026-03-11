# Changelog - MovieSwipe PWA Docker

All notable changes to this project will be documented in this file.

## [1.0.4] - 2026-03-11

### Added
- Bash shell support for interactive terminal access
- Entrypoint script for flexible command execution
- Curl and wget utilities for debugging

### Fixed
- Synology Docker terminal compatibility
- Alpine Linux shell compatibility

### Changed
- Updated GitHub Actions to latest versions (v4, v3, v5)
- Removed duplicate MIME type definitions in nginx.conf

---

## [1.0.3] - 2026-03-11

### Added
- Entrypoint script for proper shell initialization
- Interactive shell support for Synology Docker

### Fixed
- Interactive terminal access in Synology Docker
- Duplicate MIME type definitions in nginx.conf

---

## [1.0.2] - 2026-03-11

### Added
- Bash shell to sync container for interactive terminal access
- Curl and wget utilities for debugging

### Fixed
- Alpine Linux shell compatibility
- OCI runtime exec failed error

---

## [1.0.1] - 2026-03-11

### Added
- Data synchronization service (Dockerfile.sync)
- Docker Compose service for running sync operations
- .env.example with API key configuration
- SYNC_GUIDE.md documentation
- Support for multiple sync scripts

### Features
- Run movie data synchronization (Poiskkino, TMDB) in Docker
- Persistent data volumes for movie databases
- Easy API key configuration via .env file

---

## [1.0.0] - 2026-03-11

### Initial Release

### Added
- Multi-stage Docker build (Node.js 18-alpine → Nginx alpine)
- Nginx configuration with PWA optimization
- SPA routing support (try_files)
- Security headers (X-Content-Type-Options, X-XSS-Protection, etc.)
- Gzip compression
- Health check endpoint (/health)
- Non-root user execution (appuser)
- Docker Compose configuration for local development
- Build, test, and push scripts
- GitHub Actions CI/CD workflow for Docker Hub publication
- Multi-architecture support (linux/amd64, linux/arm64)

### Features
- Image size: 82.3 MB (< 100 MB target)
- PWA support with manifest and service worker
- Optimized caching for versioned assets
- CORS headers for PWA
- Production-ready Nginx configuration

---

## Version Mapping

| Version | Tag | Features | Status |
|---------|-----|----------|--------|
| 1.0.4 | v1.0.4 | Bash shell, entrypoint script | Latest |
| 1.0.3 | v1.0.3 | Entrypoint script, interactive shell | Previous |
| 1.0.2 | v1.0.2 | Bash shell, Alpine compatibility | Previous |
| 1.0.1 | v1.0.1 | Data sync service, Docker Compose | Previous |
| 1.0.0 | v1.0.0 | Initial release, PWA app | Initial |

---

## How to Use Versions

### Pull specific version
```bash
docker pull sadam6752-tech/movieswipe-pwa:v1.0.4
```

### Pull latest
```bash
docker pull sadam6752-tech/movieswipe-pwa:latest
```

### Run specific version
```bash
docker run -p 3000:3000 sadam6752-tech/movieswipe-pwa:v1.0.4
```

---

## Release Notes

### v1.0.4 (Current)
- **Recommended for**: Synology Docker with terminal access
- **Key feature**: Bash shell in sync container
- **Status**: Testing

### v1.0.1
- **Recommended for**: Full setup with data synchronization
- **Key feature**: Docker Compose with sync service
- **Status**: Stable

### v1.0.0
- **Recommended for**: Basic PWA deployment
- **Key feature**: Production-ready PWA application
- **Status**: Stable

---

## Breaking Changes

None so far. All versions are backward compatible.

---

## Future Versions

### v1.1.0 (Planned)
- Kubernetes support
- Health check improvements
- Monitoring and logging enhancements

### v2.0.0 (Planned)
- Multi-language support
- Advanced caching strategies
- API gateway integration

---

**Last Updated**: 2026-03-11
