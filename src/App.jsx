import {
  BadgeCheck,
  Captions,
  ChevronRight,
  Clapperboard,
  Download,
  Gauge,
  Languages,
  Library,
  Mic2,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  UserRound,
  Volume2,
  Wand2,
} from "lucide-react";
import React, { useMemo, useState } from "react";

const templates = [
  {
    id: "instagram-dz7gcvtfocc",
    title: "Instagram template 01",
    tone: "Confident",
    length: "51s",
    mediaType: "video",
    media: "/assets/templates/instagram-dz7gcvtfocc.mp4",
    poster: "/assets/templates/instagram-dz7gcvtfocc-poster.jpg",
    sourceUrl: "https://www.instagram.com/p/DZ7GcVTFOcc/",
    prompt: "Bugun sizga bitta oddiy fikrni aytaman: natija olish uchun avval aniq template tanlang.",
  },
  {
    id: "founder",
    title: "Founder pitch",
    tone: "Confident",
    length: "18s",
    mediaType: "image",
    media: "/assets/template-founder.svg",
    prompt: "Men bugun sizga oddiy, lekin foydali yechimni ko'rsataman.",
  },
  {
    id: "coach",
    title: "Coach lesson",
    tone: "Casual",
    length: "22s",
    mediaType: "image",
    media: "/assets/template-coach.svg",
    prompt: "Bugungi mini dars: boshlash qiyin bo'lsa, vazifani kichraytir.",
  },
  {
    id: "product",
    title: "Product demo",
    tone: "Confident",
    length: "16s",
    mediaType: "image",
    media: "/assets/template-product.svg",
    prompt: "Bu video sizning mahsulotingizni 15 soniyada tushuntirib beradi.",
  },
  {
    id: "explainer",
    title: "Quick explainer",
    tone: "Casual",
    length: "20s",
    mediaType: "image",
    media: "/assets/template-explainer.svg",
    prompt: "Avval muammoni ayting, keyin yechimni bitta misol bilan ko'rsating.",
  },
];

const languages = ["Uzbek", "English"];
const voices = ["Casual", "Confident"];

function TemplateMedia({ template }) {
  if (template.mediaType === "video") {
    return (
      <video
        src={template.media}
        poster={template.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={`${template.title} template video`}
      />
    );
  }

  return <img src={template.media} alt="" />;
}

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

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(8, Math.round(wordCount / 2.5));

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

    const stages = [
      [42, "Replacing template captions"],
      [68, "Queuing voice preview"],
      [88, "Rendering camera-front preview"],
      [100, "Preview ready"],
    ];

    stages.forEach(([nextProgress, label], index) => {
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
    if (!("speechSynthesis" in window)) {
      setResult("Browser voice preview is unavailable");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = language === "Uzbek" ? "uz-UZ" : "en-US";
    utterance.rate = voice === "Confident" ? 0.96 : 1.04;
    utterance.pitch = voice === "Confident" ? 0.92 : 1.05;
    window.speechSynthesis.speak(utterance);
    setResult("Playing voice preview");
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
          <section className="template-column" id="templates" aria-label="Templates">
            <div className="section-heading">
              <div>
                <h1>Templates</h1>
                <p>Camera front clips with one person facing the viewer.</p>
              </div>
              <button className="ghost-button" type="button">
                <Sparkles size={17} aria-hidden="true" />
                New
              </button>
            </div>

            <div className="template-feed">
              {templates.map((template) => (
                <button
                  className={`template-card ${template.id === selectedId ? "selected" : ""}`}
                  key={template.id}
                  onClick={() => chooseTemplate(template)}
                  type="button"
                >
                  <span className="video-frame">
                    <TemplateMedia template={template} />
                    <span className="caption-strip">{script || "Your words appear here"}</span>
                    <span className="play-chip">
                      <Play size={14} fill="currentColor" aria-hidden="true" />
                      {template.length}
                    </span>
                  </span>
                  <span className="template-meta">
                    <span>
                      <strong>{template.title}</strong>
                      <small>Camera front</small>
                    </span>
                    <ChevronRight size={17} aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="preview-column" aria-label="Preview">
            <div className="phone-preview">
              <TemplateMedia template={selectedTemplate} />
              <div className="preview-topline">
                <BadgeCheck size={16} aria-hidden="true" />
                <span>{selectedTemplate.title}</span>
              </div>
              <div className="preview-captions">
                {script || "Write your script to replace template words."}
              </div>
              <button className="round-play" type="button" onClick={playVoice} aria-label="Play voice preview">
                <Play size={24} fill="currentColor" aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className="editor-panel" id="script" aria-label="Script editor">
            <div className="panel-header">
              <div>
                <h2>Script</h2>
                <p>Replace the template words with your own text.</p>
              </div>
              <span className="status-dot">{result}</span>
            </div>

            <label className="field-label" htmlFor="script-text">
              Text to read
            </label>
            <textarea
              id="script-text"
              value={script}
              onChange={(event) => setScript(event.target.value)}
              maxLength={260}
              placeholder="Write the words this person should say..."
            />

            <div className="stats-row">
              <span>{wordCount} words</span>
              <span>{estimatedSeconds}s estimate</span>
              <span>{260 - script.length} chars left</span>
            </div>

            <div className="control-grid" id="voice">
              <div>
                <label className="field-label">
                  <Languages size={15} aria-hidden="true" />
                  Language
                </label>
                <div className="segmented">
                  {languages.map((item) => (
                    <button
                      className={language === item ? "active" : ""}
                      key={item}
                      onClick={() => setLanguage(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="field-label">
                  <UserRound size={15} aria-hidden="true" />
                  Voice
                </label>
                <div className="segmented">
                  {voices.map((item) => (
                    <button
                      className={voice === item ? "active" : ""}
                      key={item}
                      onClick={() => setVoice(item)}
                      type="button"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="progress-box">
              <div className="progress-line">
                <span>{result}</span>
                <strong>{progress}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="action-row">
              <button className="secondary-button" type="button" onClick={playVoice}>
                <Volume2 size={18} aria-hidden="true" />
                Voice
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={generatePreview}
                disabled={isGenerating || script.trim().length < 4}
              >
                <Wand2 size={18} aria-hidden="true" />
                Generate Preview
              </button>
              <button className="icon-button dark" type="button" aria-label="Download preview">
                <Download size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
