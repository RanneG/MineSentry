"""
Configuration management for MineSentry
"""

import os
from typing import Optional
from dataclasses import dataclass

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not installed, skip loading .env file
    pass


@dataclass
class Config:
    """Application configuration"""
    # Database
    database_url: str = os.getenv('DATABASE_URL', 'sqlite:///minesentry.db')
    
    # Bitcoin RPC
    bitcoin_rpc_url: str = os.getenv('BITCOIN_RPC_URL', 'http://127.0.0.1:8332')
    bitcoin_rpc_user: str = os.getenv('BITCOIN_RPC_USER', '')
    bitcoin_rpc_password: str = os.getenv('BITCOIN_RPC_PASSWORD', '')
    
    # Lightning Network
    lightning_enabled: bool = os.getenv('LIGHTNING_ENABLED', 'false').lower() == 'true'
    lightning_rpc_url: Optional[str] = os.getenv('LIGHTNING_RPC_URL')
    lightning_macaroon_path: Optional[str] = os.getenv('LIGHTNING_MACAROON_PATH')
    
    # API
    api_host: str = os.getenv('API_HOST', '0.0.0.0')
    api_port: int = int(os.getenv('API_PORT', '8000'))
    api_debug: bool = os.getenv('API_DEBUG', 'false').lower() == 'true'
    
    # Rewards
    min_reward_sats: int = int(os.getenv('MIN_REWARD_SATS', '10000'))
    use_lightning_threshold_sats: int = int(os.getenv('USE_LIGHTNING_THRESHOLD_SATS', '1000000'))
    
    # Charms
    charms_enabled: bool = os.getenv('CHARMS_ENABLED', 'false').lower() == 'true'
    charms_config: Optional[dict] = None
    
    @classmethod
    def from_env(cls) -> 'Config':
        """Create config from environment variables"""
        return cls()


# Global config instance
config = Config.from_env()

