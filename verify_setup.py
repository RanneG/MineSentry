"""
Verification script to check MineSentry setup
"""

import sys
import os


def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required. Current version:", sys.version)
        return False
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True


def check_dependencies():
    """Check if required packages are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'sqlalchemy',
        'requests'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} installed")
        except ImportError:
            print(f"❌ {package} not installed")
            missing.append(package)
    
    if missing:
        print(f"\nMissing packages: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    return True


def check_env_file():
    """Check if .env file exists"""
    if os.path.exists('.env'):
        print("✅ .env file exists")
        return True
    else:
        print("⚠️  .env file not found (create from .env.example)")
        return False


def check_database():
    """Check if database can be initialized"""
    try:
        from database import Database
        db = Database()
        print("✅ Database module loads successfully")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False


def check_bitcoin_rpc():
    """Check Bitcoin RPC connection (optional)"""
    try:
        from bitcoin_rpc import BitcoinRPC
        rpc = BitcoinRPC()
        try:
            rpc.get_block_count()
            print("✅ Bitcoin RPC connection successful")
            return True
        except Exception as e:
            print(f"⚠️  Bitcoin RPC not accessible: {e}")
            print("   (This is OK if Bitcoin node is not running yet)")
            return None  # Not a failure, just a warning
    except Exception as e:
        print(f"❌ Bitcoin RPC module error: {e}")
        return False


def main():
    """Run all checks"""
    print("=" * 50)
    print("MineSentry Setup Verification")
    print("=" * 50)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("Environment File", check_env_file),
        ("Database Module", check_database),
        ("Bitcoin RPC", check_bitcoin_rpc),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        result = check_func()
        results.append((name, result))
    
    print("\n" + "=" * 50)
    print("Summary:")
    print("=" * 50)
    
    passed = sum(1 for _, r in results if r is True)
    failed = sum(1 for _, r in results if r is False)
    warnings = sum(1 for _, r in results if r is None)
    
    print(f"✅ Passed: {passed}")
    if warnings > 0:
        print(f"⚠️  Warnings: {warnings}")
    if failed > 0:
        print(f"❌ Failed: {failed}")
        print("\nPlease fix the failed checks before proceeding.")
        sys.exit(1)
    else:
        print("\n✅ Setup looks good! You can start the server with: python api.py")
        sys.exit(0)


if __name__ == "__main__":
    main()

