"use client";

import React, { useRef, useState } from "react";
import {
  Play,
  UploadCloud,
  FileText,
  RotateCcw,
  Sparkles,
  CheckSquare,
  Square,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { SAMPLE_TEXTS, SamplePreset } from "@/lib/sampleTexts";

interface TextInputProps {
  text: string;
  onChangeText: (text: string) => void;
  annotators: string[];
  onToggleAnnotator: (ann: string) => void;
  onSelectAllAnnotators: () => void;
  onResetAnnotators: () => void;
  onRunAnnotation: () => void;
  isLoading: boolean;
  onUploadFile: (file: File) => Promise<void>;
}

const AVAILABLE_ANNOTATORS = [
  { id: "pos", label: "Parts-of-Speech", desc: "Penn Treebank grammatical tags" },
  { id: "lemma", label: "Lemmas", desc: "Root / base forms of words" },
  { id: "ner", label: "Named Entities (NER)", desc: "Persons, Locations, Organizations, Dates" },
  { id: "sentiment", label: "Sentiment", desc: "Sentence polarity (Negative to Positive)" },
  { id: "depparse", label: "Dependency Parse", desc: "Syntactic governor-dependent relations" },
  { id: "parse", label: "Constituency Parse", desc: "Full hierarchical phrase structure tree" },
  { id: "coref", label: "Coreference", desc: "Cross-mention and pronoun entity links" },
  { id: "openie", label: "Open IE & Relations", desc: "Semantic relational triplets" },
];

export function TextInput({
  text,
  onChangeText,
  annotators,
  onToggleAnnotator,
  onSelectAllAnnotators,
  onResetAnnotators,
  onRunAnnotation,
  isLoading,
  onUploadFile,
}: TextInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadStatus(`Reading ${file.name}...`);
    try {
      await onUploadFile(file);
      setUploadStatus(`Imported ${file.name} successfully`);
      setTimeout(() => setUploadStatus(null), 3500);
    } catch {
      setUploadStatus(`Error importing ${file.name}`);
      setTimeout(() => setUploadStatus(null), 3500);
    }
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    onChangeText(preset.text);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Top Presets bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Presets
          </label>
          <span className="text-xs text-zinc-400">
            {wordCount} words · {charCount} chars
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_TEXTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-zinc-700 dark:text-zinc-300 font-medium"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <label htmlFor="text-input" className="sr-only">
          Text to annotate
        </label>
        <textarea
          id="text-input"
          name="text"
          aria-label="Text to annotate"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Enter or paste text to annotate, or drag & drop a .txt/.docx file here..."
          rows={4}
          className="w-full text-sm leading-relaxed p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-y min-h-[110px]"
        />

        {/* Clear Button */}
        {text && (
          <button
            onClick={() => onChangeText("")}
            className="absolute top-3 right-3 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
            title="Clear text"
          >
            Clear
          </button>
        )}
      </div>

      {/* File Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-950/20"
        }`}
      >
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file"
          aria-label="Upload document file"
          type="file"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <UploadCloud className="w-4 h-4 text-indigo-500" />
          <span>
            Drop a <strong className="text-zinc-700 dark:text-zinc-200">.pdf (with OCR), .docx, .txt, or .md</strong> file here, or{" "}
            <span className="text-indigo-600 dark:text-indigo-400 underline font-medium">browse</span>
          </span>
          {uploadStatus && (
            <span className="ml-2 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              {uploadStatus}
            </span>
          )}
        </div>
      </div>

      {/* Annotators Selection */}
      <div className="space-y-2.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Pipeline Annotations
          </label>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onSelectAllAnnotators}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Select All
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <button
              onClick={onResetAnnotators}
              className="text-zinc-500 hover:underline cursor-pointer"
            >
              Uncheck All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AVAILABLE_ANNOTATORS.map((ann) => {
            const isSelected = annotators.includes(ann.id);
            return (
              <button
                key={ann.id}
                type="button"
                onClick={() => onToggleAnnotator(ann.id)}
                className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-sm shadow-indigo-500/10"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="mt-0.5">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold leading-tight">{ann.label}</div>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight mt-0.5 line-clamp-1">
                    {ann.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 flex items-center justify-end">
        <button
          onClick={onRunAnnotation}
          disabled={isLoading || !text.trim()}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white shadow-md transition-all ${
            isLoading || !text.trim()
              ? "bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed text-zinc-500"
              : "bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:opacity-95 shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-[0.98]"
          }`}
        >
          {isLoading ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Running NLP Pipeline...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Neural NLP Studio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
