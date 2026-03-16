from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from app.tools.patient_lookup import patient_lookup
from app.tools.condition_search import condition_search
from app.tools.coverage_lookup import coverage_lookup
from app.agents.clinical_agent import run_clinical_scenario

router = APIRouter()

class ExecuteToolRequest(BaseModel):
    tool_name: str
    params: Dict[str, Any]

class ScenarioRequest(BaseModel):
    patient_id: str

@router.get("/tools")
async def get_tools():
    return [
        {
            "name": "PatientLookup",
            "description": "Search patients by ID or family name",
            "params": ["patient_id", "family_name"]
        },
        {
            "name": "ConditionSearch",
            "description": "Find conditions for a patient",
            "params": ["patient_id"]
        },
        {
            "name": "CoverageLookup",
            "description": "Check insurance coverage for a patient",
            "params": ["patient_id"]
        }
    ]

@router.post("/execute-tool")
async def execute_tool(req: ExecuteToolRequest):
    if req.tool_name == "PatientLookup":
        return await patient_lookup(**req.params)
    elif req.tool_name == "ConditionSearch":
        return await condition_search(**req.params)
    elif req.tool_name == "CoverageLookup":
        return await coverage_lookup(**req.params)
    else:
        raise HTTPException(status_code=404, detail={"error": f"Unknown tool: {req.tool_name}"})

@router.post("/run-scenario")
async def run_scenario(req: ScenarioRequest):
    return await run_clinical_scenario(req.patient_id)
