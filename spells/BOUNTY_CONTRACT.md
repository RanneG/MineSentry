# Bounty Smart Contract Documentation

## Overview

The Bounty Smart Contract is a Charms-based smart contract equivalent that handles reward distribution for verified mining pool reports. It implements a decentralized, multi-signature bounty system on Bitcoin.

## Features

### Core Functionality

- **Multi-Signature Verification**: Requires multiple signatures to approve payments
- **Automated Reward Calculation**: Calculates bounties based on evidence type and quality
- **Payment Queue Management**: Queues and tracks payment requests
- **State Management**: Maintains contract state and payment history
- **Fund Management**: Tracks funded, paid, and reserved amounts

### Security Features

- **Multi-Sig Protection**: Prevents unauthorized payments
- **State Validation**: Validates contract state before operations
- **Fund Reservation**: Reserves funds when payment is requested
- **Approval Workflow**: Requires multiple approvals before payment

## Contract Architecture

### Components

1. **BountyContract**: Main contract logic
2. **BountyContractSpell**: Charms spell wrapper for on-chain deployment
3. **BountyPayment**: Payment request structure
4. **BountyContractState**: Contract state management

### States

- **ACTIVE**: Contract is active and processing payments
- **PAUSED**: Contract is paused (no new payments, existing can be processed)
- **CLOSED**: Contract is closed (no new operations)
- **FUNDING**: Contract is in funding phase

### Payment Status

- **PENDING**: Payment request created, awaiting approvals
- **APPROVED**: Payment approved by required signatures, ready to pay
- **PAID**: Payment executed and confirmed on blockchain
- **REJECTED**: Payment rejected by authorized signer
- **FAILED**: Payment execution failed

## Usage

### Initialization

```python
from spells.bounty_contract import BountyContract
from bitcoin_rpc import BitcoinRPC

rpc = BitcoinRPC()
contract = BountyContract(
    bitcoin_rpc=rpc,
    contract_id="minesentry_bounty_v1",
    min_signatures=2,  # Require 2 signatures
    authorized_signers=[
        "bc1qsigner1...",
        "bc1qsigner2...",
        "bc1qsigner3..."
    ]
)
```

### Funding the Contract

```python
# Fund contract with 0.01 BTC (1,000,000 sats)
contract.fund_contract(1_000_000)

state = contract.get_contract_state()
print(f"Available funds: {state['available_funds_sats']} sats")
```

### Creating Payment Requests

```python
from models import MiningPoolReport, EvidenceType, ReportStatus

# Create verified report
report = MiningPoolReport()
report.status = ReportStatus.VERIFIED
report.evidence_type = EvidenceType.CENSORSHIP
report.transaction_ids = ["tx1", "tx2"]

# Calculate bounty
bounty = contract.calculate_bounty(report)

# Create payment request
payment = contract.create_payment_request(
    report=report,
    recipient_address="bc1qrecipient..."
)
```

### Approving Payments (Multi-Signature)

```python
# First signer approves
contract.approve_payment(payment.payment_id, "bc1qsigner1...")

# Second signer approves (now has required signatures)
contract.approve_payment(payment.payment_id, "bc1qsigner2...")

# Payment is now APPROVED and ready to execute
```

### Executing Payments

```python
# Execute approved payment
success, message, txid = contract.execute_payment(payment.payment_id)

if success:
    print(f"Payment sent! TXID: {txid}")
else:
    print(f"Payment failed: {message}")
```

### Rejecting Payments

```python
contract.reject_payment(
    payment_id=payment.payment_id,
    signer_address="bc1qsigner1...",
    reason="Invalid evidence"
)
```

## Reward Calculation

Bounties are calculated based on:

