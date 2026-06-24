import React from "react";
import { TemplateMedia } from "../../templates/components/TemplateMedia.jsx";

export function PhonePreview({ selectedTemplate }) {
  return (
    <section className="preview-column" aria-label="Preview">
      <div className="phone-preview">
        <TemplateMedia template={selectedTemplate} controls />
      </div>
    </section>
  );
}
