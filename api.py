"""
REST API for MineSentry
Built with FastAPI for high performance
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID
from contextlib import asynccontextmanager
import uvicorn

from models import MiningPoolReport, EvidenceType, ReportStatus
from database import Database
from validation import ReportValidator
from reward_system import RewardCalculator, RewardPayment
from bitcoin_rpc import BitcoinRPC
from integration_bridge import MineSentryIntegration, get_integration


# Pydantic models for API requests/responses
class ReportCreateRequest(BaseModel):
    """Request model for creating a new report"""
    reporter_address: str = Field(..., description="Bitcoin address for rewards")
    pool_address: str = Field(..., description="Suspected mining pool address")
    pool_name: Optional[str] = Field(None, description="Optional pool identifier")
    block_height: int = Field(..., gt=0, description="Block height where manipulation occurred")
    evidence_type: str = Field(..., description="Type of evidence")
    transaction_ids: List[str] = Field(default_factory=list, description="Evidence transaction IDs")
    block_hash: Optional[str] = Field(None, description="Block hash")
    description: Optional[str] = Field(None, description="Human-readable description")
    
    @field_validator('evidence_type')
    @classmethod
    def validate_evidence_type(cls, v):
        if isinstance(v, str):
            try:
                EvidenceType(v.lower())
            except ValueError:
                raise ValueError(f"Invalid evidence type. Must be one of: {[e.value for e in EvidenceType]}")
            return v.lower()
        return v


class ReportResponse(BaseModel):
    """Response model for report data"""
    report_id: str
    reporter_address: str
    pool_address: str
    pool_name: Optional[str]
    block_height: int
    evidence_type: str
    transaction_ids: List[str]
    block_hash: Optional[str]
    description: Optional[str]
    timestamp: str
    status: str
    bounty_amount: float
    verification_txid: Optional[str]
    verified_by: Optional[str]
    verified_at: Optional[str]
    
    model_config = {"from_attributes": True}


class ReportUpdateRequest(BaseModel):
    """Request model for updating report status"""
    status: str = Field(..., description="New status")
    verified_by: Optional[str] = Field(None, description="Who verified the report")
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if isinstance(v, str):
            try:
                ReportStatus(v.lower())
            except ValueError:
                raise ValueError(f"Invalid status. Must be one of: {[s.value for s in ReportStatus]}")
            return v.lower()
        return v


# Global dependencies
db = None
bitcoin_rpc = None
validator = None
reward_payment = None


def get_database():
    """Get database instance"""
    global db
    if db is None:
        db = Database()
    return db


def get_bitcoin_rpc():
    """Get Bitcoin RPC instance"""
    global bitcoin_rpc
    if bitcoin_rpc is None:
        bitcoin_rpc = BitcoinRPC()
    return bitcoin_rpc


def get_validator():
    """Get report validator instance"""
    global validator
    if validator is None:
        validator = ReportValidator(get_bitcoin_rpc())
    return validator


def get_reward_payment():
    """Get reward payment instance"""
    global reward_payment
    if reward_payment is None:
        reward_payment = RewardPayment(get_bitcoin_rpc())
    return reward_payment


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup
    get_database()
    get_bitcoin_rpc()
    get_validator()
    get_reward_payment()
    
    # Initialize integration bridge
    try:
        from integration_bridge import get_integration
        integration = get_integration()
        print("✅ Integration bridge initialized")
        if integration.bounty_contract:
            print("✅ Bounty contract initialized")
    except Exception as e:
        print(f"⚠️  Integration initialization warning: {e}")
    
    yield
    
    # Shutdown (if needed)
    pass


# Initialize FastAPI app
app = FastAPI(
    title="MineSentry API",
    description="UTXO Mining Pool Monitor & Reward System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "MineSentry API",
        "version": "1.0.0",
        "description": "UTXO Mining Pool Monitor & Reward System"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        btc_rpc = get_bitcoin_rpc()
        block_count = btc_rpc.get_block_count()
        return {
            "status": "healthy",
            "bitcoin_node_connected": True,
            "block_height": block_count
        }
    except Exception as e:
        return {
            "status": "degraded",
            "bitcoin_node_connected": False,
            "error": str(e)
        }


@app.post("/reports", response_model=ReportResponse, status_code=201)
async def create_report(
    request: ReportCreateRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a new mining pool report
    
    The report will be automatically validated in the background.
    """
    db_instance = get_database()
    session = db_instance.get_session()
    
    try:
        # Create report model
        report = MiningPoolReport()
        report.reporter_address = request.reporter_address
        report.pool_address = request.pool_address
        report.pool_name = request.pool_name
        report.block_height = request.block_height
        report.evidence_type = EvidenceType(request.evidence_type)
        report.transaction_ids = request.transaction_ids
        report.block_hash = request.block_hash
        report.description = request.description
        
        # Calculate initial bounty
        report.bounty_amount = RewardCalculator.calculate_reward(report)
        
        # Save to database
        from database import MiningPoolReportDB
        db_report = MiningPoolReportDB.from_model(report)
        session.add(db_report)
        session.commit()
        session.refresh(db_report)
        
        # Schedule background validation
        background_tasks.add_task(validate_report_background, str(report.report_id))
        
        # Convert back to domain model for response
        report = db_report.to_model()
        
        return ReportResponse(**report.to_dict())
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        session.close()


