"""
Bitcoin RPC integration for blockchain data access
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not installed, skip loading .env file
    pass


@dataclass
class BitcoinRPCConfig:
    """Configuration for Bitcoin RPC connection"""
    rpc_url: str = "http://127.0.0.1:8332"
    rpc_user: str = ""
    rpc_password: str = ""
    rpc_timeout: int = 30


class BitcoinRPC:
    """Bitcoin RPC client for interacting with Bitcoin node"""
    
    def __init__(self, config: BitcoinRPCConfig = None):
        """
        Initialize Bitcoin RPC client
        
        Args:
            config: RPC configuration (defaults to environment variables)
        """
        if config is None:
            config = BitcoinRPCConfig(
                rpc_url=os.getenv('BITCOIN_RPC_URL', 'http://127.0.0.1:8332'),
                rpc_user=os.getenv('BITCOIN_RPC_USER', ''),
                rpc_password=os.getenv('BITCOIN_RPC_PASSWORD', ''),
            )
        
        self.config = config
        self.session = requests.Session()
        self.session.auth = (config.rpc_user, config.rpc_password)
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def _call(self, method: str, params: List[Any] = None) -> Dict[str, Any]:
        """
        Make RPC call to Bitcoin node
        
        Args:
            method: RPC method name
            params: Method parameters
            
        Returns:
            RPC response result
        """
        if params is None:
            params = []
        
        payload = {
            'method': method,
            'params': params,
            'jsonrpc': '2.0',
            'id': 1
        }
        
        try:
            response = self.session.post(
                self.config.rpc_url,
                json=payload,
                timeout=self.config.rpc_timeout
            )
            response.raise_for_status()
            result = response.json()
            
            if 'error' in result and result['error'] is not None:
                raise Exception(f"RPC Error: {result['error']}")
            
            return result.get('result')
        except requests.exceptions.RequestException as e:
            raise Exception(f"RPC connection error: {str(e)}")
    
    def get_blockchain_info(self) -> Dict[str, Any]:
        """Get blockchain information"""
        return self._call('getblockchaininfo')
    
    def get_block(self, block_hash: str, verbosity: int = 2) -> Dict[str, Any]:
        """
        Get block information
        
        Args:
            block_hash: Block hash
            verbosity: 0=raw hex, 1=json with txids, 2=json with full tx data
        """
        return self._call('getblock', [block_hash, verbosity])
    
    def get_block_by_height(self, height: int, verbosity: int = 2) -> Dict[str, Any]:
        """
        Get block by height
        
        Args:
            height: Block height
            verbosity: 0=raw hex, 1=json with txids, 2=json with full tx data
        """
        block_hash = self.get_block_hash(height)
        return self.get_block(block_hash, verbosity)
    
    def get_block_hash(self, height: int) -> str:
        """Get block hash by height"""
        return self._call('getblockhash', [height])
    
    def get_block_header(self, block_hash: str, verbose: bool = True) -> Dict[str, Any]:
        """Get block header"""
        return self._call('getblockheader', [block_hash, verbose])
    
    def get_transaction(self, txid: str, verbose: bool = True, block_hash: str = None) -> Dict[str, Any]:
        """
        Get transaction information
        
        Args:
            txid: Transaction ID
            verbose: Include decoded transaction
            block_hash: Optional block hash for confirmation
        """
        params = [txid, verbose]
        if block_hash:
            params.append(block_hash)
        return self._call('getrawtransaction', params)
    
    def get_raw_mempool(self, verbose: bool = False) -> List[str] | Dict[str, Any]:
        """Get mempool transaction IDs"""
        return self._call('getrawmempool', [verbose])
    
    def get_best_block_hash(self) -> str:
        """Get best block hash"""
        return self._call('getbestblockhash')
    
    def get_block_count(self) -> int:
        """Get current block count"""
        return self._call('getblockcount')
    
    def validate_address(self, address: str) -> Dict[str, Any]:
        """Validate Bitcoin address"""
        return self._call('validateaddress', [address])
    
    def estimate_fee(self, blocks: int = 6) -> float:
        """Estimate transaction fee (BTC per KB)"""
        return self._call('estimatesmartfee', [blocks])
    
    def send_to_address(self, address: str, amount: float, comment: str = "") -> str:
        """
        Send Bitcoin to address (for reward payments)
        
        Args:
            address: Recipient address
            amount: Amount in BTC
            comment: Optional comment
            
        Returns:
            Transaction ID
        """
        return self._call('sendtoaddress', [address, amount, comment])
    
    def verify_transaction_in_block(self, txid: str, block_hash: str) -> bool:
        """
        Verify if transaction is in a specific block
        
        Args:
            txid: Transaction ID
            block_hash: Block hash
            
        Returns:
            True if transaction is in block
        """
        try:
            block = self.get_block(block_hash, verbosity=2)
            txids = [tx['txid'] for tx in block.get('tx', [])]
            return txid in txids
        except Exception:
            return False
    
    def get_pool_info_from_coinbase(self, block_hash: str) -> Optional[Dict[str, Any]]:
        """
        Extract mining pool information from coinbase transaction
        
        Args:
            block_hash: Block hash
            
        Returns:
            Dictionary with pool information if found
        """
        try:
            block = self.get_block(block_hash, verbosity=2)
            if not block.get('tx'):
                return None
            
            coinbase_tx = block['tx'][0]  # First transaction is coinbase
            coinbase_hex = coinbase_tx.get('hex')
            if coinbase_hex:
                # Parse coinbase data (this is simplified - real parsing needs more work)
                # Coinbase scriptSig contains extra data that pools often use to identify themselves
                return {
                    'txid': coinbase_tx['txid'],
                    'coinbase_hex': coinbase_hex,
                }
        except Exception as e:
            print(f"Error extracting pool info: {e}")
            return None
        
        return None

