#!/bin/sh
# ============================================================================
# Entrypoint script for movieswipe-sync container
# ============================================================================
# This script allows the container to be used both for:
# 1. Running sync scripts directly
# 2. Interactive shell access via Synology Docker terminal
# ============================================================================

# If no command is provided, start an interactive bash shell
if [ $# -eq 0 ]; then
    exec /bin/bash
else
    # Otherwise, execute the provided command
    exec "$@"
fi
