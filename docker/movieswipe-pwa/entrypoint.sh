#!/bin/sh
# ============================================================================
# Entrypoint script for movieswipe-pwa container
# ============================================================================
# This script allows the container to be used both for:
# 1. Running nginx web server (default)
# 2. Interactive shell access via Synology Docker terminal
# 3. Running custom commands
# ============================================================================

# If no command is provided, start nginx
if [ $# -eq 0 ]; then
    exec nginx -g "daemon off;"
else
    # Otherwise, execute the provided command
    exec "$@"
fi
