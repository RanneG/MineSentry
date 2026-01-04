# Testing the Detection Pipeline

## Quick Status Check

The detection pipeline is **fully implemented and connected**. Here's how to test it:

## Option 1: Test Without Bitcoin Core (Quick Test)

The code works even without Bitcoin Core running, but detection will return errors:

1. **Start the API server:**
   ```bash
   python api.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Submit a report through the UI:**
   - Go to "Submit Report"
   - Fill in the form (use any test data)
   - Submit the report

4. **View detection results:**
   - Go to the report detail page
   - Click "Validate Report" button
   - You'll see detection results (confidence score: 0% due to RPC error)
   - This confirms the pipeline is working, even if Bitcoin Core isn't running

**Expected behavior:** Detection runs but returns error message because Bitcoin RPC isn't available. The UI still displays the error message, confirming the pipeline is connected.

## Option 2: Test With Real Bitcoin Data (Full Test)

For real detection analysis, you need Bitcoin Core running:

### For Testnet (Recommended for Testing)

1. **Start Bitcoin Core in testnet mode:**
   ```bash
   bitcoind -testnet -daemon
   ```

2. **Update .env file for testnet:**
   ```env
   BITCOIN_RPC_URL=http://127.0.0.1:18332
   BITCOIN_RPC_USER=your_testnet_rpc_user
   BITCOIN_RPC_PASSWORD=your_testnet_rpc_password
   ```

3. **Wait for initial sync** (check progress):
   ```bash
   bitcoin-cli -testnet getblockchaininfo
   ```

4. **Start the API and frontend** (same as Option 1)

5. **Submit a report with a real testnet block:**
   - Get current testnet block height:
     ```bash
     bitcoin-cli -testnet getblockcount
     ```
   - Use a recent block height (e.g., current_height - 100)
   - Submit the report

6. **View real detection results:**
   - Detection will analyze the actual block
   - Run all 10 detection methods
   - Return real confidence scores
   - Show actual evidence

### For Mainnet

**⚠️ WARNING:** Only use mainnet for production. For testing, use testnet!

If you must test on mainnet:
```bash
bitcoind -daemon
# Wait for full sync (this takes hours/days)
```

## What the Detection Pipeline Does

When you submit a report, the system:

1. ✅ **Saves the report** to the database
2. ✅ **Triggers background detection** automatically
3. ✅ **Runs all 10 detection methods:**
   - Missing Transactions Analysis
   - Fee Rate Discrepancy Analysis
   - Block Fullness Analysis
   - Transaction Ordering Analysis
   - Transaction Age Analysis
   - Size Preference Analysis
   - Fee Density Analysis
   - Historical Pattern Comparison
   - Address Pattern Analysis
   - Confirmation Time Analysis

4. ✅ **Calculates confidence score** (0.0 - 1.0)
5. ✅ **Stores results** in the database
6. ✅ **Displays results** in the validation modal

## Verification Steps

After submitting a report:

1. Check the API logs for:
   ```
   Detection completed for report <id>: confidence=X.XX, methods=N
   ```

2. Open the report detail page

3. Click "Validate Report" button

4. Expand "Evidence to Review" section

5. You should see:
   - **Confidence Score** (percentage with color coding)
   - **Detection Methods Triggered** (list of methods)
   - **Missing Transactions** (if any found)
   - **Detection Summary Message**

## Troubleshooting

### "RPC connection error"
- **Cause:** Bitcoin Core not running or wrong credentials
- **Solution:** Start Bitcoin Core or test without it (see Option 1)

### "Confidence score: 0%"
- **Expected** if Bitcoin Core isn't running
- Detection still runs, but can't analyze block data
- Code is working correctly

### "Database readonly error"
- **Cause:** Database file permissions
- **Solution:** 
  ```bash
  chmod 664 minesentry.db
  # Or recreate:
  rm minesentry.db
  python init_db.py
  ```

### Detection results not showing
- Check API logs for errors
- Ensure background task completed (wait a few seconds)
- Refresh the report detail page
- Check browser console for API errors

## Success Criteria

✅ **Pipeline is working if:**
- Report submission succeeds
- API logs show "Detection completed" message
- Validation modal loads (even with 0% confidence if RPC is down)
- You see detection methods, confidence score, and message in the modal

The code is fully functional - it just needs Bitcoin Core running for real data analysis!

