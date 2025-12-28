"""
Bounty Smart Contract (Charms-based)

This contract handles reward distribution for verified mining pool reports.
It implements a decentralized bounty system on Bitcoin using Charms spells.

Contract Features:
- Multi-signature verification
- Automated reward calculation
- Payment distribution
- State management
- On-chain validation
"""

from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from models import MiningPoolReport, ReportStatus, EvidenceType
from bitcoin_rpc import BitcoinRPC


class ContractState(Enum):
    """Contract state enumeration"""
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    FUNDING = "funding"


class PaymentStatus(Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    REJECTED = "rejected"
    FAILED = "failed"


@dataclass
class BountyPayment:
    """Represents a bounty payment request"""
    payment_id: str
    report_id: str
    recipient_address: str
    amount_sats: int
    status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    txid: Optional[str] = None
    approvers: List[str] = field(default_factory=list)
    rejection_reason: Optional[str] = None


@dataclass
class BountyContractState:
    """State of the bounty contract"""
    contract_id: str
    state: ContractState = ContractState.ACTIVE
    total_funded_sats: int = 0
    total_paid_sats: int = 0
    total_reserved_sats: int = 0
    min_signatures: int = 2  # Multi-sig requirement
    authorized_signers: List[str] = field(default_factory=list)
    payment_queue: List[BountyPayment] = field(default_factory=list)
    payment_history: List[BountyPayment] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)


