#!/bin/bash
# Builds the support-ticketing app and deploys to 95.38.186.86 via SSH.
# Run directly: ./support-ticketing/deploy.sh  (from anywhere in the repo)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

SERVER="ubuntu@95.38.186.86"
REMOTE_DIR="/var/www/support-ticketing"

echo "==> Installing dependencies..."
npm install --prefer-offline --silent

echo "==> Building..."
cat > .env.production.local << 'EOF'
VITE_OSTICKET_URL=/helpdesk
VITE_OSTICKET_API_KEY=194DDDD52DE91330323A12CEDA9CA4E5
EOF
npm run build
rm .env.production.local

echo "==> Uploading to server..."
ssh "$SERVER" "sudo mkdir -p $REMOTE_DIR && sudo chown ubuntu:ubuntu $REMOTE_DIR"
rsync -az --delete dist/ "$SERVER:$REMOTE_DIR/"
ssh "$SERVER" "sudo chmod -R 755 $REMOTE_DIR"

echo "==> Deploying status.php to osTicket..."
scp "$SCRIPT_DIR/server-scripts/status.php" "$SERVER:/tmp/status.php"
ssh "$SERVER" "sudo cp /tmp/status.php /var/www/osticket/status.php && sudo chmod 644 /var/www/osticket/status.php"

echo "==> Configuring nginx..."
ssh "$SERVER" "sudo tee /etc/nginx/sites-available/support-ticketing > /dev/null" << 'NGINX'
server {
    listen 80 default_server;
    server_name _;
    root /var/www/support-ticketing;
    index index.html;
    charset utf-8;

    underscores_in_headers on;

    location /helpdesk/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
NGINX

ssh "$SERVER" "sudo ln -sf /etc/nginx/sites-available/support-ticketing /etc/nginx/sites-enabled/support-ticketing \
  && sudo rm -f /etc/nginx/sites-enabled/default \
  && sudo nginx -t && sudo systemctl reload nginx"

echo ""
echo "Done! http://95.38.186.86"
