"use client";

import React from "react";
import { CoreNLPResponse, OpenIERelation } from "@/types/corenlp";
import { Network, ArrowRight, Share2, Layers } from "lucide-react";

interface OpenIeVisualizerProps {
  data: CoreNLPResponse;
}

export function OpenIeVisualizer({ data }: OpenIeVisualizerProps) {
  const sentences = data?.sentences || [];

  // Collect all openie and kbp relations across sentences
  const allRelations: { relation: OpenIERelation; sentenceIdx: number; source: "OpenIE" | "KBP" }[] = [];

  sentences.forEach((s, sIdx) => {
    (s.openie || []).forEach((rel) => {
      allRelations.push({ relation: rel, sentenceIdx: sIdx, source: "OpenIE" });
    });
    (s.kbp || []).forEach((rel) => {
      allRelations.push({ relation: rel, sentenceIdx: sIdx, source: "KBP" });
    });
  });

  if (allRelations.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
        No Open IE or KBP relation triplets extracted from the text. Try text expressing clear subject-predicate assertions (e.g. &ldquo;Google developed the Android operating system for smartphones.&rdquo;).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-indigo-500" />
          Extracted Semantic Triplets ({allRelations.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {allRelations.map((item, idx) => {
          const { relation, sentenceIdx, source } = item;

          return (
            <div
              key={idx}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Subject */}
                <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-semibold">
                  {relation.subject}
                </div>

                {/* Relation arrow */}
                <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
                    {relation.relation}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                {/* Object */}
                <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                  {relation.object}
                </div>
              </div>

              {/* Tag & Sentence */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {source}
                </span>
                <span className="text-xs text-zinc-400">
                  Sent {sentenceIdx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
