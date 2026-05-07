const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let isAvailable = false;

// Ping Ollama on module load
async function checkOllamaAvailability() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', { timeout: 5000 });
    isAvailable = response.ok;
  } catch (error) {
    console.log('Ollama not available:', error.message);
    isAvailable = false;
  }
}

// Initial check
checkOllamaAvailability();

// Re-check every 30 seconds
setInterval(checkOllamaAvailability, 30000);

async function getAvailableModels() {
  if (!isAvailable) return [];
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    return data.models.map(model => model.name);
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}

async function askOllama(messages, model) {
  if (!isAvailable) {
    throw new Error('Ollama is not available');
  }

  const url = 'http://localhost:11434/api/chat';
  const payload = {
    model,
    messages,
    stream: true
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  // Return a readable stream for the response
  return response.body;
}

module.exports = {
  askOllama,
  getAvailableModels,
  isAvailable: () => isAvailable
};