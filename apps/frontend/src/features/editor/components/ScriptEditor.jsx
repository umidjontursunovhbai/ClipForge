import { Download, Wand2 } from "lucide-react";
import React from "react";

export function ScriptEditor({
  script,
  wordCount,
  estimatedSeconds,
  isGenerating,
  isTranscribing,
  generatedUrl,
  onScriptChange,
  onGeneratePreview,
}) {
  const generateLabel = isGenerating ? "Generating..." : "Generate Preview";

  return (
    <section className="editor-panel" id="script" aria-label="Script editor">
      <div className="panel-header script-header">
        <div>
          <h2>Script</h2>
          <p>Write the words this person should say.</p>
        </div>
      </div>

      <label className="field-label" htmlFor="script-text">
        Text to read
      </label>
      <textarea
        id="script-text"
        value={script}
        onChange={(event) => onScriptChange(event.target.value)}
        maxLength={1000}
        placeholder={isTranscribing ? "Reading the original video script..." : "Write the words this person should say..."}
      />

      <div className="stats-row script-stats">
        <span>{wordCount} words</span>
        <span>{estimatedSeconds}s estimate</span>
        <span>{1000 - script.length} chars left</span>
      </div>

      <div className="action-row script-actions">
        <button
          className="primary-button"
          type="button"
          onClick={onGeneratePreview}
          disabled={isGenerating || script.trim().length < 4}
        >
          <Wand2 size={18} aria-hidden="true" />
          {generateLabel}
        </button>
        <a
          className={`icon-button dark ${generatedUrl ? "" : "disabled"}`}
          href={generatedUrl || undefined}
          download
          aria-label="Download preview"
        >
          <Download size={18} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
