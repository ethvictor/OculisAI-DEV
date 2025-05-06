
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from database import get_session, Report
from auth import decode_auth0_token

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
    user_id   = payload["sub"]
    user_plan = payload.get("plan", "free")
    roles     = payload.get("https://yourdomain/roles", [])
    is_admin  = "admin" in roles

    # Endast admin eller Plus/Pro får spara
    if not is_admin and user_plan not in ("plus", "pro"):
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
    reports = session.exec(
        select(Report).where(Report.user_id == user_id).order_by(Report.created_at.desc())
    ).all()
    return reports

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
