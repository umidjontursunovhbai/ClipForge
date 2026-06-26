const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, { token, ...options } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail ?? "Request failed");
  }

  return response.json();
}

function mapTemplate(template) {
  return {
    id: template.id,
    title: template.title,
    length: template.length,
    mediaType: template.media_type,
    media: template.media_url,
    poster: template.poster_url,
    prompt: template.default_prompt,
    tone: template.tone ?? "Casual",
  };
}

export async function login(payload) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listTemplates(token) {
  const templates = await request("/api/templates", { token });
  return templates.map(mapTemplate);
}

export async function createTranscriptionJob(templateId, token) {
  return request(`/api/templates/${templateId}/transcription/jobs`, {
    method: "POST",
    token,
  });
}

export async function getTranscriptionJob(jobId, token) {
  return request(`/api/templates/transcription/jobs/${jobId}`, { token });
}

export async function createGenerationJob(payload, token) {
  return request("/api/generation/preview", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function getGenerationJob(jobId, token) {
  return request(`/api/generation/jobs/${jobId}`, { token });
}

export function resolveMediaUrl(url) {
  if (!url) {
    return url;
  }
  if (url.startsWith("http") || url.startsWith("/assets")) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
}


function mapGeneratedAsset(asset) {
  return {
    id: asset.id,
    jobId: asset.job_id,
    templateId: asset.template_id,
    script: asset.script,
    mediaType: asset.media_type,
    media: resolveMediaUrl(asset.public_url),
    createdAt: asset.created_at,
  };
}

export async function listGeneratedAssets(token) {
  const assets = await request("/api/generation/library", { token });
  return assets.map(mapGeneratedAsset);
}
