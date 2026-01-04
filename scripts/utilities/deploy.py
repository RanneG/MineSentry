#!/usr/bin/env python3
"""
MineSentry Deployment Script

This script handles the complete deployment and setup of MineSentry:
- Database initialization
- Configuration validation
- Service checks
- System initialization
"""

import os
import sys
import argparse
from pathlib import Path


def check_python_version():
    """Check Python version"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True


def check_dependencies():
    """Check if required packages are installed"""
    required = ['fastapi', 'uvicorn', 'sqlalchemy', 'requests', 'pydantic']
    missing = []
    
    for package in required:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("   Install with: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed")
    return True


def check_env_file():
    """Check if .env file exists"""
    env_path = Path('.env')
    if not env_path.exists():
        print("⚠️  .env file not found")
        print("   Creating from template...")
        create_env_file()
        print("   Please edit .env with your configuration")
        return False
    
    print("✅ .env file exists")
    return True


def create_env_file():
    """Create .env file from template"""
    env_content = """# MineSentry Configuration

# Database
DATABASE_URL=sqlite:///minesentry.db

# Bitcoin RPC
BITCOIN_RPC_URL=http://127.0.0.1:8332
BITCOIN_RPC_USER=your_rpc_user
BITCOIN_RPC_PASSWORD=your_rpc_password

# API
API_HOST=0.0.0.0
API_PORT=8000

# Bounty Contract (optional)
BOUNTY_CONTRACT_SIGNERS=
BOUNTY_MIN_SIGNATURES=2
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)


def initialize_database():
    """Initialize database"""
    try:
        from database import Database
        db = Database()
        db.create_tables()
        print("✅ Database initialized")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False


def check_bitcoin_rpc():
    """Check Bitcoin RPC connection"""
    try:
        from bitcoin_rpc import BitcoinRPC
        rpc = BitcoinRPC()
        block_count = rpc.get_block_count()
        print(f"✅ Bitcoin RPC connected (block height: {block_count})")
        return True
    except Exception as e:
        print(f"⚠️  Bitcoin RPC not accessible: {e}")
        print("   (This is OK if Bitcoin node is not running)")
        return None


def initialize_integration():
    """Initialize integration bridge"""
    try:
        from integration_bridge import MineSentryIntegration
        integration = MineSentryIntegration()
        status = integration.get_system_status()
        print("✅ Integration bridge initialized")
        
        if integration.bounty_contract:
            print("✅ Bounty contract initialized")
        else:
            print("ℹ️  Bounty contract not initialized (optional)")
        
        return True
    except Exception as e:
        print(f"⚠️  Integration initialization warning: {e}")
        return True  # Not critical


def print_deployment_summary():
    """Print deployment summary"""
    print("\n" + "=" * 60)
    print("MineSentry Deployment Summary")
    print("=" * 60)
    print("\n✅ Deployment complete!")
    print("\nNext steps:")
    print("1. Start the API server:")
    print("   python api.py")
    print("   or")
    print("   uvicorn api:app --host 0.0.0.0 --port 8000")
    print("\n2. Access API documentation:")
    print("   http://localhost:8000/docs")
    print("\n3. Check system status:")
    print("   curl http://localhost:8000/system/status")
    print("\n" + "=" * 60)


def main():
    """Main deployment function"""
    parser = argparse.ArgumentParser(description='Deploy MineSentry')
    parser.add_argument('--skip-rpc-check', action='store_true',
                       help='Skip Bitcoin RPC connection check')
    parser.add_argument('--skip-db-init', action='store_true',
                       help='Skip database initialization')
    parser.add_argument('--create-env', action='store_true',
                       help='Create .env file if it does not exist')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("MineSentry Deployment")
    print("=" * 60)
    print()
    
    all_checks = []
    
    # Check Python version
    print("[1/6] Checking Python version...")
    all_checks.append(check_python_version())
    print()
    
    # Check dependencies
    print("[2/6] Checking dependencies...")
    all_checks.append(check_dependencies())
    print()
    
    # Check .env file
    print("[3/6] Checking configuration...")
    if args.create_env:
        check_env_file()
    else:
        all_checks.append(check_env_file())
    print()
    
    # Initialize database
    if not args.skip_db_init:
        print("[4/6] Initializing database...")
        all_checks.append(initialize_database())
    else:
        print("[4/6] Skipping database initialization")
        all_checks.append(True)
    print()
    
    # Check Bitcoin RPC
    if not args.skip_rpc_check:
        print("[5/6] Checking Bitcoin RPC...")
        rpc_check = check_bitcoin_rpc()
        if rpc_check is not None:
            all_checks.append(rpc_check)
        else:
            all_checks.append(True)  # Warning is OK
    else:
        print("[5/6] Skipping Bitcoin RPC check")
        all_checks.append(True)
    print()
    
    # Initialize integration
    print("[6/6] Initializing integration bridge...")
    all_checks.append(initialize_integration())
    print()
    
    # Summary
    failed = sum(1 for check in all_checks if check is False)
    
    if failed > 0:
        print(f"❌ Deployment incomplete ({failed} check(s) failed)")
        sys.exit(1)
    else:
        print_deployment_summary()
        sys.exit(0)


if __name__ == "__main__":
    main()

