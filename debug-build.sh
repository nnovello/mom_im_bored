#!/bin/bash
echo "=== Debug Build Script ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Checking if react-scripts exists:"
ls -la node_modules/.bin/react-scripts
echo "Checking package.json:"
cat package.json | grep -A 5 -B 5 "react-scripts"
echo "Running build command:"
npm run build 