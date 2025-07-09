#!/bin/bash

echo "BMA Activity Report - Database Setup Script"
echo "=========================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Database configuration
DB_NAME="bma_activity_report"
DB_USER="${DB_USER:-benorbe}"

echo "Setting up database: $DB_NAME"
echo "Database user: $DB_USER"

# Create database
echo "Creating database..."
createdb $DB_NAME 2>/dev/null || echo "Database may already exist, continuing..."

# Run schema
echo "Running database schema..."
psql -d $DB_NAME -f src/database/bma_schema.sql

echo ""
echo "Database setup complete!"
echo ""
echo "To test the connection, run:"
echo "  psql -d $DB_NAME -c '\dt'"
echo ""
echo "Next steps:"
echo "1. Start the backend: npm start"
echo "2. In a new terminal, start the frontend: cd client && npm start"
echo "3. Access the app at http://localhost:3001"
echo "4. Default login: admin / BMA2024admin!"