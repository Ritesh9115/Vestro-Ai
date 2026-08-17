const mongoose = require('mongoose');

/**
 * Chat — persists AI chat sessions per user per company.
 * Context = report snapshot injected into Gemini system prompt.
 * NO RAG. NO vector DB. NO LangGraph.
 */
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    companyName: { type: String, trim: true },

    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [10000, 'Message too long'],
        },
        // Chat persona used for this message
        persona: {
          type: String,
          enum: ['beginner', 'ca', 'buffett', 'summarize', 'compare', 'why_watch', 'default'],
          default: 'default',
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Report snapshot injected as system context — no retrieval needed
    reportContext: {
      type: mongoose.Schema.Types.Mixed,
    },

    createdAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

chatSchema.index({ userId: 1, symbol: 1 });
chatSchema.index({ userId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
