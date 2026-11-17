import { NextResponse } from "next/server";

const CANDIDATE_URLS = [
  process.env.CORENLP_URL,
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://127.0.0.1:9000",
  "http://localhost:9000",
].filter(Boolean) as string[];

const UNIQUE_URLS = Array.from(new Set(CANDIDATE_URLS));

export async function GET() {
  const startTime = Date.now();

  for (const url of UNIQUE_URLS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${url}/ping`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const latency = Date.now() - startTime;
        const isPython = url.includes("8000");
        return NextResponse.json({
          online: true,
          url,
          engine: isPython ? "Textra Neural Engine (Python In-Project Engine)" : "Textra Linguistic Engine",
          latencyMs: latency,
          status: "connected",
          message: isPython
            ? "In-Project Textra Neural NLP Engine is operational."
            : "Textra Linguistic Engine is operational.",
        });
      }
    } catch {
      // Continue to next candidate URL
    }
  }

  return NextResponse.json(
    {
      online: false,
      url: process.env.CORENLP_URL || "http://localhost:8000",
      status: "offline",
      message:
        "NLP engine is offline. Start the Python engine (`python textra/python_engine/server.py`) on port 8000.",
    },
    { status: 503 }
  );
}
