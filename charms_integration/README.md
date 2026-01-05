# MineSentry Charms SDK Integration

This directory contains the **Charms SDK integration demonstration** that shows how MineSentry would use Charms to power its decentralized bounty payment system.

**Note**: This currently uses a mock implementation since `charms-protocol-sdk` is not yet published to crates.io. The code demonstrates the exact integration pattern that would be used when the actual SDK is available.

## What This Code Demonstrates

This code demonstrates the **exact integration pattern** that MineSentry would use with Charms SDK:

1. **Initializes the Charms client** for Bitcoin testnet

2. **Defines programmable conditions** for bounty payments:
   - 2-of-3 validator multi-signature requirement
   - 24-hour timeout for automatic refunds
   - Oracle-based report validation trigger

3. **Creates conditional transaction templates** that only execute when censorship is confirmed

## How This Connects to the Full MineSentry System

```
User Interface (React)
         ↓
Detection Engine (Python spells)
         ↓
Validation Consensus (Validators vote)
         ↓
Charms SDK (THIS CODE) ← Creates conditional Bitcoin transaction
         ↓
Bitcoin Network ← Executes payment when conditions met
```

## Running This Demo

```bash
cd charms_integration
cargo run
```

**Expected Output:**
```
=== MineSentry Charms SDK Integration ===
✅ Charms SDK initialized successfully
📝 Created MineSentry bounty conditions
💰 Bounty Transaction Template Created
🔗 Conditional UTXO Created
🚀 Charms SDK Integration Complete!
```

## For Hackathon Judges

This code demonstrates the "SDK First" approach by:

- **Defining the exact integration pattern** that would be used with charms-protocol-sdk
- **Demonstrating CharmsClient usage** for conditional Bitcoin transactions
- **Showing Condition objects** for programmable transaction logic
- **Proving the concept** of how MineSentry's bounty system would integrate with Charms

**Note**: When `charms-protocol-sdk` becomes available, the mock implementation can be easily replaced with the actual SDK by changing the dependency in `Cargo.toml` and updating the imports.

The full MineSentry system (UI + detection + validation) is designed to use this Charms integration to make bounty payments programmable, trustless, and automated.

