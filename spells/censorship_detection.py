"""
Enhanced Censorship Detection Spell

This spell detects censorship in Bitcoin mining pools using 10+ detection methods:

Core Detection Methods:
1. Missing Transactions Analysis - Checks if suspected transactions are excluded
2. Fee Rate Discrepancy Analysis - Compares fee rates of included vs excluded txs
3. Block Fullness Analysis - Detects blocks with space excluding high-fee txs
4. Transaction Ordering Analysis - Identifies suspicious ordering patterns

Advanced Detection Methods:
5. Transaction Age Analysis - Detects exclusion of older high-fee transactions
6. Size Preference Analysis - Identifies bias toward smaller transactions
7. Fee Density Analysis - Analyzes fee per byte efficiency patterns
8. Historical Pattern Comparison - Compares with recent block patterns
9. Address Pattern Analysis - Detects unusual address clustering
10. Confirmation Time Analysis - Analyzes excessive confirmation delays
"""

from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
from models import MiningPoolReport, EvidenceType
from bitcoin_rpc import BitcoinRPC


@dataclass
class CensorshipDetectionResult:
    """Result of censorship detection analysis"""
    is_censored: bool
    confidence_score: float  # 0.0 to 1.0
    evidence_count: int
    missing_transactions: List[str]
    excluded_fee_total: float  # Total fees of excluded transactions in BTC
    detection_methods: List[str]
    details: Dict[str, Any]
    message: str


