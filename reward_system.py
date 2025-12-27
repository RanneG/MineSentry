"""
Reward system for verified reports
Integrates with Bitcoin and Lightning Network for payments
"""

from typing import Optional, Dict
from decimal import Decimal
from models import MiningPoolReport, ReportStatus
from bitcoin_rpc import BitcoinRPC
import os


class RewardCalculator:
    """Calculates reward amounts based on report type and severity"""
    
    # Base rewards in satoshis
    BASE_REWARDS = {
        'CENSORSHIP': 100000,  # 0.001 BTC
        'DOUBLE_SPEND_ATTEMPT': 500000,  # 0.005 BTC
        'SELFISH_MINING': 200000,  # 0.002 BTC
        'BLOCK_REORDERING': 150000,  # 0.0015 BTC
        'TRANSACTION_CENSORSHIP': 75000,  # 0.00075 BTC
        'UNUSUAL_BLOCK_TEMPLATE': 50000,  # 0.0005 BTC
        'OTHER': 25000,  # 0.00025 BTC
    }
    
    @staticmethod
    def calculate_reward(report: MiningPoolReport) -> float:
        """
        Calculate reward amount for a report
        
        Args:
            report: Mining pool report
            
        Returns:
            Reward amount in satoshis
        """
        base_reward = RewardCalculator.BASE_REWARDS.get(
            report.evidence_type.value.upper(),
            RewardCalculator.BASE_REWARDS['OTHER']
        )
        
        # Adjust based on number of transactions provided (more evidence = higher reward)
        evidence_multiplier = min(1.0 + (len(report.transaction_ids) * 0.1), 2.0)
        
        reward = base_reward * evidence_multiplier
        
        # Ensure minimum reward
        return max(reward, 10000)  # Minimum 0.0001 BTC


class RewardPayment:
    """Handles reward payments to reporters"""
    
    def __init__(self, bitcoin_rpc: BitcoinRPC, lightning_enabled: bool = False):
        """
        Initialize reward payment system
        
        Args:
            bitcoin_rpc: Bitcoin RPC client
            lightning_enabled: Whether Lightning Network is enabled
        """
        self.bitcoin_rpc = bitcoin_rpc
        self.lightning_enabled = lightning_enabled
        self.min_payment_sats = 10000  # 0.0001 BTC minimum
        self.use_lightning_threshold = 1000000  # Use Lightning for payments < 0.01 BTC
    
    def pay_reward(self, report: MiningPoolReport) -> Optional[str]:
        """
        Pay reward to reporter
        
        Args:
            report: Verified mining pool report
            
        Returns:
            Transaction ID if successful, None otherwise
        """
        if report.status != ReportStatus.VERIFIED:
            raise ValueError("Cannot pay reward for non-verified report")
        
        if report.bounty_amount <= 0:
            raise ValueError("Bounty amount must be greater than 0")
        
        amount_btc = report.bounty_amount / 100000000  # Convert sats to BTC
        
        # Use Lightning Network for small payments if enabled
        if self.lightning_enabled and report.bounty_amount < self.use_lightning_threshold:
            return self._pay_via_lightning(report.reporter_address, report.bounty_amount)
        else:
            return self._pay_via_onchain(report.reporter_address, amount_btc)
    
    def _pay_via_onchain(self, address: str, amount_btc: float) -> Optional[str]:
        """
        Pay reward via on-chain Bitcoin transaction
        
        Args:
            address: Recipient address
            amount_btc: Amount in BTC
            
        Returns:
            Transaction ID
        """
        try:
            comment = "MineSentry reward payment"
            txid = self.bitcoin_rpc.send_to_address(address, amount_btc, comment)
            return txid
        except Exception as e:
            print(f"Error sending on-chain payment: {e}")
            return None
    
    def _pay_via_lightning(self, address: str, amount_sats: int) -> Optional[str]:
        """
        Pay reward via Lightning Network
        
        Args:
            address: Lightning invoice or node ID
            amount_sats: Amount in satoshis
            
        Returns:
            Payment hash or transaction ID
        """
        # TODO: Implement Lightning Network payment
        # This would integrate with LND, CLN, or other Lightning node
        # For now, fall back to on-chain
        print(f"Lightning payment not yet implemented, using on-chain fallback")
        amount_btc = amount_sats / 100000000
        return self._pay_via_onchain(address, amount_btc)


class LightningNetwork:
    """Lightning Network integration for micro-payments"""
    
    def __init__(self, lightning_rpc_url: str = None, macaroon_path: str = None):
        """
        Initialize Lightning Network client
        
        Args:
            lightning_rpc_url: Lightning node RPC URL (e.g., LND gRPC)
            macaroon_path: Path to macaroon file for authentication
        """
        self.lightning_rpc_url = lightning_rpc_url or os.getenv('LIGHTNING_RPC_URL')
        self.macaroon_path = macaroon_path or os.getenv('LIGHTNING_MACAROON_PATH')
        # TODO: Initialize Lightning client (LND, CLN, etc.)
    
    def create_invoice(self, amount_sats: int, memo: str = "") -> Optional[str]:
        """
        Create Lightning invoice
        
        Args:
            amount_sats: Amount in satoshis
            memo: Invoice memo/description
            
        Returns:
            Payment request (invoice)
        """
        # TODO: Implement invoice creation
        return None
    
    def pay_invoice(self, payment_request: str) -> Optional[str]:
        """
        Pay Lightning invoice
        
        Args:
            payment_request: Lightning payment request (invoice)
            
        Returns:
            Payment hash if successful
        """
        # TODO: Implement invoice payment
        return None
    
    def get_balance(self) -> Dict[str, int]:
        """
        Get Lightning Network balance
        
        Returns:
            Dictionary with 'local' and 'remote' balances in sats
        """
        # TODO: Implement balance retrieval
        return {'local': 0, 'remote': 0}

