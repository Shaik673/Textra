import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const corenlpUrl = process.env.CORENLP_URL || "http://localhost:9000";

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

    // If OpenIE is requested, allow fallback rule-based clause splitting when optional model is not installed
    if (annotatorList.includes("openie")) {
      props["openie.splitter.nomodel"] = "true";
    }

    const targetUrl = new URL(corenlpUrl);
    targetUrl.searchParams.set("properties", JSON.stringify(props));
    targetUrl.searchParams.set("pipelineLanguage", lang);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for heavy parsing

    const corenlpResponse = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: encodeURIComponent(text.trim()),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!corenlpResponse.ok) {
      const errText = await corenlpResponse.text();
      return NextResponse.json(
        {
          error: "CoreNLP Processing Error",
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
        error: "Failed to connect to Stanford CoreNLP server",
        details: message,
        suggestion: "Verify that the CoreNLP server is running on http://localhost:9000.",
      },
      { status: 503 }
    );
  }
}
