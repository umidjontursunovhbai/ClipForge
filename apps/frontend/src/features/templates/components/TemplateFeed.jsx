import { Play } from "lucide-react";
import React from "react";
import { TemplateMedia } from "./TemplateMedia.jsx";

export function TemplateFeed({ templates, onChooseTemplate }) {
  return (
    <section className="template-gallery" id="templates" aria-label="Templates">
      <div className="template-feed">
        {templates.map((template) => (
          <button
            className="template-card"
            key={template.id}
            onClick={() => onChooseTemplate(template)}
            aria-label={`Open ${template.title}`}
            type="button"
          >
            <span className="video-frame">
              <TemplateMedia template={template} hoverPreview />
              <span className="play-chip icon-only" aria-hidden="true">
                <Play size={15} fill="currentColor" />
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
