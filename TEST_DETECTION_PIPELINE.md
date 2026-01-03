# Testing Guide: Is the Detection Pipeline Working?

## The Goal

We need to check if submitting a report actually triggers the detection spells and shows real results (not placeholder text).

## What We're Looking For

We want to see **real Bitcoin analysis results** in the "Validate Report" page, not the old fake text that says "This is a test report at suggest potential."

## Quick Test - Do This Now

### Step 1: Submit a Test Report

1. Go to `http://localhost:3000`

2. Click **"Submit Report"**

3. Fill in:

   - **Reporter Address:** `tb1qtest1234567890abcdefghijklmnopqrstuvwx`
   - **Pool Address:** `tb1qpool1234567890abcdefghijklmnopqrstuvwxy`
   - **Block Height:** `2750000`
   - **Evidence Type:** `censorship`
   - **Transaction IDs:** (leave empty for this test)
   - **Description:** `Testing the detection pipeline`

4. Click **Submit**

### Step 2: Check the Database Immediately

**Open your terminal** and run this command:

```bash
./test_detection_pipeline.sh
```

**Or manually check:**

```bash
# Get latest report ID
sqlite3 minesentry.db "SELECT report_id, block_height, timestamp FROM mining_pool_reports ORDER BY timestamp DESC LIMIT 1;"

# Check if detection_results exist (replace REPORT_ID with actual ID from above)
sqlite3 minesentry.db "SELECT description FROM mining_pool_reports WHERE report_id='REPORT_ID';" | python3 -m json.tool | grep -A 10 "detection_results"
```

**Tell me what it shows:**

- `confidence_score: 0.45` → **Good!** Detection is working
- `confidence_score: 0.0` and `error: true` → Bitcoin Core not running (expected if you haven't started it)
- `confidence_score: 0.0` and `error: false` → Detection ran but found nothing
- `confidence_score: NULL` or no `detection_results` → **Problem!** Detection didn't run
- Nothing returned → Report didn't save at all

### Step 3: Look at the "Validate Report" Page

1. Go to the **"Reports"** page
2. Find your new report
3. Click **"Validate Report"**
4. **Look carefully at what appears**

**Good Signs (It's Working):**

- You see a **confidence score** like "45%" (may be 0% if no Bitcoin Core)
- You see **detection methods** listed (like "Missing Transactions", "Fee Rate Discrepancy")
- You see **actual evidence** (transaction IDs, numbers, percentages)
- You see a clear **error message** if Bitcoin Core isn't running (with instructions)
- The old placeholder text is **gone**

**Bad Signs (Not Working):**

- You still see: *"This is a test report at suggest potential"*
- No confidence score appears
- Just shows your submitted description, no analysis
- No error message even when Bitcoin Core isn't running

## What to Do If It's Not Working

If the detection pipeline isn't working, check these files:

### 1. Check `api.py`

Look at the `validate_report_background` function. After saving a report, it should call:

```python
# This should exist in api.py around line 266
detection_results = integration.run_detection_spell(report)
```

### 2. Check `integration_bridge.py`

Open this file. The `run_detection_spell` function should **actually run the spells**, not just return fake data. It should call:

```python
detection_result = self.censorship_spell.detect_censorship(...)
```

### 3. Check the Frontend Modal

Look at `frontend/src/components/ValidateReportModal.tsx`. It should fetch detection results from:

```typescript
apiClient.getReportConfidence(report.report_id)
```

Which calls the API endpoint: `/reports/{report_id}/confidence`

## Simple Database Check

Want to see everything? Run this:

```bash
# Get latest report
sqlite3 minesentry.db "SELECT report_id FROM mining_pool_reports ORDER BY timestamp DESC LIMIT 1;"

# Replace REPORT_ID with the ID from above, then:
sqlite3 minesentry.db "SELECT description FROM mining_pool_reports WHERE report_id='REPORT_ID';" | python3 -m json.tool
```

This shows **all fields** of your latest report, including `detection_results` (which should have JSON data).

## Understanding the Results

| What you see | What it means | Status |
| :--- | :--- | :--- |
| **confidence_score: 0.15-1.0** | ✅ Detection is working! | Working |
| **confidence_score: 0.0, error: false** | Detection ran but found nothing | Working (no issues detected) |
| **confidence_score: 0.0, error: true** | Bitcoin Core not running | Expected (need to start Bitcoin Core) |
| **No detection_results in description** | Detection didn't run | Problem - check api.py |
| **No report in DB** | Submission failed | Problem - check api.py |

## Expected Behavior Without Bitcoin Core

If Bitcoin Core is not running, you should see:
- `confidence_score: 0.0`
- `error: true`
- `error_type: "rpc_connection"`
- Clear error message: "Bitcoin Core is not running or not accessible..."

This is **expected and correct** - the detection pipeline is working, it just can't connect to Bitcoin Core.

## To Test With Real Detection

To see actual detection results:

1. Start Bitcoin Core testnet:
   ```bash
   ./start_bitcoind_testnet.sh
   ```

2. Wait for it to sync (can take time)

3. Submit a report with real testnet data:
   - Get a real block height from testnet
   - Get real transaction IDs from that block
   - Submit the report

4. Check the results - you should see:
   - Confidence score > 0 (if censorship detected)
   - Detection methods triggered
   - Missing transactions (if any)

## Quick Test Script

Use the provided script:

```bash
./test_detection_pipeline.sh
```

This will automatically check your latest report and show detection results.

