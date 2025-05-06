from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from database import get_session, Report
from auth import decode_auth0_token
# Rätt import från samma paket
from .user_routes import admin_users

router = APIRouter()
security = HTTPBearer()

@router.post("/reports", response_model=Report)
def create_report(
    report_in: Report,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
):
    # Validera JWT och hämta claims
    payload   = decode_auth0_token(credentials.credentials)
    user_id   = payload.get("sub")
    user_plan = payload.get("plan", "free")

    # Kontrollera admin via roller eller backend-lista
    roles       = payload.get("https://oculis-ai.example.com/roles", [])
    is_admin    = isinstance(roles, list) and "admin" in roles
    # Backend-registrerade admins via user_routes
    if user_id in admin_users:
        is_admin = True

    # Kontrollera plan från app_metadata om angivet
    app_metadata = payload.get("app_metadata", {})
    if isinstance(app_metadata, dict):
        metadata_plan = app_metadata.get("plan", "")
        if metadata_plan in ("plus", "pro", "pro-trial"):
            user_plan = metadata_plan

    # Debug-loggning
    print(f"User ID: {user_id}, Is Admin: {is_admin}, User Plan: {user_plan}, App Metadata: {app_metadata}")

    # Admin ELLER Betald plan krävs
    if not is_admin and user_plan not in ("plus", "pro", "pro-trial"):
        raise HTTPException(403, "Betald plan krävs för att spara rapporter")

    # Skapa och spara rapporten
    report = Report(
        user_id=user_id,
        analysis_type=report_in.analysis_type,
        url=report_in.url,
        results=report_in.results
    )
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

@router.get("/reports", response_model=list[Report])
def list_reports(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
):
    user_id = decode_auth0_token(credentials.credentials)["sub"]
    return session.exec(
        select(Report)
        .where(Report.user_id == user_id)
        .order_by(Report.created_at.desc())
    ).all()

@router.get("/reports/{report_id}", response_model=Report)
def get_report(
    report_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
):
    user_id = decode_auth0_token(credentials.credentials)["sub"]
    report = session.get(Report, report_id)
    if not report or report.user_id != user_id:
        raise HTTPException(404, "Rapporten hittades inte")
    return report
