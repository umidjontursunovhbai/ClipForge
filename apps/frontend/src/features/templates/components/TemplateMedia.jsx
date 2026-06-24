import React from "react";

export function TemplateMedia({ template, autoPlay = false }) {
  if (template.mediaType === "video") {
    if (!autoPlay) {
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
        preload={autoPlay ? "auto" : "metadata"}
        aria-label={`${template.title} template video`}
      />
    );
  }

  return <img src={template.media} alt="" />;
}
