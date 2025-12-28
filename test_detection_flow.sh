#!/bin/bash
# Complete test script for the detection pipeline

echo "🧪 MineSentry Detection Pipeline Test Script"
echo "=============================================="
echo ""

# Step 1: Check database
echo "Step 1: Checking database..."
if [ -f "minesentry.db" ]; then
    echo "  ✅ Database file exists"
    # Check if it's writable
    if [ -w "minesentry.db" ]; then
        echo "  ✅ Database is writable"
    else
        echo "  ⚠️  Database may not be writable - fixing permissions..."
        chmod 664 minesentry.db 2>/dev/null || echo "  ⚠️  Could not fix permissions automatically"
    fi
else
    echo "  ⚠️  Database not found - creating..."
    python3 init_db.py
    if [ $? -eq 0 ]; then
        echo "  ✅ Database created"
    else
        echo "  ❌ Failed to create database"
        exit 1
    fi
fi
echo ""

# Step 2: Check if API is running
echo "Step 2: Checking if API server is running..."
API_RUNNING=$(curl -s http://localhost:8000/health 2>/dev/null | grep -q "status" && echo "yes" || echo "no")
if [ "$API_RUNNING" = "yes" ]; then
    echo "  ✅ API server is running on http://localhost:8000"
else
    echo "  ⚠️  API server is NOT running"
    echo "  → Start it in another terminal: python api.py"
fi
echo ""

# Step 3: Check if Frontend is running
echo "Step 3: Checking if Frontend is running..."
FRONTEND_RUNNING=$(curl -s http://localhost:3000 2>/dev/null | grep -q "html" && echo "yes" || echo "no")
if [ "$FRONTEND_RUNNING" = "yes" ]; then
    echo "  ✅ Frontend is running on http://localhost:3000"
else
    echo "  ⚠️  Frontend is NOT running"
    echo "  → Start it in another terminal: cd frontend && npm run dev"
fi
echo ""

# Step 4: Check Bitcoin RPC connection
echo "Step 4: Checking Bitcoin RPC connection..."
if python3 -c "from bitcoin_rpc import BitcoinRPC; rpc = BitcoinRPC(); rpc.get_blockchain_info()" 2>/dev/null; then
    echo "  ✅ Bitcoin RPC is connected"
    BLOCK_HEIGHT=$(python3 -c "from bitcoin_rpc import BitcoinRPC; rpc = BitcoinRPC(); print(rpc.get_block_count())" 2>/dev/null)
    echo "  → Current block height: $BLOCK_HEIGHT"
else
    echo "  ⚠️  Bitcoin RPC is NOT connected"
    echo "  → Detection will still work but return 0% confidence"
    echo "  → To connect: Start Bitcoin Core (see TESTING_GUIDE.md)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Setup Summary:"
echo ""
echo "Database:        ✅ Ready"
if [ "$API_RUNNING" = "yes" ]; then
    echo "API Server:      ✅ Running"
else
    echo "API Server:      ⚠️  Not running (start: python api.py)"
fi
if [ "$FRONTEND_RUNNING" = "yes" ]; then
    echo "Frontend:        ✅ Running"
else
    echo "Frontend:        ⚠️  Not running (start: cd frontend && npm run dev)"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next Steps:"
echo ""
echo "1. Make sure API and Frontend are running (see above)"
echo "2. Open browser to: http://localhost:3000"
echo "3. Go to 'Submit Report'"
echo "4. Submit a test report"
echo "5. Click 'Validate Report' to see detection results"
echo ""
echo "For detailed testing instructions, see TESTING_GUIDE.md"

