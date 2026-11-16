import { NextResponse } from "next/server";

export async function GET() {
  const corenlpUrl = process.env.CORENLP_URL || "http://localhost:9000";
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${corenlpUrl}/ping`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latency = Date.now() - startTime;

    if (res.ok) {
      return NextResponse.json({
        online: true,
        url: corenlpUrl,
        latencyMs: latency,
        status: "connected",
        message: "Stanford CoreNLP server is operational.",
      });
    }

    return NextResponse.json(
      {
        online: false,
        url: corenlpUrl,
        status: "error",
        message: `CoreNLP server returned status ${res.status}`,
      },
      { status: 502 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to reach CoreNLP server";
    return NextResponse.json(
      {
        online: false,
        url: corenlpUrl,
        status: "offline",
        message: `CoreNLP server at ${corenlpUrl} is currently offline. Ensure StanfordCoreNLPServer is running on port 9000. (${message})`,
      },
      { status: 503 }
    );
  }
}
