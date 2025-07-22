#!/bin/bash
echo "=== Testing Render-like Environment ==="

# Simulate Render's environment
export NODE_ENV=production
export CI=true
export RENDER=true

echo "Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "CI: $CI"
echo "RENDER: $RENDER"

# Test the build script
echo "Running build script:"
npm run build

echo "Test completed!" 