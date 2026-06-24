import {
  ArrowLeft,
  Captions,
  Clapperboard,
  Gauge,
  Library,
  LogOut,
  Mic2,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { AuthPage } from "../features/auth/components/AuthPage.jsx";
import { ScriptEditor } from "../features/editor/components/ScriptEditor.jsx";
import { PhonePreview } from "../features/preview/components/PhonePreview.jsx";
import { TemplateFeed } from "../features/templates/components/TemplateFeed.jsx";
import {
  createGenerationJob,
  createTranscriptionJob,
  getGenerationJob,
  getTranscriptionJob,
  listTemplates,
  login,
  resolveMediaUrl,
} from "../services/apiClient.js";
import { countWords, estimateReadingSeconds } from "../services/scriptMetrics.js";
import { playVoicePreview } from "../services/voicePreview.js";

const detectedLanguageMap = {
  en: "English",
  uz: "Uzbek",
};

const storedToken = window.localStorage.getItem("clipforge_token");

async function pollJob({ fetchJob, onUpdate }) {
  for (let index = 0; index < 240; index += 1) {
    const job = await fetchJob();
    onUpdate(job);

    if (job.status === "completed" || job.status === "failed") {
      return job;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1200));
  }

  throw new Error("Job timeout. Server is still busy.");
}

export default function App() {
  const [authToken, setAuthToken] = useState(storedToken);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesError, setTemplatesError] = useState("");
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(Boolean(storedToken));
  const [selectedId, setSelectedId] = useState("");
  const [script, setScript] = useState("");
  const [view, setView] = useState("templates");
  const [language, setLanguage] = useState("Uzbek");
  const [voice, setVoice] = useState("Casual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("Ready");
  const [generatedUrl, setGeneratedUrl] = useState("");

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let cancelled = false;
    setIsLoadingTemplates(true);
    setTemplatesError("");

    listTemplates(authToken)
      .then((items) => {
        if (cancelled) {
          return;
        }
        setTemplates(items);
        if (items.length > 0) {
          setSelectedId((current) => current || items[0].id);
          setScript((current) => current || items[0].prompt);
          setVoice((current) => current || items[0].tone);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setTemplatesError(error instanceof Error ? error.message : "Templates failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingTemplates(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? templates[0],
    [selectedId, templates]
  );

  const previewTemplate = useMemo(() => {
    if (!selectedTemplate) {
      return null;
    }
    if (!generatedUrl) {
      return selectedTemplate;
    }
    return {
      ...selectedTemplate,
      media: resolveMediaUrl(generatedUrl),
      poster: null,
    };
  }, [generatedUrl, selectedTemplate]);

  const wordCount = countWords(script);
  const estimatedSeconds = estimateReadingSeconds(wordCount);

  async function handleLogin(payload) {
    setIsLoggingIn(true);
    setAuthError("");

    try {
      const response = await login(payload);
      window.localStorage.setItem("clipforge_token", response.token);
      setAuthToken(response.token);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function logout() {
    window.localStorage.removeItem("clipforge_token");
    setAuthToken("");
    setTemplates([]);
    setSelectedId("");
    setScript("");
    setView("templates");
  }

  async function chooseTemplate(template) {
    setSelectedId(template.id);
    setScript(template.prompt);
    setVoice(template.tone);
    setGeneratedUrl("");
    setResult("Queued transcription");
    setProgress(0);
    setView("editor");

    try {
      setIsTranscribing(true);
      const queued = await createTranscriptionJob(template.id, authToken);
      const completed = await pollJob({
        fetchJob: () => getTranscriptionJob(queued.id, authToken),
        onUpdate: (job) => {
          setProgress(job.progress ?? 0);
          setResult(job.status === "running" ? "Transcribing template audio" : `Transcription ${job.status}`);
        },
      });

      if (completed.status === "failed") {
        throw new Error(completed.error ?? "Template transcription failed");
      }

      if (completed.text) {
        setScript(completed.text.slice(0, 1000));
        if (detectedLanguageMap[completed.language]) {
          setLanguage(detectedLanguageMap[completed.language]);
        }
        setResult(completed.language ? `Transcribed audio (${completed.language})` : "Transcribed template audio");
      } else {
        setResult("No speech detected in template");
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Template transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  }

  async function generatePreview() {
    if (!selectedTemplate) {
      return;
    }

    setIsGenerating(true);
    setGeneratedUrl("");
    setResult("Queued generation");
    setProgress(0);

    try {
      const queued = await createGenerationJob(
        {
          template_id: selectedTemplate.id,
          script,
          language,
          voice,
        },
        authToken
      );

      const completed = await pollJob({
        fetchJob: () => getGenerationJob(queued.id, authToken),
        onUpdate: (job) => {
          setProgress(job.progress ?? 0);
          setResult(job.status === "running" ? "Generating lip-sync preview" : `Generation ${job.status}`);
        },
      });

      if (completed.status === "failed") {
        throw new Error(completed.error ?? "Generation failed");
      }

      setGeneratedUrl(completed.result_url);
      setResult("Generated preview ready");
      setProgress(100);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  function playVoice() {
    setResult(playVoicePreview({ script, language, voice }));
  }

  if (!authToken) {
    return <AuthPage error={authError} isLoading={isLoggingIn} onLogin={handleLogin} />;
  }

  if (isLoadingTemplates) {
    return (
      <main className="state-shell">
        <div className="state-panel">
          <Clapperboard size={28} aria-hidden="true" />
          <h1>Loading templates</h1>
          <p>Backend is reading templates from Postgres.</p>
          <div className="loading-bar">
            <span />
          </div>
        </div>
      </main>
    );
  }

  if (templatesError) {
    return (
      <main className="state-shell">
        <div className="state-panel">
          <h1>Backend connection failed</h1>
          <p>{templatesError}</p>
          <button className="secondary-button" type="button" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </main>
    );
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
            onClick={() => selectedTemplate && setView("editor")}
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
        <button className="icon-button" aria-label="Sign out" onClick={logout}>
          <LogOut size={18} aria-hidden="true" />
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
              <strong>{isGenerating || isTranscribing ? "Busy" : "Idle"}</strong>
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
            {previewTemplate && <PhonePreview selectedTemplate={previewTemplate} />}
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
              generatedUrl={generatedUrl ? resolveMediaUrl(generatedUrl) : ""}
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
