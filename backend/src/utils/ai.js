const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const config = require("../config/config");

async function callGemini(prompt, options = {}) {
  if (!config.geminiKey) {
    throw new Error("Gemini API key not configured.");
  }

  const models = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log(`🤖 Trying Gemini model: ${model}`);

      const llm = new ChatGoogleGenerativeAI({
        model,
        apiKey: config.geminiKey,
        temperature: options.temperature ?? 0.1,
        maxOutputTokens: options.maxOutputTokens || 8192,
      });

      const messages = [
        new SystemMessage("You are an expert financial AI assistant."),
        new HumanMessage(prompt),
      ];

      const response = await llm.invoke(messages);

      let text = response.content;

      if (Array.isArray(text)) {
        text = text
          .map((part) =>
            typeof part === "string" ? part : part.text || ""
          )
          .join("");
      }

      if (typeof text !== "string") {
        throw new Error("Gemini returned an unexpected response format.");
      }

      if (options.responseMimeType === "application/json") {
        text = text
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/i, "")
          .trim();

        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");

        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Gemini did not return valid JSON.");
        }

        return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      }

      return text;

    } catch (err) {
      console.log(`❌ ${model} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}

module.exports = { callGemini };