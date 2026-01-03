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
DB_NAME="${DB_NAME:-portfolio}"
DB_USER="${DB_USER:-postgres}"

# Function to run migration
run_migration() {
    local action=$1
    
    echo -e "${YELLOW}Running migrations: $action${NC}"
    echo -e "${YELLOW}Database: $DB_NAME@$DB_HOST:$DB_PORT${NC}"
    echo ""
    
    # Find all migration files in order
    if [ "$action" = "up" ]; then
        migration_files=$(ls migrations/*_*.up.sql 2>/dev/null | sort)
    else
        migration_files=$(ls migrations/*_*.down.sql 2>/dev/null | sort -r)
    fi
    
    if [ -z "$migration_files" ]; then
        echo -e "${RED}Error: No migration files found${NC}"
        exit 1
    fi
    
    # Run each migration
    for migration_file in $migration_files; do
        echo -e "${YELLOW}→ Running: $migration_file${NC}"
        PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Migration failed: $migration_file${NC}"
            exit 1
        fi
    done
    
    echo ""
    echo -e "${GREEN}✓ All migrations completed successfully!${NC}"
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
        echo "  DB_NAME     - Database name (default: portfolio)"
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
