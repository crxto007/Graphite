const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getAvailableModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY?.trim()}`
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    // Return models with id and name for display
    return data.data.map(model => ({
      id: model.id,
      name: model.name,
      // Cost per million tokens - we'll use a placeholder or fetch if available
      cost: model.pricing ? `${(parseFloat(model.prompt) * 1000000).toFixed(2)} / ${(parseFloat(model.completion) * 1000000).toFixed(2)}` : 'unknown'
    }));
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    return [];
  }
}

async function askOpenRouter(messages, model) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const url = 'https://openrouter.ai/api/v1/chat/completions';
  const payload = {
    model,
    messages,
    stream: true
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  // Return a readable stream for the response
  return response.body;
}

module.exports = {
  askOpenRouter,
  getAvailableModels
};