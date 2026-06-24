import { Download, Languages, UserRound, Volume2, Wand2 } from "lucide-react";
import React from "react";
import { languages, voices } from "../../../shared/options.js";

export function ScriptEditor({
  script,
  language,
  voice,
  result,
  progress,
  wordCount,
  estimatedSeconds,
  isGenerating,
  isTranscribing,
  generatedUrl,
  onScriptChange,
  onLanguageChange,
  onVoiceChange,
  onPlayVoice,
  onGeneratePreview,
}) {
  return (
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
        onChange={(event) => onScriptChange(event.target.value)}
        maxLength={1000}
        placeholder="Write the words this person should say..."
        disabled={isTranscribing}
      />

      <div className="stats-row">
        <span>{wordCount} words</span>
        <span>{estimatedSeconds}s estimate</span>
        <span>{1000 - script.length} chars left</span>
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
                onClick={() => onLanguageChange(item)}
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
                onClick={() => onVoiceChange(item)}
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
        <button className="secondary-button" type="button" onClick={onPlayVoice}>
          <Volume2 size={18} aria-hidden="true" />
          Voice
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={onGeneratePreview}
          disabled={isTranscribing || isGenerating || script.trim().length < 4}
        >
          <Wand2 size={18} aria-hidden="true" />
          Generate Preview
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