1. **Base Reward**: Depends on evidence type
   - Censorship: 100,000 sats (0.001 BTC)
   - Double Spend Attempt: 500,000 sats (0.005 BTC)
   - Selfish Mining: 200,000 sats (0.002 BTC)
   - Block Reordering: 150,000 sats (0.0015 BTC)
   - Transaction Censorship: 75,000 sats (0.00075 BTC)
   - Unusual Block Template: 50,000 sats (0.0005 BTC)
   - Other: 25,000 sats (0.00025 BTC)

2. **Evidence Multiplier**: More transactions = higher reward
   - Base multiplier: 1.0
   - +0.1 per transaction
   - Maximum multiplier: 2.0

3. **Minimum Reward**: 10,000 sats (0.0001 BTC)

## Charms Integration

### Deploying as Charms Spell

```python
from spells.bounty_contract import BountyContractSpell

# Wrap contract as spell
spell = BountyContractSpell(contract)

# Deploy to Bitcoin network
spell_id = spell.deploy()
print(f"Spell deployed: {spell_id}")
```

### Executing Spell Methods

```python
# Execute contract method via Charms
result = spell.execute_spell_method(
    method_name="create_payment_request",
    params={
        'report': report,
        'recipient_address': 'bc1q...'
    }
)
```

## Contract State

### Querying State

```python
state = contract.get_contract_state()
print(f"State: {state['state']}")
print(f"Available funds: {state['available_funds_sats']} sats")
print(f"Total paid: {state['total_paid_sats']} sats")
print(f"Pending payments: {state['pending_payments']}")
```

### Payment Queue

```python
queue = contract.get_payment_queue()
for payment in queue:
    print(f"{payment['payment_id']}: {payment['amount_btc']} BTC")
    print(f"  Status: {payment['status']}")
    print(f"  Approvals: {payment['approvals']}")
```

## Workflow

### Standard Payment Flow

1. **Report Verification**: Report is verified by validation system
2. **Payment Request**: Contract creates payment request for verified report
3. **Multi-Sig Approval**: Required number of signers approve payment
4. **Payment Execution**: Approved payment is executed on blockchain
5. **Confirmation**: Payment transaction is confirmed
6. **State Update**: Contract state is updated with payment record

### Rejection Flow

1. **Payment Request**: Payment request created
2. **Rejection**: Authorized signer rejects with reason
3. **Fund Release**: Reserved funds are released
4. **History Record**: Payment moved to history with rejection status

## Security Considerations

### Multi-Signature Requirements

- Configure minimum signatures based on security needs
- Use trusted, independent signers
- Implement key management best practices
- Consider hardware wallets for signer keys

### Fund Management

- Monitor available funds
- Ensure sufficient funding before creating payments
- Track reserved vs. available funds
- Implement funding alerts

### Access Control

- Only authorized signers can approve/reject payments
- Contract state changes are tracked
- Payment history is maintained for audit

## Integration with MineSentry

The bounty contract integrates with MineSentry's validation and reward system:

```python
from validation import ReportValidator
from spells.bounty_contract import BountyContract

# Validate report
validator = ReportValidator(bitcoin_rpc)
is_valid, message, data = validator.validate_report(report)

if is_valid:
    report.status = ReportStatus.VERIFIED
    
    # Create payment via contract
    contract = BountyContract(bitcoin_rpc)
    payment = contract.create_payment_request(
        report=report,
        recipient_address=report.reporter_address
    )
```

## Future Enhancements

- Full Charms framework integration
- On-chain deployment
- Decentralized governance
- Automatic payment execution
- Lightning Network support
- Multi-currency support
- Staking mechanisms
- Reputation system integration

## Limitations

- Currently implements contract logic (not yet deployed on-chain)
- Requires Bitcoin RPC access for payments
- Multi-sig coordination needed
- Manual approval process (can be automated)

## See Also

- [spells/README.md](README.md) - General spells documentation
- [CHARMS_INTEGRATION.md](../docs/guides/CHARMS_INTEGRATION.md) - Charms integration guide
- [reward_system.py](../reward_system.py) - Reward system implementation

