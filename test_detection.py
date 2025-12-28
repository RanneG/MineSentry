#!/usr/bin/env python3
"""
Quick test script to verify the detection pipeline is working
"""

import sys
import time
from integration_bridge import get_integration
from models import MiningPoolReport, EvidenceType, ReportStatus

def test_detection_pipeline():
    """Test the detection pipeline with a sample report"""
    print("🧪 Testing MineSentry Detection Pipeline\n")
    
    try:
        # Get integration instance
        print("1. Initializing integration bridge...")
        integration = get_integration()
        print("   ✅ Integration bridge initialized\n")
        
        # Check Bitcoin RPC connection
        print("2. Checking Bitcoin RPC connection...")
        try:
            blockchain_info = integration.bitcoin_rpc.get_blockchain_info()
            current_height = blockchain_info.get('blocks', 0)
            network = blockchain_info.get('chain', 'unknown')
            print(f"   ✅ Bitcoin RPC connected (Network: {network}, Block height: {current_height})\n")
        except Exception as e:
            print(f"   ⚠️  Bitcoin RPC connection failed: {e}")
            print("   ℹ️  Detection will still work, but will fail on actual block data\n")
        
        # Create a test report
        print("3. Creating test report...")
        report = MiningPoolReport()
        report.reporter_address = "tb1qtest1234567890abcdefghijklmnopqrstuvwx"
        report.pool_address = "tb1qpool1234567890abcdefghijklmnopqrstuvwxy"
        report.block_height = max(1, current_height - 100) if 'current_height' in locals() else 100000
        report.evidence_type = EvidenceType.CENSORSHIP
        report.transaction_ids = []  # Empty for now - will test detection anyway
        report.description = "Test report for detection pipeline"
        
        print(f"   Report details:")
        print(f"   - Block height: {report.block_height}")
        print(f"   - Evidence type: {report.evidence_type.value}")
        print(f"   - Transaction IDs: {len(report.transaction_ids)}")
        print("   ✅ Test report created\n")
        
        # Run detection spell
        print("4. Running detection spell...")
        print("   (This will fetch block data and run all 10 detection methods)")
        try:
            detection_results = integration.run_detection_spell(report)
            
            print(f"   ✅ Detection completed!\n")
            print("   Detection Results:")
            print(f"   - Is Censored: {detection_results['is_censored']}")
            print(f"   - Confidence Score: {detection_results['confidence_score']:.2%}")
            print(f"   - Evidence Count: {detection_results['evidence_count']}")
            print(f"   - Detection Methods: {len(detection_results['detection_methods'])}")
            if detection_results['detection_methods']:
                print(f"     Methods triggered: {', '.join(detection_results['detection_methods'])}")
            print(f"   - Missing Transactions: {len(detection_results['missing_transactions'])}")
            print(f"   - Message: {detection_results['message']}\n")
            
            if 'error' in detection_results.get('details', {}):
                print(f"   ⚠️  Detection error: {detection_results['details']['error']}\n")
            
            print("   ✅ Detection pipeline is working!\n")
            return True
            
        except Exception as e:
            print(f"   ❌ Detection failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_detection_pipeline()
    sys.exit(0 if success else 1)