async def validate_report_background(report_id: str):
    """Background task to validate a report"""
    db_instance = get_database()
    session = db_instance.get_session()
    validator_instance = get_validator()
    
    try:
        from database import MiningPoolReportDB
        db_report = session.query(MiningPoolReportDB).filter_by(report_id=report_id).first()
        
        if not db_report:
            return
        
        report = db_report.to_model()
        
        # Validate report
        is_valid, message, validation_data = validator_instance.validate_report(report)
        
        # Update report status
        if is_valid:
            db_report.status = ReportStatus.UNDER_REVIEW
        else:
            db_report.status = ReportStatus.REJECTED
        
        session.commit()
        
    except Exception as e:
        print(f"Error in background validation: {e}")
        session.rollback()
    finally:
        session.close()


@app.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
):
    """List all reports with optional filtering"""
    db_instance = get_database()
    session = db_instance.get_session()
    
    try:
        from database import MiningPoolReportDB
        query = session.query(MiningPoolReportDB)
        
        if status:
            try:
                status_enum = ReportStatus(status.lower())
                query = query.filter_by(status=status_enum)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        
        reports = query.order_by(MiningPoolReportDB.timestamp.desc()).offset(offset).limit(limit).all()
        
        return [ReportResponse(**report.to_model().to_dict()) for report in reports]
        
    finally:
        session.close()


