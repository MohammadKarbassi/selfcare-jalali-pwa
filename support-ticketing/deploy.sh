#!/bin/bash
# Builds the app and deploys to 95.38.186.86 via SSH.
# Run from ~/support-ticketing OR from ~/selfcare-jalali-pwa after git pull.
set -e

# Find the directory that has package.json (the real build root)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/package.json" ]; then
  BUILD_DIR="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../package.json" ]; then
  # Make sure the parent is NOT the selfcare-jalali-pwa monorepo root
  PARENT_NAME=$(node -p "try{require('$SCRIPT_DIR/../package.json').name}catch(e){''}" 2>/dev/null || echo "")
  if [ "$PARENT_NAME" = "selfcare-jalali-pwa" ]; then
    echo "Error: این اسکریپت باید از ~/support-ticketing/ اجرا شود، نه از داخل گیت ریپو."
    echo "دستور صحیح: cd ~/support-ticketing && ./deploy.sh"
    exit 1
  fi
  BUILD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  echo "Error: could not find package.json. Run from ~/support-ticketing."
  exit 1
fi
cd "$BUILD_DIR"

SERVER="ubuntu@95.38.186.86"
REMOTE_DIR="/var/www/support-ticketing"

echo "==> Building from $BUILD_DIR ..."
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
SCRIPT_DIR_REAL="$(cd "$(dirname "$0")" && pwd)"
scp "$SCRIPT_DIR_REAL/server-scripts/status.php" "$SERVER:/tmp/status.php"
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
