#!/usr/bin/env python3
"""
Get real testnet blockchain data for submitting reports

This script fetches recent block data from Bitcoin testnet to use
when submitting test reports.
"""

import sys
from bitcoin_rpc import BitcoinRPC
from dotenv import load_dotenv
load_dotenv()

def get_testnet_data():
    """Get recent block data from testnet"""
    try:
        rpc = BitcoinRPC()
        
        # Get current blockchain info
        info = rpc.get_blockchain_info()
        current_height = info.get('blocks', 0)
        
        if current_height == 0:
            print("⚠️  Blockchain not synced yet or Bitcoin Core not connected")
            print("")
            print("Please visit: https://mempool.space/testnet")
            print("  1. Find a recent block")
            print("  2. Click on it to see block details")
            print("  3. Note the block height and transaction IDs")
            return None
        
        # Get a recent block (100 blocks ago, or latest if less than 100)
        test_height = max(current_height - 100, 1)
        
        print(f"Current testnet block height: {current_height:,}")
        print(f"Fetching block at height: {test_height:,}")
        print("")
        
        block_hash = rpc.get_block_hash(test_height)
        block = rpc.get_block(block_hash, verbosity=2)
        
        print(f"✅ Block found!")
        print(f"   Block Height: {block.get('height', test_height):,}")
        print(f"   Block Hash: {block_hash}")
        print(f"   Number of transactions: {len(block.get('tx', []))}")
        print("")
        
        # Get some transaction IDs (skip coinbase)
        txids = [tx['txid'] for tx in block.get('tx', [])[1:6]]  # Get 5 non-coinbase txs
        
        print("📝 Transaction IDs from this block:")
        for i, txid in enumerate(txids, 1):
            print(f"   {i}. {txid}")
        
        print("")
        print("=" * 60)
        print("✅ Use this data to submit your report:")
        print("=" * 60)
        print(f"Block Height: {test_height}")
        print(f"Block Hash: {block_hash}")
        print(f"Transaction IDs (use one or more):")
        for txid in txids:
            print(f"  - {txid}")
        print("")
        print("Pool Address: (use any testnet address)")
        print("  Example: tb1qtest1234567890abcdefghijklmnopqrstuvwx")
        print("")
        print("Reporter Address: (your testnet address)")
        print("  Example: tb1qtest1234567890abcdefghijklmnopqrstuvwx")
        
        return {
            'block_height': test_height,
            'block_hash': block_hash,
            'transaction_ids': txids
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("")
        print("Make sure:")
        print("  1. Bitcoin Core is running: ./start_bitcoind_testnet.sh")
        print("  2. RPC is configured in .env file")
        print("  3. Bitcoin Core is synced (may take time)")
        return None

if __name__ == "__main__":
    get_testnet_data()

