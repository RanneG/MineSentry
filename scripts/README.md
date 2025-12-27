# MineSentry Scripts

This directory contains utility scripts for MineSentry.

## Available Scripts

### Setup Scripts

- **`setup.sh`** - Main setup script (if exists)

### Utility Scripts

- **`UPLOAD_TO_GITHUB.sh`** - Automated script to help upload project to GitHub

## Usage

Make scripts executable before running:
```bash
chmod +x scripts/*.sh
```

Then run them:
```bash
./scripts/script_name.sh
```

## Note

Most functionality is available through Python scripts in the root directory:
- `setup_bounty_contract.py` - Interactive bounty contract setup
- `fund_bounty_contract.py` - Fund the bounty contract
- `init_db.py` - Initialize database
- `verify_setup.py` - Verify system setup
- `create_test_reports.py` - Create test data

