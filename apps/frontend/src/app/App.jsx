import {
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
import { playVoicePreview } from "../services/voicePreview.js";

export default function App() {
  const [selectedId, setSelectedId] = useState(templates[0].id);
  const [script, setScript] = useState(templates[0].prompt);
  const [language, setLanguage] = useState("Uzbek");
  const [voice, setVoice] = useState("Casual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("Ready for preview");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [selectedId]
  );

  const wordCount = countWords(script);
  const estimatedSeconds = estimateReadingSeconds(wordCount);

  function chooseTemplate(template) {
    setSelectedId(template.id);
    setScript(template.prompt);
    setVoice(template.tone);
    setResult("Template loaded");
    setProgress(0);
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
          <a className="nav-item active" href="#templates" aria-label="Templates">
            <Library size={18} aria-hidden="true" />
          </a>
          <a className="nav-item" href="#script" aria-label="Script">
            <Captions size={18} aria-hidden="true" />
          </a>
          <a className="nav-item" href="#voice" aria-label="Voice">
            <Mic2 size={18} aria-hidden="true" />
          </a>
          <a className="nav-item" href="#settings" aria-label="Settings">
            <Settings2 size={18} aria-hidden="true" />
          </a>
        </nav>

        <button className="icon-button" aria-label="Create new template">
          <Plus size={18} aria-hidden="true" />
        </button>
      </aside>

      <section className="workspace">
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

        <div className="main-grid">
          <TemplateFeed
            templates={templates}
            selectedId={selectedId}
            script={script}
            onChooseTemplate={chooseTemplate}
          />
          <PhonePreview selectedTemplate={selectedTemplate} script={script} onPlayVoice={playVoice} />
          <ScriptEditor
            script={script}
            language={language}
            voice={voice}
            result={result}
            progress={progress}
            wordCount={wordCount}
            estimatedSeconds={estimatedSeconds}
            isGenerating={isGenerating}
            onScriptChange={setScript}
            onLanguageChange={setLanguage}
            onVoiceChange={setVoice}
            onPlayVoice={playVoice}
            onGeneratePreview={generatePreview}
          />
        </div>
      </section>
    </main>
  );
}
