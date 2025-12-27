# Bounty Contract Setup Guide

This guide will help you set up the MineSentry bounty contract system.

## Overview

The bounty contract handles reward distribution for verified mining pool reports using a multi-signature system for security.

## Prerequisites

1. **Bitcoin Core running** - The contract needs Bitcoin RPC access
2. **Authorized Signers** - At least 2 Bitcoin addresses for multi-signature approvals
3. **Environment Variables** - Configured in `.env` file

## Quick Setup

### Option 1: Interactive Setup Script (Recommended)

Run the interactive setup script:

```bash
python3 setup_bounty_contract.py
```

This script will:
1. Guide you through entering signer addresses
2. Configure minimum signatures
3. Update your `.env` file
4. Test Bitcoin RPC connection
5. Initialize the contract
6. Optionally fund the contract

### Option 2: Manual Setup

#### Step 1: Configure Environment Variables

Edit your `.env` file and add:

```env
# Bounty Contract Configuration
BOUNTY_CONTRACT_SIGNERS=bc1qsigner1...,bc1qsigner2...,bc1qsigner3...
BOUNTY_MIN_SIGNATURES=2
```

**Important:**
- `BOUNTY_CONTRACT_SIGNERS`: Comma-separated list of Bitcoin addresses
- `BOUNTY_MIN_SIGNATURES`: Number of approvals needed (should be ≤ number of signers)
- At least 2 signers are recommended for security

#### Step 2: Restart API Server

After updating `.env`, restart the API server:

```bash
python3 api.py
```

The bounty contract will be automatically initialized when the API starts.

#### Step 3: Verify Contract Status

Check the contract status:

```bash
curl http://localhost:8000/bounty/contract/status
```

Or visit the Bounty Contract page in the frontend.

## Funding the Contract

### Option 1: Using the Funding Script

```bash
python3 fund_bounty_contract.py
```

### Option 2: Manual Funding

The contract tracks funds internally. In a production system, you would:
1. Generate a contract address
2. Send Bitcoin to that address
3. Update the contract's funded balance

For now, use the `fund_contract()` method programmatically:

```python
from integration_bridge import get_integration

integration = get_integration()
contract = integration.bounty_contract
contract.fund_contract(1_000_000)  # Fund with 0.01 BTC (1M sats)
```

## Using the Bounty Contract

### Creating Payment Requests

When a report is verified, create a payment request:

```python
payment = contract.create_payment_request(
    report=verified_report,
    recipient_address="bc1q..."
)
```

### Approving Payments

Authorized signers approve payments:

```python
contract.approve_payment(payment.payment_id, "signer_address")
```

Multiple approvals are needed (based on `min_signatures`).

### Executing Payments

Once approved, execute the payment:

```python
success, message, txid = contract.execute_payment(payment.payment_id)
```

## Reward Structure

Bounties are calculated based on evidence type:

- **Censorship**: 100,000 sats (0.001 BTC)
- **Double Spend Attempt**: 500,000 sats (0.005 BTC)
- **Selfish Mining**: 200,000 sats (0.002 BTC)
- **Block Reordering**: 150,000 sats (0.0015 BTC)
- **Transaction Censorship**: 75,000 sats (0.00075 BTC)
- **Unusual Block Template**: 50,000 sats (0.0005 BTC)
- **Other**: 25,000 sats (0.00025 BTC)

Multiplier: +0.1 per transaction (max 2.0x)
Minimum: 10,000 sats (0.0001 BTC)

## API Endpoints

Once set up, the contract is accessible via:

- `GET /bounty/contract/status` - Get contract status
- `GET /bounty/payments/queue` - Get payment queue
- `POST /bounty/payments/{report_id}/create` - Create payment request
- `POST /bounty/payments/{payment_id}/approve` - Approve payment
- `POST /bounty/payments/{payment_id}/execute` - Execute approved payment

## Frontend Access

The bounty contract can be managed through the frontend:

1. Navigate to the "Bounty Contract" page
2. View contract status and available funds
3. See pending payment requests
4. Approve payments (if you're an authorized signer)
5. Execute approved payments

## Security Considerations

1. **Multi-Signature**: Always require at least 2 signatures
2. **Authorized Signers**: Only trusted addresses should be signers
3. **Funding**: Fund the contract from a secure wallet
4. **Private Keys**: Never share private keys of signer addresses
5. **Testing**: Test on testnet before mainnet deployment

## Troubleshooting

### Contract Not Initialized

If the contract shows as "not configured":
1. Check `.env` file has `BOUNTY_CONTRACT_SIGNERS` set
2. Restart the API server
3. Verify environment variables are loaded

### Payment Approval Fails

- Verify the signer address is in `BOUNTY_CONTRACT_SIGNERS`
- Check that you have enough approvals (min_signatures)
- Ensure the payment is in PENDING status

### Funding Issues

- Verify Bitcoin RPC is connected
- Check wallet has sufficient balance
- Ensure contract address is correct

## Example Workflow

```bash
# 1. Setup contract
python3 setup_bounty_contract.py

# 2. Fund contract (optional)
python3 fund_bounty_contract.py

# 3. Restart API
python3 api.py

# 4. Check status
curl http://localhost:8000/bounty/contract/status
```

## Next Steps

After setup:
1. Fund the contract with Bitcoin
2. Test creating a payment request
3. Test the approval workflow
4. Verify payments execute correctly

For more details, see `spells/BOUNTY_CONTRACT.md`.
