# Censorship Detection Spell Documentation

## Overview

The **Censorship Detection Spell** is the first spell implementation for MineSentry. It detects censorship in Bitcoin mining pools by analyzing block content, transaction inclusion patterns, and fee rate discrepancies.

## How It Works

The spell uses **10 detection methods** to identify censorship:

### 1. Missing Transactions Analysis

Checks if transactions that should be included in a block are missing:
- Verifies suspected transactions exist
- Confirms they're not in the block
- Flags as suspicious if valid transactions are excluded

### 2. Fee Rate Discrepancy Analysis

Compares fee rates between:
- Transactions included in the block
- Transactions in mempool that were excluded

Flags when high-fee transactions are excluded in favor of lower-fee ones.

### 3. Block Fullness Analysis

Analyzes if blocks are not full when high-fee transactions are available:
- Checks block size utilization
- Suspicious if block has space but excludes high-fee transactions

### 4. Transaction Ordering Analysis

Detects unusual transaction ordering:
- Checks if low-fee transactions appear before high-fee ones
- Flags potential manipulation in transaction sequencing

### 5. Transaction Age Analysis

Analyzes transaction age patterns:
- Detects if older high-fee transactions are being excluded
- Flags preference for newer transactions over older valid ones
- Suspicious if average transaction age is unusually low

### 6. Size Preference Analysis

Identifies transaction size bias:
- Detects systematic exclusion of larger transactions
- Flags when average transaction size is unusually small
- Indicates potential size-based discrimination

### 7. Fee Density Analysis

Analyzes fee per byte efficiency:
- Compares fee density (fee/byte) across transactions
- Detects inconsistencies in fee density selection
- Flags when low-density transactions are included over high-density ones

### 8. Historical Pattern Comparison

Compares with recent block patterns:
- Analyzes fee and transaction count patterns vs. previous blocks
- Detects significant deviations from normal patterns
- Flags when current block differs substantially from recent history

### 9. Address Pattern Analysis

Detects address clustering patterns:
- Analyzes address diversity in block transactions
- Identifies unusual concentration of addresses
- Flags potential address-based discrimination

### 10. Confirmation Time Analysis

Analyzes transaction confirmation delays:
- Tracks how long transactions waited before confirmation
- Flags excessive delays (>1 hour) for high-fee transactions
- Indicates systematic exclusion of specific transactions

## Confidence Scoring

The spell calculates a confidence score (0.0 to 1.0) based on:

- **Method Score**: 0.15 per detection method (max 0.6)
- **Evidence Score**: 0.05 per evidence point (max 0.4)
- **Critical Method Bonus**: 0.1 per critical method (max 0.3)
  - Critical methods: missing_transactions, fee_rate_analysis, confirmation_time_analysis
- **Total Score**: Sum of all scores (capped at 1.0)

Reports with confidence ≥ 0.7 are considered censored.

## Usage Examples

### Basic Usage

```python
from bitcoin_rpc import BitcoinRPC
from spells.censorship_detection import CensorshipDetectionSpell

rpc = BitcoinRPC()
spell = CensorshipDetectionSpell(rpc)

# Detect censorship in a block
result = spell.detect_censorship(
    block_height=800000,
    suspected_txids=["txid1", "txid2"]
)

if result.is_censored:
    print(f"Censorship detected with {result.confidence_score:.0%} confidence")
    print(f"Missing transactions: {result.missing_transactions}")
```

### Integrated with Validation

```python
from validation import ReportValidator
from models import MiningPoolReport, EvidenceType

rpc = BitcoinRPC()
validator = ReportValidator(rpc)

report = MiningPoolReport(
    evidence_type=EvidenceType.CENSORSHIP,
    block_height=800000,
    transaction_ids=["txid1", "txid2"],
    # ... other fields
)

# Spell validation is automatically used
is_valid, message, data = validator.validate_report(report, use_spells=True)
```

## Configuration

Adjust detection sensitivity:

```python
spell = CensorshipDetectionSpell(rpc)
spell.min_fee_rate = 2.0  # Minimum fee rate in sat/vB to consider (default: 1.0)
spell.min_confidence = 0.8  # Minimum confidence to flag as censored (default: 0.7)
```

## Result Structure

```python
@dataclass
class CensorshipDetectionResult:
    is_censored: bool              # Whether censorship was detected
    confidence_score: float        # Confidence level (0.0-1.0)
    evidence_count: int            # Number of evidence points
    missing_transactions: List[str] # Transaction IDs missing from block
    excluded_fee_total: float      # Total fees of excluded txs (BTC)
    detection_methods: List[str]   # Methods that detected censorship
    details: Dict[str, Any]        # Detailed analysis data
    message: str                   # Human-readable summary
```

## Limitations

1. **Mempool Data**: Requires access to mempool state, which may not always be available
2. **Performance**: Analysis can be slow for blocks with many transactions
3. **False Positives**: May flag legitimate block construction choices as censorship
4. **Network Conditions**: Results may vary based on network congestion and timing

## Best Practices

1. **Multiple Evidence Points**: Use multiple detection methods for higher confidence
2. **Verify Results**: Always verify spell results with additional analysis
3. **Consider Context**: Account for network conditions and legitimate block construction
4. **Threshold Tuning**: Adjust confidence thresholds based on your use case

## Future Enhancements

- Machine learning-based pattern detection
- Historical pattern analysis across multiple blocks
- Integration with mempool monitoring services
- Statistical analysis of pool behavior over time
- Support for transaction clustering analysis

## Testing

Run the example script to test the spell:

```bash
cd /Users/rannegerodias/Desktop/MineSentry
source venv/bin/activate
python spells/example_usage.py
```

## See Also

- [Spells README](spells/README.md) - General spells documentation
- [CHARMS_INTEGRATION.md](CHARMS_INTEGRATION.md) - Charms framework integration guide

