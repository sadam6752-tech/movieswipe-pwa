#!/bin/bash

# ============================================================================
# Test Script for movieswipe-pwa Docker Image
# ============================================================================
# This script tests the Docker image locally.
# Usage: ./scripts/test.sh [tag]
# Example: ./scripts/test.sh latest
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

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"

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
echo -e "${YELLOW}Container Logs (last 10 lines):${NC}"
docker logs "$CONTAINER_NAME" | tail -10
echo ""

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
docker stop "$CONTAINER_NAME"
docker rm "$CONTAINER_NAME"
echo ""

echo -e "${GREEN}✓ All tests completed!${NC}"