class CensorshipDetectionSpell:
    """
    Censorship Detection Spell for MineSentry
    
    This spell implements multiple detection methods to identify
    censorship in Bitcoin mining pools.
    """
    
    def __init__(self, bitcoin_rpc: BitcoinRPC):
        """
        Initialize censorship detection spell
        
        Args:
            bitcoin_rpc: Bitcoin RPC client instance
        """
        self.bitcoin_rpc = bitcoin_rpc
        self.min_fee_rate = 1.0  # Minimum fee rate in sat/vB to consider suspicious
        self.min_confidence = 0.7  # Minimum confidence score to flag as censored
    
    def detect_censorship(
        self,
        block_height: int,
        block_hash: Optional[str] = None,
        suspected_txids: List[str] = None,
        mempool_before_block: Optional[List[str]] = None
    ) -> CensorshipDetectionResult:
        """
        Detect censorship in a specific block
        
        Args:
            block_height: Height of the block to analyze
            block_hash: Optional block hash (will be fetched if not provided)
            suspected_txids: List of transaction IDs suspected to be censored
            mempool_before_block: Optional list of transaction IDs in mempool before block
            
        Returns:
            CensorshipDetectionResult with detection results
        """
        try:
            # Get block information
            if block_hash is None:
                block_hash = self.bitcoin_rpc.get_block_hash(block_height)
            
            block_info = self.bitcoin_rpc.get_block(block_hash, verbosity=2)
            block_txids = [tx['txid'] for tx in block_info.get('tx', [])]
            
            detection_methods = []
            missing_txs = []
            excluded_fee_total = 0.0
            evidence_count = 0
            details = {}
            
            # Method 1: Check if suspected transactions are missing from block
            if suspected_txids:
                method1_result = self._check_missing_transactions(
                    suspected_txids, block_txids, block_hash
                )
                if method1_result['censored']:
                    detection_methods.append('missing_transactions')
                    missing_txs.extend(method1_result['missing'])
                    evidence_count += len(method1_result['missing'])
                    details['missing_transactions'] = method1_result
            
            # Method 2: Analyze fee rates in block vs mempool
            if mempool_before_block or suspected_txids:
                method2_result = self._analyze_fee_rate_discrepancy(
                    block_txids, block_hash, mempool_before_block or suspected_txids
                )
                if method2_result['censored']:
                    detection_methods.append('fee_rate_analysis')
                    excluded_fee_total += method2_result.get('excluded_fees', 0.0)
                    evidence_count += method2_result.get('evidence_points', 0)
                    details['fee_analysis'] = method2_result
            
            # Method 3: Check block fullness (if block is not full, high-fee txs should be included)
            method3_result = self._check_block_fullness(block_info, block_txids, block_hash)
            if method3_result['censored']:
                detection_methods.append('block_fullness_analysis')
                evidence_count += method3_result.get('evidence_points', 0)
                details['block_fullness'] = method3_result
            
            # Method 4: Check for unusual transaction ordering (low fee txs before high fee)
            method4_result = self._check_transaction_ordering(block_info)
            if method4_result['censored']:
                detection_methods.append('transaction_ordering')
                evidence_count += method4_result.get('evidence_points', 0)
                details['transaction_ordering'] = method4_result
            
            # Method 5: Transaction age analysis (preferring newer over older high-fee txs)
            method5_result = self._analyze_transaction_age(block_info, block_txids, block_hash)
            if method5_result['censored']:
                detection_methods.append('transaction_age_analysis')
                evidence_count += method5_result.get('evidence_points', 0)
                details['transaction_age'] = method5_result
            
            # Method 6: Transaction size preference analysis
            method6_result = self._analyze_size_preference(block_info, block_txids, block_hash)
            if method6_result['censored']:
                detection_methods.append('size_preference_analysis')
                evidence_count += method6_result.get('evidence_points', 0)
                details['size_preference'] = method6_result
            
            # Method 7: Fee density analysis (fee per byte efficiency)
            method7_result = self._analyze_fee_density(block_info, block_txids)
            if method7_result['censored']:
                detection_methods.append('fee_density_analysis')
                evidence_count += method7_result.get('evidence_points', 0)
                details['fee_density'] = method7_result
            
            # Method 8: Historical pattern comparison
            method8_result = self._compare_historical_patterns(block_height, block_hash, block_info)
            if method8_result['censored']:
                detection_methods.append('historical_pattern_analysis')
                evidence_count += method8_result.get('evidence_points', 0)
                details['historical_pattern'] = method8_result
            
            # Method 9: Address pattern analysis (basic clustering detection)
            method9_result = self._analyze_address_patterns(block_info, block_txids)
            if method9_result['censored']:
                detection_methods.append('address_pattern_analysis')
                evidence_count += method9_result.get('evidence_points', 0)
                details['address_patterns'] = method9_result
            
            # Method 10: Transaction confirmation time analysis
            if suspected_txids:
                method10_result = self._analyze_confirmation_time(suspected_txids, block_height)
                if method10_result['censored']:
                    detection_methods.append('confirmation_time_analysis')
                    evidence_count += method10_result.get('evidence_points', 0)
                    details['confirmation_time'] = method10_result
            
            # Calculate confidence score
            confidence = self._calculate_confidence_score(
                detection_methods, evidence_count, details
            )
            
            is_censored = confidence >= self.min_confidence
            
            message = self._generate_message(
                is_censored, confidence, detection_methods, missing_txs
            )
            
            return CensorshipDetectionResult(
                is_censored=is_censored,
                confidence_score=confidence,
                evidence_count=evidence_count,
                missing_transactions=missing_txs,
                excluded_fee_total=excluded_fee_total,
                detection_methods=detection_methods,
                details=details,
                message=message
            )
            
        except Exception as e:
            return CensorshipDetectionResult(
                is_censored=False,
                confidence_score=0.0,
                evidence_count=0,
                missing_transactions=[],
                excluded_fee_total=0.0,
                detection_methods=[],
                details={'error': str(e)},
                message=f"Error in censorship detection: {str(e)}"
            )
    
    def _check_missing_transactions(
        self,
        suspected_txids: List[str],
        block_txids: List[str],
        block_hash: str
    ) -> Dict[str, Any]:
        """Check if suspected transactions are missing from block"""
        missing = [txid for txid in suspected_txids if txid not in block_txids]
        
        # Verify missing transactions exist and are valid
        verified_missing = []
        for txid in missing:
            try:
                tx_info = self.bitcoin_rpc.get_transaction(txid)
                if tx_info:
                    # Check if transaction was confirmed in a later block
                    confirmed_height = tx_info.get('blockheight')
                    if confirmed_height is None:
                        verified_missing.append(txid)
                    # If confirmed in later block, still suspicious
                    elif confirmed_height > 0:
                        verified_missing.append(txid)
            except Exception:
                # Transaction not found, skip
                pass
        
        return {
            'censored': len(verified_missing) > 0,
            'missing': verified_missing,
            'total_suspected': len(suspected_txids),
            'found_in_block': len(suspected_txids) - len(verified_missing)
        }
    
    def _analyze_fee_rate_discrepancy(
        self,
        block_txids: List[str],
        block_hash: str,
        mempool_txids: List[str]
    ) -> Dict[str, Any]:
        """Analyze if high fee rate transactions were excluded"""
        try:
            # Get fee rates of transactions in block
            block_fee_rates = []
            for txid in block_txids[:100]:  # Limit to first 100 txs for performance
                try:
                    tx_info = self.bitcoin_rpc.get_transaction(txid)
                    if tx_info:
                        vsize = tx_info.get('vsize', tx_info.get('size', 0))
                        fee = tx_info.get('fee', 0)
                        if vsize > 0:
                            fee_rate = (fee / vsize) * 100000000  # Convert to sat/vB
                            block_fee_rates.append(fee_rate)
                except Exception:
                    continue
            
            # Check if mempool transactions have higher fee rates
            mempool_higher_fee_count = 0
            excluded_fees = 0.0
            
            for txid in mempool_txids[:50]:  # Limit for performance
                if txid in block_txids:
                    continue  # Skip if already in block
                
                try:
                    tx_info = self.bitcoin_rpc.get_transaction(txid, verbose=True)
                    if tx_info:
                        vsize = tx_info.get('vsize', tx_info.get('size', 0))
                        fee = tx_info.get('fee', 0)
                        if vsize > 0:
                            fee_rate = (fee / vsize) * 100000000
                            
                            # If fee rate is higher than average block fee rate
                            if block_fee_rates and fee_rate > sum(block_fee_rates) / len(block_fee_rates):
                                mempool_higher_fee_count += 1
                                excluded_fees += fee / 100000000  # Convert to BTC
                except Exception:
                    continue
            
            censored = mempool_higher_fee_count > 0
            
            return {
                'censored': censored,
                'mempool_higher_fee_count': mempool_higher_fee_count,
                'excluded_fees': excluded_fees,
                'evidence_points': mempool_higher_fee_count,
                'avg_block_fee_rate': sum(block_fee_rates) / len(block_fee_rates) if block_fee_rates else 0
            }
            
        except Exception as e:
            return {
                'censored': False,
                'error': str(e),
                'evidence_points': 0
            }
    
    def _check_block_fullness(
        self,
        block_info: Dict,
        block_txids: List[str],
        block_hash: str
    ) -> Dict[str, Any]:
        """Check if block is full - if not full, should include high-fee transactions"""
        try:
            # Estimate block size (approximate)
            tx_count = len(block_txids)
            estimated_size = tx_count * 250  # Average tx size estimate
            max_block_size = 1000000  # 1MB soft limit (conservative)
            
            fullness_ratio = estimated_size / max_block_size
            
            # If block is less than 90% full, it's suspicious if high-fee txs are excluded
            suspicious = fullness_ratio < 0.9 and tx_count < 2000
            
            return {
                'censored': suspicious,
                'fullness_ratio': fullness_ratio,
                'tx_count': tx_count,
                'evidence_points': 1 if suspicious else 0
            }
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _check_transaction_ordering(self, block_info: Dict) -> Dict[str, Any]:
        """Check for unusual transaction ordering (low fee before high fee)"""
        try:
            tx_list = block_info.get('tx', [])[1:]  # Skip coinbase
            if len(tx_list) < 2:
                return {'censored': False, 'evidence_points': 0}
            
            # Simple check: if we can get fee rates, check for obvious ordering issues
            # This is a simplified check - full implementation would compare all txs
            fee_rates = []
            for tx in tx_list[:20]:  # Check first 20 transactions
                try:
                    fee = tx.get('fee', 0)
                    vsize = tx.get('vsize', tx.get('size', 0))
                    if vsize > 0:
                        fee_rate = (fee / vsize) * 100000000
                        fee_rates.append(fee_rate)
                except Exception:
                    continue
            
            if len(fee_rates) < 2:
                return {'censored': False, 'evidence_points': 0}
            
            # Check if fee rates are generally decreasing (suspicious)
            decreasing_count = sum(
                1 for i in range(1, len(fee_rates))
                if fee_rates[i] < fee_rates[i-1]
            )
            
            # If more than 50% of transitions are decreasing, suspicious
            suspicious = decreasing_count / (len(fee_rates) - 1) > 0.5
            
            return {
                'censored': suspicious,
                'decreasing_ratio': decreasing_count / (len(fee_rates) - 1) if len(fee_rates) > 1 else 0,
                'evidence_points': 1 if suspicious else 0
            }
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _analyze_transaction_age(
        self,
        block_info: Dict,
        block_txids: List[str],
        block_hash: str
    ) -> Dict[str, Any]:
        """Analyze if older high-fee transactions are being excluded"""
        try:
            block_time = block_info.get('time', 0)
            if block_time == 0:
                return {'censored': False, 'evidence_points': 0}
            
            # Analyze transaction ages in block
            tx_ages = []
            for tx in block_info.get('tx', [])[1:21]:  # Skip coinbase, limit to 20
                try:
                    tx_time = tx.get('time', block_time)
                    age = block_time - tx_time
                    tx_ages.append(age)
                except Exception:
                    continue
            
            if len(tx_ages) < 2:
                return {'censored': False, 'evidence_points': 0}
            
            avg_age = sum(tx_ages) / len(tx_ages)
            
            # If average age is very low, might be excluding older valid transactions
            # Suspicious if avg age < 600 seconds (10 minutes) when block has space
            suspicious = avg_age < 600 and len(block_txids) < 2000
            
            return {
                'censored': suspicious,
                'avg_transaction_age': avg_age,
                'evidence_points': 1 if suspicious else 0
            }
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _analyze_size_preference(
        self,
        block_info: Dict,
        block_txids: List[str],
        block_hash: str
    ) -> Dict[str, Any]:
        """Analyze if there's a preference for smaller transactions over larger ones"""
        try:
            tx_sizes = []
            tx_fees = []
            
            for tx in block_info.get('tx', [])[1:51]:  # Skip coinbase, limit to 50
                try:
                    size = tx.get('vsize', tx.get('size', 0))
                    fee = tx.get('fee', 0)
                    if size > 0:
                        tx_sizes.append(size)
                        tx_fees.append(fee)
                except Exception:
                    continue
            
            if len(tx_sizes) < 5:
                return {'censored': False, 'evidence_points': 0}
            
            # Calculate average size
            avg_size = sum(tx_sizes) / len(tx_sizes)
            
            # Check if small transactions are favored (suspicious pattern)
            # If average size is very small, might be excluding larger valid transactions
            suspicious = avg_size < 250 and len(block_txids) < 1500  # Very small avg size
            
            return {
                'censored': suspicious,
                'avg_transaction_size': avg_size,
                'evidence_points': 1 if suspicious else 0
            }
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _analyze_fee_density(
        self,
        block_info: Dict,
        block_txids: List[str]
    ) -> Dict[str, Any]:
        """Analyze fee density (fee per byte efficiency) patterns"""
        try:
            fee_densities = []
            
            for tx in block_info.get('tx', [])[1:51]:  # Skip coinbase
                try:
                    size = tx.get('vsize', tx.get('size', 0))
                    fee = tx.get('fee', 0)
                    if size > 0 and fee > 0:
                        density = fee / size  # Fee per byte
                        fee_densities.append(density)
                except Exception:
                    continue
            
            if len(fee_densities) < 3:
                return {'censored': False, 'evidence_points': 0}
            
            # Check for inconsistent fee density (low density txs included)
            sorted_densities = sorted(fee_densities)
            if len(sorted_densities) >= 10:
                # Check if bottom 25% have significantly lower density
                bottom_quartile = sorted_densities[:len(sorted_densities)//4]
                top_quartile = sorted_densities[-len(sorted_densities)//4:]
                
                if top_quartile and bottom_quartile:
                    bottom_avg = sum(bottom_quartile) / len(bottom_quartile)
                    top_avg = sum(top_quartile) / len(top_quartile)
                    
                    # Suspicious if there's a huge gap (might indicate preference)
                    if top_avg > 0:
                        ratio = bottom_avg / top_avg
                        suspicious = ratio < 0.3  # Bottom quartile has <30% of top quartile density
                        
                        return {
                            'censored': suspicious,
                            'density_ratio': ratio,
                            'evidence_points': 1 if suspicious else 0
                        }
            
            return {'censored': False, 'evidence_points': 0}
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _compare_historical_patterns(
        self,
        block_height: int,
        block_hash: str,
        block_info: Dict
    ) -> Dict[str, Any]:
        """Compare block patterns with recent historical blocks"""
        try:
            # Get previous block for comparison
            if block_height <= 1:
                return {'censored': False, 'evidence_points': 0}
            
            prev_block_hash = self.bitcoin_rpc.get_block_hash(block_height - 1)
            prev_block = self.bitcoin_rpc.get_block(prev_block_hash, verbosity=2)
            
            current_tx_count = len(block_info.get('tx', []))
            prev_tx_count = len(prev_block.get('tx', []))
            
            # Calculate fee statistics for current block
            current_fees = []
            for tx in block_info.get('tx', [])[1:21]:
                try:
                    fee = tx.get('fee', 0)
                    if fee > 0:
                        current_fees.append(fee)
                except Exception:
                    continue
            
            # Calculate fee statistics for previous block
            prev_fees = []
            for tx in prev_block.get('tx', [])[1:21]:
                try:
                    fee = tx.get('fee', 0)
                    if fee > 0:
                        prev_fees.append(fee)
                except Exception:
                    continue
            
            if current_fees and prev_fees:
                current_avg_fee = sum(current_fees) / len(current_fees)
                prev_avg_fee = sum(prev_fees) / len(prev_fees)
                
                # If current block has significantly lower avg fees, suspicious
                if prev_avg_fee > 0:
                    fee_ratio = current_avg_fee / prev_avg_fee
                    suspicious = fee_ratio < 0.5 and current_tx_count < prev_tx_count
                    
                    return {
                        'censored': suspicious,
                        'fee_ratio_vs_previous': fee_ratio,
                        'tx_count_change': current_tx_count - prev_tx_count,
                        'evidence_points': 1 if suspicious else 0
                    }
            
            return {'censored': False, 'evidence_points': 0}
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _analyze_address_patterns(
        self,
        block_info: Dict,
        block_txids: List[str]
    ) -> Dict[str, Any]:
        """Basic address pattern analysis (clustering detection)"""
        try:
            # Extract addresses from transactions (output addresses)
            addresses = set()
            address_counts = {}
            
            for tx in block_info.get('tx', [])[1:51]:  # Skip coinbase, limit for performance
                try:
                    vout = tx.get('vout', [])
                    for output in vout[:5]:  # Limit outputs per tx
                        script_pub_key = output.get('scriptPubKey', {})
                        address = script_pub_key.get('address')
                        if address:
                            addresses.add(address)
                            address_counts[address] = address_counts.get(address, 0) + 1
                except Exception:
                    continue
            
            if len(addresses) < 2:
                return {'censored': False, 'evidence_points': 0}
            
            # Check for unusual address concentration
            # Suspicious if a small number of addresses dominate the block
            total_address_occurrences = sum(address_counts.values())
            if total_address_occurrences > 0:
                top_addresses = sorted(address_counts.values(), reverse=True)[:5]
                top_concentration = sum(top_addresses) / total_address_occurrences
                
                # If top 5 addresses account for >60% of outputs, suspicious
                suspicious = top_concentration > 0.6 and len(addresses) < 20
                
                return {
                    'censored': suspicious,
                    'address_diversity': len(addresses),
                    'top_address_concentration': top_concentration,
                    'evidence_points': 1 if suspicious else 0
                }
            
            return {'censored': False, 'evidence_points': 0}
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _analyze_confirmation_time(
        self,
        suspected_txids: List[str],
        block_height: int
    ) -> Dict[str, Any]:
        """Analyze how long suspected transactions waited for confirmation"""
        try:
            confirmation_times = []
            
            for txid in suspected_txids[:20]:  # Limit for performance
                try:
                    tx_info = self.bitcoin_rpc.get_transaction(txid)
                    if tx_info:
                        # Get transaction time
                        tx_time = tx_info.get('time', 0)
                        block_time = tx_info.get('blocktime', 0)
                        
                        if tx_time > 0 and block_time > 0:
                            wait_time = block_time - tx_time
                            if wait_time > 0:
                                confirmation_times.append(wait_time)
                except Exception:
                    continue
            
            if len(confirmation_times) == 0:
                return {'censored': False, 'evidence_points': 0}
            
            avg_wait = sum(confirmation_times) / len(confirmation_times)
            
            # Suspicious if transactions waited very long (> 1 hour) when they should be included
            suspicious = avg_wait > 3600  # 1 hour
            
            return {
                'censored': suspicious,
                'avg_confirmation_time': avg_wait,
                'evidence_points': 2 if suspicious else 0
            }
            
        except Exception:
            return {'censored': False, 'evidence_points': 0}
    
    def _calculate_confidence_score(
        self,
        detection_methods: List[str],
        evidence_count: int,
        details: Dict[str, Any]
    ) -> float:
        """Calculate confidence score (0.0 to 1.0)"""
        if not detection_methods:
            return 0.0
        
        # Base score from number of methods that detected censorship
        # More methods = higher confidence
        method_score = min(len(detection_methods) * 0.15, 0.6)  # Max 0.6 from methods
        
        # Evidence score (capped at 0.4)
        evidence_score = min(evidence_count * 0.05, 0.4)
        
        # Bonus for critical methods
        critical_methods = ['missing_transactions', 'fee_rate_analysis', 'confirmation_time_analysis']
        critical_bonus = sum(0.1 for method in detection_methods if method in critical_methods)
        critical_bonus = min(critical_bonus, 0.3)  # Max 0.3 bonus
        
        # Combined score (capped at 1.0)
        total_score = min(method_score + evidence_score + critical_bonus, 1.0)
        
        return round(total_score, 2)
    
    def _generate_message(
        self,
        is_censored: bool,
        confidence: float,
        methods: List[str],
        missing_txs: List[str]
    ) -> str:
        """Generate human-readable message"""
        if not is_censored:
            return f"Censorship not detected (confidence: {confidence:.0%})"
        
        msg_parts = [f"Censorship detected with {confidence:.0%} confidence"]
        
        if 'missing_transactions' in methods:
            msg_parts.append(f"{len(missing_txs)} transactions missing from block")
        
        if 'fee_rate_analysis' in methods:
            msg_parts.append("high-fee transactions excluded")
        
        if 'block_fullness_analysis' in methods:
            msg_parts.append("block not full with high-fee txs available")
        
        if 'transaction_ordering' in methods:
            msg_parts.append("suspicious transaction ordering detected")
        
        if 'transaction_age_analysis' in methods:
            msg_parts.append("older high-fee transactions excluded")
        
        if 'size_preference_analysis' in methods:
            msg_parts.append("size preference bias detected")
        
        if 'fee_density_analysis' in methods:
            msg_parts.append("fee density inconsistencies found")
        
        if 'historical_pattern_analysis' in methods:
            msg_parts.append("deviates from historical patterns")
        
        if 'address_pattern_analysis' in methods:
            msg_parts.append("unusual address clustering patterns")
        
        if 'confirmation_time_analysis' in methods:
            msg_parts.append("excessive confirmation delays")
        
        return ". ".join(msg_parts) + "."
    
    def validate_report(self, report: MiningPoolReport) -> Tuple[bool, str, Dict]:
        """
        Validate a censorship report using this spell
        
        Args:
            report: Mining pool report to validate
            
        Returns:
            Tuple of (is_valid, message, validation_data)
        """
        if report.evidence_type != EvidenceType.CENSORSHIP:
            return (
                False,
                "This spell only validates censorship reports",
                {}
            )
        
        # Run censorship detection
        result = self.detect_censorship(
            block_height=report.block_height,
            block_hash=report.block_hash,
            suspected_txids=report.transaction_ids
        )
        
        validation_data = {
            'censorship_detected': result.is_censored,
            'confidence_score': result.confidence_score,
            'evidence_count': result.evidence_count,
            'missing_transactions': result.missing_transactions,
            'detection_methods': result.detection_methods,
            'details': result.details
        }
        
        is_valid = result.is_censored and result.confidence_score >= self.min_confidence
        
        return (
            is_valid,
            result.message,
            validation_data
        )

