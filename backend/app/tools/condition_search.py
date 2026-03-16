from app.fhir_client import fhir_request

async def condition_search(patient_id: str) -> dict:
    """Search for conditions for a specific patient."""
    params = {"patient": patient_id}
    result = await fhir_request("Condition", params)
    
    extracted_list = []
    
    entries = result.get("entry", [])
    for entry in entries:
        resource = entry.get("resource", {})
        
        # Extract code and display
        code = None
        display = None
        code_obj = resource.get("code", {})
        coding_list = code_obj.get("coding", [])
        if coding_list:
            code = coding_list[0].get("code")
            display = coding_list[0].get("display")
            
        # Extract clinicalStatus
        clinical_status = None
        status_obj = resource.get("clinicalStatus", {})
        status_coding_list = status_obj.get("coding", [])
        if status_coding_list:
            clinical_status = status_coding_list[0].get("code")
            
        extracted_list.append({
            "code": code,
            "display": display,
            "clinicalStatus": clinical_status
        })
        
    summary = f"Found {len(extracted_list)} conditions"
    
    return {
        "tool": "ConditionSearch",
        "fhir_request": {
            "resource": "Condition",
            "params": params
        },
        "fhir_response": result,
        "conditions": extracted_list,
        "summary": summary
    }
