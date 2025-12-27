# Quick Start Guide

Get MineSentry up and running in 5 minutes!

## Prerequisites

- Python 3.8+
- Bitcoin Core node with RPC enabled (or access to a Bitcoin RPC endpoint)

## Quick Setup

### Option 1: Using Setup Script (Recommended)

```bash
# Make setup script executable (if not already)
chmod +x setup.sh

# Run setup
./setup.sh

# Activate virtual environment
source venv/bin/activate

# Edit .env with your Bitcoin RPC credentials
# Then start the server
python api.py
```

### Option 2: Manual Setup

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
# Copy .env.example to .env and edit with your settings
# Or create .env manually with:
# BITCOIN_RPC_URL=http://127.0.0.1:8332
# BITCOIN_RPC_USER=your_user
# BITCOIN_RPC_PASSWORD=your_password

# 4. Initialize database
python init_db.py

# 5. Start API server
python api.py
```

## Configure Bitcoin RPC

Edit `.env` file:

```env
BITCOIN_RPC_URL=http://127.0.0.1:8332
BITCOIN_RPC_USER=your_rpc_user
BITCOIN_RPC_PASSWORD=your_rpc_password
```

If using Bitcoin Core, add to your `bitcoin.conf`:

```
server=1
rpcuser=your_rpc_user
rpcpassword=your_rpc_password
rpcport=8332
```

## Test the API

Once the server is running:

1. **Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Submit a Report**:
   ```bash
   curl -X POST "http://localhost:8000/reports" \
     -H "Content-Type: application/json" \
     -d '{
       "reporter_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
       "pool_address": "bc1q...",
       "block_height": 800000,
       "evidence_type": "censorship",
       "transaction_ids": ["abc123..."],
       "description": "Pool refused valid transactions"
     }'
   ```

3. **View API Documentation**:
   Open browser: http://localhost:8000/docs

4. **List Reports**:
   ```bash
   curl http://localhost:8000/reports
   ```

## Using the Python Client

```python
from example_client import MineSentryClient

# Initialize client
client = MineSentryClient("http://localhost:8000")

# Submit a report
report = client.submit_report(
    reporter_address="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    pool_address="bc1q...",
    block_height=800000,
    evidence_type="censorship",
    transaction_ids=["abc123..."],
    description="Example report"
)

print(f"Report ID: {report['report_id']}")
print(f"Status: {report['status']}")

# Get stats
stats = client.get_stats()
print(f"Total reports: {stats['total_reports']}")
```

## Common Issues

### "Bitcoin RPC connection error"

- Check that Bitcoin Core is running
- Verify RPC credentials in `.env`
- Ensure RPC is enabled in `bitcoin.conf`
- Check firewall settings

### "Database initialization failed"

- Ensure write permissions in the directory
- For PostgreSQL, check connection string format
- Try using SQLite first (default): `DATABASE_URL=sqlite:///minesentry.db`

### "Module not found"

- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again
- Check Python version: `python3 --version` (needs 3.8+)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CHARMS_INTEGRATION.md](CHARMS_INTEGRATION.md) for Charms setup
- Explore the API at http://localhost:8000/docs
- Review example usage in `example_client.py`

## Support

For issues or questions:
1. Check the README.md
2. Review API documentation at `/docs`
3. Check logs for error messages

