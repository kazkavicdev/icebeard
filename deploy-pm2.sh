#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "===== Starting deployment $(date) ====="

# Pull latest changes
echo "Pulling latest changes..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install

# Create data directory for SQLite if it doesn't exist
echo "Setting up database directory..."
mkdir -p data
chmod 777 data
touch data/sqlite.db
chmod 666 data/sqlite.db

# Backup database if it exists
if [ -f "data/sqlite.db" ] && [ -s "data/sqlite.db" ]; then
  echo "Backing up existing database..."
  cp data/sqlite.db data/sqlite.db.backup.$(date +%Y%m%d%H%M%S)
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Verify database connection
echo "Verifying database connection..."
npx prisma db pull --force || {
  echo "Database connection failed. Check permissions and path."
  exit 1
}

# Start or restart the application with PM2
echo "Starting/restarting application with PM2..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

echo "===== Deployment completed successfully $(date) =====" 