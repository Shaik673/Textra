import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
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
    let ocrUsed = false;
    let pageCount: number | undefined;

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (extension === "pdf") {
      // Create unique temporary file for PDF extraction
      const tempId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.pdf`;
      tempFilePath = path.join(os.tmpdir(), tempId);
      await fs.writeFile(tempFilePath, buffer);

      const scriptPath = path.resolve(process.cwd(), "python_engine", "extract_pdf.py");
      try {
        const { stdout } = await execFileAsync("python", [scriptPath, tempFilePath], {
          maxBuffer: 50 * 1024 * 1024,
          timeout: 30000,
        });

        const parsed = JSON.parse(stdout.trim());
        if (parsed.success) {
          extractedText = parsed.text || "";
          ocrUsed = !!parsed.ocrUsed;
          pageCount = parsed.pageCount;
        } else {
          throw new Error(parsed.error || "Failed to parse PDF document");
        }
      } catch (execErr: unknown) {
        const errMessage = execErr instanceof Error ? execErr.message : "PDF extraction subprocess failed";
        console.error("[PDF Extract Error]:", errMessage);
        return NextResponse.json(
          { error: "Failed to extract text from PDF", details: errMessage },
          { status: 500 }
        );
      }
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
      ocrUsed,
      pageCount,
      charCount: extractedText.length,
      wordCount: extractedText.trim().split(/\s+/).filter(Boolean).length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "File extraction failed";
    return NextResponse.json(
      { error: "Could not extract text from file", details: message },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch {
        // Ignore temp cleanup errors
      }
    }
  }
}
