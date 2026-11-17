"use client";

import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  GitCommit,
  Copy,
  Check,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Workflow,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { StructuredSummary } from "@/app/api/summarize/route";

interface SummaryVisualizerProps {
  summary: StructuredSummary | null;
  isLoading: boolean;
  onGenerateSummary?: () => void;
}

export function SummaryVisualizer({
  summary,
  isLoading,
  onGenerateSummary,
}: SummaryVisualizerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    const fullText = [
      `# ${summary.title}`,
      "",
      `## Executive Overview`,
      summary.overview,
      "",
      `## Detailed Sections`,
      ...summary.sections.map((s) => `### ${s.heading}\n${s.content}\n`),
      `## Key Takeaways`,
      ...summary.keyPoints.map((pt) => `• ${pt}`),
      "",
      `## Process Flow`,
      ...summary.flowchart.map((st) => `${st.step}. ${st.title}: ${st.detail}`),
      "",
      `## Strategic Takeaway`,
      summary.takeaway,
    ].join("\n");

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-6 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-3 w-64 bg-zinc-100 dark:bg-zinc-850 rounded-md" />
            </div>
          </div>
          <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
        </div>

        <div className="space-y-4">
          <div className="h-20 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
            <div className="h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
          </div>
          <div className="h-28 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
        </div>

        <div className="text-center text-xs text-zinc-400 font-medium pt-2">
          Gemini AI is parsing syntax, synthesizing key themes, and rendering visual process flow...
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Executive Summary Not Yet Generated
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            The AI Summarizer generates paragraph-wise breakdowns, key takeaways, and an interactive process flowchart. Check the <strong className="text-zinc-700 dark:text-zinc-200">Executive Summary</strong> box in the checklist above, or generate it directly now.
          </p>
        </div>

        {onGenerateSummary && (
          <button
            onClick={onGenerateSummary}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Executive Summary Now</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3" />
              Gemini GenAI Synthesis
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Clock className="w-3 h-3" />
              ~{summary.readingTimeMinutes} min read
            </span>
            <span className="text-[11px] text-zinc-400">&bull;</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {summary.wordCount} source words
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {summary.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
            title="Copy formatted summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {onGenerateSummary && (
            <button
              onClick={onGenerateSummary}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer"
              title="Regenerate summary"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
        </div>
      </div>

      {/* Executive Overview Highlight Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/60 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Executive Overview</span>
        </div>
        <p className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
          {summary.overview}
        </p>
      </div>

      {/* Detailed Section Paragraphs (Paragraph-wise with proper headings) */}
      {summary.sections && summary.sections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>Structured Sectional Analysis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-2.5 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                    0{idx + 1}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {section.heading}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Takeaways & Point-Wise Breakdown */}
      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Core Takeaways & Quantitative Findings</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {summary.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Visual Flowchart */}
      {summary.flowchart && summary.flowchart.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
            <Workflow className="w-3.5 h-3.5 text-cyan-500" />
            <span>Sequential Process Flowchart</span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              {summary.flowchart.map((step, idx) => (
                <div key={idx} className="relative flex flex-col">
                  {/* Step Card */}
                  <div className="flex-1 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950/60 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2 hover:border-cyan-400/60 dark:hover:border-cyan-800 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                        STEP 0{step.step || idx + 1}
                      </span>
                      <GitCommit className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {step.title}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>

                  {/* Flow Arrow for Desktop */}
                  {idx < summary.flowchart.length - 1 && (
                    <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center text-zinc-400 shadow-2xs">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Strategic Takeaway / Final Verdict Callout */}
      {summary.takeaway && (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Strategic Takeaway & Actionable Verdict
            </div>
            <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              {summary.takeaway}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
