"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
  Network,
  Binary,
  Compass,
  Database,
  BarChart3,
  Flame,
  FileCode,
  Globe,
  Share2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Sample NLP interactive presets
const PRESET_DEMOS = [
  {
    title: "World History",
    text: "The Nobel Prize was established in 1895 by Alfred Nobel to honor achievements in science, literature, and peace.",
    tokens: [
      { word: "The", pos: "DT", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "Nobel", pos: "NNP", ner: "ORGANIZATION", color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
      { word: "Prize", pos: "NNP", ner: "ORGANIZATION", color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
      { word: "was", pos: "VBD", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "established", pos: "VBN", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
      { word: "in", pos: "IN", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "1895", pos: "CD", ner: "DATE", color: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
      { word: "by", pos: "IN", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "Alfred", pos: "NNP", ner: "PERSON", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
      { word: "Nobel", pos: "NNP", ner: "PERSON", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
      { word: "in", pos: "IN", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "Stockholm", pos: "NNP", ner: "LOCATION", color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
      { word: ".", pos: ".", ner: "O", color: "bg-slate-800 text-slate-400 border-slate-700" },
    ],
    sentiment: "Positive",
    sentimentScore: 88,
    relations: ["Alfred Nobel established Nobel Prize", "Nobel Prize established in 1895"],
  },
  {
    title: "Quantum Breakthrough",
    text: "Google quantum processors achieved quantum supremacy in Mountain View, solving mathematical simulations at unbelievable speed.",
    tokens: [
      { word: "Google", pos: "NNP", ner: "ORGANIZATION", color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
      { word: "quantum", pos: "JJ", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "processors", pos: "NNS", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
      { word: "achieved", pos: "VBD", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
      { word: "quantum", pos: "JJ", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "supremacy", pos: "NN", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
      { word: "in", pos: "IN", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "Mountain", pos: "NNP", ner: "LOCATION", color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
      { word: "View", pos: "NNP", ner: "LOCATION", color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
      { word: ",", pos: ",", ner: "O", color: "bg-slate-800 text-slate-400 border-slate-700" },
      { word: "solving", pos: "VBG", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
      { word: "simulations", pos: "NNS", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
      { word: "at", pos: "IN", ner: "O", color: "bg-slate-800 text-slate-300 border-slate-700" },
      { word: "speed", pos: "NN", ner: "O", color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
    ],
    sentiment: "Very Positive",
    sentimentScore: 94,
    relations: ["Google achieved quantum supremacy", "simulations solved at speed"],
  },
];

export default function LandingPage() {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const activeDemo = PRESET_DEMOS[selectedDemo];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-800/80 bg-grid-pattern">
          {/* Animated background glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Engine badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-indigo-500/10 animate-float">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Textra Neural Linguistic Engine Online</span>
              <span className="text-slate-500">•</span>
              <span className="text-indigo-400">Universal Dependencies v2</span>
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-tight sm:leading-none">
              Natural Language Processing with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Linguistic Intelligence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              Textra integrates deep neural NLP architectures into a modern reactive suite.
              Analyze syntax trees, universal dependencies, named entities, recursive sentiment,
              and coreference chains with real-time visualizers.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/studio"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-indigo-200" />
                Launch Core Studio Room
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base shadow-lg hover:border-slate-600 transition-all flex items-center justify-center gap-2.5"
              >
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Analytics Dashboard
              </Link>
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900 border border-indigo-500/20 text-indigo-300 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Create Free Account
              </Link>
            </div>

            {/* Counter badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">8+</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Neural Annotators</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mb-1">99.2%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Treebank Precision</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mb-1">4.0 GB</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Java Heap Allocation</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mb-1">&lt;350ms</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Live Pipeline Latency</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE LIVE DEMO PREVIEW ================= */}
        <section className="py-16 md:py-24 bg-slate-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Interactive Model Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
                Experience Textra Neural NLP Output in Real-Time
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Toggle preset sentences below to inspect token annotations, entity tags, sentiment polarity, and extracted relational triplets.
              </p>

              {/* Demo selector buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {PRESET_DEMOS.map((demo, idx) => (
                  <button
                    key={demo.title}
                    onClick={() => setSelectedDemo(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedDemo === idx
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {demo.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Preview Board */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md shadow-2xl">
              {/* Target sentence display */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                  Sample Sentence
                </span>
                <p className="text-base sm:text-lg text-slate-200 font-serif leading-relaxed italic">
                  &ldquo;{activeDemo.text}&rdquo;
                </p>
              </div>

              {/* Tokens & NER tags */}
              <div className="mb-8">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-3">
                  Token Breakdown &amp; Named Entities
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {activeDemo.tokens.map((t, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center transition-transform hover:scale-105 ${t.color}`}
                    >
                      <span className="text-sm font-semibold">{t.word}</span>
                      <div className="flex items-center gap-1.5 text-[10px] opacity-75 font-mono uppercase mt-0.5">
                        <span>{t.pos}</span>
                        {t.ner !== "O" && <span className="font-bold underline">{t.ner}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment & Relations preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Recursive Sentiment
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {activeDemo.sentiment} ({activeDemo.sentimentScore}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${activeDemo.sentimentScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Open Information Extraction Triplets
                  </span>
                  <div className="space-y-1.5">
                    {activeDemo.relations.map((rel, rIdx) => (
                      <div key={rIdx} className="text-xs font-mono text-purple-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        {rel}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA to Studio */}
              <div className="mt-8 text-center pt-6 border-t border-slate-800/80">
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Analyze custom text &amp; upload documents in Core Studio Room
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES GRID ================= */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Platform Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
                End-to-End Linguistic Pipeline
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Textra bundles eight specialized natural language processing layers into a unified reactive canvas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Binary className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">POS &amp; Lemma Morphology</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Penn Treebank morphological tagging and canonical base lemma extraction. Distinguish nouns, verbs, gerunds, and determiners instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-purple-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Named Entity Recognition</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Neural CRF sequence labeling identifying Person, Organization, Location, Date, Time, Money, Percentages, and Numerical quantities.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-pink-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Deep Recursive Sentiment</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recursive Neural Tensor Networks (RNTN) computing compositional sentiment vectors over syntactic parse trees rather than bag-of-words.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <GitBranch className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Universal Arc Dependencies</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive SVG dependency arc visualizer mapping grammatical relations (nsubj, dobj, amod, advmod, prep) with zoom and pan.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Network className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Coreference Resolution</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clusters pronouns, nominal mentions, and proper nouns into unified entity reference chains across multi-sentence documents.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 hover:bg-slate-900/60 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Open Information Extraction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts open-domain relational facts and assertion triplets formatted as (Subject, Relation, Object) directly from raw text.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ARCHITECTURE SECTION ================= */}
        <section className="py-16 md:py-24 bg-slate-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Pipeline Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4">
                How Textra Neural Architecture Operates
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Next.js handles presentation, user authentication, and reactive visualizers, while the dedicated neural engine executes heavy deep-learning inference.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
                <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">01 / INPUT</span>
                <h4 className="text-sm font-bold text-white mb-2">Raw Text or Document</h4>
                <p className="text-xs text-slate-400">
                  User types text or uploads PDF/TXT files in Core Studio.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
                <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">02 / PROXY</span>
                <h4 className="text-sm font-bold text-white mb-2">Next.js API Gateway</h4>
                <p className="text-xs text-slate-400">
                  <code className="text-indigo-300">/api/annotate</code> builds JSON pipeline properties with model fallbacks.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
                <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">03 / INFERENCE</span>
                <h4 className="text-sm font-bold text-white mb-2">Neural NLP Engine</h4>
                <p className="text-xs text-slate-400">
                  Dedicated neural engine processes sentences across 8 annotator phases.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 relative">
                <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">04 / RENDER</span>
                <h4 className="text-sm font-bold text-white mb-2">Reactive Visualizers</h4>
                <p className="text-xs text-slate-400">
                  SVG trees, sentiment gauges, entity badges, and interactive graph arcs render seamlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= AUTH & SECURITY SHOWCASE ================= */}
        <section className="py-16 md:py-20 bg-slate-900/40 border-t border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  Security &amp; Integrations
                </span>
                <h2 className="text-3xl font-bold text-white mt-2 mb-4">
                  Multi-Provider Social SSO &amp; Brevo Email Verification
                </h2>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Log in effortlessly using Google, GitHub, or LinkedIn, or register via verified email.
                  All OTP codes are delivered securely through Brevo SMTP relay with full simulation support in staging environments.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>One-click Social Login (Google, GitHub, LinkedIn)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Brevo (Sendinblue) 6-digit OTP verification delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Safe fallback demo mode when credentials are not yet supplied</span>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Link
                    href="/auth/signup"
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Try Registration Flow
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Visual preview of login options */}
              <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-400">Authentication Portal</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Brevo Ready
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-200 font-medium">Continue with Google</span>
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-200 font-medium">Continue with GitHub</span>
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-200 font-medium">Continue with LinkedIn</span>
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                    <span className="text-xs text-indigo-200 font-medium">Email OTP via Brevo SMTP</span>
                    <span className="text-[10px] text-indigo-400 uppercase font-semibold">Nodemailer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA BANNER ================= */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Analyze Your Documents?
              </h2>
              <p className="text-base text-slate-300 max-w-2xl mx-auto mb-8">
                Launch the Textra Core Studio Room now to run full neural pipelines on your sentences, paragraphs, or uploaded datasets.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/studio"
                  className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-all shadow-xl hover:scale-105"
                >
                  Open Core Studio Room
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold border border-slate-700 transition-all"
                >
                  View Activity Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
