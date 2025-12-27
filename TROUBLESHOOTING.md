# Troubleshooting Guide

## Bitcoin RPC Connection Refused

If you see the error: `Connection refused` or `Failed to establish a new connection: [Errno 61] Connection refused`

This means **Bitcoin Core is not running**.

### Solution: Start Bitcoin Core

#### Option 1: Start Bitcoin Core GUI (Recommended for macOS)

1. **Open Bitcoin Core Application**:
   - Look for "Bitcoin Core" in your Applications folder
   - Or launch it from Spotlight (Cmd+Space, type "Bitcoin Core")
   - Or run: `open -a "Bitcoin Core"`

2. **Wait for Bitcoin Core to Start**:
   - Bitcoin Core will start in the background
   - The RPC server will start once the node begins syncing
   - You'll see the Bitcoin Core icon in your menu bar

3. **Verify it's Running**:
   ```bash
   bitcoin-cli getblockchaininfo
   ```

#### Option 2: Start Bitcoin Core from Command Line

```bash
# Start bitcoind in the background
bitcoind -daemon

# Or start with specific datadir
bitcoind -daemon -datadir="$HOME/Library/Application Support/Bitcoin"
```

#### Option 3: Start Bitcoin Core with GUI

```bash
# Open Bitcoin Core GUI
open -a "Bitcoin Core"
```

### Verify Bitcoin Core is Running

Check if Bitcoin Core is running:

```bash
# Check if bitcoind process is running
ps aux | grep bitcoind | grep -v grep

# Check if port 8332 is listening
lsof -i :8332

# Test RPC connection
bitcoin-cli getblockchaininfo
```

### Check Bitcoin Core Status

Once Bitcoin Core is running, check its status:

```bash
# Get blockchain info
bitcoin-cli getblockchaininfo

# Get network info
bitcoin-cli getnetworkinfo

# Get current block height
bitcoin-cli getblockcount
```

### Test MineSentry Connection

After Bitcoin Core is running, test MineSentry connection:

```bash
cd /Users/rannegerodias/Desktop/MineSentry

# Test RPC connection
python -c "from bitcoin_rpc import BitcoinRPC; rpc = BitcoinRPC(); print('✅ Connected! Block height:', rpc.get_block_count())"

# Or run verification script
python verify_setup.py
```

### Common Issues

#### Issue: "Connection refused" even after starting Bitcoin Core

**Possible causes:**
1. Bitcoin Core is still starting up (wait 30-60 seconds)
2. RPC server not enabled (check `bitcoin.conf` has `server=1`)
3. Wrong port (check `rpcport=8332` in `bitcoin.conf`)
4. Bitcoin Core is syncing for the first time (can take hours/days)

**Solution:**
- Wait for Bitcoin Core to fully start
- Check `bitcoin.conf` configuration
- Check Bitcoin Core logs: `tail -f ~/Library/Application\ Support/Bitcoin/debug.log`

#### Issue: "Authentication failed"

**Possible causes:**
1. Username/password mismatch between `.env` and `bitcoin.conf`
2. Bitcoin Core not restarted after changing `bitcoin.conf`

**Solution:**
- Verify `.env` matches `bitcoin.conf`
- Restart Bitcoin Core after changing configuration
- Check: `cat ~/Library/Application\ Support/Bitcoin/bitcoin.conf | grep rpc`
- Check: `cat .env | grep BITCOIN_RPC`

#### Issue: Bitcoin Core taking a long time to sync

**First-time sync:**
- Bitcoin Core needs to download and verify the entire blockchain
- This can take several hours to days depending on your internet speed
- The RPC server starts even while syncing, but some RPC calls may be limited

**Solution:**
- Be patient during initial sync
- Use `prune` option if you don't need full blockchain (add `prune=550` to `bitcoin.conf`)
- Consider using a remote RPC endpoint for development/testing

### Using a Remote Bitcoin RPC Endpoint

If you don't want to run Bitcoin Core locally, you can use a remote RPC endpoint:

1. **Update `.env`**:
   ```env
   BITCOIN_RPC_URL=http://remote-host:8332
   BITCOIN_RPC_USER=your_username
   BITCOIN_RPC_PASSWORD=your_password
   ```

2. **Security Warning**: Only use trusted endpoints. Remote RPC endpoints can see your queries and may have rate limits.

### Quick Start Commands

```bash
# 1. Start Bitcoin Core
open -a "Bitcoin Core"

# 2. Wait 30 seconds for it to start

# 3. Verify it's running
bitcoin-cli getblockchaininfo

# 4. Test MineSentry connection
cd /Users/rannegerodias/Desktop/MineSentry
python -c "from bitcoin_rpc import BitcoinRPC; rpc = BitcoinRPC(); print('✅ Connected! Block height:', rpc.get_block_count())"
```

### Getting Help

If you continue to have issues:

1. Check Bitcoin Core logs:
   ```bash
   tail -50 ~/Library/Application\ Support/Bitcoin/debug.log
   ```

2. Verify configuration:
   ```bash
   # Check bitcoin.conf
   cat ~/Library/Application\ Support/Bitcoin/bitcoin.conf
   
   # Check .env
   cat .env | grep BITCOIN_RPC
   ```

3. Check if Bitcoin Core process is running:
   ```bash
   ps aux | grep bitcoind
   ```

4. Check if port 8332 is listening:
   ```bash
   lsof -i :8332
   ```

