"""
Integration Bridge - Connects all MineSentry components

This module provides a unified interface for:
- Report submission and validation
- Censorship detection via spells
- Bounty contract integration
- Payment processing
"""

from typing import Dict, List, Optional, Tuple, Any
from models import MiningPoolReport, EvidenceType, ReportStatus
from bitcoin_rpc import BitcoinRPC
from validation import ReportValidator, CharmsValidator
from spells.censorship_detection import CensorshipDetectionSpell
from spells.bounty_contract import BountyContract, PaymentStatus
from database import Database
from reward_system import RewardCalculator
import os


class MineSentryIntegration:
    """
    Integration Bridge for MineSentry
    
    Provides a unified interface to all MineSentry components
    """
    
    def __init__(
        self,
        bitcoin_rpc: BitcoinRPC = None,
        database: Database = None,
        bounty_contract: BountyContract = None
    ):
        """
        Initialize integration bridge
        
        Args:
            bitcoin_rpc: Bitcoin RPC client (created if None)
            database: Database instance (created if None)
            bounty_contract: Bounty contract instance (created if None)
        """
        # Initialize Bitcoin RPC
        if bitcoin_rpc is None:
            bitcoin_rpc = BitcoinRPC()
        self.bitcoin_rpc = bitcoin_rpc
        
        # Initialize database
        if database is None:
            database = Database()
        self.database = database
        
        # Initialize validators
        self.validator = ReportValidator(bitcoin_rpc)
        self.charms_validator = CharmsValidator(bitcoin_rpc)
        
        # Initialize spells
        self.censorship_spell = CensorshipDetectionSpell(bitcoin_rpc)
        
        # Initialize bounty contract (optional)
        self.bounty_contract = bounty_contract
        if bounty_contract is None:
            # Initialize with default config if available
            authorized_signers = os.getenv('BOUNTY_CONTRACT_SIGNERS', '').split(',')
            authorized_signers = [s.strip() for s in authorized_signers if s.strip()]
            if authorized_signers:
                self.bounty_contract = BountyContract(
                    bitcoin_rpc=bitcoin_rpc,
                    contract_id="minesentry_bounty_v1",
                    min_signatures=int(os.getenv('BOUNTY_MIN_SIGNATURES', '2')),
                    authorized_signers=authorized_signers
                )
        
        # Initialize reward calculator
        self.reward_calculator = RewardCalculator()
    
    def submit_report(
        self,
        reporter_address: str,
        pool_address: str,
        block_height: int,
        evidence_type: EvidenceType,
        transaction_ids: List[str] = None,
        block_hash: Optional[str] = None,
        pool_name: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit a new mining pool report
        
        Args:
            reporter_address: Bitcoin address for rewards
            pool_address: Suspected mining pool address
            block_height: Block height where issue occurred
            evidence_type: Type of evidence
            transaction_ids: List of transaction IDs as evidence
            block_hash: Optional block hash
            pool_name: Optional pool name
            description: Optional description
            
        Returns:
            Dictionary with report data and submission result
        """
        # Create report
        report = MiningPoolReport()
        report.reporter_address = reporter_address
        report.pool_address = pool_address
        report.block_height = block_height
        report.evidence_type = evidence_type
        report.transaction_ids = transaction_ids or []
        report.block_hash = block_hash
        report.pool_name = pool_name
        report.description = description
        
        # Calculate initial bounty
        report.bounty_amount = self.reward_calculator.calculate_reward(report)
        
        # Save to database
        session = self.database.get_session()
        try:
            from database import MiningPoolReportDB
            db_report = MiningPoolReportDB.from_model(report)
            session.add(db_report)
            session.commit()
            session.refresh(db_report)
            
            report = db_report.to_model()
            
            return {
                'success': True,
                'report_id': str(report.report_id),
                'status': report.status.value,
                'bounty_amount': report.bounty_amount,
                'message': 'Report submitted successfully'
            }
        except Exception as e:
            session.rollback()
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to submit report'
            }
        finally:
            session.close()
    
    def validate_report(
        self,
        report_id: str,
        use_spells: bool = True
    ) -> Dict[str, Any]:
        """
        Validate a report using validation system and spells
        
        Args:
            report_id: Report ID to validate
            use_spells: Whether to use Charms spells for validation
            
        Returns:
            Dictionary with validation results
        """
        # Get report from database
        session = self.database.get_session()
        try:
            from database import MiningPoolReportDB
            db_report = session.query(MiningPoolReportDB).filter_by(
                report_id=report_id
            ).first()
            
            if not db_report:
                return {
                    'success': False,
                    'error': 'Report not found'
                }
            
            report = db_report.to_model()
            
            # Validate report
            is_valid, message, validation_data = self.validator.validate_report(
                report,
                use_spells=use_spells
            )
            
            # Update report status
            if is_valid:
                db_report.status = ReportStatus.UNDER_REVIEW
            else:
                db_report.status = ReportStatus.REJECTED
            
            session.commit()
            
            return {
                'success': True,
                'valid': is_valid,
                'message': message,
                'validation_data': validation_data,
                'status': db_report.status.value
            }
            
        except Exception as e:
            session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()
    
    def verify_report(
        self,
        report_id: str,
        verified_by: str
    ) -> Dict[str, Any]:
        """
        Manually verify a report (move to VERIFIED status)
        
        Args:
            report_id: Report ID to verify
            verified_by: Who verified the report
            
        Returns:
            Dictionary with verification result
        """
        session = self.database.get_session()
        try:
            from database import MiningPoolReportDB
            db_report = session.query(MiningPoolReportDB).filter_by(
                report_id=report_id
            ).first()
            
            if not db_report:
                return {'success': False, 'error': 'Report not found'}
            
            db_report.status = ReportStatus.VERIFIED
            db_report.verified_by = verified_by
            from datetime import datetime
            db_report.verified_at = datetime.utcnow()
            
            session.commit()
            
            return {
                'success': True,
                'report_id': report_id,
                'status': ReportStatus.VERIFIED.value,
                'message': 'Report verified successfully'
            }
            
        except Exception as e:
            session.rollback()
            return {'success': False, 'error': str(e)}
        finally:
            session.close()
    
    def create_bounty_payment(
        self,
        report_id: str,
        recipient_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a bounty payment request for a verified report
        
        Args:
            report_id: Verified report ID
            recipient_address: Optional recipient address (uses reporter address if None)
            
        Returns:
            Dictionary with payment creation result
        """
        if not self.bounty_contract:
            return {
                'success': False,
                'error': 'Bounty contract not initialized'
            }
        
        # Get report from database
        session = self.database.get_session()
        try:
            from database import MiningPoolReportDB
            db_report = session.query(MiningPoolReportDB).filter_by(
                report_id=report_id
            ).first()
            
            if not db_report:
                return {'success': False, 'error': 'Report not found'}
            
            report = db_report.to_model()
            
            if report.status != ReportStatus.VERIFIED:
                return {
                    'success': False,
                    'error': f'Report must be verified (current status: {report.status.value})'
                }
            
            # Use reporter address if recipient not provided
            recipient = recipient_address or report.reporter_address
            
            # Create payment request
            payment = self.bounty_contract.create_payment_request(
                report=report,
                recipient_address=recipient
            )
            
            return {
                'success': True,
                'payment_id': payment.payment_id,
                'report_id': report_id,
                'amount_sats': payment.amount_sats,
                'amount_btc': payment.amount_sats / 100000000,
                'recipient_address': recipient,
                'status': payment.status.value,
                'message': 'Payment request created successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()
    
    def approve_bounty_payment(
        self,
        payment_id: str,
        signer_address: str
    ) -> Dict[str, Any]:
        """
        Approve a bounty payment (multi-signature)
        
        Args:
            payment_id: Payment ID to approve
            signer_address: Address of the approving signer
            
        Returns:
            Dictionary with approval result
        """
        if not self.bounty_contract:
            return {
                'success': False,
                'error': 'Bounty contract not initialized'
            }
        
        try:
            success, message = self.bounty_contract.approve_payment(
                payment_id,
                signer_address
            )
            
            return {
                'success': success,
                'message': message,
                'payment_id': payment_id
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def execute_bounty_payment(
        self,
        payment_id: str
    ) -> Dict[str, Any]:
        """
        Execute an approved bounty payment
        
        Args:
            payment_id: Payment ID to execute
            
        Returns:
            Dictionary with execution result
        """
        if not self.bounty_contract:
            return {
                'success': False,
                'error': 'Bounty contract not initialized'
            }
        
        try:
            success, message, txid = self.bounty_contract.execute_payment(payment_id)
            
            return {
                'success': success,
                'message': message,
                'txid': txid,
                'payment_id': payment_id
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_system_status(self) -> Dict[str, Any]:
        """
        Get overall system status
        
        Returns:
            Dictionary with system status information
        """
        session = self.database.get_session()
        try:
            from database import MiningPoolReportDB
            from sqlalchemy import func
            
            total_reports = session.query(func.count(MiningPoolReportDB.report_id)).scalar()
            verified_reports = session.query(func.count(MiningPoolReportDB.report_id)).filter_by(
                status=ReportStatus.VERIFIED
            ).scalar()
            
            # Get bounty contract status
            contract_status = None
            if self.bounty_contract:
                contract_status = self.bounty_contract.get_contract_state()
            
            # Get detailed Bitcoin node information
            rpc_url = None
            if self.bitcoin_rpc:
                rpc_url = getattr(self.bitcoin_rpc.config, 'rpc_url', 'http://127.0.0.1:8332')
            
            bitcoin_info = {
                'connected': False,
                'block_height': None,
                'network': None,
                'chain': None,
                'verification_progress': None,
                'difficulty': None,
                'blocks': None,
                'connections': None,
                'rpc_url': rpc_url,
            }
            
            if self.bitcoin_rpc:
                try:
                    blockchain_info = self.bitcoin_rpc.get_blockchain_info()
                    bitcoin_info = {
                        'connected': True,
                        'block_height': blockchain_info.get('blocks'),
                        'blocks': blockchain_info.get('blocks'),
                        'network': blockchain_info.get('chain'),  # main, test, regtest
                        'chain': blockchain_info.get('chain'),
                        'verification_progress': blockchain_info.get('verificationprogress', 0),
                        'difficulty': blockchain_info.get('difficulty'),
                        'connections': blockchain_info.get('connections', 0),
                        'rpc_url': rpc_url,
                        'best_block_hash': blockchain_info.get('bestblockhash'),
                        'chain_work': blockchain_info.get('chainwork'),
                        'size_on_disk': blockchain_info.get('size_on_disk', 0),
                        'pruned': blockchain_info.get('pruned', False),
                        'initial_block_download': blockchain_info.get('initialblockdownload', False),
                    }
                except Exception as e:
                    # If RPC fails, mark as disconnected but keep rpc_url
                    bitcoin_info['connected'] = False
                    bitcoin_info['error'] = str(e)
                    bitcoin_info['rpc_url'] = rpc_url
            
            return {
                'system': 'MineSentry',
                'bitcoin_rpc': bitcoin_info,
                'database': {
                    'connected': True,
                    'total_reports': total_reports,
                    'verified_reports': verified_reports
                },
                'spells': {
                    'censorship_detection': True,
                    'bounty_contract': self.bounty_contract is not None
                },
                'bounty_contract': contract_status
            }
            
        finally:
            session.close()
    
    def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a report by ID
        
        Args:
            report_id: Report ID
            
        Returns:
            Dictionary with report data or None
        """
        session = self.database.get_session()
        try:
            from database import MiningPoolReportDB
            db_report = session.query(MiningPoolReportDB).filter_by(
                report_id=report_id
            ).first()
            
            if not db_report:
                return None
            
            report = db_report.to_model()
            return report.to_dict()
            
        finally:
            session.close()


# Global integration instance
_integration_instance = None


def get_integration() -> MineSentryIntegration:
    """
    Get or create global integration instance
    
    Returns:
        MineSentryIntegration instance
    """
    global _integration_instance
    if _integration_instance is None:
        _integration_instance = MineSentryIntegration()
    return _integration_instance


def reset_integration():
    """
    Reset the global integration instance (useful for reloading config)
    
    This forces a new integration instance to be created on next get_integration() call
    """
    global _integration_instance
    _integration_instance = None


def initialize_bounty_contract(
    authorized_signers: List[str],
    min_signatures: int = 2
) -> Dict[str, Any]:
    """
    Initialize bounty contract with provided signers
    
    Args:
        authorized_signers: List of authorized signer Bitcoin addresses
        min_signatures: Minimum signatures required (default: 2)
        
    Returns:
        Dictionary with initialization result
    """
    global _integration_instance
    
    try:
        # Validate inputs
        if not authorized_signers or len(authorized_signers) < 2:
            return {
                'success': False,
                'error': 'At least 2 authorized signers are required'
            }
        
        if min_signatures < 1 or min_signatures > len(authorized_signers):
            return {
                'success': False,
                'error': f'Minimum signatures must be between 1 and {len(authorized_signers)}'
            }
        
        # Get or create integration instance
        integration = get_integration()
        
        # Check if contract already exists
        if integration.bounty_contract:
            return {
                'success': False,
                'error': 'Bounty contract is already initialized'
            }
        
        # Create new bounty contract
        from spells.bounty_contract import BountyContract
        
        contract = BountyContract(
            bitcoin_rpc=integration.bitcoin_rpc,
            contract_id="minesentry_bounty_v1",
            min_signatures=min_signatures,
            authorized_signers=authorized_signers
        )
        
        # Set contract in integration
        integration.bounty_contract = contract
        
        # Get contract state
        state = contract.get_contract_state()
        
        return {
            'success': True,
            'message': 'Bounty contract initialized successfully',
            'contract': {
                'contract_id': state['contract_id'],
                'state': state['state'],
                'min_signatures': min_signatures,
                'authorized_signers_count': len(authorized_signers),
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to initialize bounty contract: {str(e)}'
        }

