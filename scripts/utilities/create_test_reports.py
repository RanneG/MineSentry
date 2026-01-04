#!/usr/bin/env python3
"""
Create test reports for MineSentry

This script creates sample reports with various statuses and evidence types
to populate the database for testing and demonstration.
"""

import requests
import json
from datetime import datetime, timedelta
from random import choice, randint
import time

API_URL = "http://localhost:8000"

# Test data
REPORTER_ADDRESSES = [
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    "bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3",
    "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297",
    "bc1qr5j3xt4tcfw0wtdd8cdy5nrjf2kcqvj6r00hvw",
]

POOL_ADDRESSES = [
    "bc1qfg4hu6z3w6vhs5f2qvn8jpxd2xqkh0kmqxvqjd",
    "bc1qh4z2k0xj7l3qfhxnq8s4p8yv0znj3r4v5p7qk9",
    "bc1q8k5z7m9n2p4r6t8v0w2x4y6z8a0b2c4d6e8f0",
]

POOL_NAMES = [
    "F2Pool",
    "Antpool",
    "ViaBTC",
    "Slush Pool",
    "BTC.com",
    "Poolin",
    "Binance Pool",
]

EVIDENCE_TYPES = [
    "censorship",
    "double_spend_attempt",
    "selfish_mining",
    "block_reordering",
    "transaction_censorship",
    "unusual_block_template",
    "other",
]

STATUSES = ["pending", "pending", "pending", "under_review", "verified", "rejected"]


def create_test_report(report_num: int):
    """Create a single test report"""
    
    # Use current block height minus some random offset for realism
    base_block_height = 850000  # Approximate current height
    block_height = base_block_height - randint(0, 1000)
    
    # Create report data
    report_data = {
        "reporter_address": choice(REPORTER_ADDRESSES),
        "pool_address": choice(POOL_ADDRESSES),
        "pool_name": choice(POOL_NAMES),
        "block_height": block_height,
        "evidence_type": choice(EVIDENCE_TYPES),
        "transaction_ids": [
            f"{'0' * 64}",
            f"{'1' * 64}",
            f"{'2' * 64}",
        ][:randint(1, 3)],  # 1-3 transaction IDs
        "block_hash": f"{'a' * randint(0, 9)}{'0' * (64 - randint(0, 9))}",
        "description": f"Test report #{report_num}: Suspected {choice(EVIDENCE_TYPES)} activity detected at block {block_height}. "
                      f"This is a test report created for demonstration purposes. "
                      f"Multiple suspicious transactions were observed that suggest potential manipulation by the mining pool."
    }
    
    try:
        response = requests.post(
            f"{API_URL}/reports",
            json=report_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            report = response.json()
            print(f"✅ Created report #{report_num}: {report['report_id'][:8]}... (Status: {report['status']})")
            return report
        else:
            print(f"❌ Failed to create report #{report_num}: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating report #{report_num}: {str(e)}")
        return None


def update_report_status(report_id: str, status: str):
    """Update a report's status"""
    try:
        response = requests.patch(
            f"{API_URL}/reports/{report_id}/status",
            json={"status": status},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return True
        else:
            print(f"⚠️  Could not update {report_id} to {status}: {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️  Error updating status: {str(e)}")
        return False


def main():
    """Main function to create test reports"""
    print("=" * 60)
    print("MineSentry Test Report Generator")
    print("=" * 60)
    print()
    
    # Check if API is running
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code != 200:
            print(f"❌ API server returned status {response.status_code}")
            print("   Make sure the API is running: python api.py")
            return
    except Exception as e:
        print(f"❌ Cannot connect to API at {API_URL}")
        print(f"   Error: {str(e)}")
        print("   Make sure the API is running: python api.py")
        return
    
    print(f"✅ Connected to API at {API_URL}")
    print()
    
    # Ask how many reports to create
    try:
        num_reports = int(input("How many test reports to create? (default: 10): ") or "10")
    except ValueError:
        num_reports = 10
    
    print(f"Creating {num_reports} test reports...")
    print()
    
    created_reports = []
    
    # Create reports
    for i in range(1, num_reports + 1):
        report = create_test_report(i)
        if report:
            created_reports.append(report)
        time.sleep(0.2)  # Small delay to avoid overwhelming the API
    
    print()
    print("=" * 60)
    print(f"✅ Created {len(created_reports)} reports successfully!")
    print("=" * 60)
    print()
    
    # Update some reports to different statuses for variety
    if created_reports:
        print("Updating report statuses for variety...")
        print()
        
        # Update some to verified (for diversity)
        verified_count = min(2, len(created_reports) // 3)
        for report in created_reports[:verified_count]:
            time.sleep(0.1)
            if update_report_status(report['report_id'], 'verified'):
                print(f"✅ Updated {report['report_id'][:8]}... to verified")
        
        # Update some to under_review
        review_start = verified_count
        review_end = min(verified_count + 2, len(created_reports))
        for report in created_reports[review_start:review_end]:
            time.sleep(0.1)
            if update_report_status(report['report_id'], 'under_review'):
                print(f"✅ Updated {report['report_id'][:8]}... to under_review")
        
        # Update some to rejected
        rejected_start = review_end
        rejected_end = min(rejected_start + 1, len(created_reports))
        for report in created_reports[rejected_start:rejected_end]:
            time.sleep(0.1)
            if update_report_status(report['report_id'], 'rejected'):
                print(f"✅ Updated {report['report_id'][:8]}... to rejected")
    
    print()
    print("=" * 60)
    print("✅ Test reports created successfully!")
    print("=" * 60)
    print()
    print("You can now view them in the frontend:")
    print(f"  - Dashboard: http://localhost:3000")
    print(f"  - Reports: http://localhost:3000/reports")
    print()


if __name__ == "__main__":
    main()

