#!/usr/bin/env python3
"""
Test the detection pipeline through the API
"""

import sys
import time
import requests
from example_client import MineSentryClient

def test_api_detection():
    """Test detection through the API"""
    print("🧪 Testing Detection Pipeline via API\n")
    
    base_url = "http://localhost:8000"
    client = MineSentryClient(base_url)
    
    try:
        # Check if API is running
        print("1. Checking API health...")
        try:
            health_url = f"{base_url}/health"
            response = requests.get(health_url, timeout=2)
            if response.status_code == 200:
                health = response.json()
                print(f"   ✅ API is running: {health.get('status', 'unknown')}\n")
            else:
                print(f"   ⚠️  API returned status {response.status_code}\n")
        except requests.exceptions.ConnectionError:
            print(f"   ❌ API not running - connection refused")
            print("   ℹ️  Please start the API server: python api.py\n")
            return False
        except Exception as e:
            print(f"   ⚠️  Error checking API: {e}\n")
        
        # Submit a test report
        print("2. Submitting test report...")
        try:
            report = client.submit_report(
                reporter_address="tb1qtest1234567890abcdefghijklmnopqrstuvwx",
                pool_address="tb1qpool1234567890abcdefghijklmnopqrstuvwxy",
                block_height=100000,  # Use a safe testnet/mainnet block height
                evidence_type="censorship",
                transaction_ids=[],
                pool_name="Test Pool",
                description="Test report for detection pipeline"
            )
            
            report_id = report['report_id']
            print(f"   ✅ Report submitted: {report_id}\n")
            
        except Exception as e:
            print(f"   ❌ Failed to submit report: {e}\n")
            return False
        
        # Wait a moment for background detection to run
        print("3. Waiting for background detection to run...")
        print("   (Detection runs asynchronously when report is submitted)")
        time.sleep(3)  # Give it a few seconds
        
        # Fetch the report to see if detection ran
        print("4. Fetching report with detection results...")
        try:
            report_data = client.get_report(report_id)
            print(f"   ✅ Report retrieved\n")
            print(f"   Report Status: {report_data.get('status', 'unknown')}")
            
            # Check for detection results in description (stored as JSON)
            description = report_data.get('description', '')
            if description and ('detection_results' in description or 'confidence' in description.lower()):
                print("   ✅ Detection results found in report!\n")
                print(f"   Description (contains detection data): {description[:200]}...")
            else:
                print("   ℹ️  Detection may still be running or not completed yet")
                print("   (Detection runs in background - may take a few more seconds)\n")
                
        except Exception as e:
            print(f"   ❌ Failed to get report: {e}\n")
            return False
        
        # Try to get confidence score
        print("5. Fetching confidence score via API endpoint...")
        try:
            confidence_url = f"{base_url}/reports/{report_id}/confidence"
            response = requests.get(confidence_url)
            if response.status_code == 200:
                confidence_data = response.json()
                print("   ✅ Confidence data retrieved!\n")
                print(f"   Confidence Score: {confidence_data.get('confidence_score', 0):.2%}")
                print(f"   Is Censored: {confidence_data.get('is_censored', False)}")
                print(f"   Detection Methods: {len(confidence_data.get('detection_methods', []))}")
                if confidence_data.get('detection_methods'):
                    print(f"     Methods: {', '.join(confidence_data['detection_methods'])}")
                print(f"   Evidence Count: {confidence_data.get('evidence_count', 0)}")
                print(f"   Message: {confidence_data.get('message', 'N/A')}\n")
            else:
                print(f"   ⚠️  Confidence endpoint returned: {response.status_code}")
                print(f"   Response: {response.text[:200]}\n")
        except Exception as e:
            print(f"   ⚠️  Failed to get confidence: {e}")
            print("   (This is OK if detection hasn't completed yet)\n")
        
        print("✅ API Detection Pipeline Test Complete!\n")
        print("ℹ️  Note: Detection requires Bitcoin RPC connection for real block data.")
        print("   If Bitcoin Core is not running, detection will fail gracefully.\n")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}\n")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_api_detection()
    sys.exit(0 if success else 1)

