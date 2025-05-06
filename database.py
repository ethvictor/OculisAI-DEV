import os
from datetime import datetime
from typing import Optional, Generator, Dict, Any
from sqlmodel import SQLModel, Field, create_engine, Session
from sqlalchemy import Column
from sqlalchemy.types import JSON

# Konfigurationsvariabel för databas-URL; standard till en lokal SQLite-fil
database_url = os.getenv("DATABASE_URL", "sqlite:///./database.db")
# Skapa engine
engine = create_engine(database_url, echo=True)

class Report(SQLModel, table=True):
    """
    Databasmodell för sparade rapporter per användare.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    analysis_type: str
    url: str
    results: Dict[str, Any] = Field(sa_column=Column(JSON), default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)


def init_db() -> None:
    """
    Initierar databasen och skapar alla tabeller.
    Ska kallas vid applikationens startup.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Generator för en databas-session (FastAPI dependency).
    Används som:
        with get_session() as session:
            ...
    """
    with Session(engine) as session:
        yield session
