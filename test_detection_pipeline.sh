#!/bin/bash
# Quick test script to check if detection pipeline is working

echo "🔍 Testing Detection Pipeline"
echo "=============================="
echo ""

DB_FILE="minesentry.db"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    exit 1
fi

echo "1. Checking latest report in database..."
echo ""

# Get the latest report
LATEST_REPORT=$(sqlite3 "$DB_FILE" "SELECT report_id, reporter_address, block_height, status, timestamp FROM mining_pool_reports ORDER BY timestamp DESC LIMIT 1;")

if [ -z "$LATEST_REPORT" ]; then
    echo "❌ No reports found in database"
    echo "   Please submit a report first!"
    exit 1
fi

echo "✅ Latest report found:"
echo "$LATEST_REPORT" | awk -F'|' '{print "   Report ID: " $1; print "   Reporter: " $2; print "   Block Height: " $3; print "   Status: " $4; print "   Timestamp: " $5}'
echo ""

echo "2. Checking detection results..."
echo ""

# Extract report_id (first field)
REPORT_ID=$(echo "$LATEST_REPORT" | cut -d'|' -f1)

# Get description field which contains detection_results
DESCRIPTION=$(sqlite3 "$DB_FILE" "SELECT description FROM mining_pool_reports WHERE report_id='$REPORT_ID';")

if [ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" = "" ]; then
    echo "⚠️  No description field found"
    echo "   This means detection may not have run yet"
    exit 1
fi

# Check if description contains detection_results JSON
if echo "$DESCRIPTION" | grep -q "detection_results"; then
    echo "✅ Detection results found in database!"
    echo ""
    echo "Detection results (formatted):"
    echo "$DESCRIPTION" | python3 -m json.tool 2>/dev/null | grep -A 20 "detection_results" || echo "$DESCRIPTION"
    echo ""
    
    # Extract confidence_score using Python
    CONFIDENCE=$(echo "$DESCRIPTION" | python3 -c "
import sys
import json
try:
    data = json.load(sys.stdin)
    if 'detection_results' in data:
        score = data['detection_results'].get('confidence_score', 'N/A')
        is_censored = data['detection_results'].get('is_censored', 'N/A')
        error = data['detection_results'].get('error', False)
        methods = data['detection_results'].get('detection_methods', [])
        message = data['detection_results'].get('message', 'N/A')
        
        print(f'   Confidence Score: {score}')
        print(f'   Is Censored: {is_censored}')
        print(f'   Error: {error}')
        print(f'   Detection Methods: {len(methods)} methods')
        if methods:
            print(f'      Methods: {", ".join(methods[:3])}')
        print(f'   Message: {message[:100]}...')
    else:
        print('   ⚠️  No detection_results found in description')
except:
    print('   ⚠️  Could not parse JSON')
" 2>/dev/null)
    
    echo "$CONFIDENCE"
else
    echo "⚠️  No detection_results found in description field"
    echo "   Description content: ${DESCRIPTION:0:100}..."
fi

echo ""
echo "3. Next Steps:"
echo "   • Go to http://localhost:3000/reports"
echo "   • Find the report with ID: $REPORT_ID"
echo "   • Click 'Validate Report'"
echo "   • Check if you see confidence score and detection methods"

