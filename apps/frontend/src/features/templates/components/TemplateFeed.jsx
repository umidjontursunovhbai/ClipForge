import { ChevronRight, Play, Sparkles } from "lucide-react";
import React from "react";
import { TemplateMedia } from "./TemplateMedia.jsx";

export function TemplateFeed({ templates, selectedId, script, onChooseTemplate }) {
  return (
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
            onClick={() => onChooseTemplate(template)}
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
  );
}
