"""
Database models and setup for MineSentry
Supports both SQLite and PostgreSQL
"""

import os
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Enum as SQLEnum, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid

from models import EvidenceType, ReportStatus

Base = declarative_base()


class MiningPoolReportDB(Base):
    """SQLAlchemy model for mining pool reports"""
    __tablename__ = 'mining_pool_reports'
    
    report_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_address = Column(String(255), nullable=False, index=True)
    pool_address = Column(String(255), nullable=False, index=True)
    pool_name = Column(String(255), nullable=True)
    block_height = Column(Integer, nullable=False, index=True)
    evidence_type = Column(SQLEnum(EvidenceType), nullable=False)
    transaction_ids = Column(Text, nullable=True)  # JSON array as string
    block_hash = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING, nullable=False, index=True)
    bounty_amount = Column(Float, default=0.0, nullable=False)
    verification_txid = Column(String(64), nullable=True)
    verified_by = Column(String(255), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    def to_model(self):
        """Convert database model to domain model"""
        from models import MiningPoolReport
        import json
        
        report = MiningPoolReport()
        report.report_id = uuid.UUID(self.report_id)
        report.reporter_address = self.reporter_address
        report.pool_address = self.pool_address
        report.pool_name = self.pool_name
        report.block_height = self.block_height
        report.evidence_type = self.evidence_type
        report.transaction_ids = json.loads(self.transaction_ids) if self.transaction_ids else []
        report.block_hash = self.block_hash
        report.description = self.description
        report.timestamp = self.timestamp
        report.status = self.status
        report.bounty_amount = self.bounty_amount
        report.verification_txid = self.verification_txid
        report.verified_by = self.verified_by
        report.verified_at = self.verified_at
        return report
    
    @classmethod
    def from_model(cls, model):
        """Create database model from domain model"""
        import json
        
        return cls(
            report_id=str(model.report_id),
            reporter_address=model.reporter_address,
            pool_address=model.pool_address,
            pool_name=model.pool_name,
            block_height=model.block_height,
            evidence_type=model.evidence_type,
            transaction_ids=json.dumps(model.transaction_ids) if model.transaction_ids else None,
            block_hash=model.block_hash,
            description=model.description,
            timestamp=model.timestamp,
            status=model.status,
            bounty_amount=model.bounty_amount,
            verification_txid=model.verification_txid,
            verified_by=model.verified_by,
            verified_at=model.verified_at,
        )


class Database:
    """Database connection and session management"""
    
    def __init__(self, database_url: str = None):
        """
        Initialize database connection
        
        Args:
            database_url: Database URL (defaults to SQLite if not provided)
                          Format: sqlite:///minesentry.db or postgresql://user:pass@host/dbname
        """
        if database_url is None:
            database_url = os.getenv('DATABASE_URL', 'sqlite:///minesentry.db')
        
        self.engine = create_engine(database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        """Get a new database session"""
        return self.SessionLocal()
    
    def create_tables(self):
        """Create all database tables"""
        Base.metadata.create_all(bind=self.engine)
    
    def drop_tables(self):
        """Drop all database tables (use with caution!)"""
        Base.metadata.drop_all(bind=self.engine)

