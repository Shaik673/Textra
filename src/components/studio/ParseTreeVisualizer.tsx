"use client";

import React, { useState, useMemo } from "react";
import { CoreNLPResponse, ParseTreeNode } from "@/types/corenlp";
import { parsePennTreebank } from "@/lib/parseTree";
import { Network, ChevronDown, ChevronRight, Copy, Check, Code } from "lucide-react";

interface ParseTreeVisualizerProps {
  data: CoreNLPResponse;
}

// Tree node component rendered recursively with modern pill badges
function TreeNodeItem({ node }: { node: ParseTreeNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const isLeaf = !node.children || node.children.length === 0;

  // Category styling based on phrase tags
  const getTagStyle = (tag: string) => {
    if (tag === "ROOT" || tag === "S" || tag === "SINV") {
      return "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    }
    if (tag.startsWith("NP")) {
      return "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
    if (tag.startsWith("VP")) {
      return "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    }
    if (tag.startsWith("PP")) {
      return "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
    if (tag.startsWith("ADJP") || tag.startsWith("ADVP")) {
      return "bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800";
    }
    return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
  };

  if (isLeaf) {
    return (
      <div className="flex flex-col items-center mx-1 my-1">
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getTagStyle(
            node.label
          )}`}
        >
          {node.label}
        </span>
        <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
        <span className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs">
          {node.word}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mx-1.5 my-1">
      {/* Node label pill */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-xs transition-all hover:scale-105 ${getTagStyle(
          node.label
        )}`}
      >
        <span>{node.label}</span>
        {node.children.length > 0 && (
          <span className="text-[9px] opacity-70">
            {collapsed ? `+${node.children.length}` : ""}
          </span>
        )}
      </button>

      {/* Children branches */}
      {!collapsed && (
        <>
          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex items-start justify-center border-t border-zinc-300 dark:border-zinc-700 pt-2 px-1">
            {node.children.map((child) => (
              <TreeNodeItem key={child.id} node={child} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ParseTreeVisualizer({ data }: ParseTreeVisualizerProps) {
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");
  const [copied, setCopied] = useState(false);

  const sentences = data?.sentences || [];
  const currentSentence = sentences[selectedSentenceIdx];
  const parseString = currentSentence?.parse || "";

  const treeRoot = useMemo(() => {
    return parsePennTreebank(parseString);
  }, [parseString]);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(parseString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentSentence || !parseString) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
        No constituency parse available. Ensure the &ldquo;parse&rdquo; annotator is enabled.
      </div>
    );
  }

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

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setViewMode("tree")}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === "tree"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Visual Hierarchy Tree
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === "raw"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Penn Treebank String
          </button>
        </div>
      </div>

      {/* Main Canvas View */}
      {viewMode === "tree" ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold uppercase tracking-wider">
              Hierarchical Phrase Structure Tree (Click nodes to collapse/expand)
            </span>
          </div>

          <div className="overflow-x-auto pb-6 pt-4 flex justify-center bg-zinc-50/50 dark:bg-zinc-950/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 p-4 min-h-[300px]">
            {treeRoot ? (
              <TreeNodeItem node={treeRoot} />
            ) : (
              <div className="text-zinc-400 text-xs">Failed to parse tree representation.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Raw Penn Treebank Format
            </span>
            <button
              onClick={handleCopyRaw}
              className="text-xs px-2.5 py-1 rounded-md border flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed">
            {parseString}
          </pre>
        </div>
      )}
    </div>
  );
}
