from app.fhir_client import fhir_request

async def patient_lookup(patient_id: str = None, family_name: str = None) -> dict:
    """Lookup patients by ID or family name."""
    params = {}
    if patient_id:
        params["_id"] = patient_id
    if family_name:
        params["family"] = family_name

    result = await fhir_request("Patient", params)
    
    count = result.get("total", len(result.get("entry", [])))
    summary = f"Found {count} patients"
    
    return {
        "tool": "PatientLookup",
        "fhir_request": {
            "resource": "Patient",
            "params": params
        },
        "fhir_response": result,
        "summary": summary
    }