class BountyContract:
    """
    Charms-based Bounty Smart Contract
    
    This contract implements a decentralized bounty system for rewarding
    verified mining pool reports. It uses multi-signature verification
    and automated payment distribution.
    """
    
    def __init__(
        self,
        bitcoin_rpc: BitcoinRPC,
        contract_id: str = "minesentry_bounty_v1",
        min_signatures: int = 2,
        authorized_signers: List[str] = None
    ):
        """
        Initialize bounty contract
        
        Args:
            bitcoin_rpc: Bitcoin RPC client
            contract_id: Unique contract identifier
            min_signatures: Minimum signatures required for payments
            authorized_signers: List of authorized signer addresses
        """
        self.bitcoin_rpc = bitcoin_rpc
        self.contract_id = contract_id
        self.min_signatures = min_signatures
        self.authorized_signers = authorized_signers or []
        
        # Initialize contract state
        self.state = BountyContractState(
            contract_id=contract_id,
            min_signatures=min_signatures,
            authorized_signers=self.authorized_signers,
            state=ContractState.ACTIVE
        )
        
        # Payment calculation parameters
        self.base_rewards = {
            EvidenceType.CENSORSHIP: 100000,  # 0.001 BTC
            EvidenceType.DOUBLE_SPEND_ATTEMPT: 500000,  # 0.005 BTC
            EvidenceType.SELFISH_MINING: 200000,  # 0.002 BTC
            EvidenceType.BLOCK_REORDERING: 150000,  # 0.0015 BTC
            EvidenceType.TRANSACTION_CENSORSHIP: 75000,  # 0.00075 BTC
            EvidenceType.UNUSUAL_BLOCK_TEMPLATE: 50000,  # 0.0005 BTC
            EvidenceType.OTHER: 25000,  # 0.00025 BTC
        }
    
    def calculate_bounty(self, report: MiningPoolReport) -> int:
        """
        Calculate bounty amount for a verified report
        
        Args:
            report: Verified mining pool report
            
        Returns:
            Bounty amount in satoshis
        """
        # Get base reward for evidence type
        base_reward = self.base_rewards.get(
            report.evidence_type,
            self.base_rewards[EvidenceType.OTHER]
        )
        
        # Adjust based on number of transactions provided (more evidence = higher reward)
        evidence_multiplier = min(1.0 + (len(report.transaction_ids) * 0.1), 2.0)
        
        # Calculate reward
        reward = int(base_reward * evidence_multiplier)
        
        # Ensure minimum reward
        return max(reward, 10000)  # Minimum 0.0001 BTC
    
    def create_payment_request(
        self,
        report: MiningPoolReport,
        recipient_address: str
    ) -> BountyPayment:
        """
        Create a payment request for a verified report
        
        Args:
            report: Verified mining pool report
            recipient_address: Bitcoin address to receive payment
            
        Returns:
            BountyPayment object
        """
        if self.state.state != ContractState.ACTIVE:
            raise Exception(f"Contract is not active (state: {self.state.state.value})")
        
        if report.status != ReportStatus.VERIFIED:
            raise Exception("Report must be verified before creating payment request")
        
        # Calculate bounty amount
        amount_sats = self.calculate_bounty(report)
        
        # Check if contract has sufficient funds
        available_funds = (
            self.state.total_funded_sats -
            self.state.total_paid_sats -
            self.state.total_reserved_sats
        )
        
        if amount_sats > available_funds:
            raise Exception(f"Insufficient funds: need {amount_sats} sats, have {available_funds} sats")
        
        # Create payment request
        payment_id = f"{self.contract_id}_{report.report_id}_{int(datetime.utcnow().timestamp())}"
        payment = BountyPayment(
            payment_id=payment_id,
            report_id=str(report.report_id),
            recipient_address=recipient_address,
            amount_sats=amount_sats,
            status=PaymentStatus.PENDING
        )
        
        # Reserve funds
        self.state.total_reserved_sats += amount_sats
        self.state.payment_queue.append(payment)
        self.state.updated_at = datetime.utcnow()
        
        return payment
    
    def approve_payment(
        self,
        payment_id: str,
        signer_address: str
    ) -> Tuple[bool, str]:
        """
        Approve a payment request (multi-signature)
        
        Args:
            payment_id: Payment request ID
            signer_address: Address of the approving signer
            
        Returns:
            Tuple of (success, message)
        """
        if signer_address not in self.authorized_signers:
            return (False, "Unauthorized signer")
        
        # Find payment in queue
        payment = None
        for p in self.state.payment_queue:
            if p.payment_id == payment_id:
                payment = p
                break
        
        if payment is None:
            return (False, "Payment not found in queue")
        
        if payment.status != PaymentStatus.PENDING:
            return (False, f"Payment already {payment.status.value}")
        
        # Add approver if not already approved by this signer
        if signer_address not in payment.approvers:
            payment.approvers.append(signer_address)
        
        # Check if we have enough signatures
        if len(payment.approvers) >= self.min_signatures:
            payment.status = PaymentStatus.APPROVED
            payment.approved_at = datetime.utcnow()
            self.state.updated_at = datetime.utcnow()
            return (True, "Payment approved and ready to pay")
        
        return (True, f"Approval added ({len(payment.approvers)}/{self.min_signatures} signatures)")
    
    def reject_payment(
        self,
        payment_id: str,
        signer_address: str,
        reason: str
    ) -> Tuple[bool, str]:
        """
        Reject a payment request
        
        Args:
            payment_id: Payment request ID
            signer_address: Address of the rejecting signer
            reason: Reason for rejection
            
        Returns:
            Tuple of (success, message)
        """
        if signer_address not in self.authorized_signers:
            return (False, "Unauthorized signer")
        
        # Find payment in queue
        payment = None
        for p in self.state.payment_queue:
            if p.payment_id == payment_id:
                payment = p
                break
        
        if payment is None:
            return (False, "Payment not found in queue")
        
        # Reject payment
        payment.status = PaymentStatus.REJECTED
        payment.rejection_reason = reason
        
        # Release reserved funds
        self.state.total_reserved_sats -= payment.amount_sats
        
        # Move to history
        self.state.payment_queue.remove(payment)
        self.state.payment_history.append(payment)
        self.state.updated_at = datetime.utcnow()
        
        return (True, "Payment rejected")
    
    def execute_payment(self, payment_id: str) -> Tuple[bool, str, Optional[str]]:
        """
        Execute an approved payment (send Bitcoin)
        
        Args:
            payment_id: Payment request ID
            
        Returns:
            Tuple of (success, message, txid)
        """
        # Find approved payment
        payment = None
        for p in self.state.payment_queue:
            if p.payment_id == payment_id and p.status == PaymentStatus.APPROVED:
                payment = p
                break
        
        if payment is None:
            return (False, "Approved payment not found", None)
        
        try:
            # Send Bitcoin payment
            amount_btc = payment.amount_sats / 100000000
            comment = f"MineSentry bounty payment for report {payment.report_id}"
            
            txid = self.bitcoin_rpc.send_to_address(
                payment.recipient_address,
                amount_btc,
                comment
            )
            
            # Update payment status
            payment.status = PaymentStatus.PAID
            payment.txid = txid
            payment.paid_at = datetime.utcnow()
            
            # Update contract state
            self.state.total_paid_sats += payment.amount_sats
            self.state.total_reserved_sats -= payment.amount_sats
            
            # Move to history
            self.state.payment_queue.remove(payment)
            self.state.payment_history.append(payment)
            self.state.updated_at = datetime.utcnow()
            
            return (True, "Payment executed successfully", txid)
            
        except Exception as e:
            payment.status = PaymentStatus.FAILED
            return (False, f"Payment failed: {str(e)}", None)
    
    def get_contract_state(self) -> Dict[str, Any]:
        """
        Get current contract state
        
        Returns:
            Dictionary with contract state information
        """
        available_funds = (
            self.state.total_funded_sats -
            self.state.total_paid_sats -
            self.state.total_reserved_sats
        )
        
        return {
            'contract_id': self.contract_id,
            'state': self.state.state.value,
            'total_funded_sats': self.state.total_funded_sats,
            'total_paid_sats': self.state.total_paid_sats,
            'total_reserved_sats': self.state.total_reserved_sats,
            'available_funds_sats': available_funds,
            'min_signatures': self.min_signatures,
            'authorized_signers': self.authorized_signers,
            'pending_payments': len(self.state.payment_queue),
            'total_payments': len(self.state.payment_history),
            'created_at': self.state.created_at.isoformat(),
            'updated_at': self.state.updated_at.isoformat(),
        }
    
    def get_payment_queue(self) -> List[Dict[str, Any]]:
        """
        Get current payment queue
        
        Returns:
            List of payment request dictionaries
        """
        return [
            {
                'payment_id': p.payment_id,
                'report_id': p.report_id,
                'recipient_address': p.recipient_address,
                'amount_sats': p.amount_sats,
                'amount_btc': p.amount_sats / 100000000,
                'status': p.status.value,
                'approvers': p.approvers,
                'approvals': f"{len(p.approvers)}/{self.min_signatures}",
                'created_at': p.created_at.isoformat(),
                'approved_at': p.approved_at.isoformat() if p.approved_at else None,
            }
            for p in self.state.payment_queue
        ]
    
    def get_payment_history(self) -> List[Dict[str, Any]]:
        """
        Get payment history (completed payments)
        
        Returns:
            List of payment dictionaries with status='paid'
        """
        return [
            {
                'payment_id': p.payment_id,
                'report_id': p.report_id,
                'recipient_address': p.recipient_address,
                'amount_sats': p.amount_sats,
                'amount_btc': p.amount_sats / 100000000,
                'status': p.status.value,
                'approvers': p.approvers,
                'txid': p.txid,
                'created_at': p.created_at.isoformat(),
                'approved_at': p.approved_at.isoformat() if p.approved_at else None,
                'paid_at': p.paid_at.isoformat() if p.paid_at else None,
            }
            for p in self.state.payment_history
            if p.status == PaymentStatus.PAID
        ]
    
    def fund_contract(self, amount_sats: int) -> bool:
        """
        Fund the contract (add funds)
        
        Args:
            amount_sats: Amount to add in satoshis
            
        Returns:
            True if successful
        """
        if amount_sats <= 0:
            return False
        
        self.state.total_funded_sats += amount_sats
        self.state.updated_at = datetime.utcnow()
        return True
    
    def pause_contract(self) -> bool:
        """Pause the contract (stop processing new payments)"""
        if self.state.state == ContractState.ACTIVE:
            self.state.state = ContractState.PAUSED
            self.state.updated_at = datetime.utcnow()
            return True
        return False
    
    def resume_contract(self) -> bool:
        """Resume the contract"""
        if self.state.state == ContractState.PAUSED:
            self.state.state = ContractState.ACTIVE
            self.state.updated_at = datetime.utcnow()
            return True
        return False
    
    def close_contract(self) -> bool:
        """Close the contract (no new payments, existing can be processed)"""
        if self.state.state in [ContractState.ACTIVE, ContractState.PAUSED]:
            self.state.state = ContractState.CLOSED
            self.state.updated_at = datetime.utcnow()
            return True
        return False


