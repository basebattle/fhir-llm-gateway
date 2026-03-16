from app.tools.patient_lookup import patient_lookup
from app.tools.condition_search import condition_search
from app.tools.coverage_lookup import coverage_lookup
from app.agents.reasoning_logger import ReasoningTrace

async def run_clinical_scenario(patient_id: str) -> dict:
    trace = ReasoningTrace()
    
    # Step 1: Patient
    patient_result = await patient_lookup(patient_id=patient_id)
    trace.log_step("PatientLookup", {"patient_id": patient_id}, patient_result["summary"])
    
    # Step 2: Conditions
    condition_result = await condition_search(patient_id=patient_id)
    trace.log_step("ConditionSearch", {"patient_id": patient_id}, condition_result["summary"])
    
    # Step 3: Coverage
    coverage_result = await coverage_lookup(patient_id=patient_id)
    trace.log_step("CoverageLookup", {"patient_id": patient_id}, coverage_result["summary"])
    
    # Extract Patient Details
    patient_name = "Unknown"
    patient_age = "N/A"
    entries = patient_result.get("fhir_response", {}).get("entry", [])
    if entries:
        resource = entries[0].get("resource", {})
        names = resource.get("name", [])
        if names:
            name_obj = names[0]
            given = " ".join(name_obj.get("given", []))
            family = name_obj.get("family", "")
            patient_name = f"{given} {family}".strip()
        
        # Calculate rough age from birthDate for summary purposes
        birth_date = resource.get("birthDate")
        if birth_date:
            try:
                birth_year = int(birth_date.split("-")[0])
                patient_age = f"{2026 - birth_year}yo" # Using 2026 as current year
            except:
                pass
                
    # Extract Conditions
    condition_names = [c["display"] for c in condition_result.get("conditions", []) if c.get("display")]
    conditions_str = ", ".join(condition_names) if condition_names else "no documented conditions"
    
    # Extract Coverage
    coverage_items = coverage_result.get("coverage", [])
    payer_name = "unknown"
    if coverage_items and coverage_items[0].get("payer"):
        payer_name = coverage_items[0]["payer"]
    elif not coverage_items:
        payer_name = "No coverage data"

    summary_string = f"Patient {patient_name}, {patient_age}, with {conditions_str}, covered by {payer_name}."
    
    return {
        "patient": patient_result,
        "conditions": condition_result,
        "coverage": coverage_result,
        "summary": summary_string,
        "reasoning_trace": trace.finalize()
    }
