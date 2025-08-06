# Webmail Auth Redirect Setup

This project sets up an Nginx redirect from `webmail-auth001.ibeddcoutsource.org` to `webmail-auth001.molecullesoft.com` with support for the specific encryption path `/cpsess/prompt`.

## 🎯 Purpose

This setup is designed for ethical purposes in a safe environment to redirect webmail authentication requests from one domain to another while preserving the encryption parameters.

## 📁 Project Structure

```
.
├── nginx.conf                                    # Main Nginx configuration
├── webmail-auth001.ibeddcoutsource.org.conf     # Server block configuration
├── Dockerfile                                    # Docker container setup
├── docker-compose.yml                           # Docker Compose configuration
├── setup.sh                                     # Automated setup script
├── README.md                                    # This file
├── logs/                                        # Nginx log directory (created by setup)
└── ssl/                                         # SSL certificates directory (created by setup)
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- SSL certificates for `webmail-auth001.ibeddcoutsource.org` (optional for testing)

### Step 1: Clone and Setup

```bash
# Navigate to the project directory
cd /path/to/this/project

# Run the automated setup script
./setup.sh
```

### Step 2: SSL Certificate Setup (Recommended)

For production use, you'll need SSL certificates:

```bash
# Create SSL directory
mkdir -p ssl

# Option 1: Use your existing certificates
cp /path/to/your/certificate.crt ssl/
cp /path/to/your/private.key ssl/

# Option 2: Generate self-signed certificates for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/private.key -out ssl/certificate.crt
```

### Step 3: Deploy

```bash
# Start the service
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔧 Configuration Details

### Redirect Rules

The configuration handles two types of redirects:

1. **Specific Path Redirect**: `/cpsess/prompt` with query parameters
   - Preserves all query parameters including encryption tokens
   - Redirects to: `https://webmail-auth001.molecullesoft.com/cpsess/prompt?[query_string]`

2. **General Redirect**: All other paths
   - Redirects to: `https://webmail-auth001.molecullesoft.com[request_uri]`

### Security Features

- HTTP to HTTPS redirect
- Security headers (X-Frame-Options, XSS Protection, etc.)
- SSL/TLS configuration with modern ciphers
- Request logging for monitoring

## 🧪 Testing

### Test the Redirect

```bash
# Test the specific encryption path
curl -I "https://webmail-auth001.ibeddcoutsource.org/cpsess/prompt?fromPWA=1&pwd=&_x_zm_rtaid=I7SQ3VePRPS/cndRs57BvQ.1709509974548/&_x_zm_rhtaid="

# Test general redirect
curl -I "https://webmail-auth001.ibeddcoutsource.org/"

# Test with verbose output
curl -v "https://webmail-auth001.ibeddcoutsource.org/cpsess/prompt?fromPWA=1&pwd=&_x_zm_rtaid=I7SQ3VePRPS/cndRs57BvQ.1709509974548/&_x_zm_rhtaid="
```

### Expected Response

You should see a `301 Moved Permanently` response with a `Location` header pointing to the target domain.

## 📊 Monitoring

### View Logs

```bash
# View real-time logs
docker-compose logs -f

# View specific log files
tail -f logs/webmail-auth001.ibeddcoutsource.org.access.log
tail -f logs/webmail-auth001.ibeddcoutsource.org.error.log
```

### Health Check

The container includes a health check that runs every 30 seconds:

```bash
# Check container health
docker-compose ps
```

## 🛠️ Management Commands

```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down

# Restart the service
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# View container logs
docker-compose logs -f

# Access container shell
docker-compose exec nginx-redirect sh
```

## 🔒 SSL Certificate Management

### Automatic SSL (Let's Encrypt)

For automatic SSL certificate management, you can integrate with Let's Encrypt:

```bash
# Install certbot
apt-get update && apt-get install -y certbot

# Generate certificate
certbot certonly --standalone -d webmail-auth001.ibeddcoutsource.org

# Copy certificates
cp /etc/letsencrypt/live/webmail-auth001.ibeddcoutsource.org/fullchain.pem ssl/certificate.crt
cp /etc/letsencrypt/live/webmail-auth001.ibeddcoutsource.org/privkey.pem ssl/private.key
```

### Manual SSL Certificate Renewal

```bash
# Stop the service
docker-compose down

# Update certificates
# ... update your certificates in ssl/ directory ...

# Restart the service
docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :80
   netstat -tulpn | grep :443
   
   # Stop conflicting services
   sudo systemctl stop apache2  # if Apache is running
   sudo systemctl stop nginx    # if Nginx is running
   ```

2. **SSL Certificate Errors**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/certificate.crt -text -noout
   
   # Verify certificate matches domain
   openssl x509 -in ssl/certificate.crt -noout -subject
   ```

3. **Container Won't Start**
   ```bash
   # Check container logs
   docker-compose logs
   
   # Test nginx configuration
   docker-compose exec nginx-redirect nginx -t
   ```

### Debug Mode

To run in debug mode with more verbose logging:

```bash
# Edit the nginx configuration to increase log level
# Add this line to the http block in nginx.conf:
# error_log /var/log/nginx/error.log debug;

# Rebuild and restart
docker-compose up -d --build
```

## 📝 DNS Configuration

Make sure your DNS is properly configured:

```bash
# Add A record for webmail-auth001.ibeddcoutsource.org
# Point it to your server's IP address

# Test DNS resolution
nslookup webmail-auth001.ibeddcoutsource.org
dig webmail-auth001.ibeddcoutsource.org
```

## 🔄 Updates and Maintenance

### Update Configuration

1. Edit the configuration files as needed
2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

### Backup Configuration

```bash
# Create backup
tar -czf webmail-redirect-backup-$(date +%Y%m%d).tar.gz \
    nginx.conf \
    webmail-auth001.ibeddcoutsource.org.conf \
    docker-compose.yml \
    Dockerfile \
    ssl/
```

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify DNS configuration
3. Test SSL certificates
4. Check firewall settings

## ⚖️ Legal and Ethical Considerations

This setup is intended for ethical purposes in a safe environment. Ensure you have proper authorization and comply with all applicable laws and regulations regarding domain redirects and webmail access.