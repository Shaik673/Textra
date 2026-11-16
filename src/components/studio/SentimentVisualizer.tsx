"use client";

import React from "react";
import { CoreNLPResponse } from "@/types/corenlp";
import { SENTIMENT_COLORS } from "@/lib/tagDescriptions";
import { Smile, Meh, Frown, Sparkles, TrendingUp, BarChart2 } from "lucide-react";

interface SentimentVisualizerProps {
  data: CoreNLPResponse;
}

export function SentimentVisualizer({ data }: SentimentVisualizerProps) {
  const sentences = data?.sentences || [];

  if (sentences.length === 0) {
    return null;
  }

  // Aggregate counts of sentiment labels
  const counts: Record<string, number> = {
    "Very Positive": 0,
    "Positive": 0,
    "Neutral": 0,
    "Negative": 0,
    "Very Negative": 0,
  };

  sentences.forEach((s) => {
    const sent = s.sentiment || "Neutral";
    if (counts[sent] !== undefined) {
      counts[sent]++;
    } else {
      counts[sent] = (counts[sent] || 0) + 1;
    }
  });

  const total = sentences.length;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Very Positive":
      case "Positive":
        return <Smile className="w-5 h-5 text-emerald-500" />;
      case "Negative":
      case "Very Negative":
        return <Frown className="w-5 h-5 text-rose-500" />;
      default:
        return <Meh className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Sentiment */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            Dominant Sentiment
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              {getSentimentIcon(sentences[0]?.sentiment || "Neutral")}
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {sentences[0]?.sentiment || "Neutral"}
              </div>
              <div className="text-xs text-zinc-500">
                Calculated by Stanford Recursive Deep Model
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Distribution Bars */}
        <div className="sm:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
              Sentence Polarity Breakdown ({total} sentences)
            </span>
          </div>

          <div className="space-y-2">
            {(["Very Positive", "Positive", "Neutral", "Negative", "Very Negative"] as const).map((label) => {
              const count = counts[label] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const info = SENTIMENT_COLORS[label] || SENTIMENT_COLORS["Neutral"];

              return (
                <div key={label} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-zinc-600 dark:text-zinc-400 font-medium">
                    {label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${info.bg} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono text-zinc-500 font-medium">
                    {pct}% ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Sentence Breakdown */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Sentence-by-Sentence Sentiment Analysis
        </h4>

        <div className="space-y-3">
          {sentences.map((sentence, sIdx) => {
            const sentiment = sentence.sentiment || "Neutral";
            const info = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS["Neutral"];
            const text = sentence.tokens.map((t) => t.word).join(" ");

            return (
              <div
                key={sIdx}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getSentimentIcon(sentiment)}</div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Sentence {sIdx + 1}
                    </span>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                      &ldquo;{text}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold text-white ${info.bg}`}
                  >
                    {sentiment}
                  </span>
                  {sentence.sentimentValue && (
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      Score: {sentence.sentimentValue}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
