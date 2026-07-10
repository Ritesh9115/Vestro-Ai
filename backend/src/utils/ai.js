const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

/**
 * Reusable helper to call Gemini with automatic model fallback.
 * It will try the next model if it encounters 429, 503, or RESOURCE_EXHAUSTED.
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Options like temperature and responseMimeType
 * @returns {Promise<any>} - The parsed JSON or text response
 */
async function callGemini(prompt, options = {}) {
  if (!config.geminiKey) {
    throw new Error('Gemini API key not configured. Add GEMINI_API_KEY to your .env file.');
  }

  const genAI = new GoogleGenerativeAI(config.geminiKey);
  const isJson = options.responseMimeType === 'application/json';

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.temperature ?? 0.1,
          maxOutputTokens: options.maxOutputTokens ?? 8192,
          responseMimeType: options.responseMimeType,
        },
      });

      const result = await model.generateContent(prompt);
      let text = result.response.text();

      if (isJson) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) throw new Error('Gemini did not return valid JSON');
        text = text.slice(jsonStart, jsonEnd + 1);

        return JSON.parse(text);
      }

      return text;
    } catch (err) {
      lastError = err;
      const msg = err.message || '';
      
      const shouldRetry = 
        msg.includes('429') || 
        msg.includes('404') ||
        msg.includes('503') || 
        msg.includes('Service Unavailable') || 
        msg.includes('RESOURCE_EXHAUSTED') || 
        msg.includes('JSON');

      if (shouldRetry) {
        console.log(`[AI Fallback] Model ${modelName} failed. Retrying... (${msg.slice(0, 60)})`);
        continue;
      }
      
      throw err;
    }
  }

  if (lastError?.message?.includes('JSON')) {
    throw new Error('AI returned malformed data across all models. Please try again.');
  }
  throw new Error('Gemini API quota exceeded. All fallback models are at their daily limit. Wait a few minutes and retry.');
}

module.exports = { callGemini };
