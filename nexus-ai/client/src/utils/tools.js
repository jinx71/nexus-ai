// Single source of truth for the three tools on the client. The server has its
// own prompt builders keyed by the same tool slugs (summarize/paraphrase/generate).
export const TOOLS = {
  summarize: {
    key: 'summarize',
    name: 'Summarizer',
    tagline: 'Condense long text down to the essentials.',
    blurb: 'Drop in an article, transcript, or report and get a faithful summary — streamed as it is written.',
    placeholder: 'Paste an article, transcript, or document to summarize…',
    cta: 'Summarize',
    accent: 'from-brand-500 to-brand-700',
    options: [
      {
        name: 'length',
        label: 'Length',
        values: ['Short', 'Medium', 'Detailed'],
        default: 'Medium',
      },
    ],
  },
  paraphrase: {
    key: 'paraphrase',
    name: 'Paraphraser',
    tagline: 'Rewrite text in a new tone — same meaning.',
    blurb: 'Rephrase anything in a different register while keeping the original intent intact.',
    placeholder: 'Paste the text you want to rephrase…',
    cta: 'Paraphrase',
    accent: 'from-brand-500 to-sky2-500',
    options: [
      {
        name: 'tone',
        label: 'Tone',
        values: ['Professional', 'Casual', 'Friendly', 'Formal', 'Confident', 'Playful'],
        default: 'Professional',
      },
    ],
  },
  generate: {
    key: 'generate',
    name: 'Generator',
    tagline: 'Turn a short brief into finished content.',
    blurb: 'Describe what you need — an email, a thread, an outline — and watch it generate in real time.',
    placeholder: 'Describe what you want to write…',
    cta: 'Generate',
    accent: 'from-sky2-500 to-brand-600',
    options: [
      {
        name: 'format',
        label: 'Format',
        values: ['Paragraph', 'Bullet points', 'Email', 'Tweet thread', 'Outline'],
        default: 'Paragraph',
      },
    ],
  },
};

export const TOOL_LIST = Object.values(TOOLS);

export const getTool = (key) => TOOLS[key] || null;
