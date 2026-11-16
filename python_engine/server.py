import os
import sys
import json
import urllib.parse
from typing import Optional, Union
from fastapi import FastAPI, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Ensure python_engine is importable from anywhere
ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(ENGINE_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from python_engine.model import analyze_text, get_pipeline

app = FastAPI(
    title="Textra In-Project Python NLP Engine",
    description="Drop-in Stanford Stanza Neural Engine emitting 100% compatible CoreNLP AST schemas for Textra Studio.",
    version="1.0.0"
)

# Enable CORS for Next.js Studio and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnnotationRequest(BaseModel):
    text: str
    annotators: Optional[Union[list, str]] = None
    pipelineLanguage: Optional[str] = "en"

@app.on_event("startup")
def preload_pipeline():
    """Pre-warm Stanza PyTorch models during server startup."""
    print("[Textra Python NLP Server] Pre-warming Stanza neural models...")
    get_pipeline()
    print("[Textra Python NLP Server] Pipeline ready to serve requests on port 8000.")

@app.get("/ping")
def ping():
    """Health check endpoint mimicking Stanford CoreNLP ping."""
    return Response(content="pong", media_type="text/plain")

@app.get("/")
def root_info():
    """Server diagnostic & health endpoint."""
    return {
        "engine": "Textra Stanford Stanza Python NLP Engine",
        "status": "online",
        "supported_annotators": [
            "tokenize", "ssplit", "pos", "lemma", "ner",
            "depparse", "sentiment", "constituency", "coref", "openie"
        ],
        "ast_compatibility": "Stanford CoreNLP 4.5.x JSON Schema"
    }

@app.post("/")
async def corenlp_compatible_annotate(
    request: Request,
    properties: Optional[str] = Query(None),
    pipelineLanguage: Optional[str] = Query("en")
):
    """
    Drop-in endpoint matching Stanford CoreNLP Java Server POST /?properties={...}
    Accepts raw body, urlencoded form text, or JSON payload.
    """
    body_bytes = await request.body()
    content_type = request.headers.get("content-type", "")

    raw_text = ""

    if "application/json" in content_type:
        try:
            json_body = json.loads(body_bytes.decode("utf-8"))
            raw_text = json_body.get("text", "")
        except Exception:
            raw_text = body_bytes.decode("utf-8", errors="ignore")
    else:
        # CoreNLP client sends raw encoded string or form body
        decoded_body = body_bytes.decode("utf-8", errors="ignore")
        # Check if it was URL-encoded
        if "%" in decoded_body or "+" in decoded_body:
            raw_text = urllib.parse.unquote_plus(decoded_body)
        else:
            raw_text = decoded_body

    if not raw_text.strip():
        return Response(
            content=json.dumps({"error": "No input text provided."}),
            media_type="application/json",
            status_code=400
        )

    ast_response = analyze_text(raw_text)
    return Response(
        content=json.dumps(ast_response),
        media_type="application/json"
    )

@app.post("/annotate")
async def json_annotate(payload: AnnotationRequest):
    """Modern JSON REST endpoint for Textra."""
    if not payload.text or not payload.text.strip():
        return Response(
            content=json.dumps({"error": "Text is required for annotation."}),
            media_type="application/json",
            status_code=400
        )

    ast_response = analyze_text(payload.text)
    return Response(
        content=json.dumps(ast_response),
        media_type="application/json"
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("TEXTRA_PYTHON_PORT", 8000))
    print(f"Starting Textra Python NLP Engine on http://127.0.0.1:{port}")
    uvicorn.run("python_engine.server:app", host="127.0.0.1", port=port, log_level="info", reload=False)
