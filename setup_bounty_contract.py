#!/usr/bin/env python3
"""
Bounty Contract Setup Script

This script helps you set up and initialize the MineSentry bounty contract.
It guides you through:
1. Configuring authorized signers
2. Setting up environment variables
3. Initializing the contract
4. Funding the contract (optional)
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv, set_key
from bitcoin_rpc import BitcoinRPC
from integration_bridge import get_integration

# Load environment variables
load_dotenv()


def get_or_create_env():
    """Get or create .env file"""
    env_path = Path('.env')
    if not env_path.exists():
        print("⚠️  .env file not found. Creating...")
        env_path.touch()
    return env_path


def get_signers_from_user():
    """Get signer addresses from user"""
    print("\n" + "="*60)
    print("Step 1: Configure Authorized Signers")
    print("="*60)
    print("\nAuthorized signers are Bitcoin addresses that can approve payments.")
    print("You need at least 2 signers for multi-signature security.")
    print("\nEnter signer addresses (one per line, empty line to finish):")
    
    signers = []
    while True:
        address = input(f"Signer {len(signers) + 1} address (or press Enter to finish): ").strip()
        if not address:
            if len(signers) < 2:
                print("⚠️  You need at least 2 signers. Please enter more addresses.")
                continue
            break
        
        # Basic address validation (starts with 1, 3, or bc1)
        if not (address.startswith('1') or address.startswith('3') or address.startswith('bc1')):
            print("⚠️  Invalid Bitcoin address format. Please try again.")
            continue
        
        if address in signers:
            print("⚠️  Address already added. Please enter a different address.")
            continue
        
        signers.append(address)
        print(f"✅ Added signer {len(signers)}: {address}")
    
    return signers


def get_min_signatures(num_signers):
    """Get minimum signatures required"""
    print("\n" + "="*60)
    print("Step 2: Configure Minimum Signatures")
    print("="*60)
    print(f"\nYou have {num_signers} authorized signers.")
    print("Minimum signatures is the number of approvals needed for a payment.")
    print(f"Recommended: 2-{num_signers} (higher = more secure, but slower)")
    
    while True:
        try:
            min_sig = input(f"Minimum signatures required (default: 2): ").strip()
            if not min_sig:
                return 2
            min_sig = int(min_sig)
            if min_sig < 1:
                print("⚠️  Minimum signatures must be at least 1.")
                continue
            if min_sig > num_signers:
                print(f"⚠️  Minimum signatures cannot exceed number of signers ({num_signers}).")
                continue
            return min_sig
        except ValueError:
            print("⚠️  Please enter a valid number.")


def update_env_file(signers, min_signatures):
    """Update .env file with bounty contract configuration"""
    env_path = get_or_create_env()
    
    signers_str = ','.join(signers)
    
    # Update or add BOUNTY_CONTRACT_SIGNERS
    set_key(str(env_path), 'BOUNTY_CONTRACT_SIGNERS', signers_str)
    
    # Update or add BOUNTY_MIN_SIGNATURES
    set_key(str(env_path), 'BOUNTY_MIN_SIGNATURES', str(min_signatures))
    
    print("\n✅ Updated .env file with bounty contract configuration")
    print(f"   BOUNTY_CONTRACT_SIGNERS={signers_str}")
    print(f"   BOUNTY_MIN_SIGNATURES={min_signatures}")


def test_bitcoin_rpc():
    """Test Bitcoin RPC connection"""
    print("\n" + "="*60)
    print("Step 3: Testing Bitcoin RPC Connection")
    print("="*60)
    
    try:
        rpc = BitcoinRPC()
        info = rpc.get_blockchain_info()
        print(f"\n✅ Bitcoin RPC connected successfully!")
        print(f"   Network: {info.get('chain', 'unknown')}")
        print(f"   Block height: {info.get('blocks', 0):,}")
        return rpc
    except Exception as e:
        print(f"\n❌ Bitcoin RPC connection failed: {e}")
        print("\n⚠️  Make sure Bitcoin Core is running and RPC is configured.")
        return None


def initialize_contract(rpc, signers, min_signatures):
    """Initialize the bounty contract"""
    print("\n" + "="*60)
    print("Step 4: Initializing Bounty Contract")
    print("="*60)
    
    try:
        from spells.bounty_contract import BountyContract
        
        contract = BountyContract(
            bitcoin_rpc=rpc,
            contract_id="minesentry_bounty_v1",
            min_signatures=min_signatures,
            authorized_signers=signers
        )
        
        state = contract.get_contract_state()
        print("\n✅ Bounty contract initialized successfully!")
        print(f"   Contract ID: {state['contract_id']}")
        print(f"   State: {state['state']}")
        print(f"   Min Signatures: {min_signatures}")
        print(f"   Authorized Signers: {len(signers)}")
        print(f"   Available Funds: {state['available_funds_sats']:,} sats ({state['available_funds_sats']/100000000:.8f} BTC)")
        
        return contract
    except Exception as e:
        print(f"\n❌ Failed to initialize contract: {e}")
        import traceback
        traceback.print_exc()
        return None


def fund_contract_interactive(contract, rpc):
    """Interactively fund the contract"""
    print("\n" + "="*60)
    print("Step 5: Fund the Contract (Optional)")
    print("="*60)
    
    state = contract.get_contract_state()
    print(f"\nCurrent available funds: {state['available_funds_sats']:,} sats ({state['available_funds_sats']/100000000:.8f} BTC)")
    
    fund_choice = input("\nWould you like to fund the contract now? (y/n): ").strip().lower()
    if fund_choice != 'y':
        print("⏭️  Skipping funding. You can fund the contract later.")
        return
    
    try:
        # Get an address to send funds to
        # Note: In a real implementation, the contract would have its own address
        # For now, we'll use a new address from the wallet
        address = rpc._call('getnewaddress', ['bounty_contract'])
        print(f"\n📝 Contract address: {address}")
        print("\n⚠️  IMPORTANT: Send funds to this address to fund the bounty contract.")
        print("   You can send funds from any Bitcoin wallet.")
        
        amount_choice = input("\nEnter amount in BTC to fund (or press Enter to skip): ").strip()
        if not amount_choice:
            print("⏭️  Skipping automatic funding.")
            return
        
        amount_btc = float(amount_choice)
        if amount_btc <= 0:
            print("⚠️  Invalid amount. Skipping funding.")
            return
        
        # Note: In a production system, you would use a wallet with funds
        # For now, we'll just record the address
        print(f"\n✅ Contract address ready: {address}")
        print(f"   Please send {amount_btc} BTC to this address.")
        print("   Once sent, the contract will be funded.")
        
    except Exception as e:
        print(f"\n⚠️  Could not generate funding address: {e}")
        print("   You can fund the contract manually later.")


def verify_integration():
    """Verify the contract is properly integrated"""
    print("\n" + "="*60)
    print("Step 6: Verifying Integration")
    print("="*60)
    
    try:
        # Reload environment variables
        load_dotenv(override=True)
        
        # Reset integration to force reload
        from integration_bridge import reset_integration
        reset_integration()
        
        # Get fresh integration instance
        integration = get_integration()
        
        if integration.bounty_contract:
            state = integration.bounty_contract.get_contract_state()
            print("\n✅ Bounty contract is properly integrated!")
            print(f"   Contract ID: {state['contract_id']}")
            print(f"   State: {state['state']}")
            print(f"   Available Funds: {state['available_funds_sats']:,} sats")
            return True
        else:
            print("\n❌ Bounty contract is not initialized in integration bridge.")
            print("   This might be because:")
            print("   1. Environment variables weren't loaded correctly")
            print("   2. BOUNTY_CONTRACT_SIGNERS is empty or not set")
            print("   3. The API server needs to be restarted")
            return False
            
    except Exception as e:
        print(f"\n❌ Integration verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main setup function"""
    print("\n" + "="*60)
    print("MineSentry Bounty Contract Setup")
    print("="*60)
    print("\nThis script will help you configure and initialize the bounty contract.")
    print("You'll need:")
    print("  - Bitcoin addresses for authorized signers (at least 2)")
    print("  - Bitcoin Core running and connected")
    print("\nPress Ctrl+C at any time to cancel.\n")
    
    try:
        # Step 1: Get signers
        signers = get_signers_from_user()
        
        # Step 2: Get min signatures
        min_signatures = get_min_signatures(len(signers))
        
        # Step 3: Update .env file
        update_env_file(signers, min_signatures)
        
        # Step 4: Test Bitcoin RPC
        rpc = test_bitcoin_rpc()
        if not rpc:
            print("\n❌ Cannot proceed without Bitcoin RPC connection.")
            sys.exit(1)
        
        # Step 5: Initialize contract
        contract = initialize_contract(rpc, signers, min_signatures)
        if not contract:
            print("\n❌ Failed to initialize contract.")
            sys.exit(1)
        
        # Step 6: Fund contract (optional)
        fund_contract_interactive(contract, rpc)
        
        # Step 7: Verify integration
        verify_success = verify_integration()
        
        print("\n" + "="*60)
        print("Setup Complete!")
        print("="*60)
        
        if verify_success:
            print("\n✅ Bounty contract is set up and ready to use!")
            print("\n📋 Next steps:")
            print("   1. Restart the API server to load new configuration:")
            print("      python api.py")
            print("   2. The bounty contract will be available at /bounty/contract/status")
            print("   3. Fund the contract with Bitcoin to enable payments")
        else:
            print("\n⚠️  Setup completed, but integration verification failed.")
            print("   Please restart the API server and try again.")
            print("   python api.py")
        
        print("\n")
        
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Setup failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

