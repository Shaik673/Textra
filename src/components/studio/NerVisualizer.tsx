"use client";

import React, { useState } from "react";
import { CoreNLPResponse, CoreNLPToken } from "@/types/corenlp";
import { NER_INFO } from "@/lib/tagDescriptions";
import { User, MapPin, Building2, Calendar, DollarSign, Clock, Hash, Tag, Layers } from "lucide-react";

interface NerVisualizerProps {
  data: CoreNLPResponse;
}

interface EntitySpan {
  text: string;
  type: string;
  tokens: CoreNLPToken[];
  sentenceIndex: number;
}

export function NerVisualizer({ data }: NerVisualizerProps) {
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const sentences = data?.sentences || [];

  // Group continuous tokens with the same NER tag into EntitySpans
  const entitySpans: EntitySpan[] = [];
  const entityCounts: Record<string, number> = {};

  sentences.forEach((sentence, sIdx) => {
    let currentSpan: EntitySpan | null = null;

    sentence.tokens.forEach((token) => {
      const ner = token.ner;
      if (ner && ner !== "O") {
        if (currentSpan && currentSpan.type === ner) {
          currentSpan.text += (token.before || " ") + token.word;
          currentSpan.tokens.push(token);
        } else {
          if (currentSpan) {
            entitySpans.push(currentSpan);
            entityCounts[currentSpan.type] = (entityCounts[currentSpan.type] || 0) + 1;
          }
          currentSpan = {
            text: token.word,
            type: ner,
            tokens: [token],
            sentenceIndex: sIdx,
          };
        }
      } else {
        if (currentSpan) {
          entitySpans.push(currentSpan);
          entityCounts[currentSpan.type] = (entityCounts[currentSpan.type] || 0) + 1;
          currentSpan = null;
        }
      }
    });

    if (currentSpan) {
      const finalSpan: EntitySpan = currentSpan;
      entitySpans.push(finalSpan);
      entityCounts[finalSpan.type] = (entityCounts[finalSpan.type] || 0) + 1;
    }
  });

  const availableTypes = Object.keys(entityCounts);

  const getIcon = (type: string) => {
    switch (type) {
      case "PERSON":
        return <User className="w-3.5 h-3.5" />;
      case "LOCATION":
      case "CITY":
      case "COUNTRY":
      case "STATE_OR_PROVINCE":
        return <MapPin className="w-3.5 h-3.5" />;
      case "ORGANIZATION":
        return <Building2 className="w-3.5 h-3.5" />;
      case "DATE":
        return <Calendar className="w-3.5 h-3.5" />;
      case "TIME":
        return <Clock className="w-3.5 h-3.5" />;
      case "MONEY":
        return <DollarSign className="w-3.5 h-3.5" />;
      default:
        return <Tag className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Entity Category Badges */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <button
          onClick={() => setSelectedType("ALL")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            selectedType === "ALL"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          All Entities ({entitySpans.length})
        </button>

        {availableTypes.map((type) => {
          const info = NER_INFO[type] || {
            label: type,
            color: "text-zinc-700 dark:text-zinc-300",
            bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300",
            badge: "bg-zinc-700 text-white",
          };

          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 border ${
                selectedType === type
                  ? "border-indigo-600 ring-2 ring-indigo-500/30 font-semibold"
                  : "border-zinc-200 dark:border-zinc-700 opacity-90 hover:opacity-100"
              } ${info.bg} ${info.color}`}
            >
              {getIcon(type)}
              <span>{info.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${info.badge}`}>
                {entityCounts[type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inline Text View with Entity Highlights */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Document Flow Entity Highlights
        </h4>

        <div className="space-y-3 leading-relaxed text-sm">
          {sentences.map((sentence, sIdx) => (
            <p key={sIdx} className="text-zinc-800 dark:text-zinc-200 leading-8">
              {sentence.tokens.map((token, tIdx) => {
                const ner = token.ner;
                const isEntity = ner && ner !== "O";
                const info = NER_INFO[ner || ""] || {
                  label: ner,
                  color: "text-zinc-700 dark:text-zinc-300",
                  bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300",
                  badge: "bg-zinc-700 text-white",
                };

                const isHighlighted = selectedType === "ALL" || selectedType === ner;

                if (!isEntity) {
                  return (
                    <span key={tIdx} className="text-zinc-700 dark:text-zinc-300">
                      {token.word}{" "}
                    </span>
                  );
                }

                return (
                  <span
                    key={tIdx}
                    className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md border text-xs font-medium transition-all ${
                      info.bg
                    } ${info.color} ${
                      isHighlighted ? "opacity-100 ring-2 ring-indigo-500/20" : "opacity-30"
                    }`}
                  >
                    <span>{token.word}</span>
                    <span
                      className={`text-[9px] uppercase px-1 rounded font-bold tracking-tight ${info.badge}`}
                    >
                      {ner}
                    </span>
                    {" "}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>

      {/* Entity Catalog Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Extracted Entities Catalog ({entitySpans.length})
        </h4>

        {entitySpans.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            No named entities recognized in the input text. Try text containing names of people, cities, companies, or dates.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {entitySpans
              .filter((span) => selectedType === "ALL" || selectedType === span.type)
              .map((span, idx) => {
                const info = NER_INFO[span.type] || {
                  label: span.type,
                  color: "text-zinc-700 dark:text-zinc-300",
                  bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-300",
                  badge: "bg-zinc-700 text-white",
                };

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${info.bg} transition-all shadow-sm`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${info.badge}`}>
                        {getIcon(span.type)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {span.text}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">
                          Sentence {span.sentenceIndex + 1}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${info.badge}`}>
                      {span.type}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
