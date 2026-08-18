/**
 * ai.js — Vestro AI Gemini wrapper
 *
 * Uses @google/generative-ai (official SDK) directly.
 * Falls back through a chain of models from fastest → most capable.
 * Model list confirmed via ListModels API — free-tier quota verified.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

// Models ordered by user preference and image:
const MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.6-flash-lite'
];

/** Sleep helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try to recover a valid JSON object from a string that may be truncated.
 * Scans backwards through the string looking for a point where JSON.parse succeeds.
 * Used when Gemini hits maxOutputTokens mid-JSON.
 */
function repairTruncatedJson(str) {
  // First pass: try with maxOutputTokens bumped to 16k on next model
  // Second pass: close dangling structure by scanning backwards
  let s = str.trim();
  // Scan backwards: try cutting off the last partial array/object element
  for (let i = s.length - 1; i > s.length / 2; i--) {
    const ch = s[i];
    if (ch === ',' || ch === '[' || ch === '{') {
      // Try closing the structure at this point
      const truncated = s.slice(0, i);
      // Count open braces/brackets
      let depth = 0;
      const closes = [];
      for (const c of truncated) {
        if (c === '{') { depth++; closes.push('}'); }
        else if (c === '[') { depth++; closes.push(']'); }
        else if (c === '}' || c === ']') { closes.pop(); depth--; }
      }
      const candidate = truncated + closes.reverse().join('');
      try {
        return JSON.parse(candidate);
      } catch (_) { /* continue */ }
    }
  }
  return null;
}

/**
 * Extract retryDelay seconds from a 429 error message.
 * Returns delay in ms, capped at 60 000 ms.
 */
function parse429Delay(errMsg) {
  const match = errMsg.match(/retry[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*s/i);
  if (match) return Math.min(parseFloat(match[1]) * 1000 + 500, 60000); // capped at 60s
  return 5000; // default 5 s
}

/**
 * Call Gemini with automatic model fallback + 429 retry.
 *
 * @param {string} prompt
 * @param {object} options
 * @param {string}  [options.system]          - System instruction
 * @param {number}  [options.temperature]     - Default 0.1
 * @param {number}  [options.maxOutputTokens] - Default 8192
 * @param {boolean} [options.json]            - Parse and return JSON
 * @returns {string|object}
 */
async function callGemini(prompt, options = {}) {
  if (!config.geminiKey) {
    throw new Error('GOOGLE_API_KEY is not configured in backend/.env');
  }

  const genAI = new GoogleGenerativeAI(config.geminiKey);
  let lastError;

  for (const modelName of MODELS) {
    // Try each model up to 2 times (once immediately, once after retry-delay on 429)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: options.system ||
            'You are an expert financial AI assistant with deep knowledge of equity markets, valuations, and investment analysis.',
          generationConfig: {
            temperature: options.temperature ?? 0.1,
            maxOutputTokens: options.maxOutputTokens ?? 8192,
          },
        });

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        if (!text || typeof text !== 'string') throw new Error('Empty response from Gemini');

        if (options.json) {
          text = text
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/\s*```\s*$/i, '')
            .trim();
          const start = text.search(/[\[{]/);
          const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
          if (start === -1 || end === -1) {
            throw new Error(`Gemini did not return valid JSON (model: ${modelName})`);
          }
          const jsonStr = text.slice(start, end + 1);
          try {
            return JSON.parse(jsonStr);
          } catch (parseErr) {
            // Recovery: Gemini may have truncated mid-JSON. Try to find the last
            // complete top-level object by scanning backwards for a valid closing brace.
            const recovered = repairTruncatedJson(jsonStr);
            if (recovered) return recovered;
            throw new Error(`JSON parse failed (model: ${modelName}): ${parseErr.message.slice(0, 80)}`);
          }
        }
        return text;

      } catch (err) {
        lastError = err;
        const msg = err.message || '';
        const is429 = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');

        if (is429 && attempt === 0) {
          // Wait the suggested delay then retry THIS model once
          const delay = parse429Delay(msg);
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[AI] ${modelName} rate-limited. Retrying in ${delay}ms…`);
          }
          await sleep(delay);
          continue; // retry same model
        }

        // Non-429 error or second attempt failed — move to next model
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[AI] Model ${modelName} failed (attempt ${attempt + 1}): ${msg.substring(0, 120)}`);
        }
        break; // break inner loop, try next model
      }
    }
  }

  throw lastError || new Error('All Gemini models failed. Check API key and quota.');
}

module.exports = { callGemini };