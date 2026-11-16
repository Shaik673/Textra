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
} from "lucide-react";

export default function StudioPage() {
  const [text, setText] = useState<string>(
    "The quick brown fox jumped over the lazy dog. Barack Obama was born in Hawaii."
  );
  const [annotators, setAnnotators] = useState<string[]>([
    "pos",
    "lemma",
    "ner",
    "sentiment",
    "depparse",
    "parse",
    "coref",
    "openie",
  ]);
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

  // Run CoreNLP annotation
  const runAnnotation = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

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
    setAnnotators(["pos", "lemma", "ner", "depparse", "sentiment"]);
  };

  // Run initial annotation when server becomes connected
  useEffect(() => {
    if (serverStatus === "connected" && !nlpData && !isLoading) {
      runAnnotation();
    }
  }, [serverStatus]);

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
              CoreNLP Studio Workspace
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Natural Language Processing Studio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Analyze text using the integrated Stanford CoreNLP suite: parts-of-speech, named entity recognition, Universal Dependencies, syntactic constituency trees, deep recursive sentiment, and semantic relation triplets.
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
              <div className="text-sm font-bold">Annotation Request Failed</div>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-mono">
                {error}
              </p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                Tip: Ensure StanfordCoreNLPServer is listening at port 9000 with the required model jars loaded.
              </p>
            </div>
          </div>
        )}

        {/* Outcomes & Visualization Room */}
        {nlpData && (
          <div className="space-y-6">
            {/* Summary Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Sentences</div>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {sentences.length}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                <div className="text-xs text-zinc-500 font-medium">Total Tokens</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
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
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Object.keys(nlpData.corefs || {}).length}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <nav className="flex flex-wrap gap-2 -mb-px">
                {[
                  { id: "pos", label: "Parts-of-Speech & Lemmas", icon: Tag },
                  { id: "ner", label: "Named Entities (NER)", icon: ShieldCheck },
                  { id: "sentiment", label: "Sentiment", icon: Smile },
                  { id: "depparse", label: "Dependency Parse", icon: GitFork },
                  { id: "parse", label: "Constituency Tree", icon: Network },
                  { id: "coref", label: "Coreference", icon: Users },
                  { id: "openie", label: "Open IE Relations", icon: Share2 },
                  { id: "json", label: "Raw JSON", icon: FileCode },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition-all ${
                        isActive
                          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                          : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Active Visualization Container */}
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
    </div>
  );
}