# Charms Spell Interface
# This would be deployed as a Charms spell on Bitcoin
class BountyContractSpell:
    """
    Charms spell wrapper for the bounty contract
    
    This class would interface with Charms framework to deploy
    the contract logic on-chain.
    """
    
    def __init__(self, contract: BountyContract):
        """
        Initialize spell with contract
        
        Args:
            contract: BountyContract instance
        """
        self.contract = contract
        self.spell_id = None  # Would be set when deployed
    
    def deploy(self) -> str:
        """
        Deploy contract as Charms spell
        
        Returns:
            Spell ID (transaction hash or similar)
        """
        # TODO: Implement Charms deployment
        # This would:
        # 1. Compile contract logic to Charms bytecode
        # 2. Create deployment transaction
        # 3. Broadcast to Bitcoin network
        # 4. Return spell ID
        
        self.spell_id = f"spell_{self.contract.contract_id}_{int(datetime.utcnow().timestamp())}"
        return self.spell_id
    
    def execute_spell_method(
        self,
        method_name: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a contract method via Charms spell
        
        Args:
            method_name: Name of the method to execute
            params: Method parameters
            
        Returns:
            Method execution result
        """
        # TODO: Implement Charms spell execution
        # This would:
        # 1. Create transaction calling the spell method
        # 2. Sign with required signatures
        # 3. Broadcast to network
        # 4. Wait for confirmation
        # 5. Return result
        
        # For now, execute locally
        if method_name == "create_payment_request":
            report = params.get('report')
            address = params.get('recipient_address')
            payment = self.contract.create_payment_request(report, address)
            return {'success': True, 'payment_id': payment.payment_id}
        
        elif method_name == "approve_payment":
            payment_id = params.get('payment_id')
            signer = params.get('signer_address')
            success, message = self.contract.approve_payment(payment_id, signer)
            return {'success': success, 'message': message}
        
        elif method_name == "execute_payment":
            payment_id = params.get('payment_id')
            success, message, txid = self.contract.execute_payment(payment_id)
            return {'success': success, 'message': message, 'txid': txid}
        
        else:
            return {'success': False, 'error': f"Unknown method: {method_name}"}

