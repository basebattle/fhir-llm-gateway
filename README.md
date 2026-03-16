# FHIR-to-LLM Clinical Data Gateway

Enterprise-grade FHIR access layer for AI agents, powered by Medplum and the Model Context Protocol (MCP).

## Architecture

This project implements a **tri-mode FHIR client**:

- **Static mode** (`FHIR_MODE=static`): Loads pre-captured FHIR R4 JSON responses from `data/traces/`. Used for the deployed portfolio site. Zero external dependencies.
- **Cloud mode** (`FHIR_MODE=cloud`): Authenticates to Medplum via OAuth2 client_credentials and queries the live FHIR R4 API. Used for live walkthrough demos.
- **Local mode** (`FHIR_MODE=local`): Queries a local FHIR server (e.g., Docker-based HAPI). Optional fallback for offline development.

## Setup

1. Copy `.env.example` to `.env` and fill in your Medplum credentials.
2. Install backend: `cd backend && pip install -r requirements.txt`
3. Install frontend: `cd frontend && npm install`
4. Capture traces: `cd backend && python scripts/capture_traces.py`
5. Run backend: `cd backend && uvicorn app.main:app --reload --port 8000`
6. Run frontend: `cd frontend && npm run dev`

## Part of the Healthcare AI Innovation Showroom

This project is P06 in the Innovation Showroom portfolio.
Live portfolio: <https://hc-portfolio-zeta.vercel.app>
