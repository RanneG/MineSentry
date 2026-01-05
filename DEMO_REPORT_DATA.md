# Demo Report Data for MineSentry

Use these fake report details to test the submission and validation workflow.

## 📋 Report #1: Missing High-Fee Transactions

**Pool Address:**
```
bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
```

**Block Height:**
```
2750000
```

**Evidence Type:**
```
Censorship
```

**Transaction IDs (Comma-separated):**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
f9e8d7c6b5a4321098765432109876543210fedcba9876543210fedcba987654
3c4d5e6f7a8b9012345678901234567890abcdef1234567890abcdef12345678
```

**Description:**
```
High-fee transactions with 45+ sat/vB were excluded from block 2750000 despite the block only being 68% full. Three transactions totaling 1.2 BTC in fees were missing from the mempool after block confirmation. Pool appears to be censoring specific address ranges.
```

---

## 📋 Report #2: Fee Rate Discrepancy

**Pool Address:**
```
tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx
```

**Block Height:**
```
2751000
```

**Evidence Type:**
```
Censorship
```

**Transaction IDs:**
```
5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6
9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9
```

**Description:**
```
Block 2751000 included 15 low-fee transactions (5-8 sat/vB) while excluding 8 high-fee transactions (50-75 sat/vB) that were confirmed in subsequent blocks. The excluded transactions had a combined fee of 0.0008 BTC. This pattern suggests selective censorship.
```

---

## 📋 Report #3: Block Fullness Analysis

**Pool Address:**
```
bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4
```

**Block Height:**
```
2749500
```

**Evidence Type:**
```
Censorship
```

**Transaction IDs:**
```
1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2
7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7
4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4
c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3
```

**Description:**
```
Block 2749500 was only 62% full (620 KB / 1000 KB) despite having 22 high-fee transactions (40+ sat/vB) waiting in the mempool. Analysis shows these transactions were delayed by 3+ blocks before confirmation. This indicates intentional exclusion of profitable transactions.
```

---

## 📋 Report #4: Transaction Ordering Anomaly

**Pool Address:**
```
tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7
```

**Block Height:**
```
2750500
```

**Evidence Type:**
```
Censorship
```

**Transaction IDs:**
```
8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9
2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3
b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6
```

**Description:**
```
Unusual transaction ordering detected in block 2750500. Three high-fee transactions (60+ sat/vB) were placed at the end of the block instead of the beginning, contrary to fee-rate optimization. Lower-fee transactions (15-20 sat/vB) were prioritized, suggesting non-economic ordering criteria.
```

---

## 📋 Report #5: Address Pattern Censorship

**Pool Address:**
```
bc1p5d7rjq7g6rdk2yhzj9h0vuq4zve2cy8gq9fqz5
```

**Block Height:**
```
2752000
```

**Evidence Type:**
```
Censorship
```

**Transaction IDs:**
```
3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a
9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8
5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6
```

**Description:**
```
Pattern analysis reveals systematic exclusion of transactions from addresses starting with 'bc1q' prefixes in blocks 2751950-2752050. 47 transactions matching this pattern with fees above 30 sat/vB were delayed an average of 5 blocks. This appears to be targeted censorship of specific address types.
```

---

## 🎮 Quick Demo Instructions

1. **Enable Demo Mode** (if not already enabled) - Click the floating demo toggle button
2. **Go to "Submit Report"** page
3. **Fill in any of the reports above**
4. **Click "Submit"**
5. **Navigate to "Reports"** to see your submitted report
6. **Click on the report** to view details
7. **Click "Validate Report"** to see the validation modal (hidden for the submitter)
8. **Review evidence and detection results** in the modal

---

## 📝 Notes

- **Pool Addresses**: These are valid Bitcoin address formats (mainnet and testnet)
- **Block Heights**: Current realistic block heights (testnet around 2.7M)
- **Transaction IDs**: Fake but realistic 64-character hex strings
- **Descriptions**: Detailed but fictional evidence descriptions

These reports will work in both **Demo Mode** (with simulated detection) and **Real Mode** (if Bitcoin Core is running).
