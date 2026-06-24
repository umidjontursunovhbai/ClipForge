import { BadgeCheck, Play } from "lucide-react";
import React from "react";
import { TemplateMedia } from "../../templates/components/TemplateMedia.jsx";

export function PhonePreview({ selectedTemplate, script, onPlayVoice }) {
  return (
    <section className="preview-column" aria-label="Preview">
      <div className="phone-preview">
        <TemplateMedia template={selectedTemplate} autoPlay />
        <div className="preview-topline">
          <BadgeCheck size={16} aria-hidden="true" />
          <span>{selectedTemplate.title}</span>
        </div>
        <div className="preview-captions">
          {script || "Write your script to replace template words."}
        </div>
        <button className="round-play" type="button" onClick={onPlayVoice} aria-label="Play voice preview">
          <Play size={24} fill="currentColor" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
