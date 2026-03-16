from app.fhir_client import fhir_request

async def coverage_lookup(patient_id: str) -> dict:
    """Lookup coverage information for a specific patient."""
    params = {"beneficiary": f"Patient/{patient_id}"}
    result = await fhir_request("Coverage", params)
    
    extracted_data = []
    entries = result.get("entry", [])
    for entry in entries:
        resource = entry.get("resource", {})
        
        # Extract payer name
        payers = resource.get("payor", [])
        payer_name = None
        if payers:
            payer_name = payers[0].get("display")
            
        # Extract type
        type_obj = resource.get("type", {})
        type_coding = type_obj.get("coding", [])
        coverage_type = None
        if type_coding:
            coverage_type = type_coding[0].get("display") or type_coding[0].get("code")
            
        # Extract period
        period = resource.get("period", {})
        
        extracted_data.append({
            "payer": payer_name,
            "type": coverage_type,
            "period": period
        })
        
    summary = f"Found {len(extracted_data)} coverage records"
    
    return {
        "tool": "CoverageLookup",
        "fhir_request": {
            "resource": "Coverage",
            "params": params
        },
        "fhir_response": result,
        "coverage": extracted_data,
        "summary": summary
    }