@app.get("/reports/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    """Get a specific report by ID"""
    db_instance = get_database()
    session = db_instance.get_session()
    
    try:
        from database import MiningPoolReportDB
        db_report = session.query(MiningPoolReportDB).filter_by(report_id=report_id).first()
        
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report = db_report.to_model()
        return ReportResponse(**report.to_dict())
        
    finally:
        session.close()


@app.patch("/reports/{report_id}/status", response_model=ReportResponse)
async def update_report_status(
    report_id: str,
    request: ReportUpdateRequest,
    background_tasks: BackgroundTasks
):
    """Update report status (e.g., verify or reject)"""
    db_instance = get_database()
    session = db_instance.get_session()
    reward_payment_instance = get_reward_payment()
    
    try:
        from database import MiningPoolReportDB
        db_report = session.query(MiningPoolReportDB).filter_by(report_id=report_id).first()
        
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report = db_report.to_model()
        new_status = ReportStatus(request.status.lower())
        
        # Update status
        db_report.status = new_status
        db_report.verified_by = request.verified_by
        if new_status == ReportStatus.VERIFIED:
            db_report.verified_at = datetime.utcnow()
            # Schedule reward payment
            background_tasks.add_task(pay_reward_background, report_id)
        
        session.commit()
        session.refresh(db_report)
        
        report = db_report.to_model()
        return ReportResponse(**report.to_dict())
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        session.close()


@app.delete("/reports/{report_id}")
async def delete_report(report_id: str):
    """
    Delete a report by ID
    
    Note: Only allows deletion of reports that are not verified.
    Verified reports should not be deleted to maintain audit trail.
    """
    db_instance = get_database()
    session = db_instance.get_session()
    
    try:
        from database import MiningPoolReportDB
        db_report = session.query(MiningPoolReportDB).filter_by(report_id=report_id).first()
        
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Prevent deletion of verified reports (maintain audit trail)
        if db_report.status == ReportStatus.VERIFIED:
            raise HTTPException(
                status_code=403, 
                detail="Cannot delete verified reports. They are part of the audit trail."
            )
        
        # Delete the report
        session.delete(db_report)
        session.commit()
        
        return {"message": "Report deleted successfully", "report_id": report_id}
        
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        session.close()


async def pay_reward_background(report_id: str):
    """Background task to pay reward"""
    db_instance = get_database()
    session = db_instance.get_session()
    reward_payment_instance = get_reward_payment()
    
    try:
        from database import MiningPoolReportDB
        db_report = session.query(MiningPoolReportDB).filter_by(report_id=report_id).first()
        
        if not db_report:
            return
        
        report = db_report.to_model()
        
        if report.status == ReportStatus.VERIFIED:
            txid = reward_payment_instance.pay_reward(report)
            if txid:
                db_report.verification_txid = txid
                session.commit()
        
    except Exception as e:
        print(f"Error paying reward: {e}")
        session.rollback()
    finally:
        session.close()


@app.post("/reports/{report_id}/validate")
async def validate_report_endpoint(report_id: str):
    """Manually trigger validation for a report"""
    db_instance = get_database()
    session = db_instance.get_session()
    validator_instance = get_validator()
    
    try:
        from database import MiningPoolReportDB
        db_report = session.query(MiningPoolReportDB).filter_by(report_id=report_id).first()
        
        if not db_report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report = db_report.to_model()
        is_valid, message, validation_data = validator_instance.validate_report(report)
        
        # Update status based on validation
        if is_valid:
            db_report.status = ReportStatus.UNDER_REVIEW
        else:
            db_report.status = ReportStatus.REJECTED
        
        session.commit()
        
        return {
            "valid": is_valid,
            "message": message,
            "validation_data": validation_data
        }
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        session.close()


@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    integration = get_integration()
    db_instance = get_database()
    session = db_instance.get_session()
    
    try:
        from database import MiningPoolReportDB
        from sqlalchemy import func
        
        total_reports = session.query(func.count(MiningPoolReportDB.report_id)).scalar()
        verified_reports = session.query(func.count(MiningPoolReportDB.report_id)).filter_by(
            status=ReportStatus.VERIFIED
        ).scalar()
        total_bounty = session.query(func.sum(MiningPoolReportDB.bounty_amount)).filter_by(
            status=ReportStatus.VERIFIED
        ).scalar() or 0.0
        
        stats = {
            "total_reports": total_reports,
            "verified_reports": verified_reports,
            "pending_reports": session.query(func.count(MiningPoolReportDB.report_id)).filter_by(
                status=ReportStatus.PENDING
            ).scalar(),
            "rejected_reports": session.query(func.count(MiningPoolReportDB.report_id)).filter_by(
                status=ReportStatus.REJECTED
            ).scalar(),
            "total_bounty_paid_sats": total_bounty,
            "total_bounty_paid_btc": total_bounty / 100000000
        }
        
        # Add bounty contract stats if available
        if integration.bounty_contract:
            contract_state = integration.bounty_contract.get_contract_state()
            stats["bounty_contract"] = {
                "available_funds_sats": contract_state["available_funds_sats"],
                "total_paid_sats": contract_state["total_paid_sats"],
                "pending_payments": contract_state["pending_payments"]
            }
        
        return stats
        
    finally:
        session.close()


# Bounty Contract Endpoints
class BountyContractSetupRequest(BaseModel):
    """Request model for setting up bounty contract"""
    authorized_signers: List[str] = Field(..., min_length=2, description="List of authorized signer Bitcoin addresses")
    min_signatures: int = Field(2, ge=1, description="Minimum signatures required for payments")


@app.post("/bounty/contract/setup")
async def setup_bounty_contract(request: BountyContractSetupRequest):
    """Initialize/setup the bounty contract"""
    from integration_bridge import initialize_bounty_contract
    
    result = initialize_bounty_contract(
        authorized_signers=request.authorized_signers,
        min_signatures=request.min_signatures
    )
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
    return result


@app.get("/bounty/contract/status")
async def get_bounty_contract_status():
    """Get bounty contract status"""
    integration = get_integration()
    if not integration.bounty_contract:
        raise HTTPException(status_code=404, detail="Bounty contract not initialized")
    
    return integration.bounty_contract.get_contract_state()


@app.get("/bounty/payments/queue")
async def get_bounty_payment_queue():
    """Get bounty payment queue"""
    integration = get_integration()
    if not integration.bounty_contract:
        raise HTTPException(status_code=404, detail="Bounty contract not initialized")
    
    return integration.bounty_contract.get_payment_queue()


@app.post("/bounty/payments/{report_id}/create")
async def create_bounty_payment(
    report_id: str,
    recipient_address: Optional[str] = None
):
    """Create a bounty payment request for a verified report"""
    integration = get_integration()
    result = integration.create_bounty_payment(report_id, recipient_address)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
    return result


class BountyPaymentApproveRequest(BaseModel):
    """Request model for approving bounty payment"""
    signer_address: str = Field(..., description="Address of the approving signer")


@app.post("/bounty/payments/{payment_id}/approve")
async def approve_bounty_payment(
    payment_id: str,
    request: BountyPaymentApproveRequest
):
    """Approve a bounty payment (multi-signature)"""
    integration = get_integration()
    result = integration.approve_bounty_payment(payment_id, request.signer_address)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
    return result


@app.post("/bounty/payments/{payment_id}/execute")
async def execute_bounty_payment(payment_id: str):
    """Execute an approved bounty payment"""
    integration = get_integration()
    result = integration.execute_bounty_payment(payment_id)
    
    if not result.get('success'):
        raise HTTPException(status_code=400, detail=result.get('error', 'Unknown error'))
    
    return result


@app.get("/system/status")
async def get_system_status():
    """Get overall system status"""
    integration = get_integration()
    return integration.get_system_status()


if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment or use default
    port = int(os.getenv('API_PORT', '8000'))
    host = os.getenv('API_HOST', '0.0.0.0')
    
    uvicorn.run(app, host=host, port=port)

