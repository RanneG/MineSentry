# Bitcoin RPC Setup Guide

This guide will help you configure Bitcoin RPC for MineSentry.

## Quick Setup

1. **Edit the `.env` file** and update these values:
   ```env
   BITCOIN_RPC_URL=http://127.0.0.1:8332
   BITCOIN_RPC_USER=your_actual_username
   BITCOIN_RPC_PASSWORD=your_actual_password
   ```

## Option 1: Using Bitcoin Core (Local Node)

If you're running Bitcoin Core locally:

### Step 1: Configure Bitcoin Core

Edit your `bitcoin.conf` file (location depends on OS):
- **macOS**: `~/Library/Application Support/Bitcoin/bitcoin.conf`
- **Linux**: `~/.bitcoin/bitcoin.conf`
- **Windows**: `%APPDATA%\Bitcoin\bitcoin.conf`

Add these lines:
```conf
server=1
rpcuser=your_username_here
rpcpassword=your_secure_password_here
rpcport=8332
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
```

**Security Note**: Use a strong, randomly generated password. You can generate one with:
```bash
openssl rand -hex 32
```

### Step 2: Restart Bitcoin Core

Restart your Bitcoin Core node for changes to take effect.

### Step 3: Update .env File

Update your `.env` file with the same credentials:
```env
BITCOIN_RPC_USER=your_username_here
BITCOIN_RPC_PASSWORD=your_secure_password_here
```

### Step 4: Test Connection

Test the connection:
```bash
python -c "from bitcoin_rpc import BitcoinRPC; rpc = BitcoinRPC(); print('Block height:', rpc.get_block_count())"
```

## Option 2: Using Remote Bitcoin RPC Endpoint

If you're using a remote Bitcoin RPC endpoint:

1. Update `.env` with the remote URL:
   ```env
   BITCOIN_RPC_URL=http://your-remote-host:8332
   BITCOIN_RPC_USER=your_username
   BITCOIN_RPC_PASSWORD=your_password
   ```

2. **Security Warning**: Only use this with trusted endpoints. Never expose your Bitcoin RPC endpoint publicly without proper authentication.

## Option 3: Using a Bitcoin RPC Service

Some services provide Bitcoin RPC access:
- **Blockstream**: https://blockstream.info/api/
- **Electrum Servers**: Various public servers
- **Self-hosted**: Run your own Bitcoin node

**Note**: Public RPC endpoints may have rate limits and may not support all RPC methods.

## Verification

After configuring, verify your setup:

### Using Python
```python
from bitcoin_rpc import BitcoinRPC
from config import config

rpc = BitcoinRPC()
try:
    block_count = rpc.get_block_count()
    print(f"✅ Connected! Current block height: {block_count}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
```

### Using verify_setup.py
```bash
python verify_setup.py
```

### Using the API Health Check
```bash
python api.py
# In another terminal:
curl http://localhost:8000/health
```

## Troubleshooting

### "Connection refused"
- Bitcoin Core may not be running
- RPC may not be enabled in `bitcoin.conf`
- Check if `server=1` is set

### "Authentication failed"
- Username/password mismatch
- Check `.env` matches `bitcoin.conf`
- Ensure no extra spaces in credentials

### "Connection timeout"
- Firewall blocking port 8332
- Bitcoin Core not listening on the expected interface
- Check `rpcbind` setting in `bitcoin.conf`

### "RPC method not found"
- Some methods require specific Bitcoin Core versions
- Public RPC endpoints may disable certain methods

## Security Best Practices

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **Use strong passwords** (at least 32 characters)
3. **Restrict RPC access** with `rpcallowip` (only allow localhost for local nodes)
4. **Use HTTPS** for remote connections (with proper certificates)
5. **Keep Bitcoin Core updated** to latest stable version

## Example Configuration

Here's a complete example `.env` configuration:

```env
# Bitcoin RPC Configuration
BITCOIN_RPC_URL=http://127.0.0.1:8332
BITCOIN_RPC_USER=minesentry_user
BITCOIN_RPC_PASSWORD=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

And corresponding `bitcoin.conf`:

```conf
server=1
rpcuser=minesentry_user
rpcpassword=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
rpcport=8332
rpcallowip=127.0.0.1
rpcbind=127.0.0.1
```

## Need Help?

If you're having issues:
1. Check Bitcoin Core logs
2. Verify `bitcoin.conf` syntax
3. Test RPC manually: `bitcoin-cli getblockchaininfo`
4. Review the [Bitcoin Core RPC documentation](https://developer.bitcoin.org/reference/rpc/)

