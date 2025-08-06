#!/bin/bash

# Webmail Auth Redirect Setup Script
# This script sets up the Nginx redirect from webmail-auth001.ibeddcoutsource.org to webmail-auth001.molecullesoft.com

set -e

echo "🚀 Setting up Webmail Auth Redirect..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p ssl

# Check if SSL certificates exist
if [ ! -f "ssl/certificate.crt" ] || [ ! -f "ssl/private.key" ]; then
    echo "⚠️  SSL certificates not found in ssl/ directory"
    echo "📝 Please add your SSL certificates:"
    echo "   - ssl/certificate.crt"
    echo "   - ssl/private.key"
    echo ""
    echo "🔧 Or you can generate self-signed certificates for testing:"
    echo "   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
    echo "   -keyout ssl/private.key -out ssl/certificate.crt"
    echo ""
    read -p "Do you want to continue without SSL certificates? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update nginx configuration if SSL certificates exist
if [ -f "ssl/certificate.crt" ] && [ -f "ssl/private.key" ]; then
    echo "🔒 SSL certificates found, updating configuration..."
    sed -i 's|# ssl_certificate /path/to/your/certificate.crt;|ssl_certificate /etc/nginx/ssl/certificate.crt;|g' webmail-auth001.ibeddcoutsource.org.conf
    sed -i 's|# ssl_certificate_key /path/to/your/private.key;|ssl_certificate_key /etc/nginx/ssl/private.key;|g' webmail-auth001.ibeddcoutsource.org.conf
    
    # Update docker-compose to mount SSL certificates
    sed -i 's|# - ./ssl/certificate.crt:/etc/nginx/ssl/certificate.crt:ro|- ./ssl/certificate.crt:/etc/nginx/ssl/certificate.crt:ro|g' docker-compose.yml
    sed -i 's|# - ./ssl/private.key:/etc/nginx/ssl/private.key:ro|- ./ssl/private.key:/etc/nginx/ssl/private.key:ro|g' docker-compose.yml
fi

# Build and start the container
echo "🐳 Building and starting Docker container..."
docker-compose up -d --build

# Check if container is running
echo "🔍 Checking container status..."
sleep 5
if docker-compose ps | grep -q "Up"; then
    echo "✅ Container is running successfully!"
    echo ""
    echo "🌐 Redirect Configuration:"
    echo "   From: https://webmail-auth001.ibeddcoutsource.org"
    echo "   To:   https://webmail-auth001.molecullesoft.com"
    echo ""
    echo "🔗 Test the redirect:"
    echo "   curl -I https://webmail-auth001.ibeddcoutsource.org/cpsess/prompt?fromPWA=1&pwd=&_x_zm_rtaid=I7SQ3VePRPS/cndRs57BvQ.1709509974548/&_x_zm_rhtaid="
    echo ""
    echo "📊 View logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop the service:"
    echo "   docker-compose down"
else
    echo "❌ Container failed to start. Check logs:"
    docker-compose logs
    exit 1
fi