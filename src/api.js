// Get the backend URL from environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Basic ingestion of text
export async function ingestText(text) {
  const formData = new FormData();
  formData.append("text", text);
  const res = await fetch(`${BACKEND_URL}/ingest-text`, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
    mode: 'cors'
  });
  if (!res.ok) {
    throw new Error(`Ingest error: ${res.statusText}`);
  }
  return res.json();
}

// Analyze artwork using the /ask-image endpoint
export async function analyzeArtwork(file, topK = 3, threshold = 0.2, useGptSummary = true) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("top_k", topK);
  formData.append("threshold", threshold);
  formData.append("use_gpt_summary", useGptSummary);

  try {
    console.log(`Analyzing artwork: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    
    const response = await fetch(`${BACKEND_URL}/ask-image`, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Error: ${response.status} - ${errMsg}`);
    }
    
    const data = await response.json();
    console.log("Analysis complete:", Object.keys(data));
    return data;
  } catch (err) {
    console.error("Analysis error:", err);
    throw err;
  }
}

// Get just the artist name quickly
export async function getArtistNameOnly(file, topK = 3, threshold = 0.2) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("top_k", topK);
  formData.append("threshold", threshold);

  try {
    console.log(`Quick artist name check for: ${file.name}`);
    
    const response = await fetch(`${BACKEND_URL}/artist-name-only`, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errMsg = await response.text();
      throw new Error(`Error: ${response.status} - ${errMsg}`);
    }
    
    const data = await response.json();
    return data.artist_name;
  } catch (err) {
    console.error("Artist name lookup error:", err);
    throw err;
  }
}

// Health check endpoint
export async function checkHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("Health check error:", err);
    throw err;
  }
}

// Debug CORS settings
export async function debugCors() {
  try {
    const response = await fetch(`${BACKEND_URL}/debug-cors`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`CORS debug failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("CORS debug error:", err);
    throw err;
  }
}
