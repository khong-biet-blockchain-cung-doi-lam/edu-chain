#!/bin/bash
# Script chạy tests trên Docker
# Usage: ./run_docker_tests.sh

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║  Running Test Suite on Docker                      ║"
echo "║  Account & Password Generation from Excel          ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/.."

# Build image
echo "📦 Building Docker image..."
docker build -t edu-chain-test -f docker/Dockerfile.test .

echo ""
echo "🐳 Running tests in Docker container..."
docker run --rm edu-chain-test

echo ""
echo "✅ Tests completed successfully!"
