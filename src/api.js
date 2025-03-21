const BACKEND_URL = "http://localhost:8000"; // Adjust if deployed

// Basic ingestion of text
export async function ingestText(text) {
  const formData = new FormData();
  formData.append("text", text);
  const res = await fetch(`${BACKEND_URL}/ingest-text`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    throw new Error(`Ingest error: ${res.statusText}`);
  }
  return res.json();
}

// Load example docs
export async function loadExampleDocs() {
  const res = await fetch(`${BACKEND_URL}/example-load`, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Error loading examples: ${res.statusText}`);
  }
  return res.json();
}

// Detect art style
export async function detectArtStyle(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BACKEND_URL}/detect-art`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    throw new Error(`Art detect error: ${res.statusText}`);
  }
  return res.json();
}

// Ask about art - RAG pipeline
export async function askAboutArt({
  query,
  stylePrediction,
  creativeStoryMode,
  sessionId,
  topK
}) {
  const formData = new FormData();
  formData.append("query", query);
  if (stylePrediction) {
    formData.append("style_prediction", stylePrediction);
  }
  formData.append("creative_story_mode", creativeStoryMode);
  if (sessionId) {
    formData.append("session_id", sessionId);
  }
  formData.append("top_k", topK);

  const res = await fetch(`${BACKEND_URL}/ask-about-art`, {
    method: "POST",
    body: formData
  });
  if (!res.ok) {
    throw new Error(`Ask about art error: ${res.statusText}`);
  }
  return res.json();
}

// Test Exa API integration
export async function testExaSearch(query, maxResults = 3) {
  // Use URLSearchParams to properly encode query parameters
  const params = new URLSearchParams({
    query: query,
    max_results: maxResults
  });
  
  const res = await fetch(`${BACKEND_URL}/test-exa?${params.toString()}`, {
    method: "POST"
  });
  
  if (!res.ok) {
    throw new Error(`Exa search error: ${res.statusText}`);
  }
  
  return res.json();
}

// Test OpenAI API integration
export async function testOpenAI(prompt, useEmbeddings = false) {
  // Use URLSearchParams to properly encode query parameters
  const params = new URLSearchParams({
    prompt: prompt,
    use_embeddings: useEmbeddings
  });
  
  const res = await fetch(`${BACKEND_URL}/test-openai?${params.toString()}`, {
    method: "POST"
  });
  
  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.statusText}`);
  }
  
  return res.json();
}

// Compare user art to artists with Exa integration for tips
export async function compareUserArt(file, topK = 3, requestTips = true) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("top_k", topK);
  formData.append("request_tips", requestTips);
  
  const res = await fetch(`${BACKEND_URL}/compare-user-art`, {
    method: "POST",
    body: formData
  });
  
  if (!res.ok) {
    throw new Error(`Art comparison error: ${res.statusText}`);
  }
  
  return res.json();
}
