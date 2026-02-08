#!/bin/bash
# Script chạy tests trên Docker (moved to backend/scripts)
# Usage: ./run_docker_tests.sh

set -e

echo "Running Test Suite on Docker (backend/scripts)"

dir=$(cd "$(dirname "$0")/.." && pwd)
cd "$dir"

# Build image
echo "📦 Building Docker image..."
docker build -t edu-chain-test -f Dockerfile.test .

echo ""
echo "🐳 Running tests in Docker container..."
docker run --rm edu-chain-test

echo ""
echo "Tests completed successfully!"
