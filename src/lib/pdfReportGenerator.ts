import { jsPDF } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import { CoreNLPResponse, DependencyRelation } from "@/types/corenlp";
import { StructuredSummary } from "@/app/api/summarize/route";
import { POS_INFO } from "./tagDescriptions";

export interface PdfReportOptions {
  text: string;
  nlpData: CoreNLPResponse;
  activeAnnotators: string[];
  userName?: string;
  fileName?: string;
  summary?: StructuredSummary | null;
}

// Resilient wrapper for autoTable across ESM/CJS bundlers and browser runtimes
function runAutoTable(doc: jsPDF, options: UserOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyModule = autoTable as any;
  const fn = anyModule?.default || anyModule?.autoTable || anyModule;
  if (typeof fn === "function") {
    fn(doc, options);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (typeof (doc as any).autoTable === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable(options);
  }
}

export async function generateStudioPdfReport({
  text,
  nlpData,
  activeAnnotators,
  userName = "Textra Explorer",
  fileName = "Textra_NLP_Analysis_Report.pdf",
  summary,
}: PdfReportOptions) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
  };

  // ----------------------------------------------------
  // BRAND HEADER
  // ----------------------------------------------------
  doc.setFillColor(67, 56, 202); // Indigo-700
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("TEXTRA LINGUISTIC STUDIO", margin + 6, currentY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text("Automated Natural Language Processing & Syntactic Annotation Report", margin + 6, currentY + 16);

  currentY += 28;

  // ----------------------------------------------------
  // METADATA SUMMARY CARD
  // ----------------------------------------------------
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 26, 2, 2, "FD");

  const totalWords = text.trim() ? text.trim().split(/\s+/).length : 0;
  const totalChars = text.length;
  const sentenceCount = nlpData.sentences?.length || 0;
  const reportDate = new Date().toLocaleString();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.text("Analyst / User:", margin + 5, currentY + 7);
  doc.text("Generated At:", margin + 5, currentY + 14);
  doc.text("Text Metrics:", margin + 5, currentY + 21);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(userName, margin + 30, currentY + 7);
  doc.text(reportDate, margin + 30, currentY + 14);
  doc.text(`${totalWords} Words  |  ${totalChars} Characters  |  ${sentenceCount} Sentences`, margin + 30, currentY + 21);

  doc.setFont("helvetica", "bold");
  doc.text("Selected Annotations:", pageWidth / 2 + 10, currentY + 7);
  doc.setFont("helvetica", "normal");
  const annotatorList = activeAnnotators.length > 0 ? activeAnnotators.join(", ").toUpperCase() : "NONE";
  doc.text(annotatorList, pageWidth / 2 + 10, currentY + 14, { maxWidth: pageWidth / 2 - margin - 15 });

  currentY += 32;

  // ----------------------------------------------------
  // 1. INPUT TEXT SECTION
  // ----------------------------------------------------
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("1. Source Text Document", margin, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Verbatim excerpt of the input text corpus provided for linguistic processing.", margin, currentY);
  currentY += 5;

  const splitSourceText = doc.splitTextToSize(text || "(No input text provided)", pageWidth - margin * 2 - 8);
  const textBoxHeight = Math.min(Math.max(splitSourceText.length * 4.2 + 8, 14), 60);

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, textBoxHeight, 1.5, 1.5, "FD");

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(splitSourceText.slice(0, 12), margin + 4, currentY + 6);
  if (splitSourceText.length > 12) {
    doc.text("... [Text truncated in report preview]", margin + 4, currentY + textBoxHeight - 3);
  }

  currentY += textBoxHeight + 10;

  // ----------------------------------------------------
  // 1.5 EXECUTIVE SUMMARY (if available)
  // ----------------------------------------------------
  if (summary) {
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Executive Summary (Gemini AI Synthesis)", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text(summary.title, margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitOverview = doc.splitTextToSize(summary.overview, pageWidth - margin * 2);
    doc.text(splitOverview, margin, currentY);
    currentY += splitOverview.length * 4.2 + 4;

    if (summary.keyPoints && summary.keyPoints.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("Key Takeaways:", margin, currentY);
      currentY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      for (const pt of summary.keyPoints) {
        const splitPt = doc.splitTextToSize(`• ${pt}`, pageWidth - margin * 2 - 4);
        doc.text(splitPt, margin + 2, currentY);
        currentY += splitPt.length * 3.8;
      }
      currentY += 3;
    }

    if (summary.takeaway) {
      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(251, 191, 36);
      const splitTakeaway = doc.splitTextToSize(`Strategic Verdict: ${summary.takeaway}`, pageWidth - margin * 2 - 6);
      const h = splitTakeaway.length * 4 + 4;
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, h, 1, 1, "FD");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(146, 64, 14);
      doc.text(splitTakeaway, margin + 3, currentY + 4);
      currentY += h + 8;
    }
  }

  // ----------------------------------------------------
  // 2. POS & LEMMAS SECTION (if pos or lemma is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("pos") || activeAnnotators.includes("lemma")) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("2. Part-of-Speech (POS) & Lemmatization", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Token-level grammatical categorization (Penn Treebank taxonomy) and dictionary root lemmas.", margin, currentY);
    currentY += 4;

    const tokenRows: string[][] = [];
    nlpData.sentences?.forEach((sent, sIdx) => {
      sent.tokens?.forEach((tok) => {
        const desc = POS_INFO[tok.pos || ""]?.label || "Grammatical Particle";
        tokenRows.push([
          `S${sIdx + 1}.${tok.index}`,
          tok.word,
          tok.lemma || tok.word.toLowerCase(),
          tok.pos || "O",
          desc,
        ]);
      });
    });

    runAutoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["#", "Token", "Root Lemma", "POS Tag", "Grammatical Role"]],
      body: tokenRows.slice(0, 100),
      theme: "grid",
      headStyles: { fillColor: [67, 56, 202], textColor: 255, fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // ----------------------------------------------------
  // 3. NAMED ENTITIES (if ner is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("ner")) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("3. Named Entity Recognition (NER)", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Identified real-world semantic entities including persons, organizations, locations, and numerical dates.", margin, currentY);
    currentY += 4;

    const nerRows: string[][] = [];
    nlpData.sentences?.forEach((sent, sIdx) => {
      let currentEntity: { text: string; ner: string } | null = null;
      sent.tokens?.forEach((tok) => {
        if (tok.ner && tok.ner !== "O") {
          if (currentEntity && currentEntity.ner === tok.ner) {
            currentEntity.text += ` ${tok.word}`;
          } else {
            if (currentEntity) {
              nerRows.push([`${nerRows.length + 1}`, currentEntity.text, currentEntity.ner, `Sent ${sIdx + 1}`]);
            }
            currentEntity = { text: tok.word, ner: tok.ner };
          }
        } else if (currentEntity) {
          nerRows.push([`${nerRows.length + 1}`, currentEntity.text, currentEntity.ner, `Sent ${sIdx + 1}`]);
          currentEntity = null;
        }
      });
      if (currentEntity) {
        const ent: { text: string; ner: string } = currentEntity;
        nerRows.push([`${nerRows.length + 1}`, ent.text, ent.ner, `Sent ${sIdx + 1}`]);
      }
    });

    if (nerRows.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 12, 1, 1, "FD");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("No named entities detected in the current text selection.", margin + 4, currentY + 7);
      currentY += 18;
    } else {
      runAutoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["#", "Entity Mention", "Category", "Sentence / Token Position"]],
        body: nerRows,
        theme: "grid",
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // @ts-expect-error autoTable adds lastAutoTable to doc
      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // ----------------------------------------------------
  // 4. UNIVERSAL DEPENDENCIES (if depparse is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("depparse")) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("4. Universal Dependency Relations", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Syntactic dependency links between head words (governors) and dependent tokens.", margin, currentY);
    currentY += 4;

    const depRows: string[][] = [];
    nlpData.sentences?.forEach((sent, sIdx) => {
      const deps: DependencyRelation[] = sent.basicDependencies || sent.enhancedPlusPlusDependencies || [];
      deps.forEach((dep) => {
        depRows.push([
          `S${sIdx + 1}`,
          dep.governorGloss || `Word #${dep.governor}`,
          dep.dep,
          dep.dependentGloss || `Word #${dep.dependent}`,
        ]);
      });
    });

    if (depRows.length > 0) {
      runAutoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["Sent", "Governor (Head)", "Dependency Relation", "Dependent Token"]],
        body: depRows.slice(0, 80),
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // @ts-expect-error autoTable adds lastAutoTable to doc
      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // ----------------------------------------------------
  // 5. CONSTITUENCY PARSE TREE (if parse is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("parse")) {
    checkPageBreak(45);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("5. Hierarchical Phrase Structure (Parse Trees)", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Syntactic clause grouping according to formal phrase structure grammar (S, NP, VP, PP).", margin, currentY);
    currentY += 5;

    nlpData.sentences?.forEach((sent, sIdx) => {
      if (sent.parse) {
        checkPageBreak(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(67, 56, 202);
        doc.text(`Sentence #${sIdx + 1} Parse Structure:`, margin, currentY);
        currentY += 4;

        const formattedParse = sent.parse
          .replace(/\s+/g, " ")
          .replace(/\(\s*/g, "\n  (")
          .trim();
        const parseLines = doc.splitTextToSize(formattedParse, pageWidth - margin * 2 - 8);
        const boxH = Math.min(parseLines.length * 3.8 + 6, 50);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(margin, currentY, pageWidth - margin * 2, boxH, 1, 1, "FD");

        doc.setFont("courier", "normal");
        doc.setFontSize(7);
        doc.setTextColor(30, 41, 59);
        doc.text(parseLines.slice(0, 12), margin + 4, currentY + 5);

        currentY += boxH + 8;
      }
    });
  }

  // ----------------------------------------------------
  // 6. SENTIMENT ANALYSIS (if sentiment is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("sentiment")) {
    checkPageBreak(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("6. Deep Recursive Sentiment Analysis", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Linguistic sentiment polarity computed across neural syntax tree nodes.", margin, currentY);
    currentY += 4;

    const sentimentRows: string[][] = [];
    nlpData.sentences?.forEach((sent, sIdx) => {
      const excerpt = sent.tokens?.map((t) => t.word).join(" ").slice(0, 85) || "";
      sentimentRows.push([
        `Sentence #${sIdx + 1}`,
        excerpt.length >= 85 ? `${excerpt}...` : excerpt,
        sent.sentiment || "Neutral",
        sent.sentimentValue ? `${sent.sentimentValue} / 4` : "2 / 4",
      ]);
    });

    runAutoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Sentence Index", "Sentence Text Excerpt", "Polarity Classification", "Neural Score"]],
      body: sentimentRows,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // @ts-expect-error autoTable adds lastAutoTable to doc
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // ----------------------------------------------------
  // 7. COREFERENCE RESOLUTION (if coref is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("coref") && nlpData.corefs) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("7. Cross-Sentence Coreference Resolution", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Resolved referential links grouping pronouns and mentions that refer to the same real-world entity.", margin, currentY);
    currentY += 4;

    const corefRows: string[][] = [];
    Object.entries(nlpData.corefs).forEach(([chainId, mentions]) => {
      if (Array.isArray(mentions) && mentions.length > 0) {
        const rep = mentions.find((m) => m.isRepresentativeMention) || mentions[0];
        const allTexts = Array.from(new Set(mentions.map((m) => m.text))).join("; ");
        corefRows.push([
          `Chain #${chainId}`,
          rep.text,
          `${mentions.length} mentions`,
          allTexts.length > 60 ? `${allTexts.slice(0, 60)}...` : allTexts,
        ]);
      }
    });

    if (corefRows.length > 0) {
      runAutoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["Chain ID", "Representative Mention", "Count", "Referent Mentions"]],
        body: corefRows,
        theme: "grid",
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // @ts-expect-error autoTable adds lastAutoTable to doc
      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // ----------------------------------------------------
  // 8. OPEN INFORMATION EXTRACTION (if openie is checked)
  // ----------------------------------------------------
  if (activeAnnotators.includes("openie")) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("8. Open Information Extraction (Fact Triplets)", margin, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Extracted structured Subject-Relation-Object assertion propositions.", margin, currentY);
    currentY += 4;

    const tripletRows: string[][] = [];
    nlpData.sentences?.forEach((sent) => {
      sent.openie?.forEach((trip) => {
        tripletRows.push([
          `${tripletRows.length + 1}`,
          trip.subject,
          trip.relation,
          trip.object,
        ]);
      });
    });

    if (tripletRows.length > 0) {
      runAutoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [["#", "Subject", "Relation (Predicate)", "Object"]],
        body: tripletRows.slice(0, 50),
        theme: "grid",
        headStyles: { fillColor: [236, 72, 153], textColor: 255, fontSize: 8, fontStyle: "bold" },
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      // @ts-expect-error autoTable adds lastAutoTable to doc
      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // ----------------------------------------------------
  // ADD HEADERS AND FOOTERS TO ALL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Top subtle bar
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 10, pageWidth - margin, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Textra NLP Studio &bull; Linguistic Annotation Report", margin, 8);

    // Bottom footer
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text(
      `Generated by Textra NLP Platform  &bull;  Confidential  &bull;  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: "center" }
    );
  }

  // Trigger browser download
  doc.save(fileName);
}
