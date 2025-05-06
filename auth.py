import os
import json
import logging
from urllib.request import urlopen
from urllib.error import URLError
from jose import jwt, JWTError
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

logger = logging.getLogger(__name__)

# Required Auth0 configurations
auth0_domain = os.getenv("AUTH0_DOMAIN")
if not auth0_domain:
    raise RuntimeError("Miljövariabeln AUTH0_DOMAIN saknas")

api_audience = os.getenv("AUTH0_AUDIENCE")
if not api_audience:
    raise RuntimeError("Miljövariabeln AUTH0_AUDIENCE saknas")

# JWT validation settings
ALGORITHMS = ["RS256"]
jwks_url = f"https://{auth0_domain}/.well-known/jwks.json"

# Cache for JWKS to avoid repeated network calls
_jwks_cache = None

def _get_jwks() -> dict:
    """
    Hämtar och cache:ar JSON Web Key Set från Auth0.
    """
    global _jwks_cache
    if _jwks_cache is None:
        try:
            logger.info(f"Hämtar JWKS från {jwks_url}")
            with urlopen(jwks_url, timeout=5) as response:
                _jwks_cache = json.loads(response.read())
        except URLError as e:
            logger.error(f"Kan inte hämta JWKS: {e}")
            raise RuntimeError(
                "Kontakt med Auth0 misslyckades, kontrollera nätverk eller AUTH0_DOMAIN"
            ) from e
    return _jwks_cache

def decode_auth0_token(token: str) -> dict:
    """
    Validerar en Auth0 JWT och returnerar dess claims.

    Förväntar en RS256-signerad access token med rätt audience och issuer.
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as e:
        logger.error(f"Ogiltigt tokenheader: {e}")
        raise JWTError("Ogiltig JWT-header")

    jwks = _get_jwks()
    rsa_key = {}
    for key in jwks.get("keys", []):
        if key.get("kid") == unverified_header.get("kid"):
            rsa_key = {
                "kty": key.get("kty"),
                "kid": key.get("kid"),
                "use": key.get("use"),
                "n":   key.get("n"),
                "e":   key.get("e"),
            }
            break
    if not rsa_key:
        logger.error(f"Ingen passande nyckel för kid {unverified_header.get('kid')}")
        raise JWTError("Ingen lämplig nyckel hittades i JWKS")

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=api_audience,
            issuer=f"https://{auth0_domain}/"
        )
        return payload
    except JWTError as e:
        logger.error(f"JWT-validering misslyckades: {e}")
        raise JWTError(f"JWT-validering misslyckades: {e}")
