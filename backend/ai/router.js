const { askOllama } = require('./ollama');
const { askOpenRouter } = require('./openrouter');
const { askAnthropic } = require('./anthropic');

async function askAI(messages, settings) {
  // settings should contain: provider, model
  const { provider, model } = settings;

  try {
    if (provider === 'ollama') {
      const response = await askOllama(messages, model);
      return { response, provider: 'ollama' };
    } else if (provider === 'openrouter') {
      const response = await askOpenRouter(messages, model);
      return { response, provider: 'openrouter' };
    } else if (provider === 'anthropic') {
      const response = await askAnthropic(messages, model);
      return { response, provider: 'anthropic' };
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error.message);
    // Fall through to next provider in chain
    if (provider === 'ollama') {
      try {
        const response = await askOpenRouter(messages, settings.openrouterModel || 'deepseek/deepseek-coder');
        return { response, provider: 'openrouter' };
      } catch (openRouterError) {
        try {
          const response = await askAnthropic(messages, settings.anthropicModel || 'claude-3-haiku-20240307');
          return { response, provider: 'anthropic' };
        } catch (anthropicError) {
          throw new Error('All AI providers failed');
        }
      }
    } else if (provider === 'openrouter') {
      try {
        const response = await askAnthropic(messages, settings.anthropicModel || 'claude-3-haiku-20240307');
        return { response, provider: 'anthropic' };
      } catch (anthropicError) {
        throw new Error('OpenRouter and Anthropic failed');
      }
    } else {
      throw new Error('Anthropic provider failed');
    }
  }
}

function registerAI(app, wss) {
  // Route for AI requests
  app.post('/api/ask', async (req, res) => {
    try {
      const { messages, settings } = req.body;
      const { response, provider } = await askAI(messages, settings);
      res.json({ response, provider });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

module.exports = { askAI, registerAI };