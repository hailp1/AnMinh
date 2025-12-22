#!/bin/bash
# Database Backup Script for DMS System
# Run this daily via cron job

# Configuration
BACKUP_DIR="d:/AM_DMS/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dms_backup_$DATE.sql"
RETENTION_DAYS=7

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

echo "=== DMS Database Backup ==="
echo "Started at: $(date)"
echo "Backup file: $BACKUP_FILE"

# Perform backup
docker exec dms_postgres pg_dump -U postgres dms > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup successful!"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Get file size
    SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "📦 Backup size: $SIZE"
    
    # Delete old backups
    echo "🗑️  Cleaning old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "dms_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    echo "✅ Backup completed successfully!"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "Finished at: $(date)"
