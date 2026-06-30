/**
 * Per-tool prompt construction. Each tool maps a user's raw input + a couple of
 * options into a (system, user) message pair. Keeping this on the SERVER means
 * the client never decides how the model is steered — it only picks a tool.
 */

const TONES = ['Professional', 'Casual', 'Friendly', 'Formal', 'Confident', 'Playful'];
const FORMATS = ['Paragraph', 'Bullet points', 'Email', 'Tweet thread', 'Outline'];
const LENGTHS = ['Short', 'Medium', 'Detailed'];

const lengthHint = (length) => {
  switch (length) {
    case 'Short':
      return 'Keep it tight — a few sentences at most.';
    case 'Detailed':
      return 'Be thorough and cover the important nuances.';
    default:
      return 'Aim for a balanced, medium length.';
  }
};

const buildPrompt = (tool, input, options = {}) => {
  const text = String(input || '').trim();

  switch (tool) {
    case 'summarize': {
      const length = LENGTHS.includes(options.length) ? options.length : 'Medium';
      return {
        system:
          'You are a precise summarization assistant. Capture the key points faithfully, ' +
          'never invent facts, and keep the original meaning. Return only the summary text.',
        user: `${lengthHint(length)}\n\nSummarize the following:\n\n"""${text}"""`,
      };
    }

    case 'paraphrase': {
      const tone = TONES.includes(options.tone) ? options.tone : 'Professional';
      return {
        system:
          'You are a skilled rewriting assistant. Rephrase the text while preserving its ' +
          'meaning. Do not add commentary. Return only the rewritten text.',
        user: `Rewrite the following in a ${tone.toLowerCase()} tone:\n\n"""${text}"""`,
      };
    }

    case 'generate': {
      const format = FORMATS.includes(options.format) ? options.format : 'Paragraph';
      return {
        system:
          'You are a helpful content generation assistant. Produce clear, original, ' +
          'well-structured content. Return only the generated content.',
        user: `Write content based on this brief. Format it as: ${format}.\n\nBrief:\n\n"""${text}"""`,
      };
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
};

module.exports = { buildPrompt, TONES, FORMATS, LENGTHS };
