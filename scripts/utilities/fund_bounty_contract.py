#!/usr/bin/env python3
"""
Fund Bounty Contract Script

This script helps you fund the MineSentry bounty contract with Bitcoin.
It creates a funding transaction to add funds to the contract.
"""

import sys
from pathlib import Path
from dotenv import load_dotenv
from bitcoin_rpc import BitcoinRPC
from integration_bridge import get_integration

# Load environment variables
load_dotenv()


def main():
    """Main funding function"""
    print("\n" + "="*60)
    print("Fund MineSentry Bounty Contract")
    print("="*60)
    
    try:
        # Get integration instance
        integration = get_integration()
        
        if not integration.bounty_contract:
            print("\n❌ Bounty contract is not initialized!")
            print("   Please run setup_bounty_contract.py first.")
            sys.exit(1)
        
        # Get current state
        state = integration.bounty_contract.get_contract_state()
        print(f"\nContract ID: {state['contract_id']}")
        print(f"Current available funds: {state['available_funds_sats']:,} sats ({state['available_funds_sats']/100000000:.8f} BTC)")
        print(f"Total funded: {state['total_funded_sats']:,} sats ({state['total_funded_sats']/100000000:.8f} BTC)")
        print(f"Total paid: {state['total_paid_sats']:,} sats ({state['total_paid_sats']/100000000:.8f} BTC)")
        
        # Get funding amount
        print("\nEnter the amount to fund the contract:")
        amount_input = input("Amount in BTC (or press Enter to cancel): ").strip()
        
        if not amount_input:
            print("❌ Funding cancelled.")
            sys.exit(0)
        
        try:
            amount_btc = float(amount_input)
            if amount_btc <= 0:
                print("❌ Amount must be greater than 0.")
                sys.exit(1)
            
            amount_sats = int(amount_btc * 100000000)
        except ValueError:
            print("❌ Invalid amount. Please enter a number.")
            sys.exit(1)
        
        # Confirm funding
        print(f"\n⚠️  You are about to fund the contract with {amount_btc} BTC ({amount_sats:,} sats).")
        confirm = input("Are you sure? (type 'yes' to confirm): ").strip()
        
        if confirm.lower() != 'yes':
            print("❌ Funding cancelled.")
            sys.exit(0)
        
        # Fund the contract
        print("\n📤 Funding contract...")
        try:
            integration.bounty_contract.fund_contract(amount_sats)
            
            # Get updated state
            state = integration.bounty_contract.get_contract_state()
            print("\n✅ Contract funded successfully!")
            print(f"   New available funds: {state['available_funds_sats']:,} sats ({state['available_funds_sats']/100000000:.8f} BTC)")
            print(f"   Total funded: {state['total_funded_sats']:,} sats ({state['total_funded_sats']/100000000:.8f} BTC)")
            
        except Exception as e:
            print(f"\n❌ Failed to fund contract: {e}")
            print("\n⚠️  Note: The fund_contract method is a placeholder.")
            print("   In a production system, this would create a transaction")
            print("   to send funds to the contract address.")
            sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n\n❌ Funding cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

