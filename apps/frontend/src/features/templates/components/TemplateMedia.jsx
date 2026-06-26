import React, { useRef } from "react";

export function TemplateMedia({ template, autoPlay = false, controls = false, hoverPreview = false }) {
  const videoRef = useRef(null);

  function playPreview() {
    const video = videoRef.current;
    if (!video || controls) {
      return;
    }

    video.play().catch(() => {});
  }

  function stopPreview() {
    const video = videoRef.current;
    if (!video || controls) {
      return;
    }

    video.pause();
    video.currentTime = 0;
  }

  if (template.mediaType === "video") {
    if (!autoPlay && !controls && !hoverPreview) {
      return <img src={template.poster} alt="" />;
    }

    return (
      <video
        ref={videoRef}
        src={template.media}
        poster={template.poster}
        muted
        loop
        playsInline
        autoPlay={autoPlay}
        controls={controls}
        preload={autoPlay ? "auto" : "metadata"}
        aria-label={`${template.title} template video`}
        onMouseEnter={hoverPreview ? playPreview : undefined}
        onMouseLeave={hoverPreview ? stopPreview : undefined}
        onFocus={hoverPreview ? playPreview : undefined}
        onBlur={hoverPreview ? stopPreview : undefined}
      />
    );
  }

  return <img src={template.media} alt="" />;
}
