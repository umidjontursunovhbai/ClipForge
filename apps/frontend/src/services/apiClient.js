const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8088";

export async function transcribeTemplate(templateId) {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/transcription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail ?? "Template transcription failed");
  }

  return response.json();
}
