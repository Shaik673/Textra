import { NextRequest, NextResponse } from "next/server";

export interface SummarySection {
  heading: string;
  content: string;
}

export interface FlowchartStep {
  step: number;
  title: string;
  detail: string;
}

export interface StructuredSummary {
  title: string;
  overview: string;
  sections: SummarySection[];
  keyPoints: string[];
  flowchart: FlowchartStep[];
  takeaway: string;
  wordCount: number;
  readingTimeMinutes: number;
  generatedAt: string;
}

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

// Helper to strip any unexpected HTML tags or raw backticks
function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for summarization." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured in .env.local",
          details: "Please verify GEMINI_API_KEY is defined in textra/.env.local",
        },
        { status: 500 }
      );
    }

    const prompt = `You are an expert NLP analyst, executive intelligence researcher, and document summarizer.
Analyze the provided document text and produce an executive-tier, highly structured summary.

You must respond with ONLY a single valid JSON object strictly matching this schema:
{
  "title": "A crisp, engaging professional headline summarizing the subject matter",
  "overview": "A 2 to 3 sentence high-level executive overview synthesizing the core message",
  "sections": [
    {
      "heading": "Section Heading (e.g. Operational Methodology, Strategic Context, or Technical Implementation)",
      "content": "A detailed, insightful paragraph describing this specific facet without any HTML or markdown formatting."
    }
  ],
  "keyPoints": [
    "Crucial takeaway or quantitative finding 1",
    "Crucial takeaway or quantitative finding 2",
    "Crucial takeaway or quantitative finding 3",
    "Crucial takeaway or quantitative finding 4"
  ],
  "flowchart": [
    {
      "step": 1,
      "title": "Initial Stage / Trigger",
      "detail": "Description of what occurs at this step"
    },
    {
      "step": 2,
      "title": "Core Mechanism / Processing",
      "detail": "Description of key actions taken"
    },
    {
      "step": 3,
      "title": "Outcome / Deployment",
      "detail": "Final result, deliverable, or strategic consequence"
    }
  ],
  "takeaway": "A definitive strategic conclusion or action-oriented verdict"
}

Strict Rules:
- Do NOT output any HTML tags (no <p>, <b>, <div>, <br>, etc.).
- Do NOT output raw markdown fences (no \`\`\`json or \`\`\`).
- Ensure all quotes and special characters are properly escaped in JSON.
- Provide 2 to 4 rich sections and 3 to 5 logical flowchart steps.

Source Text:
${text.slice(0, 50000)}`;

    let lastError = "No candidate models responded.";

    // Try candidate models with graceful fallback
    for (const model of CANDIDATE_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        });

        const data = await response.json();

        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawOutput = data.candidates[0].content.parts[0].text.trim();
          
          let parsed: Partial<StructuredSummary>;
          try {
            parsed = JSON.parse(rawOutput);
          } catch {
            // Clean markdown fences if any
            const cleaned = rawOutput.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            parsed = JSON.parse(cleaned);
          }

          const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
          const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

          const sanitizedSummary: StructuredSummary = {
            title: sanitizeText(parsed.title || "Executive Document Synthesis"),
            overview: sanitizeText(parsed.overview || "Executive synthesis of the provided text."),
            sections: (parsed.sections || []).map((sec) => ({
              heading: sanitizeText(sec.heading),
              content: sanitizeText(sec.content),
            })),
            keyPoints: (parsed.keyPoints || []).map((pt) => sanitizeText(pt)),
            flowchart: (parsed.flowchart || []).map((step, idx) => ({
              step: step.step || idx + 1,
              title: sanitizeText(step.title),
              detail: sanitizeText(step.detail),
            })),
            takeaway: sanitizeText(parsed.takeaway || "Analysis concluded."),
            wordCount,
            readingTimeMinutes,
            generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          return NextResponse.json({
            success: true,
            modelUsed: model,
            summary: sanitizedSummary,
          });
        } else {
          lastError = data.error?.message || response.statusText;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate summary with Gemini API.",
        details: lastError,
      },
      { status: 502 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
