"use client";

import React, { useState } from "react";
import { CoreNLPResponse, DependencyRelation } from "@/types/corenlp";
import { DEP_INFO } from "@/lib/tagDescriptions";
import { GitFork, ArrowRight, Eye, Info } from "lucide-react";

interface DependencyVisualizerProps {
  data: CoreNLPResponse;
}

export function DependencyVisualizer({ data }: DependencyVisualizerProps) {
  const [depType, setDepType] = useState<"basic" | "enhanced">("basic");
  const [activeTokenIdx, setActiveTokenIdx] = useState<number | null>(null);
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number>(0);

  const sentences = data?.sentences || [];
  const currentSentence = sentences[selectedSentenceIdx];

  if (!currentSentence) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
        No dependency parsing data available.
      </div>
    );
  }

  const rawDeps: DependencyRelation[] =
    depType === "basic"
      ? currentSentence.basicDependencies || []
      : currentSentence.enhancedPlusPlusDependencies || currentSentence.enhancedDependencies || currentSentence.basicDependencies || [];

  const tokens = currentSentence.tokens || [];

  // Spacing calculations for SVG
  const tokenWidth = 105;
  const startX = 60;
  const baselineY = 220;
  const svgWidth = Math.max(tokens.length * tokenWidth + 120, 800);
  const svgHeight = 280;

  const getTokenX = (idx: number) => {
    // idx is 1-based from engine, 0 is ROOT
    if (idx === 0) return 30;
    return startX + (idx - 1) * tokenWidth + tokenWidth / 2;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        {/* Sentence selector */}
        {sentences.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-500">Sentence:</span>
            <div className="flex gap-1">
              {sentences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSentenceIdx(idx)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedSentenceIdx === idx
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dependency variant toggles */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs font-semibold text-zinc-500">Mode:</span>
          <button
            onClick={() => setDepType("basic")}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
              depType === "basic"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Basic Universal Dependencies
          </button>
          <button
            onClick={() => setDepType("enhanced")}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
              depType === "enhanced"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Enhanced++ Dependencies
          </button>
        </div>
      </div>

      {/* SVG Interactive Arc Visualization */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-indigo-500 rotate-180" />
            Syntactic Dependency Graph (Hover tokens to isolate arcs)
          </h4>
          <span className="text-xs text-zinc-400">
            {rawDeps.length} dependency relations
          </span>
        </div>

        {/* Scrollable Canvas */}
        <div className="overflow-x-auto pb-4 pt-2 border border-zinc-100 dark:border-zinc-800/80 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/40">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="select-none font-sans"
            style={{ minWidth: "100%" }}
          >
            <defs>
              <marker
                id="dep-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
              </marker>
              <marker
                id="dep-arrow-active"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
              </marker>
            </defs>

            {/* Dependency Arcs */}
            {rawDeps.map((dep, dIdx) => {
              const isRoot = dep.governor === 0;
              const gX = getTokenX(dep.governor);
              const dX = getTokenX(dep.dependent);

              const distance = Math.abs(dX - gX);
              const arcHeight = Math.min(Math.max(distance * 0.45, 45), 170);
              const midX = (gX + dX) / 2;
              const topY = baselineY - arcHeight;

              const isActive =
                activeTokenIdx !== null &&
                (dep.governor === activeTokenIdx || dep.dependent === activeTokenIdx);

              const strokeColor = isActive ? "#ec4899" : isRoot ? "#10b981" : "#6366f1";
              const strokeWidth = isActive ? 2.5 : 1.5;
              const opacity = activeTokenIdx === null || isActive ? 1 : 0.2;

              // Arc path
              const pathD = isRoot
                ? `M ${dX} ${baselineY - 25} L ${dX} ${baselineY - 60} Q ${dX} ${baselineY - 80} ${dX - 15} ${baselineY - 80}`
                : `M ${gX} ${baselineY - 25} C ${gX} ${topY}, ${dX} ${topY}, ${dX} ${baselineY - 25}`;

              return (
                <g key={dIdx} style={{ opacity, transition: "all 0.2s ease" }}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={isActive ? "url(#dep-arrow-active)" : "url(#dep-arrow)"}
                  />

                  {/* Arc Label Badge */}
                  <g transform={`translate(${midX}, ${topY + (isRoot ? -10 : 8)})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="16"
                      rx="8"
                      fill={isActive ? "#fdf2f8" : "#eef2ff"}
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      fill={isActive ? "#be185d" : "#4338ca"}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {dep.dep}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Baseline Divider */}
            <line
              x1="20"
              y1={baselineY}
              x2={svgWidth - 20}
              y2={baselineY}
              stroke="#e4e4e7"
              strokeDasharray="4 4"
            />

            {/* Tokens Along the Baseline */}
            {tokens.map((token) => {
              const x = getTokenX(token.index);
              const isHovered = activeTokenIdx === token.index;

              return (
                <g
                  key={token.index}
                  transform={`translate(${x}, ${baselineY + 22})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveTokenIdx(token.index)}
                  onMouseLeave={() => setActiveTokenIdx(null)}
                >
                  {/* Token Word */}
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill={isHovered ? "#4f46e5" : "currentColor"}
                    fontSize="13"
                    fontWeight={isHovered ? "bold" : "600"}
                    className="dark:fill-zinc-100"
                  >
                    {token.word}
                  </text>

                  {/* Token POS Tag */}
                  <rect
                    x="-18"
                    y="8"
                    width="36"
                    height="16"
                    rx="4"
                    fill={isHovered ? "#4f46e5" : "#e0e7ff"}
                    className="dark:fill-zinc-800"
                  />
                  <text
                    x="0"
                    y="20"
                    textAnchor="middle"
                    fill={isHovered ? "#ffffff" : "#4338ca"}
                    fontSize="9"
                    fontWeight="bold"
                    className="dark:fill-indigo-300"
                  >
                    {token.pos}
                  </text>

                  {/* Token Index */}
                  <text
                    x="0"
                    y="36"
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="8"
                    fontWeight="medium"
                  >
                    #{token.index}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Relations Table / List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Extracted Grammatical Dependencies ({rawDeps.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {rawDeps.map((dep, idx) => {
            const isRoot = dep.governor === 0;
            const explanation = DEP_INFO[dep.dep] || dep.dep;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveTokenIdx(dep.dependent)}
                onMouseLeave={() => setActiveTokenIdx(null)}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {isRoot ? "ROOT" : dep.governorGloss}
                  </span>
                  <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80">
                      {dep.dep}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {dep.dependentGloss}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400 italic">
                  {explanation}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
