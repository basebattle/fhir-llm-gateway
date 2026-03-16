import os
import time
import json
from pathlib import Path
from dotenv import load_dotenv
import httpx

DOTENV_PATH = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=DOTENV_PATH)

FHIR_MODE = os.getenv("FHIR_MODE", "static")
MEDPLUM_BASE_URL = os.getenv("MEDPLUM_BASE_URL", "https://api.medplum.com/fhir/R4")
MEDPLUM_TOKEN_URL = os.getenv("MEDPLUM_TOKEN_URL", "https://api.medplum.com/oauth2/token")
MEDPLUM_CLIENT_ID = os.getenv("MEDPLUM_CLIENT_ID", "")
MEDPLUM_CLIENT_SECRET = os.getenv("MEDPLUM_CLIENT_SECRET", "")
FHIR_LOCAL_URL = os.getenv("FHIR_LOCAL_URL", "http://localhost:8080")
TRACES_DIR = Path(__file__).parent.parent / "data" / "traces"

_token_cache: dict = {"access_token": None, "expires_at": 0.0}

async def _get_medplum_token() -> str:
    now = time.time()
    if _token_cache["access_token"] and now < _token_cache["expires_at"]:
        return _token_cache["access_token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            MEDPLUM_TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": MEDPLUM_CLIENT_ID,
                "client_secret": MEDPLUM_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        token_data = resp.json()

    _token_cache["access_token"] = token_data["access_token"]
    _token_cache["expires_at"] = now + token_data.get("expires_in", 3600) - 60
    return _token_cache["access_token"]

async def fhir_request(resource_type: str, params: dict | None = None, operation: str | None = None) -> dict:
    params = params or {}

    if FHIR_MODE == "static":
        if operation:
            trace_name = f"{resource_type.lower()}_{operation.replace('$', '')}.json"
        else:
            trace_name = f"{resource_type.lower()}_search.json"
        trace_path = TRACES_DIR / trace_name
        if not trace_path.exists():
            raise FileNotFoundError(f"Static trace not found: {trace_path}")
        with open(trace_path) as f:
            result = json.load(f)

    elif FHIR_MODE == "cloud":
        token = await _get_medplum_token()
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/fhir+json"}
        async with httpx.AsyncClient(timeout=30.0) as client:
            if operation:
                url = f"{MEDPLUM_BASE_URL}/{resource_type}/{params.pop('id', '')}/{operation}"
                resp = await client.get(url, headers=headers, params=params)
            else:
                resp = await client.get(f"{MEDPLUM_BASE_URL}/{resource_type}", headers=headers, params=params)
            resp.raise_for_status()
            result = resp.json()

    elif FHIR_MODE == "local":
        async with httpx.AsyncClient(timeout=30.0) as client:
            if operation:
                url = f"{FHIR_LOCAL_URL}/{resource_type}/{params.pop('id', '')}/{operation}"
                resp = await client.get(url, params=params)
            else:
                resp = await client.get(f"{FHIR_LOCAL_URL}/{resource_type}", params=params)
            resp.raise_for_status()
            result = resp.json()

    else:
        raise ValueError(f"Unknown FHIR_MODE: {FHIR_MODE}. Must be static, cloud, or local.")

    if "resourceType" not in result:
        raise ValueError(f"Invalid FHIR response: missing resourceType field.")

    return result

def get_fhir_mode() -> str:
    return FHIR_MODE
