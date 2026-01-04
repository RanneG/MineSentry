#!/usr/bin/env python3
"""
Start script for MineSentry API server
Handles port configuration for deployment platforms (Railway, Render, etc.)
Railway and Render provide PORT environment variable
"""
import os
import uvicorn

if __name__ == "__main__":
    # Get port from environment (Railway, Render, etc. provide PORT env var)
    # Fall back to API_PORT or default to 8000
    port = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))
    host = os.getenv("HOST", os.getenv("API_HOST", "0.0.0.0"))
    
    # Import app here to avoid circular imports
    from api import app
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )

