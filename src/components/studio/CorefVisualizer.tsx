"use client";

import React, { useState } from "react";
import { CoreNLPResponse, CorefMention } from "@/types/corenlp";
import { Link2, Users, Tag, CheckCircle2 } from "lucide-react";

interface CorefVisualizerProps {
  data: CoreNLPResponse;
}

const CLUSTER_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-600" },
  { bg: "bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-600" },
  { bg: "bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", badge: "bg-purple-600" },
  { bg: "bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-600" },
  { bg: "bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", badge: "bg-rose-600" },
  { bg: "bg-cyan-100 dark:bg-cyan-950/70 border-cyan-300 dark:border-cyan-800", text: "text-cyan-700 dark:text-cyan-300", badge: "bg-cyan-600" },
  { bg: "bg-fuchsia-100 dark:bg-fuchsia-950/70 border-fuchsia-300 dark:border-fuchsia-800", text: "text-fuchsia-700 dark:text-fuchsia-300", badge: "bg-fuchsia-600" },
];

export function CorefVisualizer({ data }: CorefVisualizerProps) {
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);

  const rawCorefs = data?.corefs || {};
  const clusterIds = Object.keys(rawCorefs);

  if (clusterIds.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
        No coreference chains resolved. Coreference requires multi-mention text with pronouns or repeated entity references (e.g. &ldquo;Elon Musk founded SpaceX. He said that his goal...&rdquo;).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clusters List */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
          Resolved Coreference Clusters ({clusterIds.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusterIds.map((cId, idx) => {
            const mentions = rawCorefs[cId] || [];
            const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
            const repMention = mentions.find((m) => m.isRepresentativeMention) || mentions[0];
            const isSelected = activeClusterId === cId;

            return (
              <div
                key={cId}
                onClick={() => setActiveClusterId(isSelected ? null : cId)}
                className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${color.bg} ${
                  isSelected ? "ring-2 ring-indigo-500/50 scale-[1.01]" : "hover:border-indigo-400"
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.badge}`} />
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Entity #{cId}: &ldquo;{repMention?.text}&rdquo;
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-500">
                    {mentions.length} mentions
                  </span>
                </div>

                <div className="pt-3 space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-500">
                    Mentions in text:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mentions.map((m, mIdx) => (
                      <span
                        key={mIdx}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium bg-white dark:bg-zinc-800 ${
                          m.isRepresentativeMention
                            ? "border-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {m.text}
                        <span className="text-[9px] text-zinc-400 ml-1">
                          (Sent {m.sentNum})
                        </span>
                      </span>
                    ))}
                  </div>

                  {repMention && (
                    <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-zinc-500">
                      {repMention.gender && repMention.gender !== "UNKNOWN" && (
                        <span>Gender: <strong>{repMention.gender}</strong></span>
                      )}
                      {repMention.number && repMention.number !== "UNKNOWN" && (
                        <span>Number: <strong>{repMention.number}</strong></span>
                      )}
                      {repMention.animacy && repMention.animacy !== "UNKNOWN" && (
                        <span>Animacy: <strong>{repMention.animacy}</strong></span>
                      )}
                    </div>
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
