# MineSentry Spells

This directory contains Charms-based spells for detecting and validating mining pool manipulation.

## Available Spells

### Censorship Detection Spell

The **Censorship Detection Spell** (`censorship_detection.py`) detects censorship in Bitcoin mining pools using multiple detection methods:

#### Detection Methods (10 Total)

**Core Detection Methods:**

1. **Missing Transactions Analysis**
   - Checks if suspected transactions are missing from blocks
   - Verifies transactions exist and should have been included

2. **Fee Rate Discrepancy Analysis**
   - Compares fee rates of transactions in block vs. mempool
   - Flags when high-fee transactions are excluded

3. **Block Fullness Analysis**
   - Checks if blocks are not full when high-fee transactions are available
   - Suspicious if block has space but excludes high-fee txs

4. **Transaction Ordering Analysis**
   - Detects unusual ordering (low-fee transactions before high-fee)
   - Flags potential manipulation in transaction ordering

**Advanced Detection Methods:**

5. **Transaction Age Analysis**
   - Analyzes if older high-fee transactions are being excluded
   - Detects preference for newer transactions over older valid ones

6. **Size Preference Analysis**
   - Identifies bias toward smaller transactions
   - Flags when larger valid transactions are systematically excluded

7. **Fee Density Analysis**
   - Analyzes fee per byte efficiency patterns
   - Detects inconsistencies in fee density selection

8. **Historical Pattern Comparison**
   - Compares block patterns with recent historical blocks
   - Flags significant deviations from normal patterns

9. **Address Pattern Analysis**
   - Detects unusual address clustering patterns
   - Identifies potential address-based discrimination

10. **Confirmation Time Analysis**
    - Analyzes excessive confirmation delays for valid transactions
    - Flags when transactions wait unusually long despite high fees

#### Usage

##### Direct Detection

```python
from bitcoin_rpc import BitcoinRPC
from spells.censorship_detection import CensorshipDetectionSpell

rpc = BitcoinRPC()
spell = CensorshipDetectionSpell(rpc)

result = spell.detect_censorship(
    block_height=800000,
    suspected_txids=["txid1", "txid2"],
    block_hash="abc123..."  # Optional
)

print(f"Censored: {result.is_censored}")
print(f"Confidence: {result.confidence_score}")
print(f"Missing Txs: {result.missing_transactions}")
```

##### Report Validation

```python
from models import MiningPoolReport, EvidenceType
from spells.censorship_detection import CensorshipDetectionSpell

report = MiningPoolReport(
    block_height=800000,
    evidence_type=EvidenceType.CENSORSHIP,
    transaction_ids=["txid1", "txid2"],
    # ... other fields
)

spell = CensorshipDetectionSpell(rpc)
is_valid, message, validation_data = spell.validate_report(report)
```

##### Integration with Validator

```python
from validation import ReportValidator
from bitcoin_rpc import BitcoinRPC

rpc = BitcoinRPC()
validator = ReportValidator(rpc)

# Spell validation is automatically used for censorship reports
result = validator.validate_report(report, use_spells=True)
```

## Spell Results

The censorship detection spell returns a `CensorshipDetectionResult` with:

- `is_censored`: Boolean indicating if censorship was detected
- `confidence_score`: Float (0.0-1.0) indicating confidence level
- `evidence_count`: Number of evidence points found
- `missing_transactions`: List of transaction IDs missing from block
- `excluded_fee_total`: Total fees (in BTC) of excluded transactions
- `detection_methods`: List of methods that detected censorship
- `details`: Detailed analysis data from each detection method
- `message`: Human-readable summary

## Confidence Scoring

Confidence score is calculated based on:

- **Method Score**: 0.25 per detection method that flags censorship
- **Evidence Score**: 0.1 per evidence point (capped at 0.5)
- **Total**: Sum of both scores (capped at 1.0)

Reports with confidence ≥ 0.7 are flagged as censored.

## Configuration

You can adjust detection parameters:

```python
spell = CensorshipDetectionSpell(rpc)
spell.min_fee_rate = 2.0  # Minimum fee rate in sat/vB (default: 1.0)
spell.min_confidence = 0.8  # Minimum confidence to flag (default: 0.7)
```

## Running Examples

Run the example script:

```bash
cd /Users/rannegerodias/Desktop/MineSentry
source venv/bin/activate
python spells/example_usage.py
```

## Future Spells

Additional spells planned:

- **Double Spend Detection Spell**: Detects double spend attempts
- **Selfish Mining Detection Spell**: Identifies selfish mining patterns
- **Block Reordering Detection Spell**: Detects unusual block ordering
- **Transaction Censorship Spell**: Specialized transaction-level censorship detection

## Contributing

To add a new spell:

1. Create a new Python file in `spells/` directory
2. Implement spell class with `validate_report()` method
3. Add to `spells/__init__.py`
4. Register in `CharmsValidator._initialize_spells()`
5. Add tests and documentation

## Notes

- Spells require Bitcoin Core RPC access
- Some detection methods may be resource-intensive
- Results are probabilistic - not definitive proof
- Always verify spell results with additional analysis

