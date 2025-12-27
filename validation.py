"""
Charms-based validation logic for mining pool reports
"""

from typing import Dict, List, Optional, Tuple
from models import MiningPoolReport, EvidenceType, ReportStatus
from bitcoin_rpc import BitcoinRPC


class ReportValidator:
    """Validates mining pool reports using blockchain data and Charms logic"""
    
    def __init__(self, bitcoin_rpc: BitcoinRPC):
        """
        Initialize validator
        
        Args:
            bitcoin_rpc: Bitcoin RPC client instance
        """
        self.bitcoin_rpc = bitcoin_rpc
    
    def validate_report(self, report: MiningPoolReport, use_spells: bool = True) -> Tuple[bool, str, Optional[Dict]]:
        """
        Validate a mining pool report
        
        Args:
            report: Mining pool report to validate
            use_spells: Whether to use Charms spells for validation (default: True)
            
        Returns:
            Tuple of (is_valid, message, validation_data)
        """
        try:
            # Basic validation
            validation_result = self._basic_validation(report)
            if not validation_result[0]:
                return validation_result
            
            # Evidence-specific validation
            validation_result = self._evidence_validation(report)
            if not validation_result[0]:
                return validation_result
            
            # Blockchain verification
            validation_result = self._blockchain_verification(report)
            if not validation_result[0]:
                return validation_result
            
            # Charms spell-based validation (if enabled and spell available)
            if use_spells:
                try:
                    charms_validator = CharmsValidator(self.bitcoin_rpc)
                    spell_result = charms_validator.validate_with_spell(report)
                    if spell_result[0] is not None:
                        # Spell validation result (True/False) takes precedence
                        # Merge validation data
                        validation_data = validation_result[2] or {}
                        if spell_result[2]:
                            validation_data['spell_validation'] = spell_result[2]
                        return (spell_result[0], spell_result[1], validation_data)
                except Exception as e:
                    # If spell validation fails, continue with standard validation
                    pass
            
            # All validations passed
            return (True, "Report validated successfully", validation_result[2])
            
        except Exception as e:
            return (False, f"Validation error: {str(e)}", None)
    
    def _basic_validation(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Perform basic validation checks"""
        
        # Check required fields
        if not report.reporter_address:
            return (False, "Reporter address is required", None)
        
        if not report.pool_address:
            return (False, "Pool address is required", None)
        
        if report.block_height <= 0:
            return (False, "Valid block height is required", None)
        
        # Validate Bitcoin addresses
        try:
            reporter_valid = self.bitcoin_rpc.validate_address(report.reporter_address)
            if not reporter_valid.get('isvalid', False):
                return (False, "Invalid reporter address", None)
        except Exception:
            # If RPC validation fails, do basic format check
            if len(report.reporter_address) < 26 or len(report.reporter_address) > 62:
                return (False, "Reporter address format appears invalid", None)
        
        # Check if block height is reasonable (not too far in future)
        try:
            current_height = self.bitcoin_rpc.get_block_count()
            if report.block_height > current_height:
                return (False, f"Block height {report.block_height} exceeds current height {current_height}", None)
        except Exception:
            pass  # If we can't check, proceed anyway
        
        return (True, "Basic validation passed", {})
    
    def _evidence_validation(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Validate evidence based on evidence type"""
        
        if report.evidence_type == EvidenceType.CENSORSHIP:
            return self._validate_censorship(report)
        elif report.evidence_type == EvidenceType.DOUBLE_SPEND_ATTEMPT:
            return self._validate_double_spend(report)
        elif report.evidence_type == EvidenceType.SELFISH_MINING:
            return self._validate_selfish_mining(report)
        elif report.evidence_type == EvidenceType.TRANSACTION_CENSORSHIP:
            return self._validate_transaction_censorship(report)
        else:
            # For other types, require at least transaction IDs
            if not report.transaction_ids:
                return (False, f"Transaction IDs required for evidence type {report.evidence_type.value}", None)
            return (True, "Evidence validation passed", {})
    
    def _validate_censorship(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Validate censorship evidence"""
        if not report.transaction_ids:
            return (False, "Transaction IDs required for censorship evidence", None)
        
        if not report.block_hash:
            return (False, "Block hash required for censorship evidence", None)
        
        return (True, "Censorship evidence validated", {})
    
    def _validate_double_spend(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Validate double spend attempt evidence"""
        if len(report.transaction_ids) < 2:
            return (False, "At least 2 transaction IDs required for double spend evidence", None)
        
        return (True, "Double spend evidence validated", {})
    
    def _validate_selfish_mining(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Validate selfish mining evidence"""
        if not report.block_hash:
            return (False, "Block hash required for selfish mining evidence", None)
        
        return (True, "Selfish mining evidence validated", {})
    
    def _validate_transaction_censorship(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Validate transaction censorship evidence"""
        if not report.transaction_ids:
            return (False, "Transaction IDs required for transaction censorship evidence", None)
        
        return (True, "Transaction censorship evidence validated", {})
    
    def _blockchain_verification(self, report: MiningPoolReport) -> Tuple[bool, str, Optional[Dict]]:
        """Verify report against blockchain data"""
        verification_data = {}
        
        try:
            # Verify block exists
            if report.block_hash:
                try:
                    block_info = self.bitcoin_rpc.get_block_header(report.block_hash)
                    if block_info.get('height') != report.block_height:
                        return (False, f"Block height mismatch: header says {block_info.get('height')}, report says {report.block_height}", None)
                    verification_data['block_verified'] = True
                except Exception as e:
                    return (False, f"Block not found or inaccessible: {str(e)}", None)
            else:
                # Try to get block hash from height
                try:
                    block_hash = self.bitcoin_rpc.get_block_hash(report.block_height)
                    report.block_hash = block_hash
                    verification_data['block_verified'] = True
                except Exception as e:
                    return (False, f"Could not retrieve block at height {report.block_height}: {str(e)}", None)
            
            # Verify transactions exist
            if report.transaction_ids:
                verified_txs = []
                for txid in report.transaction_ids:
                    try:
                        tx_info = self.bitcoin_rpc.get_transaction(txid)
                        if tx_info:
                            verified_txs.append(txid)
                            # Check if transaction is in the reported block
                            if report.block_hash:
                                in_block = self.bitcoin_rpc.verify_transaction_in_block(txid, report.block_hash)
                                verification_data[f'tx_{txid}_in_block'] = in_block
                    except Exception:
                        verification_data[f'tx_{txid}_verified'] = False
                
                verification_data['verified_transactions'] = verified_txs
                if len(verified_txs) == 0:
                    return (False, "None of the provided transaction IDs could be verified", None)
            
            # Extract pool information from coinbase if possible
            if report.block_hash:
                pool_info = self.bitcoin_rpc.get_pool_info_from_coinbase(report.block_hash)
                if pool_info:
                    verification_data['coinbase_info'] = pool_info
            
            return (True, "Blockchain verification passed", verification_data)
            
        except Exception as e:
            return (False, f"Blockchain verification error: {str(e)}", verification_data)


# Charms spell-based validation
class CharmsValidator:
    """
    Charms-based validator for advanced validation logic
    This class interfaces with Charms spells for complex validation rules
    """
    
    def __init__(self, bitcoin_rpc: BitcoinRPC, charms_config: Dict = None):
        """
        Initialize Charms validator
        
        Args:
            bitcoin_rpc: Bitcoin RPC client instance
            charms_config: Configuration for Charms integration
        """
        self.bitcoin_rpc = bitcoin_rpc
        self.charms_config = charms_config or {}
        self.spells = {}
        self._initialize_spells()
    
    def _initialize_spells(self):
        """Initialize available spells"""
        try:
            from spells.censorship_detection import CensorshipDetectionSpell
            self.spells['censorship_detection'] = CensorshipDetectionSpell(self.bitcoin_rpc)
        except ImportError:
            # Spells not available
            pass
    
    def validate_with_spell(self, report: MiningPoolReport, spell_name: str = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        Validate report using a Charms spell
        
        Args:
            report: Mining pool report
            spell_name: Name of the Charms spell to use (auto-selected if None)
            
        Returns:
            Tuple of (is_valid, message, validation_data)
        """
        # Auto-select spell based on evidence type
        if spell_name is None:
            if report.evidence_type == EvidenceType.CENSORSHIP:
                spell_name = 'censorship_detection'
            else:
                return (True, "No spell available for this evidence type", {})
        
        # Get the appropriate spell
        spell = self.spells.get(spell_name)
        if spell is None:
            return (False, f"Spell '{spell_name}' not found", {})
        
        # Run spell validation
        try:
            if hasattr(spell, 'validate_report'):
                is_valid, message, validation_data = spell.validate_report(report)
                return (is_valid, message, validation_data)
            else:
                return (False, f"Spell '{spell_name}' does not support report validation", {})
        except Exception as e:
            return (False, f"Error executing spell '{spell_name}': {str(e)}", {})

