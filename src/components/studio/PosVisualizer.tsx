"use client";

import React, { useState } from "react";
import { CoreNLPResponse, CoreNLPToken } from "@/types/corenlp";
import { POS_INFO } from "@/lib/tagDescriptions";
import { Info, Filter, Tag } from "lucide-react";

interface PosVisualizerProps {
  data: CoreNLPResponse;
}

export function PosVisualizer({ data }: PosVisualizerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeToken, setActiveToken] = useState<CoreNLPToken | null>(null);

  const categories = ["ALL", "Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Determiner", "Number"];

  const sentences = data?.sentences || [];

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Token Info Card */}
      {activeToken && (
        <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-start justify-between gap-4 transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white font-mono text-sm font-bold">
              {activeToken.pos}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  &ldquo;{activeToken.word}&rdquo;
                </span>
                {activeToken.lemma && (
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    Lemma: <strong className="font-mono">{activeToken.lemma}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {POS_INFO[activeToken.pos || ""]?.label || "Penn Treebank grammatical part-of-speech"}
                {" · "}
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {POS_INFO[activeToken.pos || ""]?.category || "Other"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveToken(null)}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sentences and Tokens Stream */}
      <div className="space-y-6">
        {sentences.map((sentence, sIdx) => (
          <div
            key={sIdx}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                Sentence {sIdx + 1}
              </span>
              <span>{sentence.tokens.length} tokens</span>
            </div>

            {/* Tokens Container */}
            <div className="flex flex-wrap gap-2.5 items-end">
              {sentence.tokens.map((token, tIdx) => {
                const pos = token.pos || "OTHER";
                const info = POS_INFO[pos] || {
                  label: pos,
                  category: "Other",
                  color: "text-zinc-700 dark:text-zinc-300",
                  bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
                };

                const matchesFilter = selectedCategory === "ALL" || info.category === selectedCategory;
                const isSelected = activeToken?.index === token.index && activeToken?.word === token.word;

                return (
                  <div
                    key={tIdx}
                    onClick={() => setActiveToken(token)}
                    className={`inline-flex flex-col items-center cursor-pointer transition-all ${
                      matchesFilter ? "opacity-100 scale-100" : "opacity-30 scale-95"
                    }`}
                  >
                    {/* POS Badge */}
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-t border-t border-x ${info.bg} ${info.color}`}
                    >
                      {pos}
                    </span>

                    {/* Word Box */}
                    <div
                      className={`px-2.5 py-1 rounded-b border text-xs font-medium text-zinc-900 dark:text-zinc-100 transition-all ${
                        isSelected
                          ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      {token.word}
                    </div>

                    {/* Lemma indicator if available */}
                    {token.lemma && token.lemma !== token.word.toLowerCase() && (
                      <span className="text-[9px] text-zinc-400 font-mono mt-0.5">
                        {token.lemma}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
