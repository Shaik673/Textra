import { NextRequest, NextResponse } from "next/server";

const CANDIDATE_URLS = [
  process.env.CORENLP_URL,
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://127.0.0.1:9000",
  "http://localhost:9000",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, annotators, pipelineLanguage } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for annotation." },
        { status: 400 }
      );
    }

    // Default or user-selected annotators
    let annotatorList = Array.isArray(annotators) && annotators.length > 0
      ? annotators
      : ["tokenize", "ssplit", "pos", "lemma", "ner", "depparse"];

    // Ensure tokenize and ssplit are present
    if (!annotatorList.includes("tokenize")) annotatorList = ["tokenize", ...annotatorList];
    if (!annotatorList.includes("ssplit")) annotatorList = ["tokenize", "ssplit", ...annotatorList.filter((a) => a !== "tokenize")];

    // Language specific tokenizers if needed
    const lang = pipelineLanguage || "en";

    const props: Record<string, string> = {
      annotators: annotatorList.join(","),
      outputFormat: "json",
      date: new Date().toISOString(),
    };

    if (annotatorList.includes("openie")) {
      props["openie.splitter.nomodel"] = "true";
    }

    const defaultUrl = process.env.CORENLP_URL || "http://127.0.0.1:8000";
    const urlsToTry = Array.from(new Set([defaultUrl, ...CANDIDATE_URLS]));

    let corenlpResponse: Response | null = null;
    let lastError: unknown = null;

    for (const url of urlsToTry) {
      try {
        const targetUrl = new URL(url);
        targetUrl.searchParams.set("properties", JSON.stringify(props));
        targetUrl.searchParams.set("pipelineLanguage", lang);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const res = await fetch(targetUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: encodeURIComponent(text.trim()),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        corenlpResponse = res;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!corenlpResponse) {
      const message = lastError instanceof Error ? lastError.message : "Unable to reach any NLP engine";
      return NextResponse.json(
        {
          error: "Failed to connect to NLP engine",
          details: message,
          suggestion: "Start the Python engine (`python textra/python_engine/server.py`) on port 8000 or CoreNLP on port 9000.",
        },
        { status: 503 }
      );
    }

    if (!corenlpResponse.ok) {
      const errText = await corenlpResponse.text();
      return NextResponse.json(
        {
          error: "NLP Processing Error",
          details: errText,
          status: corenlpResponse.status,
        },
        { status: corenlpResponse.status }
      );
    }

    const data = await corenlpResponse.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Annotation request failed";
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: message,
      },
      { status: 500 }
    );
  }
}
