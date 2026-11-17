"use client";

import React, { useState, useMemo } from "react";
import { CoreNLPResponse, ParseTreeNode } from "@/types/corenlp";
import { parsePennTreebank } from "@/lib/parseTree";
import {
  Network,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Code,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Palette,
} from "lucide-react";

interface ParseTreeVisualizerProps {
  data: CoreNLPResponse;
}

const PHRASE_TAG_DEFINITIONS: Record<string, { title: string; desc: string; category: string }> = {
  ROOT: { title: "Root Node", desc: "Topmost node governing the entire sentence clause", category: "Clause" },
  S: { title: "Simple Declarative Clause", desc: "Standard subject-predicate sentence structure", category: "Clause" },
  SBAR: { title: "Subordinate Clause", desc: "Clause introduced by a subordinating conjunction", category: "Clause" },
  SINV: { title: "Inverted Clause", desc: "Declarative sentence with inverted subject-verb order", category: "Clause" },
  SQ: { title: "Question Clause", desc: "Inverted yes/no or auxiliary question clause", category: "Clause" },
  NP: { title: "Noun Phrase", desc: "Phrase headed by a noun or pronoun acting as subject, object, or complement", category: "Phrase" },
  VP: { title: "Verb Phrase", desc: "Phrase headed by a finite or non-finite verb with its complements", category: "Phrase" },
  PP: { title: "Prepositional Phrase", desc: "Phrase headed by a preposition followed by a noun phrase object", category: "Phrase" },
  ADJP: { title: "Adjective Phrase", desc: "Phrase headed by an adjective modifying a noun", category: "Phrase" },
  ADVP: { title: "Adverb Phrase", desc: "Phrase headed by an adverb modifying a verb, adjective, or clause", category: "Phrase" },
  PRT: { title: "Particle Phrase", desc: "Grammatical particle (e.g. phrasal verb particle)", category: "Phrase" },
  QP: { title: "Quantifier Phrase", desc: "Complex number or quantity phrase", category: "Phrase" },
  WHNP: { title: "Wh-Noun Phrase", desc: "Noun phrase containing who, whom, what, or which", category: "Wh-Phrase" },
  WHADVP: { title: "Wh-Adverb Phrase", desc: "Adverb phrase containing where, when, why, or how", category: "Wh-Phrase" },
  WHPP: { title: "Wh-Prepositional Phrase", desc: "Prepositional phrase with a wh-complement", category: "Wh-Phrase" },
  CONJP: { title: "Conjunction Phrase", desc: "Multi-word conjunction phrase (e.g. 'as well as')", category: "Phrase" },
  FRAG: { title: "Sentence Fragment", desc: "Incomplete phrase functioning as a sentence", category: "Clause" },
  INTJ: { title: "Interjection", desc: "Exclamation or conversational particle", category: "Misc" },
};

type TreeTheme = "neon" | "modern" | "classic";

interface TreeNodeProps {
  node: ParseTreeNode;
  theme: TreeTheme;
  hoveredId: string | null;
  onHover: (id: string | null, node: ParseTreeNode | null) => void;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
  isParentHovered?: boolean;
}

// Collect all text from a subtree
function getNodeTextSpan(node: ParseTreeNode): string {
  if (node.word) return node.word;
  if (!node.children || node.children.length === 0) return "";
  return node.children.map(getNodeTextSpan).join(" ");
}

