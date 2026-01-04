"""
Example client script for interacting with MineSentry API
"""

import requests
import json
from typing import Optional


class MineSentryClient:
    """Simple client for MineSentry API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        Initialize client
        
        Args:
            base_url: Base URL of the MineSentry API
        """
        self.base_url = base_url.rstrip('/')
    
    def submit_report(
        self,
        reporter_address: str,
        pool_address: str,
        block_height: int,
        evidence_type: str,
        transaction_ids: list = None,
        block_hash: Optional[str] = None,
        pool_name: Optional[str] = None,
        description: Optional[str] = None
    ) -> dict:
        """
        Submit a new mining pool report
        
        Args:
            reporter_address: Bitcoin address for rewards
            pool_address: Suspected mining pool address
            block_height: Block height where manipulation occurred
            evidence_type: Type of evidence (censorship, double_spend_attempt, etc.)
            transaction_ids: List of transaction IDs as evidence
            block_hash: Block hash (optional)
            pool_name: Pool name (optional)
            description: Description (optional)
            
        Returns:
            Report data
        """
        url = f"{self.base_url}/reports"
        payload = {
            "reporter_address": reporter_address,
            "pool_address": pool_address,
            "block_height": block_height,
            "evidence_type": evidence_type,
            "transaction_ids": transaction_ids or [],
            "block_hash": block_hash,
            "pool_name": pool_name,
            "description": description
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_report(self, report_id: str) -> dict:
        """Get a specific report by ID"""
        url = f"{self.base_url}/reports/{report_id}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    
    def list_reports(self, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> list:
        """
        List reports
        
        Args:
            status: Filter by status (pending, verified, rejected, under_review)
            limit: Maximum number of reports to return
            offset: Offset for pagination
            
        Returns:
            List of reports
        """
        url = f"{self.base_url}/reports"
        params = {"limit": limit, "offset": offset}
        if status:
            params["status"] = status
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_stats(self) -> dict:
        """Get system statistics"""
        url = f"{self.base_url}/stats"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    
    def validate_report(self, report_id: str) -> dict:
        """Manually trigger validation for a report"""
        url = f"{self.base_url}/reports/{report_id}/validate"
        response = requests.post(url)
        response.raise_for_status()
        return response.json()
    
    def update_report_status(
        self,
        report_id: str,
        status: str,
        verified_by: Optional[str] = None
    ) -> dict:
        """
        Update report status
        
        Args:
            report_id: Report ID
            status: New status (pending, verified, rejected, under_review)
            verified_by: Who verified the report (optional)
            
        Returns:
            Updated report data
        """
        url = f"{self.base_url}/reports/{report_id}/status"
        payload = {"status": status}
        if verified_by:
            payload["verified_by"] = verified_by
        
        response = requests.patch(url, json=payload)
        response.raise_for_status()
        return response.json()


def main():
    """Example usage"""
    client = MineSentryClient()
    
    print("=== MineSentry Client Example ===\n")
    
    # Get stats
    print("1. Getting system statistics...")
    try:
        stats = client.get_stats()
        print(json.dumps(stats, indent=2))
    except Exception as e:
        print(f"Error: {e}\n")
    
    # Example: Submit a report
    print("\n2. Submitting example report...")
    try:
        report = client.submit_report(
            reporter_address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
            pool_address="bc1q...",
            block_height=800000,
            evidence_type="censorship",
            transaction_ids=["abc123...", "def456..."],
            description="Example report: Pool refused to include valid transactions"
        )
        print(f"Report submitted: {report['report_id']}")
        print(f"Status: {report['status']}")
        print(f"Bounty: {report['bounty_amount']} sats")
    except Exception as e:
        print(f"Error: {e}\n")
    
    # List reports
    print("\n3. Listing recent reports...")
    try:
        reports = client.list_reports(limit=5)
        print(f"Found {len(reports)} reports")
        for report in reports:
            print(f"  - {report['report_id'][:8]}... | {report['status']} | Block {report['block_height']}")
    except Exception as e:
        print(f"Error: {e}\n")


if __name__ == "__main__":
    main()

