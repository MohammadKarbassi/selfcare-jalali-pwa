#!/bin/bash
# Restore osTicket on a fresh Ubuntu 22.04 server and deploy support-ticketing.
# Usage: ./restore.sh <server-ip> <backup-dir>
# Example: ./restore.sh 1.2.3.4 ./osticket-backup
set -e

SERVER_IP="${1:?Usage: ./restore.sh <server-ip> <backup-dir>}"
BACKUP_DIR="${2:?Usage: ./restore.sh <server-ip> <backup-dir>}"
SERVER="ubuntu@$SERVER_IP"

DB_SQL=$(ls "$BACKUP_DIR"/osticket_db_*.sql 2>/dev/null | sort | tail -1)
FILES_TGZ=$(ls "$BACKUP_DIR"/osticket_files_*.tar.gz 2>/dev/null | sort | tail -1)

[ -z "$DB_SQL" ]    && echo "Error: no DB backup found in $BACKUP_DIR" && exit 1
[ -z "$FILES_TGZ" ] && echo "Error: no files backup found in $BACKUP_DIR" && exit 1

echo "==> Using DB:    $DB_SQL"
echo "==> Using Files: $FILES_TGZ"

echo "==> Installing packages on new server..."
ssh "$SERVER" "
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update -qq
  sudo apt-get install -y nginx php8.1 php8.1-fpm php8.1-mysql php8.1-gd php8.1-imap \
    php8.1-mbstring php8.1-xml php8.1-curl php8.1-intl php8.1-zip \
    mysql-server curl rsync
"

echo "==> Fixing DNS (Shecan)..."
ssh "$SERVER" "
  sudo bash -c 'cat >> /etc/systemd/resolved.conf << EOF

[Resolve]
DNS=178.22.122.100 185.51.200.2
EOF'
  sudo systemctl restart systemd-resolved
"

echo "==> Restoring osTicket files..."
scp "$FILES_TGZ" "$SERVER:/tmp/osticket_files.tar.gz"
ssh "$SERVER" "
  sudo tar -xzf /tmp/osticket_files.tar.gz -C /var/www/
  sudo chown -R www-data:www-data /var/www/osticket
  rm /tmp/osticket_files.tar.gz
"

echo "==> Restoring database..."
scp "$DB_SQL" "$SERVER:/tmp/osticket_db.sql"
ssh "$SERVER" "
  CFG=/var/www/osticket/include/ost-config.php
  DBNAME=\$(grep -oP \"define\('DBNAME',\s*'\\K[^']+\" \$CFG)
  DBUSER=\$(grep -oP \"define\('DBUSER',\s*'\\K[^']+\" \$CFG)
  DBPASS=\$(grep -oP \"define\('DBPASS',\s*'\\K[^']+\" \$CFG)
  sudo mysql -e \"CREATE DATABASE IF NOT EXISTS \\\`\$DBNAME\\\`;\"
  sudo mysql -e \"CREATE USER IF NOT EXISTS '\$DBUSER'@'localhost' IDENTIFIED BY '\$DBPASS';\"
  sudo mysql -e \"GRANT ALL ON \\\`\$DBNAME\\\`.* TO '\$DBUSER'@'localhost';\"
  sudo mysql \"\$DBNAME\" < /tmp/osticket_db.sql
  rm /tmp/osticket_db.sql
  echo 'DB restored'
"

echo "==> Configuring nginx for osTicket (port 8080)..."
ssh "$SERVER" "sudo tee /etc/nginx/sites-available/osticket > /dev/null" << 'NGINX_OST'
server {
    listen 8080;
    server_name _;
    root /var/www/osticket;
    index index.php;

    location ~ ^/api/(.*)$ {
        rewrite ^/api/(.*)$ /api/http.php?$1 last;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\. { deny all; }
    location ~ ^/(include|config)/ { deny all; }
}
NGINX_OST

ssh "$SERVER" "
  sudo ln -sf /etc/nginx/sites-available/osticket /etc/nginx/sites-enabled/osticket
  sudo systemctl enable php8.1-fpm && sudo systemctl start php8.1-fpm
  sudo nginx -t && sudo systemctl reload nginx
"

echo ""
echo "==> osTicket restored! Now deploying React support app..."
echo "    Run: ./support-ticketing/deploy.sh"
echo ""
echo "Done! osTicket at http://$SERVER_IP:8080"
echo "      Support app: run deploy.sh to build and deploy"
