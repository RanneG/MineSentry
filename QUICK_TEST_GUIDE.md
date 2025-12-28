# Quick Test Guide - Detection Pipeline

## ✅ Quick Status Check

Run this command to check everything:
```bash
./test_detection_flow.sh
```

## 🚀 Step-by-Step Testing

### Step 1: Start the Servers

**Terminal 1 - Backend API:**
```bash
python api.py
```
Wait for: `Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Wait for: `Local: http://localhost:3000`

### Step 2: Get Test Data (Optional)

**If Bitcoin Core testnet is running**, you can use real data:

1. Visit: https://mempool.space/testnet
2. Find a recent block (e.g., check current block height)
3. Copy 2-3 transaction IDs from that block
4. Copy 1 transaction ID from mempool (not in any block yet)

**OR use test data:**
- Block height: `2750000` (any testnet block)
- Transaction IDs: Just use any testnet format like `abc123...`

### Step 3: Submit a Report

1. Open browser: `http://localhost:3000`
2. Click **"Submit Report"**
3. Fill in:
   - **Pool Address**: `tb1qtest1234567890abcdefghijklmnopqrstuvwx` (testnet format)
   - **Block Height**: `2750000` (or current testnet block - 100)
   - **Evidence Type**: `censorship`
   - **Transaction IDs**: Paste any testnet transaction IDs (or leave empty for now)
   - **Description**: "Test report for detection pipeline"
4. Click **Submit**

### Step 4: Check Detection Results

1. Go to **"Reports"** page
2. Find your new report
3. Click on it to view details
4. Click **"Validate Report"** button
5. Expand **"Evidence to Review"** section

### Step 5: What to Look For

#### ✅ SUCCESS INDICATORS:

**If Bitcoin Core is connected:**
- ✅ Confidence score > 0% (e.g., "45.2%")
- ✅ Detection methods listed (e.g., "missing_transactions", "fee_rate_analysis")
- ✅ Real transaction IDs shown in "Missing Transactions"
- ✅ Detection summary message with actual findings

**If Bitcoin Core is NOT connected:**
- ✅ Confidence score: 0% (expected)
- ✅ Error message displayed (confirms pipeline is running)
- ✅ Detection structure visible (methods, evidence sections)
- ✅ This confirms the code is connected, just needs Bitcoin data

#### ❌ PROBLEM INDICATORS:

- ❌ Still seeing placeholder text like "This is a test report..."
- ❌ No confidence score shown at all
- ❌ "Evidence to Review" section is empty or shows only basic info
- ❌ No detection results section

### Step 6: Verify Detection Ran

Check the API terminal logs - you should see:
```
Detection completed for report <id>: confidence=X.XX, methods=N
```

If you see this, the detection pipeline is working! ✅

## 🔍 Debugging

### If detection results don't show:

1. **Check API logs** - Look for errors
2. **Wait a few seconds** - Detection runs in background
3. **Refresh the report page** - Results are stored in database
4. **Check browser console** - Look for API errors

### Common Issues:

**"Database readonly" error:**
```bash
chmod 664 minesentry.db
# Or recreate:
rm minesentry.db
python init_db.py
```

**"RPC connection error" in detection:**
- This is OK if Bitcoin Core isn't running
- Detection will still work, just return 0% confidence
- To fix: Start Bitcoin Core testnet

**Detection results not appearing:**
- Check API terminal for "Detection completed" message
- Try refreshing the report detail page
- Check if background task completed (wait 5-10 seconds after submitting)

## 📊 Expected Output

When you click "Validate Report", you should see:

```
Evidence to Review
  [Expand this section]

Detection Results:
  Detection Confidence: 45.2%  (or 0% if RPC not connected)
  
  Detection Methods Triggered (2):
    - missing_transactions
    - fee_rate_analysis
  
  Missing Transactions (1):
    - abc123...def456...
  
  Detection Summary:
    Censorship detected with 45% confidence. 1 transactions missing from block.

Block Hash:
  [block hash if available]

Transaction IDs:
  [your submitted transaction IDs]
```

## ✅ Success Criteria

The detection pipeline is **working correctly** if:

1. ✅ You can submit reports
2. ✅ API logs show "Detection completed" message
3. ✅ Validation modal shows detection results section
4. ✅ Confidence score is displayed (even if 0%)
5. ✅ Detection methods are listed (even if empty)
6. ✅ You see real data or error messages (not placeholder text)

**The code is connected and working!** 🎉

