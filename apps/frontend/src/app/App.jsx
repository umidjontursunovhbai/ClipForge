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
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const detectedLanguageMap = {
  en: "English",
  uz: "Uzbek",
};

const storedToken = window.localStorage.getItem("clipforge_token");

function parseRoute(pathname = window.location.pathname) {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "editor" && parts[1]) {
    return { page: "editor", templateId: decodeURIComponent(parts[1]) };
  }

  if (parts[0] === "settings") {
    return { page: "settings" };
  }

  if (parts[0] === "voice") {
    return { page: "voice" };
  }

  return { page: "dashboard" };
}

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

function EmptyPage({ title }) {
  return (
    <div className="empty-route" aria-label={title}>
      <h1>{title}</h1>
    </div>
  );
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
  const [route, setRoute] = useState(() => parseRoute());
  const [language, setLanguage] = useState("Uzbek");
  const [voice, setVoice] = useState("Casual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("Ready");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const userEditedScriptRef = useRef(false);
  const transcribedTemplateIdsRef = useRef(new Set());
  const activeTranscriptionTemplateRef = useRef("");

  function navigate(path, options = {}) {
    const method = options.replace ? "replaceState" : "pushState";
    if (window.location.pathname !== path) {
      window.history[method](null, "", path);
    }
    setRoute(parseRoute(path));
  }

  useEffect(() => {
    function handlePopState() {
      setRoute(parseRoute());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (authToken && window.location.pathname === "/") {
      navigate("/dashboard", { replace: true });
    }
  }, [authToken]);

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

  useEffect(() => {
    if (!templates.length || route.page !== "editor") {
      return;
    }

    const routeTemplate = templates.find((template) => template.id === route.templateId);
    if (!routeTemplate) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (selectedId !== routeTemplate.id) {
      userEditedScriptRef.current = false;
      setSelectedId(routeTemplate.id);
      setScript(routeTemplate.prompt);
      setVoice(routeTemplate.tone);
      setGeneratedUrl("");
      setProgress(0);
      setResult("Loading video script");
    }
  }, [route.page, route.templateId, selectedId, templates]);

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
  const isBusy = isGenerating || isTranscribing;

  useEffect(() => {
    if (route.page !== "editor" || !selectedTemplate || !authToken) {
      return;
    }

    if (selectedTemplate.id !== route.templateId) {
      return;
    }

    if (transcribedTemplateIdsRef.current.has(selectedTemplate.id)) {
      return;
    }

    if (activeTranscriptionTemplateRef.current === selectedTemplate.id) {
      return;
    }

    loadTemplateScript(selectedTemplate);
  }, [authToken, route.page, route.templateId, selectedTemplate]);

  async function handleLogin(payload) {
    setIsLoggingIn(true);
    setAuthError("");

    try {
      const response = await login(payload);
      window.localStorage.setItem("clipforge_token", response.token);
      setAuthToken(response.token);
      navigate("/dashboard", { replace: true });
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
    navigate("/dashboard", { replace: true });
  }

  function handleScriptChange(value) {
    userEditedScriptRef.current = true;
    setScript(value);
  }

  async function loadTemplateScript(template) {
    activeTranscriptionTemplateRef.current = template.id;
    setIsTranscribing(true);
    setResult("Reading video script");
    setProgress(0);

    try {
      const queued = await createTranscriptionJob(template.id, authToken);
      const completed = await pollJob({
        fetchJob: () => getTranscriptionJob(queued.id, authToken),
        onUpdate: (job) => {
          setProgress(job.progress ?? 0);
          setResult(job.status === "running" ? "Reading video script" : `Video script ${job.status}`);
        },
      });

      if (completed.status === "failed") {
        throw new Error(completed.error ?? "Template transcription failed");
      }

      transcribedTemplateIdsRef.current.add(template.id);

      if (completed.text) {
        if (!userEditedScriptRef.current && selectedId === template.id) {
          setScript(completed.text.slice(0, 1000));
        }
        if (detectedLanguageMap[completed.language]) {
          setLanguage(detectedLanguageMap[completed.language]);
        }
        setResult("Script ready");
      } else {
        setResult("No speech detected in template");
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Template transcription failed");
    } finally {
      if (activeTranscriptionTemplateRef.current === template.id) {
        activeTranscriptionTemplateRef.current = "";
      }
      setIsTranscribing(false);
    }
  }

  function chooseTemplate(template) {
    userEditedScriptRef.current = false;
    setSelectedId(template.id);
    setScript(template.prompt);
    setVoice(template.tone);
    setGeneratedUrl("");
    setResult("Loading video script");
    setProgress(0);
    navigate(`/editor/${encodeURIComponent(template.id)}`);
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
            className={`nav-item ${route.page === "dashboard" ? "active" : ""}`}
            type="button"
            onClick={() => navigate("/dashboard")}
            aria-label="Templates"
          >
            <Library size={18} aria-hidden="true" />
          </button>
          <button
            className={`nav-item ${route.page === "editor" ? "active" : ""}`}
            type="button"
            onClick={() => navigate(selectedTemplate ? `/editor/${encodeURIComponent(selectedTemplate.id)}` : "/dashboard")}
            aria-label="Script"
          >
            <Captions size={18} aria-hidden="true" />
          </button>
          <button
            className={`nav-item ${route.page === "voice" ? "active" : ""}`}
            type="button"
            onClick={() => navigate("/voice")}
            aria-label="Voice"
          >
            <Mic2 size={18} aria-hidden="true" />
          </button>
          <button
            className={`nav-item ${route.page === "settings" ? "active" : ""}`}
            type="button"
            onClick={() => navigate("/settings")}
            aria-label="Settings"
          >
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

      <section className={`workspace ${route.page === "dashboard" ? "gallery-workspace" : ""}`}>
        {route.page !== "dashboard" && (
          <header className="topbar">
            <label className="search-control" htmlFor="template-search">
              <Search size={18} aria-hidden="true" />
              <input id="template-search" type="search" placeholder="Search camera front templates" />
            </label>

            <div className="queue-pill">
              <Gauge size={17} aria-hidden="true" />
              <span>Server GPU queue</span>
              <strong>{isBusy ? "Busy" : "Idle"}</strong>
            </div>
          </header>
        )}

        {route.page === "dashboard" && <TemplateFeed templates={templates} onChooseTemplate={chooseTemplate} />}

        {route.page === "editor" && (
          <div className="editor-view">
            <button className="back-button" type="button" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={18} aria-hidden="true" />
              Templates
            </button>
            {previewTemplate && <PhonePreview selectedTemplate={previewTemplate} />}
            <ScriptEditor
              script={script}
              wordCount={wordCount}
              estimatedSeconds={estimatedSeconds}
              isGenerating={isGenerating}
              isTranscribing={isTranscribing}
              generatedUrl={generatedUrl ? resolveMediaUrl(generatedUrl) : ""}
              onScriptChange={handleScriptChange}
              onGeneratePreview={generatePreview}
            />
          </div>
        )}

        {route.page === "voice" && <EmptyPage title="Voice" />}
        {route.page === "settings" && <EmptyPage title="Settings" />}
      </section>
    </main>
  );
}
