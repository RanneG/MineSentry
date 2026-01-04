#!/usr/bin/env python3
"""
MineSentry Testnet Trial Script

This script runs a complete testnet trial of the MineSentry system:
1. Validates testnet configuration
2. Tests report submission
3. Tests validation with spells
4. Tests bounty contract (if configured)
5. Provides trial results
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from models import MiningPoolReport, EvidenceType, ReportStatus
from integration_bridge import MineSentryIntegration
from bitcoin_rpc import BitcoinRPC
from database import Database


class TestnetTrial:
    """Testnet trial runner"""
    
    def __init__(self):
        """Initialize testnet trial"""
        self.results = {
            'started_at': datetime.now(timezone.utc).isoformat(),
            'tests': [],
            'passed': 0,
            'failed': 0,
            'warnings': 0
        }
    
    def log_test(self, name: str, passed: bool, message: str = "", warning: bool = False):
        """Log test result"""
        status = "✅ PASSED" if passed else ("⚠️  WARNING" if warning else "❌ FAILED")
        print(f"{status}: {name}")
        if message:
            print(f"         {message}")
        
        self.results['tests'].append({
            'name': name,
            'passed': passed,
            'warning': warning,
            'message': message,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
        if passed:
            self.results['passed'] += 1
        elif warning:
            self.results['warnings'] += 1
        else:
            self.results['failed'] += 1
    
    def test_bitcoin_rpc_connection(self):
        """Test Bitcoin RPC connection"""
        try:
            rpc = BitcoinRPC()
            block_count = rpc.get_block_count()
            chain_info = rpc.get_blockchain_info()
            
            chain = chain_info.get('chain', 'unknown')
            is_testnet = chain in ['test', 'testnet', 'regtest']
            
            self.log_test(
                "Bitcoin RPC Connection",
                True,
                f"Connected to {chain} network (block height: {block_count})",
                warning=False
            )
            
            if not is_testnet:
                self.log_test(
                    "Network Type",
                    False,
                    f"Currently on {chain} network. For testnet trial, configure Bitcoin Core with testnet=1",
                    warning=True
                )
            
            return True, chain
        except Exception as e:
            self.log_test(
                "Bitcoin RPC Connection",
                False,
                f"Failed to connect: {str(e)}"
            )
            return False, None
    
    def test_database(self):
        """Test database connection"""
        try:
            db = Database()
            session = db.get_session()
            session.close()
            
            self.log_test(
                "Database Connection",
                True,
                "Database connection successful"
            )
            return True
        except Exception as e:
            self.log_test(
                "Database Connection",
                False,
                f"Database connection failed: {str(e)}"
            )
            return False
    
    def test_integration_bridge(self):
        """Test integration bridge initialization"""
        try:
            integration = MineSentryIntegration()
            status = integration.get_system_status()
            
            self.log_test(
                "Integration Bridge",
                True,
                "Integration bridge initialized successfully"
            )
            return True, integration
        except Exception as e:
            self.log_test(
                "Integration Bridge",
                False,
                f"Initialization failed: {str(e)}"
            )
            return False, None
    
    def test_report_submission(self, integration):
        """Test report submission"""
        try:
            # Use a test block height (adjust based on current testnet height)
            rpc = BitcoinRPC()
            try:
                current_height = rpc.get_block_count()
                test_block_height = max(1, current_height - 10)
            except:
                test_block_height = 2500000  # Example testnet block
            
            result = integration.submit_report(
                reporter_address="tb1qtest...",  # Testnet address format
                pool_address="tb1qpool...",
                block_height=test_block_height,
                evidence_type=EvidenceType.CENSORSHIP,
                transaction_ids=["test_tx_id_1", "test_tx_id_2"],
                description="Testnet trial report"
            )
            
            if result.get('success'):
                self.log_test(
                    "Report Submission",
                    True,
                    f"Report submitted successfully (ID: {result['report_id'][:8]}...)"
                )
                return True, result['report_id']
            else:
                self.log_test(
                    "Report Submission",
                    False,
                    f"Submission failed: {result.get('error', 'Unknown error')}"
                )
                return False, None
        except Exception as e:
            self.log_test(
                "Report Submission",
                False,
                f"Exception during submission: {str(e)}"
            )
            return False, None
    
    def test_report_validation(self, integration, report_id):
        """Test report validation"""
        try:
            result = integration.validate_report(report_id, use_spells=True)
            
            if result.get('success'):
                is_valid = result.get('valid', False)
                status_msg = "validated" if is_valid else "rejected"
                self.log_test(
                    "Report Validation",
                    True,
                    f"Report {status_msg}: {result.get('message', '')}"
                )
                return True
            else:
                self.log_test(
                    "Report Validation",
                    False,
                    f"Validation failed: {result.get('error', 'Unknown error')}"
                )
                return False
        except Exception as e:
            self.log_test(
                "Report Validation",
                False,
                f"Exception during validation: {str(e)}"
            )
            return False
    
    def test_bounty_contract(self, integration):
        """Test bounty contract if available"""
        if not integration.bounty_contract:
            self.log_test(
                "Bounty Contract",
                True,
                "Bounty contract not configured (optional)",
                warning=True
            )
            return True
        
        try:
            # Test contract status
            status = integration.bounty_contract.get_contract_state()
            
            self.log_test(
                "Bounty Contract Status",
                True,
                f"Contract state: {status['state']}, Available funds: {status['available_funds_sats']} sats"
            )
            return True
        except Exception as e:
            self.log_test(
                "Bounty Contract",
                False,
                f"Contract test failed: {str(e)}"
            )
            return False
    
    def test_system_status(self, integration):
        """Test system status endpoint"""
        try:
            status = integration.get_system_status()
            
            bitcoin_connected = status.get('bitcoin_rpc', {}).get('connected', False)
            db_connected = status.get('database', {}).get('connected', False)
            
            self.log_test(
                "System Status",
                bitcoin_connected and db_connected,
                f"Bitcoin RPC: {'✓' if bitcoin_connected else '✗'}, Database: {'✓' if db_connected else '✗'}"
            )
            return True
        except Exception as e:
            self.log_test(
                "System Status",
                False,
                f"Status check failed: {str(e)}"
            )
            return False
    
    def run_trial(self):
        """Run complete testnet trial"""
        print("=" * 60)
        print("MineSentry Testnet Trial")
        print("=" * 60)
        print()
        
        # Test 1: Bitcoin RPC
        print("[1/6] Testing Bitcoin RPC connection...")
        rpc_ok, chain = self.test_bitcoin_rpc_connection()
        print()
        
        # Test 2: Database
        print("[2/6] Testing database connection...")
        db_ok = self.test_database()
        print()
        
        # Test 3: Integration Bridge
        print("[3/6] Testing integration bridge...")
        integration_ok, integration = self.test_integration_bridge()
        if not integration_ok:
            print("\n❌ Cannot continue without integration bridge")
            self.print_summary()
            return False
        print()
        
        # Test 4: System Status
        print("[4/6] Testing system status...")
        self.test_system_status(integration)
        print()
        
        # Test 5: Report Submission
        print("[5/6] Testing report submission...")
        report_ok, report_id = self.test_report_submission(integration)
        print()
        
        # Test 6: Report Validation (if report was submitted)
        if report_ok and report_id:
            print("[6/6] Testing report validation...")
            self.test_report_validation(integration, report_id)
            print()
        else:
            self.log_test(
                "Report Validation",
                False,
                "Skipped (report submission failed)",
                warning=True
            )
        
        # Test 7: Bounty Contract (optional)
        print("[7/7] Testing bounty contract...")
        self.test_bounty_contract(integration)
        print()
        
        # Summary
        self.results['completed_at'] = datetime.now(timezone.utc).isoformat()
        self.print_summary()
        
        return self.results['failed'] == 0
    
    def print_summary(self):
        """Print trial summary"""
        print("=" * 60)
        print("Testnet Trial Summary")
        print("=" * 60)
        print()
        print(f"Started: {self.results['started_at']}")
        print(f"Completed: {self.results.get('completed_at', 'Not completed')}")
        print()
        print(f"✅ Passed: {self.results['passed']}")
        print(f"⚠️  Warnings: {self.results['warnings']}")
        print(f"❌ Failed: {self.results['failed']}")
        print()
        
        if self.results['failed'] == 0:
            print("🎉 All critical tests passed!")
        else:
            print("⚠️  Some tests failed - review results above")
        
        print("=" * 60)


def main():
    """Main function"""
    trial = TestnetTrial()
    success = trial.run_trial()
    
    # Return exit code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

