#!/bin/bash

echo "🔄 Rebuilding and redeploying MedVision Backend..."

# Stop and remove containers
echo "🛑 Stopping containers..."
docker-compose down

# Rebuild the app container
echo "🔨 Rebuilding app container..."
docker-compose build --no-cache app

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Show logs
echo "📋 Showing logs..."
docker-compose logs -f --tail=100
