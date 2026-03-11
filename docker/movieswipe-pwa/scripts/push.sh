#!/bin/bash

# ============================================================================
# Push Script for movieswipe-pwa Docker Image
# ============================================================================
# This script manually pushes the Docker image to Docker Hub.
# Usage: ./scripts/push.sh [tag]
# Example: ./scripts/push.sh latest
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
    echo -e "${YELLOW}Set it with: export DOCKER_USERNAME=your_username${NC}"
    exit 1
fi

# Check if image exists
if ! docker images "$IMAGE_NAME:$IMAGE_TAG" | grep -q "$IMAGE_TAG"; then
    echo -e "${RED}Error: Image $IMAGE_NAME:$IMAGE_TAG not found${NC}"
    exit 1
fi

# Check Docker login
echo -e "${YELLOW}Checking Docker login...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Not logged in to Docker Hub${NC}"
    echo -e "${YELLOW}Run: docker login${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker login verified${NC}"
echo ""

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
echo ""

echo -e "${GREEN}✓ Push completed successfully!${NC}"
