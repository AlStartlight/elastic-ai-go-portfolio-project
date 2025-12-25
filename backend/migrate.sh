#!/bin/bash

# Database Migration Script
# Usage: ./migrate.sh [up|down]

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values - CHANGE THESE to match your setup
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portfolio_db}"
DB_USER="${DB_USER:-postgres}"

# Function to run migration
run_migration() {
    local action=$1
    local migration_file="migrations/003_create_dynamic_content.${action}.sql"
    
    if [ ! -f "$migration_file" ]; then
        echo -e "${RED}Error: Migration file not found: $migration_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Running migration: $action${NC}"
    echo -e "${YELLOW}Database: $DB_NAME@$DB_HOST:$DB_PORT${NC}"
    echo ""
    
    # Run the migration
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migration completed successfully!${NC}"
    else
        echo -e "${RED}✗ Migration failed!${NC}"
        exit 1
    fi
}

# Main script
case "$1" in
    up)
        run_migration "up"
        ;;
    down)
        run_migration "down"
        ;;
    *)
        echo "Usage: $0 [up|down]"
        echo ""
        echo "Environment variables (optional):"
        echo "  DB_HOST     - Database host (default: localhost)"
        echo "  DB_PORT     - Database port (default: 5432)"
        echo "  DB_NAME     - Database name (default: portfolio_db)"
        echo "  DB_USER     - Database user (default: postgres)"
        echo "  DB_PASSWORD - Database password (required if password auth is enabled)"
        echo ""
        echo "Examples:"
        echo "  $0 up                                    # Run migration with defaults"
        echo "  DB_NAME=mydb DB_USER=admin $0 up         # Run with custom settings"
        echo "  DB_PASSWORD=secret $0 up                 # Run with password"
        exit 1
        ;;
esac
