#!/bin/bash
set -e

# Generate secret key
SECRET=$(openssl rand -hex 64)

# Create data directories
sudo mkdir -p /data/storage /data/postgres /data/redis
sudo chown -R ubuntu:ubuntu /data

# Create .env from template
sed "s/REPLACE_WITH_64_CHAR_HEX/$SECRET/" chatwoot.env > .env

echo "==> .env created with generated SECRET_KEY_BASE"
echo "==> Starting postgres and redis first..."
docker compose up -d postgres redis

echo "==> Waiting 10s for postgres to initialize..."
sleep 10

echo "==> Running database preparation..."
docker compose run --rm rails bundle exec rails db:chatwoot_prepare

echo "==> Starting all services..."
docker compose up -d

echo ""
echo "Done! Chatwoot is starting at http://95.38.186.86:3000"
echo "Wait ~30 seconds then open in browser to create admin account."
