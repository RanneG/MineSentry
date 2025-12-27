"""
Example usage of the Censorship Detection Spell

Run this script from the project root directory:
    cd /Users/rannegerodias/Desktop/MineSentry
    python spells/example_usage.py
"""

import sys
from pathlib import Path

# Add parent directory to path so we can import modules
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from bitcoin_rpc import BitcoinRPC
from spells.censorship_detection import CensorshipDetectionSpell
from models import MiningPoolReport, EvidenceType
from datetime import datetime


def example_censorship_detection():
    """Example of using the censorship detection spell"""
    
    # Initialize Bitcoin RPC
    rpc = BitcoinRPC()
    
    # Initialize the spell
    spell = CensorshipDetectionSpell(rpc)
    
    # Get current block height (or use a specific block)
    try:
        current_height = rpc.get_block_count()
        block_height = max(1, current_height - 10)  # Use a recent block (10 blocks ago)
        print(f"Using block height: {block_height} (current: {current_height})")
    except Exception as e:
        print(f"Warning: Could not get current block height: {e}")
        block_height = 800000  # Fallback to example height
    
    # Example: Check a specific block for censorship
    # Note: These are placeholder transaction IDs - replace with real ones
    suspected_txids = [
        # "abc123...",  # Replace with actual transaction IDs
        # "def456...",
    ]
    
    # For demonstration, skip if no suspected transactions
    if not suspected_txids:
        print("Note: No suspected transaction IDs provided - spell will analyze block structure only")
    
    print(f"Analyzing block {block_height} for censorship...")
    result = spell.detect_censorship(
        block_height=block_height,
        suspected_txids=suspected_txids
    )
    
    print(f"\nCensorship Detection Results:")
    print(f"  Censored: {result.is_censored}")
    print(f"  Confidence: {result.confidence_score:.0%}")
    print(f"  Evidence Count: {result.evidence_count}")
    print(f"  Missing Transactions: {len(result.missing_transactions)}")
    print(f"  Detection Methods: {', '.join(result.detection_methods)}")
    print(f"  Message: {result.message}")
    
    if result.missing_transactions:
        print(f"\nMissing Transactions:")
        for txid in result.missing_transactions:
            print(f"  - {txid}")
    
    return result


def example_report_validation():
    """Example of validating a censorship report using the spell"""
    
    # Initialize Bitcoin RPC
    rpc = BitcoinRPC()
    
    # Initialize the spell
    spell = CensorshipDetectionSpell(rpc)
    
    # Get current block height
    try:
        current_height = rpc.get_block_count()
        block_height = max(1, current_height - 10)  # Use a recent block
    except Exception:
        block_height = 800000  # Fallback
    
    # Create a sample report
    report = MiningPoolReport()
    report.reporter_address = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    report.pool_address = "bc1q..."
    report.block_height = block_height
    report.evidence_type = EvidenceType.CENSORSHIP
    report.transaction_ids = [
        # "abc123...",  # Replace with actual transaction IDs
        # "def456...",
    ]
    report.block_hash = None  # Will be fetched automatically
    report.description = "Pool refused to include valid high-fee transactions"
    
    print("Validating censorship report using spell...")
    is_valid, message, validation_data = spell.validate_report(report)
    
    print(f"\nValidation Results:")
    print(f"  Valid: {is_valid}")
    print(f"  Message: {message}")
    print(f"  Validation Data: {validation_data}")
    
    return is_valid, message, validation_data


if __name__ == "__main__":
    print("=" * 60)
    print("Censorship Detection Spell - Example Usage")
    print("=" * 60)
    
    try:
        # Example 1: Direct censorship detection
        print("\n[Example 1] Direct Censorship Detection")
        print("-" * 60)
        result = example_censorship_detection()
        
        # Example 2: Report validation
        print("\n\n[Example 2] Report Validation")
        print("-" * 60)
        is_valid, message, data = example_report_validation()
        
    except Exception as e:
        print(f"\nError: {e}")
        print("\nNote: Make sure Bitcoin Core is running and RPC is configured correctly.")

