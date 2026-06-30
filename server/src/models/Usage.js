const mongoose = require('mongoose');

const TOOLS = ['summarize', 'paraphrase', 'generate'];

/**
 * One row per completed AI request. Powers the usage dashboard.
 * We record character counts (a stable, provider-agnostic proxy for "work done")
 * rather than tokens, since the mock fallback has no tokenizer.
 */
const usageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tool: {
      type: String,
      enum: TOOLS,
      required: true,
    },
    model: {
      type: String,
      default: 'unknown',
    },
    inputChars: {
      type: Number,
      default: 0,
      min: 0,
    },
    outputChars: {
      type: Number,
      default: 0,
      min: 0,
    },
    ms: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

usageSchema.statics.TOOLS = TOOLS;

module.exports = mongoose.model('Usage', usageSchema);
