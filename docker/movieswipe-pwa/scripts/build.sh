#!/bin/bash

# ============================================================================
# Build Script for movieswipe-pwa Docker Image
# ============================================================================
# This script builds the Docker image locally for testing and development.
# Usage: ./scripts/build.sh [tag]
# Example: ./scripts/build.sh latest
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
DOCKERFILE_PATH="Dockerfile"
BUILD_CONTEXT="."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
DOCKER_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Print header
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Building Docker Image${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Image: $IMAGE_NAME:$IMAGE_TAG"
echo "Dockerfile: docker/movieswipe-pwa/$DOCKERFILE_PATH"
echo "Build Context: Project root"
echo ""

# Check if Dockerfile exists
if [ ! -f "$DOCKER_DIR/$DOCKERFILE_PATH" ]; then
    echo -e "${RED}Error: Dockerfile not found at $DOCKER_DIR/$DOCKERFILE_PATH${NC}"
    exit 1
fi

# Check if movieswipe-pwa directory exists
if [ ! -d "$PROJECT_ROOT/movieswipe-pwa" ]; then
    echo -e "${RED}Error: movieswipe-pwa directory not found at $PROJECT_ROOT/movieswipe-pwa${NC}"
    exit 1
fi

# Build image from project root
echo -e "${YELLOW}Building image...${NC}"
docker build \
    --tag "$IMAGE_NAME:$IMAGE_TAG" \
    --file "docker/movieswipe-pwa/$DOCKERFILE_PATH" \
    "$PROJECT_ROOT"

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
    echo ""
    
    # Display compose command
    echo -e "${YELLOW}To run with Docker Compose:${NC}"
    echo "cd docker/movieswipe-pwa && docker-compose up -d"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi
