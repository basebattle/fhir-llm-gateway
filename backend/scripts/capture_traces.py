#!/usr/bin/env python3
"""
Capture FHIR API traces from Medplum for static demo mode.
Run this once after uploading Synthea patients to your Medplum project.

Usage:
  cd backend
  python scripts/capture_traces.py

Requires: FHIR_MODE=cloud in .env with valid Medplum credentials.
"""
import asyncio
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
os.environ["FHIR_MODE"] = "cloud"

from app.fhir_client import fhir_request, TRACES_DIR


async def capture():
    TRACES_DIR.mkdir(parents=True, exist_ok=True)

    traces_to_capture = [
        ("Patient", {"_count": "5"}, None, "patient_search.json"),
        ("Condition", {"_count": "10"}, None, "condition_search.json"),
        ("Coverage", {"_count": "5"}, None, "coverage_search.json"),
    ]

    for resource_type, params, operation, filename in traces_to_capture:
        try:
            print(f"Capturing {filename}...", end=" ")
            result = await fhir_request(resource_type, params, operation)
            output_path = TRACES_DIR / filename
            with open(output_path, "w") as f:
                json.dump(result, f, indent=2)
            entry_count = result.get("total", len(result.get("entry", [])))
            print(f"OK ({entry_count} entries)")
        except Exception as e:
            print(f"FAILED: {e}")

    # Capture Patient/$everything for the first patient found
    try:
        print("Capturing patient_everything.json...", end=" ")
        patients = await fhir_request("Patient", {"_count": "1"})
        if patients.get("entry"):
            patient_id = patients["entry"][0]["resource"]["id"]
            everything = await fhir_request("Patient", {"id": patient_id}, operation="$everything")
            with open(TRACES_DIR / "patient_everything.json", "w") as f:
                json.dump(everything, f, indent=2)
            print(f"OK (patient {patient_id})")
        else:
            print("SKIPPED (no patients found in Medplum)")
    except Exception as e:
        print(f"FAILED: {e}")

    print("\nTrace capture complete. Files saved to:", TRACES_DIR)
    print("These files will be used when FHIR_MODE=static (deployed site).")


if __name__ == "__main__":
    asyncio.run(capture())
