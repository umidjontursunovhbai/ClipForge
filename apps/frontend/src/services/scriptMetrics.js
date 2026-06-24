export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingSeconds(wordCount) {
  return Math.max(8, Math.round(wordCount / 2.5));
}
