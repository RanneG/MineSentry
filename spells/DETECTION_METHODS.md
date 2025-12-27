# Detection Methods Reference

This document provides detailed information about all detection methods in the Enhanced Censorship Detection Spell.

## Overview

The spell uses **10 detection methods** organized into two categories:

- **Core Methods** (1-4): Fundamental detection techniques
- **Advanced Methods** (5-10): Sophisticated pattern analysis

## Core Detection Methods

### 1. Missing Transactions Analysis

**Purpose**: Verify if suspected transactions are actually missing from blocks.

**How it works**:
- Checks if reported transaction IDs are in the block
- Verifies transactions exist in blockchain
- Checks confirmation status

**Evidence indicators**:
- Transaction ID in report but not in block
- Transaction confirmed in later block (suspicious)
- Transaction exists but never confirmed

**Confidence impact**: High (critical method)

---

### 2. Fee Rate Discrepancy Analysis

**Purpose**: Compare fee rates between included and excluded transactions.

**How it works**:
- Calculates fee rate (sat/vB) for transactions in block
- Compares with fee rates of excluded transactions
- Flags when excluded txs have higher fee rates

**Evidence indicators**:
- Mempool transactions with higher fee rates than block average
- Significant fee rate discrepancies
- High-fee transactions excluded

**Confidence impact**: High (critical method)

---

### 3. Block Fullness Analysis

**Purpose**: Detect blocks with available space excluding high-fee transactions.

**How it works**:
- Estimates block size utilization
- Checks transaction count
- Flags if block is <90% full with high-fee txs available

**Evidence indicators**:
- Block fullness < 90%
- Transaction count < 2000
- Space available but high-fee txs excluded

**Confidence impact**: Medium

---

### 4. Transaction Ordering Analysis

**Purpose**: Detect suspicious transaction ordering patterns.

**How it works**:
- Analyzes fee rate ordering in block
- Checks if low-fee txs appear before high-fee txs
- Calculates decreasing fee rate ratio

**Evidence indicators**:
- >50% of transitions show decreasing fee rates
- Low-fee transactions before high-fee ones
- Unusual ordering patterns

**Confidence impact**: Medium

---

## Advanced Detection Methods

### 5. Transaction Age Analysis

**Purpose**: Detect exclusion of older high-fee transactions.

**How it works**:
- Calculates age of transactions in block
- Compares average age with expected patterns
- Flags if average age is unusually low

**Evidence indicators**:
- Average transaction age < 10 minutes
- Older high-fee transactions excluded
- Preference for very recent transactions

**Confidence impact**: Medium

---

### 6. Size Preference Analysis

**Purpose**: Identify bias toward smaller transactions.

**How it works**:
- Calculates average transaction size in block
- Compares with typical block patterns
- Flags if average size is unusually small

**Evidence indicators**:
- Average transaction size < 250 bytes
- Block has space but excludes larger txs
- Systematic size-based preference

**Confidence impact**: Medium

---

### 7. Fee Density Analysis

**Purpose**: Analyze fee per byte efficiency patterns.

**How it works**:
- Calculates fee density (fee/byte) for each transaction
- Compares quartiles (top vs bottom)
- Flags significant density gaps

**Evidence indicators**:
- Bottom quartile has <30% of top quartile density
- Low-density transactions included over high-density
- Inefficient fee density selection

**Confidence impact**: Medium

---

### 8. Historical Pattern Comparison

**Purpose**: Compare block patterns with recent history.

**How it works**:
- Compares with previous block(s)
- Analyzes fee averages and transaction counts
- Flags significant deviations

**Evidence indicators**:
- Current block avg fee < 50% of previous
- Transaction count decrease with lower fees
- Significant deviation from recent patterns

**Confidence impact**: Medium

---

### 9. Address Pattern Analysis

**Purpose**: Detect unusual address clustering patterns.

**How it works**:
- Extracts addresses from block transactions
- Calculates address diversity
- Analyzes address concentration

**Evidence indicators**:
- Top 5 addresses account for >60% of outputs
- Low address diversity (<20 unique addresses)
- Unusual address clustering

**Confidence impact**: Low-Medium

---

### 10. Confirmation Time Analysis

**Purpose**: Analyze excessive confirmation delays.

**How it works**:
- Tracks time between transaction creation and confirmation
- Calculates average confirmation wait time
- Flags excessive delays

**Evidence indicators**:
- Average confirmation time > 1 hour
- High-fee transactions waiting unusually long
- Systematic delay patterns

**Confidence impact**: High (critical method)

---

## Method Selection and Weighting

### Critical Methods

These methods have the highest impact on confidence scores:
- Missing Transactions Analysis
- Fee Rate Analysis
- Confirmation Time Analysis

### Method Scoring

Each method contributes to the overall confidence score:
- **Method Score**: 0.15 per method (max 0.6)
- **Evidence Points**: 0.05 per point (max 0.4)
- **Critical Bonus**: 0.1 per critical method (max 0.3)

### Confidence Thresholds

- **< 0.7**: Not flagged as censored
- **≥ 0.7**: Flagged as censored
- **≥ 0.85**: High confidence
- **≥ 0.95**: Very high confidence

## Combining Methods

Multiple methods can be combined for higher confidence:

- **2-3 methods**: Moderate confidence (0.4-0.6)
- **4-6 methods**: High confidence (0.7-0.85)
- **7+ methods**: Very high confidence (0.85-1.0)

## Limitations

Each method has limitations:

1. **Data Availability**: Requires access to blockchain and mempool data
2. **False Positives**: Legitimate block construction can trigger some methods
3. **Performance**: Some methods are computationally intensive
4. **Context**: Network conditions affect some detection patterns

## Best Practices

1. **Multiple Methods**: Use multiple methods for confirmation
2. **Critical Methods**: Prioritize results from critical methods
3. **Context Awareness**: Consider network conditions and timing
4. **Validation**: Verify results with additional analysis
5. **Threshold Tuning**: Adjust confidence thresholds based on use case

## Future Enhancements

Potential improvements:
- Machine learning-based pattern recognition
- Cross-blockchain comparison
- Real-time mempool monitoring integration
- Statistical significance testing
- Weighted method importance based on historical accuracy

