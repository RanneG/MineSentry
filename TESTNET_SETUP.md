# Testnet Setup Guide

This guide explains how to configure MineSentry for Bitcoin testnet testing.

## Overview

Testing on testnet is recommended before deploying to mainnet. Testnet allows you to:
- Test without risking real Bitcoin
- Verify all system components
- Test payment flows with testnet Bitcoin
- Debug issues safely

## Bitcoin Core Testnet Configuration

### 1. Configure Bitcoin Core for Testnet

Edit your `bitcoin.conf` file:

```conf
# Enable testnet
testnet=1

# RPC Configuration (same as mainnet)
server=1
rpcuser=minesentry
rpcpassword=your_secure_password
rpcport=18332  # Testnet RPC port (default: 18332)
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
```

**Important**: Testnet uses port `18332` instead of `8332` for RPC.

### 2. Update .env Configuration

Update your `.env` file for testnet:

```env
# Bitcoin RPC Configuration (TESTNET)
BITCOIN_RPC_URL=http://127.0.0.1:18332
BITCOIN_RPC_USER=minesentry
BITCOIN_RPC_PASSWORD=your_secure_password
```

### 3. Restart Bitcoin Core

Restart Bitcoin Core to apply testnet configuration:

```bash
bitcoin-cli stop
# Wait a few seconds
bitcoind -testnet -daemon
```

### 4. Verify Testnet Connection

```bash
# Check if on testnet
bitcoin-cli -testnet getblockchaininfo | grep chain

# Should show: "chain": "test"

# Get testnet block count
bitcoin-cli -testnet getblockcount
```

## Running the Testnet Trial

### Quick Test

```bash
cd /Users/rannegerodias/Desktop/MineSentry
source venv/bin/activate
python testnet_trial.py
```

### What the Trial Tests

1. **Bitcoin RPC Connection** - Verifies connection to testnet node
2. **Database Connection** - Tests database access
3. **Integration Bridge** - Initializes integration system
4. **System Status** - Checks overall system health
5. **Report Submission** - Tests submitting a report
6. **Report Validation** - Tests validation with spells
7. **Bounty Contract** - Tests contract if configured

### Expected Output

```
============================================================
MineSentry Testnet Trial
============================================================

[1/6] Testing Bitcoin RPC connection...
✅ PASSED: Bitcoin RPC Connection
         Connected to test network (block height: 2500000)

[2/6] Testing database connection...
✅ PASSED: Database Connection
         Database connection successful

...
```

## Testnet Addresses

Use testnet addresses (starting with `tb1`, `tb1q`, `m`, `n`, or `2`):

- **Testnet Bech32**: `tb1q...`
- **Testnet Legacy**: `m...` or `n...`
- **Testnet Script Hash**: `2...`

**Example testnet addresses**:
- `tb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` (valid format, placeholder)
- `mzBc4XEFSdzCDcTxAgf6EZXgsZWpztRhef` (legacy testnet)

## Getting Testnet Bitcoin

### Option 1: Testnet Faucets

Use testnet faucets to get free testnet Bitcoin:
- https://bitcoinfaucet.uo1.net/
- https://testnet-faucet.mempool.co/
- https://kuttler.eu/en/bitcoin/btc/faucet/

### Option 2: Mine Testnet Blocks

If you have mining hardware, you can mine testnet blocks directly.

### Option 3: Exchange Testnet

Some exchanges and services offer testnet Bitcoin exchange.

## Testing Payment Flows

### 1. Fund Bounty Contract (Testnet)

```python
from integration_bridge import get_integration

integration = get_integration()
if integration.bounty_contract:
    # Fund with testnet Bitcoin (e.g., 0.1 tBTC)
    integration.bounty_contract.fund_contract(10_000_000)  # 0.1 tBTC in sats
```

### 2. Submit Test Report

```python
result = integration.submit_report(
    reporter_address="tb1q...",  # Your testnet address
    pool_address="tb1qpool...",
    block_height=2500000,  # Testnet block
    evidence_type=EvidenceType.CENSORSHIP,
    transaction_ids=["test_tx_1", "test_tx_2"]
)
```

### 3. Verify and Pay

```python
# Verify report
integration.verify_report(result['report_id'], "verifier")

# Create payment
payment = integration.create_bounty_payment(result['report_id'])

# Approve and execute (with testnet Bitcoin)
```

## Switching Between Mainnet and Testnet

### Quick Switch

1. **Update .env**:
   ```env
   # For testnet
   BITCOIN_RPC_URL=http://127.0.0.1:18332
   
   # For mainnet
   BITCOIN_RPC_URL=http://127.0.0.1:8332
   ```

2. **Restart Bitcoin Core** with appropriate flag:
   ```bash
   # Testnet
   bitcoind -testnet -daemon
   
   # Mainnet
   bitcoind -daemon
   ```

3. **Restart API**:
   ```bash
   python api.py
   ```

### Separate Databases (Recommended)

For better organization, use separate databases:

```env
# Testnet database
DATABASE_URL=sqlite:///minesentry_testnet.db

# Mainnet database
DATABASE_URL=sqlite:///minesentry.db
```

## Troubleshooting

### "Connection refused" on testnet

- Check Bitcoin Core is running with `-testnet` flag
- Verify RPC port is `18332` in `.env`
- Check `bitcoin.conf` has `testnet=1`

### "Invalid address format"

- Ensure using testnet address formats (`tb1...`, `m...`, `n...`, `2...`)
- Mainnet addresses won't work on testnet

### "Block height out of range"

- Testnet block heights are different from mainnet
- Use current testnet block height: `bitcoin-cli -testnet getblockcount`

### Getting Testnet Bitcoin

- Testnet Bitcoin is free from faucets
- No real value, safe to use for testing
- Can request multiple times if needed

## Safety Notes

1. **Never use mainnet private keys on testnet**
2. **Testnet addresses are not compatible with mainnet**
3. **Testnet data is separate from mainnet**
4. **Always verify network before sending real Bitcoin**

## Next Steps After Testnet Trial

1. ✅ Run `python testnet_trial.py`
2. ✅ Verify all tests pass
3. ✅ Test payment flows with testnet Bitcoin
4. ✅ Review and fix any issues
5. ✅ Switch back to mainnet when ready
6. ✅ Deploy to production

## See Also

- [QUICKSTART.md](QUICKSTART.md) - General setup guide
- [BITCOIN_RPC_SETUP.md](BITCOIN_RPC_SETUP.md) - RPC configuration
- [testnet_trial.py](testnet_trial.py) - Testnet trial script

