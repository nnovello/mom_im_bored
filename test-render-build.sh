#!/bin/bash
echo "=== Testing Build Process (Render-like environment) ==="

# Simulate Render's environment
export NODE_ENV=production
export CI=true

echo "NODE_ENV: $NODE_ENV"
echo "CI: $CI"

# Test if react-scripts is available
echo "Testing react-scripts availability:"
if command -v react-scripts &> /dev/null; then
    echo "✅ react-scripts found in PATH"
else
    echo "❌ react-scripts not found in PATH"
    echo "Checking node_modules/.bin:"
    ls -la node_modules/.bin/react-scripts
fi

# Test the build command
echo "Running build command:"
npm run build

echo "Build test completed!" 