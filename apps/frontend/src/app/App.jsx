import {
  ArrowLeft,
  Captions,
  Clapperboard,
  Gauge,
  Library,
  Mic2,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { ScriptEditor } from "../features/editor/components/ScriptEditor.jsx";
import { PhonePreview } from "../features/preview/components/PhonePreview.jsx";
import { templates } from "../features/templates/data/templates.js";
import { TemplateFeed } from "../features/templates/components/TemplateFeed.jsx";
import { previewStages } from "../services/previewGeneration.js";
import { countWords, estimateReadingSeconds } from "../services/scriptMetrics.js";
import { transcribeTemplate } from "../services/apiClient.js";
import { playVoicePreview } from "../services/voicePreview.js";

const detectedLanguageMap = {
  en: "English",
  uz: "Uzbek",
};

export default function App() {
  const [selectedId, setSelectedId] = useState(templates[0].id);
  const [script, setScript] = useState(templates[0].prompt);
  const [view, setView] = useState("templates");
  const [language, setLanguage] = useState("Uzbek");
  const [voice, setVoice] = useState("Casual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("Ready for preview");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [selectedId]
  );

  const wordCount = countWords(script);
  const estimatedSeconds = estimateReadingSeconds(wordCount);

  async function chooseTemplate(template) {
    setSelectedId(template.id);
    setScript(template.prompt);
    setVoice(template.tone);
    setResult("Transcribing template audio");
    setProgress(0);
    setView("editor");

    try {
      setIsTranscribing(true);
      const transcription = await transcribeTemplate(template.id);
      if (transcription.text) {
        setScript(transcription.text.slice(0, 1000));
        if (detectedLanguageMap[transcription.language]) {
          setLanguage(detectedLanguageMap[transcription.language]);
        }
        setResult(
          transcription.language
            ? `Transcribed audio (${transcription.language})`
            : "Transcribed template audio"
        );
      } else {
        setResult("No speech detected in template");
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Template transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  }

  function generatePreview() {
    setIsGenerating(true);
    setResult("Preparing script");
    setProgress(16);

    previewStages.forEach(([nextProgress, label], index) => {
      window.setTimeout(() => {
        setProgress(nextProgress);
        setResult(label);
        if (nextProgress === 100) {
          setIsGenerating(false);
        }
      }, (index + 1) * 520);
    });
  }

  function playVoice() {
    setResult(playVoicePreview({ script, language, voice }));
  }

  return (
    <main className="app-shell">
      <aside className="side-nav" aria-label="Primary">
        <div className="brand-mark">
          <Clapperboard size={22} aria-hidden="true" />
          <span>ClipForge</span>
        </div>

        <nav className="nav-stack">
          <button
            className={`nav-item ${view === "templates" ? "active" : ""}`}
            type="button"
            onClick={() => setView("templates")}
            aria-label="Templates"
          >
            <Library size={18} aria-hidden="true" />
          </button>
          <button
            className={`nav-item ${view === "editor" ? "active" : ""}`}
            type="button"
            onClick={() => setView("editor")}
            aria-label="Script"
          >
            <Captions size={18} aria-hidden="true" />
          </button>
          <button className="nav-item" type="button" aria-label="Voice">
            <Mic2 size={18} aria-hidden="true" />
          </button>
          <button className="nav-item" type="button" aria-label="Settings">
            <Settings2 size={18} aria-hidden="true" />
          </button>
        </nav>

        <button className="icon-button" aria-label="Create new template">
          <Plus size={18} aria-hidden="true" />
        </button>
      </aside>

      <section className={`workspace ${view === "templates" ? "gallery-workspace" : ""}`}>
        {view === "editor" && (
          <header className="topbar">
            <label className="search-control" htmlFor="template-search">
              <Search size={18} aria-hidden="true" />
              <input id="template-search" type="search" placeholder="Search camera front templates" />
            </label>

            <div className="queue-pill">
              <Gauge size={17} aria-hidden="true" />
              <span>Server GPU queue</span>
              <strong>Idle</strong>
            </div>
          </header>
        )}

        {view === "templates" ? (
          <TemplateFeed templates={templates} onChooseTemplate={chooseTemplate} />
        ) : (
          <div className="editor-view">
            <button className="back-button" type="button" onClick={() => setView("templates")}>
              <ArrowLeft size={18} aria-hidden="true" />
              Templates
            </button>
            <PhonePreview selectedTemplate={selectedTemplate} />
            <ScriptEditor
              script={script}
              language={language}
              voice={voice}
              result={result}
              progress={progress}
              wordCount={wordCount}
              estimatedSeconds={estimatedSeconds}
              isGenerating={isGenerating}
              isTranscribing={isTranscribing}
              onScriptChange={setScript}
              onLanguageChange={setLanguage}
              onVoiceChange={setVoice}
              onPlayVoice={playVoice}
              onGeneratePreview={generatePreview}
            />
          </div>
        )}
      </section>
    </main>
  );
}
