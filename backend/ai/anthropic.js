const anthropic = require('@anthropic-ai/sdk');

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new anthropic({ apiKey });
}

async function getAvailableModels() {
  const client = getClient();
  if (!client) return [];
  try {
    // Anthropic doesn't have a public endpoint to list models
    // We'll return a predefined list of available models
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', cost: '15 / 75' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', cost: '3 / 15' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', cost: '0.25 / 1.25' }
    ];
  } catch (error) {
    console.error('Error getting Anthropic models:', error);
    return [];
  }
}

async function askAnthropic(messages, model) {
  const client = getClient();
  if (!client) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: 1024,
      messages,
      stream: true
    });
    return msg;
  } catch (error) {
    throw new Error(`Anthropic error: ${error.message}`);
  }
}

module.exports = {
  askAnthropic,
  getAvailableModels
};