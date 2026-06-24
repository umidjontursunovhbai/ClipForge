import React from "react";

export function TemplateMedia({ template, autoPlay = false, controls = false }) {
  if (template.mediaType === "video") {
    if (!autoPlay && !controls) {
      return <img src={template.poster} alt="" />;
    }

    return (
      <video
        src={template.media}
        poster={template.poster}
        muted
        loop
        playsInline
        autoPlay={autoPlay}
        controls={controls}
        preload={autoPlay ? "auto" : "metadata"}
        aria-label={`${template.title} template video`}
      />
    );
  }

  return <img src={template.media} alt="" />;
}
