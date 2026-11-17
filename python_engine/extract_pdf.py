#!/usr/bin/env python3
"""
Textra High-Fidelity PDF & OCR Text Extractor
Extracts direct text from digital PDF pages and uses native Windows OCR
on scanned / image pages.
"""

import sys
import os
import json
import asyncio
from io import BytesIO

try:
    import pymupdf
except ImportError:
    try:
        import fitz as pymupdf
    except ImportError:
        pymupdf = None

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import winocr
except ImportError:
    winocr = None


async def extract_pdf(pdf_path: str):
    if not pymupdf:
        return {
            "success": False,
            "error": "PyMuPDF is not installed.",
            "text": "",
        }

    if not os.path.exists(pdf_path):
        return {
            "success": False,
            "error": f"File not found: {pdf_path}",
            "text": "",
        }

    try:
        doc = pymupdf.open(pdf_path)
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to open PDF: {str(e)}",
            "text": "",
        }

    page_texts = []
    ocr_applied = False
    total_pages = len(doc)

    for page_idx in range(total_pages):
        page = doc[page_idx]
        direct_text = page.get_text().strip()

        # If page has sufficient text, keep digital text
        if len(direct_text) >= 30:
            page_texts.append(direct_text)
            continue

        # If text is sparse and OCR is available, render page pixmap and run OCR
        if winocr and Image:
            try:
                pix = page.get_pixmap(dpi=150)
                png_bytes = pix.tobytes("png")
                img = Image.open(BytesIO(png_bytes))
                ocr_result = await winocr.recognize_pil(img, "en")
                ocr_text = ocr_result.text.strip()
                if len(ocr_text) > len(direct_text):
                    page_texts.append(ocr_text)
                    ocr_applied = True
                    continue
            except Exception:
                pass

        # Fallback to direct text even if short
        if direct_text:
            page_texts.append(direct_text)

    combined_text = "\n\n".join(page_texts).strip()

    return {
        "success": True,
        "pageCount": total_pages,
        "text": combined_text,
        "ocrUsed": ocr_applied,
        "charCount": len(combined_text),
        "wordCount": len(combined_text.split()) if combined_text else 0,
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: extract_pdf.py <path_to_pdf>"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    result = asyncio.run(extract_pdf(pdf_path))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
