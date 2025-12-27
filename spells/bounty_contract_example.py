"""
Example usage of the Bounty Contract
"""

import sys
from pathlib import Path

# Add parent directory to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from bitcoin_rpc import BitcoinRPC
from spells.bounty_contract import BountyContract, BountyContractSpell
from models import MiningPoolReport, EvidenceType, ReportStatus
from uuid import uuid4


def example_bounty_contract():
    """Example of using the bounty contract"""
    
    print("=" * 60)
    print("Bounty Contract Example")
    print("=" * 60)
    
    # Initialize Bitcoin RPC
    rpc = BitcoinRPC()
    
    # Initialize contract with authorized signers
    authorized_signers = [
        "bc1qsigner1...",  # Replace with actual signer addresses
        "bc1qsigner2...",
        "bc1qsigner3...",
    ]
    
    contract = BountyContract(
        bitcoin_rpc=rpc,
        contract_id="minesentry_bounty_v1",
        min_signatures=2,
        authorized_signers=authorized_signers
    )
    
    # Fund the contract (example: 0.01 BTC = 1,000,000 sats)
    print("\n[Step 1] Funding contract...")
    contract.fund_contract(1_000_000)  # 0.01 BTC
    state = contract.get_contract_state()
    print(f"  Contract funded: {state['available_funds_sats']} sats available")
    
    # Create a sample verified report
    print("\n[Step 2] Creating verified report...")
    report = MiningPoolReport()
    report.report_id = uuid4()
    report.reporter_address = "bc1qrecipient..."
    report.pool_address = "bc1qpool..."
    report.block_height = 800000
    report.evidence_type = EvidenceType.CENSORSHIP
    report.transaction_ids = ["tx1", "tx2", "tx3"]
    report.status = ReportStatus.VERIFIED
    
    # Calculate bounty
    bounty_amount = contract.calculate_bounty(report)
    print(f"  Bounty calculated: {bounty_amount} sats ({bounty_amount / 100000000} BTC)")
    
    # Create payment request
    print("\n[Step 3] Creating payment request...")
    payment = contract.create_payment_request(
        report=report,
        recipient_address=report.reporter_address
    )
    print(f"  Payment ID: {payment.payment_id}")
    print(f"  Amount: {payment.amount_sats} sats")
    print(f"  Status: {payment.status.value}")
    
    # Approve payment (multi-signature)
    print("\n[Step 4] Approving payment (multi-signature)...")
    signer1 = authorized_signers[0]
    success, message = contract.approve_payment(payment.payment_id, signer1)
    print(f"  Signer 1 approval: {message}")
    
    signer2 = authorized_signers[1]
    success, message = contract.approve_payment(payment.payment_id, signer2)
    print(f"  Signer 2 approval: {message}")
    print(f"  Payment status: {payment.status.value}")
    print(f"  Approvals: {len(payment.approvers)}/{contract.min_signatures}")
    
    # Check payment queue
    print("\n[Step 5] Payment queue:")
    queue = contract.get_payment_queue()
    for p in queue:
        print(f"  - {p['payment_id']}: {p['amount_btc']} BTC, Status: {p['status']}")
    
    # Get contract state
    print("\n[Step 6] Contract state:")
    state = contract.get_contract_state()
    print(f"  State: {state['state']}")
    print(f"  Available funds: {state['available_funds_sats']} sats")
    print(f"  Total paid: {state['total_paid_sats']} sats")
    print(f"  Pending payments: {state['pending_payments']}")
    
    print("\n" + "=" * 60)
    print("Example complete!")
    print("=" * 60)
    print("\nNote: To actually execute payment, uncomment the execute_payment call")
    print("      after ensuring contract has sufficient funds and Bitcoin RPC is configured.")
    
    # Uncomment to actually execute payment:
    # print("\n[Step 7] Executing payment...")
    # success, message, txid = contract.execute_payment(payment.payment_id)
    # if success:
    #     print(f"  Payment executed! TXID: {txid}")
    # else:
    #     print(f"  Payment failed: {message}")


def example_charms_spell():
    """Example of using the contract as a Charms spell"""
    
    print("\n" + "=" * 60)
    print("Charms Spell Example")
    print("=" * 60)
    
    rpc = BitcoinRPC()
    contract = BountyContract(
        bitcoin_rpc=rpc,
        contract_id="minesentry_bounty_v1",
        min_signatures=2,
        authorized_signers=["bc1qsigner1...", "bc1qsigner2..."]
    )
    
    # Wrap contract as Charms spell
    spell = BountyContractSpell(contract)
    
    # Deploy spell (would deploy to Bitcoin network)
    print("\n[Step 1] Deploying spell...")
    spell_id = spell.deploy()
    print(f"  Spell deployed: {spell_id}")
    
    # Execute spell methods (would execute on-chain)
    print("\n[Step 2] Executing spell methods...")
    
    # Example: Create payment request via spell
    # This would be called via Charms transaction
    result = spell.execute_spell_method(
        method_name="create_payment_request",
        params={
            'report': None,  # Would pass actual report
            'recipient_address': 'bc1q...'
        }
    )
    print(f"  Method execution result: {result}")
    
    print("\n" + "=" * 60)
    print("Charms spell example complete!")
    print("=" * 60)
    print("\nNote: Full Charms integration requires Charms framework deployment.")


if __name__ == "__main__":
    try:
        example_bounty_contract()
        # Uncomment to run Charms spell example:
        # example_charms_spell()
    except Exception as e:
        print(f"\nError: {e}")
        print("\nNote: Make sure Bitcoin Core is running and RPC is configured correctly.")

