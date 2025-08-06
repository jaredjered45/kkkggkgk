FROM nginx:alpine

# Copy the main nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the server configuration
COPY webmail-auth001.ibeddcoutsource.org.conf /etc/nginx/conf.d/

# Copy website files
COPY website/ /var/www/html/

# Create log directories
RUN mkdir -p /var/log/nginx

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]