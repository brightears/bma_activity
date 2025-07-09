#!/bin/bash

echo "Starting Render build process..."

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
cd client
npm install

echo "Building frontend..."
npm run build

cd ..

echo "Build complete!"