import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (["txt", "md", "json", "csv", "text"].includes(extension) || file.type.startsWith("text/")) {
      extractedText = buffer.toString("utf-8");
    } else {
      // Fallback try utf-8 text
      extractedText = buffer.toString("utf-8");
    }

    return NextResponse.json({
      success: true,
      filename,
      size: file.size,
      text: extractedText,
      charCount: extractedText.length,
      wordCount: extractedText.trim().split(/\s+/).filter(Boolean).length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "File extraction failed";
    return NextResponse.json(
      { error: "Could not extract text from file", details: message },
      { status: 500 }
    );
  }
}
