"""
Initialize the database and create tables
"""

from database import Database


def main():
    """Initialize database"""
    print("Initializing MineSentry database...")
    
    # Get database URL from environment or use default
    import os
    database_url = os.getenv('DATABASE_URL', 'sqlite:///minesentry.db')
    
    print(f"Database URL: {database_url}")
    
    # Create database instance and tables
    db = Database(database_url)
    db.create_tables()
    
    print("Database initialized successfully!")
    print("Tables created: mining_pool_reports")


if __name__ == "__main__":
    main()

