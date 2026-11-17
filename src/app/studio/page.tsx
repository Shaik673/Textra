"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/studio/Header";
import { TextInput } from "@/components/studio/TextInput";
import { PosVisualizer } from "@/components/studio/PosVisualizer";
import { NerVisualizer } from "@/components/studio/NerVisualizer";
import { SentimentVisualizer } from "@/components/studio/SentimentVisualizer";
import { DependencyVisualizer } from "@/components/studio/DependencyVisualizer";
import { ParseTreeVisualizer } from "@/components/studio/ParseTreeVisualizer";
import { CorefVisualizer } from "@/components/studio/CorefVisualizer";
import { OpenIeVisualizer } from "@/components/studio/OpenIeVisualizer";
import { JsonViewer } from "@/components/studio/JsonViewer";
import { Footer } from "@/components/layout/Footer";
import { CoreNLPResponse } from "@/types/corenlp";
import {
  Tag,
  Smile,
  ShieldCheck,
  GitFork,
  Network,
  Users,
  Share2,
  FileCode,
  AlertTriangle,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function StudioPage() {
  // Empty text initially - no output should display unless user submits text
  const [text, setText] = useState<string>("");
  // All annotation boxes remain unchecked initially unless user checks them
  const [annotators, setAnnotators] = useState<string[]>([]);
  const [language, setLanguage] = useState<string>("en");

  const [serverStatus, setServerStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [latencyMs, setLatencyMs] = useState<number | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nlpData, setNlpData] = useState<CoreNLPResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "pos" | "ner" | "sentiment" | "depparse" | "parse" | "coref" | "openie" | "json"
  >("pos");

  // Check server health
  const checkStatus = useCallback(async () => {
    setServerStatus("checking");
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      if (res.ok && data.online) {
        setServerStatus("connected");
        setLatencyMs(data.latencyMs);
      } else {
        setServerStatus("offline");
      }
    } catch {
      setServerStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Run CoreNLP / Python annotation
  const runAnnotation = async () => {
    if (!text.trim()) {
      setError("Please enter or paste text to annotate.");
      return;
    }

    if (annotators.length === 0) {
      setError("Please check at least one pipeline annotation checkbox above (e.g. POS, NER, Parse Tree) before running analysis.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/annotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          annotators,
          pipelineLanguage: language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Annotation failed");
      }

      setNlpData(data);

      // Auto-switch to the first selected annotator's tab if current tab is not in annotators
      if (annotators.length > 0 && !annotators.includes(activeTab) && activeTab !== "json") {
        const firstSelected = annotators[0];
        if (["pos", "ner", "sentiment", "depparse", "parse", "coref", "openie"].includes(firstSelected)) {
          setActiveTab(firstSelected as typeof activeTab);
        }
      }

      // Record activity in MongoDB Atlas
      const totalTokens = (data.sentences || []).reduce(
        (acc: number, s: { tokens?: unknown[] }) => acc + (s.tokens?.length || 0),
        0
      );
      const reqDuration = Date.now() - startTime;

      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textSnippet: text.slice(0, 150),
          annotators,
          tokensCount: totalTokens,
          dominantSentiment: data.sentences?.[0]?.sentiment || "Neutral",
          latencyMs: reqDuration,
          status: "Completed",
        }),
      }).catch((err) => console.warn("Could not record activity to MongoDB:", err));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute annotation";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload & extract file
  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.details || data.error || "File upload failed");
    }

    if (data.text) {
      setText(data.text);
    }
  };

  const toggleAnnotator = (ann: string) => {
    if (annotators.includes(ann)) {
      setAnnotators(annotators.filter((a) => a !== ann));
    } else {
      setAnnotators([...annotators, ann]);
    }
  };

  const selectAllAnnotators = () => {
    setAnnotators([
      "pos",
      "lemma",
      "ner",
      "sentiment",
      "depparse",
      "parse",
      "coref",
      "openie",
    ]);
  };

  const resetAnnotators = () => {
    // Unchecks all boxes
    setAnnotators([]);
  };

  const sentences = nlpData?.sentences || [];
  const totalTokens = sentences.reduce((acc, s) => acc + (s.tokens?.length || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <Header
        serverStatus={serverStatus}
        latencyMs={latencyMs}
        onRefreshStatus={checkStatus}
        selectedLanguage={language}
        onSelectLanguage={setLanguage}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Intro Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-zinc-900 p-6 text-white shadow-lg">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Stanford NLP Studio Workspace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Natural Language Processing Studio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Analyze text using the integrated Stanford NLP suite: select your annotations, input custom text, and generate real-time interactive syntax trees, parts of speech, named entities, and sentiment analysis.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/20 to-transparent pointer-events-none" />
        </div>

        {/* Input & Control Section */}
        <TextInput
          text={text}
          onChangeText={setText}
          annotators={annotators}
          onToggleAnnotator={toggleAnnotator}
          onSelectAllAnnotators={selectAllAnnotators}
          onResetAnnotators={resetAnnotators}
          onRunAnnotation={runAnnotation}
          isLoading={isLoading}
          onUploadFile={handleUploadFile}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold">Annotation Notice</div>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-mono">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Initial Empty State - Shown when user has not run text yet */}
        {!nlpData && !isLoading && (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <Layers className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Ready for Text Analysis
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Enter your text in the workspace above, check the annotations you want to extract, and click <strong className="text-zinc-700 dark:text-zinc-300">Run Analysis</strong>.
              </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2 text-left">
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-2xs space-y-1">
                <div className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  POS & Lemmas
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Penn Treebank grammatical tags and canonical root word forms.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-2xs space-y-1">
                <div className="text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Named Entities
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Detects People, Organizations, Locations, Numbers, and Dates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-2xs space-y-1">
                <div className="text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5" />
                  Constituency Tree
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Hierarchical phrase structure tree with interactive glowing line edges.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-2xs space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5" />
                  Sentiment Polarity
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Recursive deep neural sentiment distribution from Negative to Positive.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Outcomes & Visualization Room - Shown only after user executes analysis */}
        {nlpData && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Summary Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Sentences</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {sentences.length}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Total Tokens</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {totalTokens}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Dominant Sentiment</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {sentences[0]?.sentiment || "Neutral"}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Coreference Clusters</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                  {Object.keys(nlpData.corefs || {}).length}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-px">
                {[
                  { id: "pos", label: "POS & Lemmas", icon: Tag },
                  { id: "ner", label: "Named Entities", icon: ShieldCheck },
                  { id: "depparse", label: "Dependency Arcs", icon: GitFork },
                  { id: "parse", label: "Parse Tree", icon: Network },
                  { id: "sentiment", label: "Sentiment", icon: Smile },
                  { id: "coref", label: "Coreference", icon: Users },
                  { id: "openie", label: "Open IE Facts", icon: Share2 },
                  { id: "json", label: "Raw JSON AST", icon: FileCode },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                        active
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                          : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visualizer Panels */}
            <div className="pt-2">
              {activeTab === "pos" && <PosVisualizer data={nlpData} />}
              {activeTab === "ner" && <NerVisualizer data={nlpData} />}
              {activeTab === "sentiment" && <SentimentVisualizer data={nlpData} />}
              {activeTab === "depparse" && <DependencyVisualizer data={nlpData} />}
              {activeTab === "parse" && <ParseTreeVisualizer data={nlpData} />}
              {activeTab === "coref" && <CorefVisualizer data={nlpData} />}
              {activeTab === "openie" && <OpenIeVisualizer data={nlpData} />}
              {activeTab === "json" && <JsonViewer data={nlpData} />}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
