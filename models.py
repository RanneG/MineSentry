"""
Core data models for MineSentry - UTXO Mining Pool Monitor & Reward System
"""

from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass, field


class EvidenceType(Enum):
    """Types of suspicious mining pool activities"""
    CENSORSHIP = "censorship"
    DOUBLE_SPEND_ATTEMPT = "double_spend_attempt"
    SELFISH_MINING = "selfish_mining"
    BLOCK_REORDERING = "block_reordering"
    TRANSACTION_CENSORSHIP = "transaction_censorship"
    UNUSUAL_BLOCK_TEMPLATE = "unusual_block_template"
    OTHER = "other"


class ReportStatus(Enum):
    """Status of a mining pool report"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    UNDER_REVIEW = "under_review"


@dataclass
class MiningPoolReport:
    """Main model for mining pool reports"""
    report_id: UUID = field(default_factory=uuid4)
    reporter_address: str = ""  # Bitcoin address for rewards
    pool_address: str = ""  # Suspected mining pool address
    pool_name: Optional[str] = None  # Optional pool identifier
    block_height: int = 0  # Where manipulation occurred
    evidence_type: EvidenceType = EvidenceType.OTHER
    transaction_ids: List[str] = field(default_factory=list)  # Evidence transactions
    block_hash: Optional[str] = None  # Block hash where issue occurred
    description: Optional[str] = None  # Human-readable description
    timestamp: datetime = field(default_factory=datetime.utcnow)
    status: ReportStatus = ReportStatus.PENDING
    bounty_amount: float = 0.0  # Reward amount in sats
    verification_txid: Optional[str] = None  # Transaction ID for reward payment
    verified_by: Optional[str] = None  # Address/node that verified the report
    verified_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Convert report to dictionary for serialization"""
        return {
            'report_id': str(self.report_id),
            'reporter_address': self.reporter_address,
            'pool_address': self.pool_address,
            'pool_name': self.pool_name,
            'block_height': self.block_height,
            'evidence_type': self.evidence_type.value,
            'transaction_ids': self.transaction_ids,
            'block_hash': self.block_hash,
            'description': self.description,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status.value,
            'bounty_amount': self.bounty_amount,
            'verification_txid': self.verification_txid,
            'verified_by': self.verified_by,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'MiningPoolReport':
        """Create report from dictionary"""
        report = cls()
        report.report_id = UUID(data['report_id'])
        report.reporter_address = data['reporter_address']
        report.pool_address = data['pool_address']
        report.pool_name = data.get('pool_name')
        report.block_height = data['block_height']
        report.evidence_type = EvidenceType(data['evidence_type'])
        report.transaction_ids = data.get('transaction_ids', [])
        report.block_hash = data.get('block_hash')
        report.description = data.get('description')
        report.timestamp = datetime.fromisoformat(data['timestamp'])
        report.status = ReportStatus(data['status'])
        report.bounty_amount = data.get('bounty_amount', 0.0)
        report.verification_txid = data.get('verification_txid')
        report.verified_by = data.get('verified_by')
        if data.get('verified_at'):
            report.verified_at = datetime.fromisoformat(data['verified_at'])
        return report

