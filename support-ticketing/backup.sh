#!/bin/bash
# Backup osTicket from server and download to local machine.
# Run from: ~/selfcare-jalali-pwa
set -e

SERVER="ubuntu@95.38.186.86"
BACKUP_DIR="./osticket-backup"
DATE=$(date +%Y%m%d_%H%M%S)

echo "==> Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

echo "==> Dumping MySQL database..."
ssh "$SERVER" "
  CFG=/var/www/osticket/include/ost-config.php
  DBHOST=\$(grep -oP \"define\('DBHOST',\s*'\\K[^']+\" \$CFG)
  DBNAME=\$(grep -oP \"define\('DBNAME',\s*'\\K[^']+\" \$CFG)
  DBUSER=\$(grep -oP \"define\('DBUSER',\s*'\\K[^']+\" \$CFG)
  DBPASS=\$(grep -oP \"define\('DBPASS',\s*'\\K[^']+\" \$CFG)
  mysqldump -h\"\$DBHOST\" -u\"\$DBUSER\" -p\"\$DBPASS\" \"\$DBNAME\" > /tmp/osticket_db.sql
  echo 'DB dump done'
"
scp "$SERVER:/tmp/osticket_db.sql" "$BACKUP_DIR/osticket_db_$DATE.sql"

echo "==> Archiving osTicket files..."
ssh "$SERVER" "sudo tar -czf /tmp/osticket_files.tar.gz -C /var/www osticket"
scp "$SERVER:/tmp/osticket_files.tar.gz" "$BACKUP_DIR/osticket_files_$DATE.tar.gz"

echo "==> Saving nginx config..."
ssh "$SERVER" "sudo nginx -T 2>/dev/null" > "$BACKUP_DIR/nginx_full_$DATE.conf"

echo "==> Cleaning up temp files on server..."
ssh "$SERVER" "rm -f /tmp/osticket_db.sql /tmp/osticket_files.tar.gz"

echo ""
echo "Backup saved to $BACKUP_DIR/"
ls -lh "$BACKUP_DIR/"
