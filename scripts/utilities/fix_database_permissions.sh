#!/bin/bash
# Script to fix database permissions and restart guidance

echo "🔧 Fixing Database Permissions for MineSentry"
echo "=============================================="
echo ""

cd "$(dirname "$0")"

# Make database writable
if [ -f "minesentry.db" ]; then
    echo "1. Making database writable..."
    chmod 664 minesentry.db
    echo "   ✅ Permissions updated"
else
    echo "1. Creating new database..."
    python3 init_db.py
    echo "   ✅ Database created"
fi

echo ""
echo "2. Verifying database is writable..."
python3 -c "
import sqlite3
try:
    conn = sqlite3.connect('minesentry.db')
    cursor = conn.cursor()
    cursor.execute('SELECT 1')
    conn.close()
    print('   ✅ Database is accessible')
except Exception as e:
    print(f'   ❌ Error: {e}')
    exit(1)
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT NEXT STEP:"
echo ""
echo "You MUST restart your API server for changes to take effect:"
echo ""
echo "  1. Stop the API server (Ctrl+C in terminal running 'python api.py')"
echo "  2. Start it again: python api.py"
echo "  3. Then try submitting a report"
echo ""
echo "The API server needs to reopen the database connection with"
echo "the new permissions for the fix to work."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