function VisualTreeNode({
  node,
  theme,
  hoveredId,
  onHover,
  collapsedIds,
  onToggleCollapse,
  isParentHovered = false,
}: TreeNodeProps) {
  const isLeaf = !node.children || node.children.length === 0;
  const isCollapsed = collapsedIds.has(node.id);
  const isDirectlyHovered = hoveredId === node.id;
  const isHighlighted = isDirectlyHovered || isParentHovered;

  const phraseMeta = PHRASE_TAG_DEFINITIONS[node.label];

  // Visual styling depending on node category & theme
  const getBadgeStyle = (label: string) => {
    if (theme === "neon") {
      if (label === "ROOT" || label === "S") {
        return isHighlighted
          ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.8)] scale-105"
          : "bg-purple-950/80 text-purple-300 border-purple-800 hover:border-purple-500";
      }
      if (label.startsWith("NP")) {
        return isHighlighted
          ? "bg-cyan-500 text-white border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-105"
          : "bg-cyan-950/80 text-cyan-300 border-cyan-800 hover:border-cyan-500";
      }
      if (label.startsWith("VP")) {
        return isHighlighted
          ? "bg-emerald-500 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-105"
          : "bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:border-emerald-500";
      }
      if (label.startsWith("PP")) {
        return isHighlighted
          ? "bg-amber-500 text-white border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105"
          : "bg-amber-950/80 text-amber-300 border-amber-800 hover:border-amber-500";
      }
      return isHighlighted
        ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)] scale-105"
        : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-500";
    }

    // Modern & Classic styles
    if (label === "ROOT" || label === "S") {
      return isHighlighted
        ? "bg-purple-600 text-white border-purple-500 shadow-md scale-105 ring-2 ring-purple-400/40"
        : "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800";
    }
    if (label.startsWith("NP")) {
      return isHighlighted
        ? "bg-blue-600 text-white border-blue-500 shadow-md scale-105 ring-2 ring-blue-400/40"
        : "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
    if (label.startsWith("VP")) {
      return isHighlighted
        ? "bg-emerald-600 text-white border-emerald-500 shadow-md scale-105 ring-2 ring-emerald-400/40"
        : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
    }
    if (label.startsWith("PP")) {
      return isHighlighted
        ? "bg-amber-600 text-white border-amber-500 shadow-md scale-105 ring-2 ring-amber-400/40"
        : "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
    return isHighlighted
      ? "bg-indigo-600 text-white border-indigo-500 shadow-md scale-105 ring-2 ring-indigo-400/40"
      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700";
  };

  const lineEdgeColor = isHighlighted
    ? theme === "neon"
      ? "border-cyan-400 dark:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
      : "border-indigo-500 dark:border-indigo-400"
    : "border-zinc-300 dark:border-zinc-700";

  if (isLeaf) {
    return (
      <div
        className="flex flex-col items-center mx-1 my-1 transition-all duration-200"
        onMouseEnter={() => onHover(node.id, node)}
        onMouseLeave={() => onHover(null, null)}
      >
        {/* Leaf grammatical POS tag badge */}
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border transition-all ${getBadgeStyle(
            node.label
          )}`}
          title={`${node.label}: Terminal POS Tag`}
        >
          {node.label}
        </span>

        {/* Vertical connecting line to terminal word */}
        <div className={`w-0.5 h-3.5 border-l-2 ${lineEdgeColor} transition-colors`} />

        {/* Terminal word token */}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition-all ${
            isHighlighted
              ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-400 text-indigo-700 dark:text-indigo-200 font-bold scale-105 shadow-sm"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs"
          }`}
        >
          {node.word}
        </span>
      </div>
    );
  }

  const childCount = node.children.length;

  return (
    <div
      className="flex flex-col items-center mx-1 my-1 transition-all duration-200"
      onMouseEnter={() => onHover(node.id, node)}
      onMouseLeave={() => onHover(null, null)}
    >
      {/* Node Pill with click to collapse */}
      <button
        type="button"
        onClick={() => onToggleCollapse(node.id)}
        className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg border shadow-xs transition-all cursor-pointer ${getBadgeStyle(
          node.label
        )}`}
        title={phraseMeta ? `${phraseMeta.title}: ${phraseMeta.desc}` : `${node.label} Phrase`}
      >
        <span>{node.label}</span>
        {isCollapsed && (
          <span className="text-[9px] px-1 rounded bg-black/20 dark:bg-white/20 font-sans">
            +{childCount}
          </span>
        )}
      </button>

      {/* Hierarchical Connecting Line Edges */}
      {!isCollapsed && childCount > 0 && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical stem dropping down from parent node */}
          <div className={`w-0.5 h-3.5 border-l-2 ${lineEdgeColor} transition-colors`} />

          {childCount === 1 ? (
            /* Single child straight branch */
            <div className="flex items-start justify-center">
              <VisualTreeNode
                node={node.children[0]}
                theme={theme}
                hoveredId={hoveredId}
                onHover={onHover}
                collapsedIds={collapsedIds}
                onToggleCollapse={onToggleCollapse}
                isParentHovered={isHighlighted}
              />
            </div>
          ) : (
            /* Multi-child branch with horizontal bridge and drop lines */
            <div className="flex flex-col items-center w-full">
              <div className="flex items-start justify-center w-full px-2">
                {node.children.map((child, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === childCount - 1;

                  return (
                    <div key={child.id} className="flex flex-col items-center relative flex-1">
                      {/* Horizontal connector line span */}
                      <div
                        className={`absolute top-0 h-0.5 border-t-2 ${lineEdgeColor} transition-colors ${
                          isFirst
                            ? "left-1/2 right-0"
                            : isLast
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                        }`}
                      />

                      {/* Vertical connector drop line down to this child */}
                      <div className={`w-0.5 h-3.5 border-l-2 ${lineEdgeColor} transition-colors relative z-10`} />

                      {/* Recursive child tree */}
                      <VisualTreeNode
                        node={child}
                        theme={theme}
                        hoveredId={hoveredId}
                        onHover={onHover}
                        collapsedIds={collapsedIds}
                        onToggleCollapse={onToggleCollapse}
                        isParentHovered={isHighlighted}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ParseTreeVisualizer({ data }: ParseTreeVisualizerProps) {
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");
  const [theme, setTheme] = useState<TreeTheme>("neon");
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ParseTreeNode | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

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

  const handleToggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedIds(new Set());

  const hoveredMeta = hoveredNode ? PHRASE_TAG_DEFINITIONS[hoveredNode.label] : null;
  const hoveredTextSpan = hoveredNode ? getNodeTextSpan(hoveredNode) : "";

  if (!currentSentence || !parseString) {
    return (
      <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
        No constituency parse available. Ensure the &ldquo;parse&rdquo; annotator checkbox is enabled in Studio.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        {/* Sentence selector */}
        {sentences.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-500">Sentence:</span>
            <div className="flex gap-1">
              {sentences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSentenceIdx(idx);
                    setCollapsedIds(new Set());
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedSentenceIdx === idx
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300 hover:border-indigo-400"
                  }`}
                >
                  Sentence {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Theme and Zoom Controls */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as TreeTheme)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="neon">Neon Glow Edges</option>
              <option value="modern">Modern Rounded</option>
              <option value="classic">Academic Clean</option>
            </select>
          </div>

          {/* Zoom In / Out */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1 text-xs">
            <button
              onClick={() => setZoom(Math.max(60, zoom - 15))}
              className="p-1 hover:text-indigo-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-zinc-500 px-1">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 15))}
              className="p-1 hover:text-indigo-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 hover:text-indigo-600 transition-colors text-[10px]"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Expand all button */}
          <button
            onClick={expandAll}
            className="text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 transition-all"
          >
            Expand All
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("tree")}
              className={`text-xs px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "tree"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Visual Tree
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`text-xs px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "raw"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 border text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Penn Treebank
            </button>
          </div>
        </div>
      </div>

      {/* Live Node Hover Insight Card */}
      {hoveredNode && (
        <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-md shadow-indigo-600/30">
              {hoveredNode.label}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {hoveredMeta?.title || `${hoveredNode.label} Node`}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  Depth: {hoveredNode.depth}
                </span>
                {hoveredNode.word && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Terminal Word
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                {hoveredMeta?.desc || "Syntactic grammatical constituent in Penn Treebank hierarchy."}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
              Subtree Covered Span
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300 max-w-xs truncate inline-block">
              &ldquo;{hoveredTextSpan}&rdquo;
            </span>
          </div>
        </div>
      )}

      {/* Main Canvas View */}
      {viewMode === "tree" ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Hierarchical Phrase Structure Tree &bull; Click any node to collapse/expand
            </span>
            <span className="text-[11px] text-zinc-400">
              Hover over nodes to trace syntactic branch edges
            </span>
          </div>

          <div
            className={`overflow-x-auto pb-8 pt-6 flex justify-center rounded-2xl border transition-all p-6 min-h-[380px] ${
              theme === "neon"
                ? "bg-zinc-950/90 border-zinc-800 shadow-inner"
                : "bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/80"
            }`}
          >
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
            >
              {treeRoot ? (
                <VisualTreeNode
                  node={treeRoot}
                  theme={theme}
                  hoveredId={hoveredNodeId}
                  onHover={(id, n) => {
                    setHoveredNodeId(id);
                    setHoveredNode(n);
                  }}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={handleToggleCollapse}
                />
              ) : (
                <div className="text-zinc-400 text-xs">Failed to parse tree representation.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Raw Penn Treebank S-Expression
            </span>
            <button
              onClick={handleCopyRaw}
              className="text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
            {parseString}
          </pre>
        </div>
      )}
    </div>
  );
}
