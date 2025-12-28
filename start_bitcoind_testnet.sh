#!/bin/bash
# Script to start Bitcoin Core in testnet mode with proper RPC configuration

# Load .env file to get RPC credentials
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ -f .env ]; then
    export $(grep -v '^#' .env | grep BITCOIN_RPC | xargs)
fi

# Default values if not in .env
RPC_USER=${BITCOIN_RPC_USER:-minesentry}
RPC_PASSWORD=${BITCOIN_RPC_PASSWORD:-changeme}
RPC_PORT=18332  # Testnet RPC port

echo "Starting Bitcoin Core in testnet mode..."
echo "RPC User: $RPC_USER"
echo "RPC Port: $RPC_PORT"
echo ""

bitcoind -testnet \
  -rpcuser="$RPC_USER" \
  -rpcpassword="$RPC_PASSWORD" \
  -rpcbind=127.0.0.1 \
  -rpcport=$RPC_PORT \
  -server=1 \
  -daemon

if [ $? -eq 0 ]; then
    echo "✅ Bitcoin Core started in testnet mode"
    echo ""
    echo "To check status:"
    echo "  bitcoin-cli -testnet getblockchaininfo"
    echo ""
    echo "Don't forget to update .env for testnet:"
    echo "  BITCOIN_RPC_URL=http://127.0.0.1:18332"
else
    echo "❌ Failed to start Bitcoin Core"
    exit 1
fi

