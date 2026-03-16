from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="FHIR-to-LLM Clinical Data Gateway",
    description="MCP-native FHIR access layer with tri-mode data client (static/cloud/local)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routes (will be built in Prompt 3)
# from app.api.routes import router
# app.include_router(router)

@app.get("/health")
async def health():
    from app.fhir_client import get_fhir_mode
    return {"status": "ok", "fhir_mode": get_fhir_mode()}
