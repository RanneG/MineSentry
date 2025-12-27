# Charms Integration Guide

This document outlines how to integrate Charms framework for spell-based validation logic in MineSentry.

## Overview

Charms is a framework for creating and executing spells (smart contracts/logic) on Bitcoin. MineSentry can use Charms spells to implement sophisticated validation rules for mining pool reports.

## Current Status

The Charms integration is currently a placeholder. The `CharmsValidator` class in `validation.py` provides the structure for integration, but requires:

1. Charms client library installation
2. Spell deployment
3. Integration with validation workflow

## Implementation Steps

### 1. Install Charms

Add Charms to your requirements:

```bash
# Add to requirements.txt when Charms Python client is available
# charms-python==x.x.x
```

### 2. Create Validation Spells

Create Charms spells for different validation scenarios:

- **Basic Validation Spell**: Validates report structure and required fields
- **Evidence Validation Spell**: Validates evidence based on type
- **Blockchain Verification Spell**: Verifies report against blockchain data
- **Reward Calculation Spell**: Calculates reward amounts based on report quality

### 3. Deploy Spells

Deploy spells to the Bitcoin blockchain or Charms network:

```python
# Example spell deployment (pseudocode)
spell = CharmsSpell(validation_logic)
spell_id = spell.deploy()
```

### 4. Integrate with Validator

Update `CharmsValidator` class to call deployed spells:

```python
class CharmsValidator:
    def validate_with_spell(self, report: MiningPoolReport, spell_name: str):
        # Call Charms spell
        result = charms_client.execute_spell(spell_name, report.to_dict())
        return result.is_valid, result.message
```

### 5. Update Validation Workflow

Modify `ReportValidator` to use Charms spells when enabled:

```python
def validate_report(self, report: MiningPoolReport):
    # Basic validation first
    ...
    
    # Use Charms spells if enabled
    if charms_enabled:
        charms_validator = CharmsValidator()
        is_valid, message = charms_validator.validate_with_spell(report, "basic_validation")
        if not is_valid:
            return (False, message, None)
```

## Spell Examples

### Basic Validation Spell

```javascript
// Pseudocode - actual Charms syntax may differ
spell BasicValidation {
    function validate(report) {
        if (!report.reporter_address) {
            return { valid: false, message: "Reporter address required" }
        }
        if (report.block_height <= 0) {
            return { valid: false, message: "Invalid block height" }
        }
        return { valid: true, message: "Basic validation passed" }
    }
}
```

### Evidence Validation Spell

```javascript
spell EvidenceValidation {
    function validate(report) {
        if (report.evidence_type == "censorship") {
            if (!report.transaction_ids || report.transaction_ids.length == 0) {
                return { valid: false, message: "Transaction IDs required" }
            }
        }
        return { valid: true, message: "Evidence validated" }
    }
}
```

## Benefits of Charms Integration

1. **Decentralized Validation**: Validation logic lives on-chain
2. **Transparency**: Validation rules are publicly auditable
3. **Upgradability**: Spells can be updated or replaced
4. **Composability**: Multiple spells can work together
5. **Incentive Alignment**: Validation logic can include economic incentives

## Configuration

Enable Charms in `.env`:

```env
CHARMS_ENABLED=true
CHARMS_RPC_URL=http://localhost:8080
CHARMS_NETWORK=testnet
```

## Future Enhancements

- [ ] Full Charms client integration
- [ ] Spell marketplace for validation rules
- [ ] Community-curated validation spells
- [ ] Multi-signature validation using Charms
- [ ] Decentralized reward distribution via Charms

