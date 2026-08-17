const Chat = require('../models/Chat');
const { callGemini } = require('../utils/ai');
const { asyncHandler, createError } = require('../utils/errors');

/**
 * Chat persona system prompt prefixes.
 * Same Gemini backend — persona is injected as a system-level instruction.
 */
const PERSONA_PROMPTS = {
  beginner: `You are Vestro's friendly AI tutor. Explain everything in simple English. 
Use real-world analogies. Avoid financial jargon. If you must use a term, define it immediately.
Imagine you are explaining to a college student who has never invested before.`,

  ca: `You are a Chartered Accountant (CA) and investment analyst. 
Use precise IFRS/GAAP terminology. Reference Indian SEBI regulations where relevant. 
Include ratio benchmarks (industry averages, ideal ranges). Cite specific line items from the financial statements.
Be analytical, structured, and precise.`,

  buffett: `You are channeling Warren Buffett's investment philosophy.
Focus on: economic moat, owner earnings, return on invested capital, management quality, and long-term competitive advantages.
Ask: "Is this a business I would want to own for 10–20 years?" Apply margin of safety thinking.
Use Buffett's language: "wonderful company at a fair price", "circle of competence", "economic moat".`,

  summarize: `Provide a concise 5-bullet executive summary of the research report.
Each bullet should be one clear, actionable insight. Cover: verdict rationale, key strength, key risk, financial health, and recommended next step.
Be direct and brief. No elaboration.`,

  compare: `Compare this company to its top competitors listed in the report's Recommendation Hub.
For each competitor: one strength vs this company, one weakness vs this company.
End with: "Overall, [Company] is [better/worse/similar] because..."
Be objective. Use data from the report only.`,

  why_watch: `The user wants to understand EXACTLY why this company received its specific verdict.
Walk through the verdict step by step:
1. Which financial checks passed?
2. Which financial checks failed?
3. What would need to change to get a better verdict?
4. What would make the verdict worse?
Be very specific. Reference actual numbers from the report.`,

  default: `You are Vestro's AI Investment Assistant. Be helpful, accurate, and grounded in the report data.`,
};

/**
 * Build Gemini system prompt with persona + report context (NO RAG — full report injected).
 */
function buildChatSystemPrompt(persona, reportContext, symbol) {
  const personaInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.default;

  const reportSummary = reportContext
    ? `
LOADED RESEARCH REPORT FOR: ${symbol}
Company: ${reportContext.company?.name || symbol}
Sector: ${reportContext.company?.sector || 'N/A'}
Verdict: ${reportContext.aiAnalysis?.verdict || 'N/A'}
Confidence: ${reportContext.aiAnalysis?.confidence || 'N/A'}%
Health Score: ${reportContext.aiAnalysis?.healthScore || 'N/A'}/100
Investment Thesis: ${reportContext.aiAnalysis?.investmentThesis || 'N/A'}
Top Reasons: ${reportContext.aiAnalysis?.topReasons?.join(', ') || 'N/A'}
Key Risks: ${reportContext.aiAnalysis?.keyRisks?.join(', ') || 'N/A'}
Revenue: ${reportContext.financials?.revenue || 'N/A'}
Net Margin: ${reportContext.financials?.netMargin?.toFixed(1) || 'N/A'}%
ROE: ${reportContext.financials?.roe?.toFixed(1) || 'N/A'}%
P/E: ${reportContext.financials?.pe || 'N/A'}
Debt/Equity: ${reportContext.financials?.debtToEquity || 'N/A'}
Risk Flags: ${reportContext.financials?.calculatedRiskFlags?.join(', ') || 'None'}
Moat Analysis: ${reportContext.aiAnalysis?.moatAnalysis || 'N/A'}
Why NOT Invest: ${reportContext.aiAnalysis?.whyNOTInvest || 'N/A'}
`
    : 'No report loaded.';

  return `${personaInstruction}

STRICT RULES (follow without exception):
1. You may ONLY answer questions about:
   - The financial metrics and data in the loaded research report below
   - Investment concepts and terminology (explaining what ratios/metrics mean)
   - How the AI reached its verdict for this company
   - Risk and return concepts as they apply to this specific company
2. If the user asks anything outside these topics, politely refuse:
   "I can only answer questions about ${symbol}'s research report and general investment concepts related to it."
3. NEVER hallucinate financial data not in the report.
4. NEVER recommend specific buy/sell quantities or portfolio percentages.
5. NEVER make price predictions.
6. Always add: "For educational purposes only. Not financial advice." when giving investment-related opinions.

${reportSummary}`;
}

/**
 * POST /api/chat
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { symbol, message, persona = 'default', reportContext } = req.body;
  const userId = req.user._id;

  // Load or create chat session
  let chat = await Chat.findOne({ userId, symbol: symbol.toUpperCase() });
  if (!chat) {
    chat = new Chat({
      userId,
      symbol: symbol.toUpperCase(),
      companyName: reportContext?.company?.name,
      reportContext,
      messages: [],
    });
  } else if (reportContext && !chat.reportContext) {
    // Update context if report is newly loaded
    chat.reportContext = reportContext;
  }

  // Add user message
  chat.messages.push({ role: 'user', content: message, persona });
  chat.lastMessageAt = new Date();

  // Build conversation history for Gemini (last 10 messages for context window efficiency)
  const recentMessages = chat.messages.slice(-10);
  const conversationHistory = recentMessages
    .slice(0, -1) // Exclude the just-added user message (it's in the prompt)
    .map((m) => `${m.role === 'user' ? 'User' : 'Vestro AI'}: ${m.content}`)
    .join('\n');

  const systemPrompt = buildChatSystemPrompt(persona, chat.reportContext || reportContext, symbol.toUpperCase());
  const fullPrompt = `${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}User: ${message}`;

  // Call Gemini via the shared ai.js utility (official SDK, correct model list)
  let aiResponse = '';
  try {
    aiResponse = await callGemini(fullPrompt, {
      system: systemPrompt,
      temperature: 0.3,
      maxOutputTokens: 2048,
    });
  } catch (e) {
    throw createError(`AI chat failed: ${e.message}`, 500);
  }


  // Add AI response
  chat.messages.push({ role: 'assistant', content: aiResponse, persona });
  await chat.save();

  res.json({
    message: aiResponse,
    chatId: chat._id,
    symbol: chat.symbol,
    messageCount: chat.messages.length,
  });
});

/**
 * GET /api/chat/:symbol
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({
    userId: req.user._id,
    symbol: req.params.symbol.toUpperCase(),
  }).select('-reportContext'); // Exclude heavy snapshot

  if (!chat) {
    return res.json({ symbol: req.params.symbol.toUpperCase(), messages: [], chatId: null });
  }

  res.json({ symbol: chat.symbol, messages: chat.messages, chatId: chat._id });
});

/**
 * DELETE /api/chat/:symbol
 */
const clearChat = asyncHandler(async (req, res) => {
  await Chat.deleteOne({ userId: req.user._id, symbol: req.params.symbol.toUpperCase() });
  res.json({ message: 'Chat cleared.' });
});

module.exports = { sendMessage, getChatHistory, clearChat };
