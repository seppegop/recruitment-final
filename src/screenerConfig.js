export const SHOW_SEGMENT_LABELS_TO_RESPONDENT = false;

export const ELIGIBILITY_STATEMENTS = [
  'I am 18 or older.',
  'I do design work as part of my role (employed, freelance, or student with active design practice).',
  'I have used a generative AI tool (such as ChatGPT, Claude, Midjourney, Figma AI, Galileo, or similar) for any design-related task in the past three months.',
  'I have generated or shaped early design ideas (sketches, flows, concepts, copy, or product ideas) on at least one project in the past six months.',
  'I can take part in a 90-minute online session, screen-share my own machine, bring a recent ideation example to walk through, and complete two short ideation tasks during the session — one with my usual GenAI tool, one with a partner-developed AI tool.',
];

function stripLabel(text) {
  return text.replace(/\s*\([^)]*\)\s*$/, '');
}

function formatOption(text) {
  if (SHOW_SEGMENT_LABELS_TO_RESPONDENT) return text;
  return stripLabel(text);
}

export const Q1_OPTIONS = [
  'Less than 1 year',
  '1 to 3 years (Junior)',
  '3 to 7 years (Mid)',
  '8 or more years (Senior)',
];

export const Q2_OPTIONS = [
  'Once a week or less (Light)',
  'A few times per week (Regular)',
  'Daily, on most working days (Regular)',
  'Multiple times per day, often as my default starting point (Power)',
];

export const Q3_OPTIONS = [
  'I rarely use GenAI for ideation; I prefer my own methods (Light)',
  'I sometimes use it as one of several inputs (Regular)',
  'I use it routinely for at least part of every ideation round (Regular)',
  'I have built personal prompt libraries, custom GPTs, or automated workflows, and I use multiple tools in combination (Power)',
];

export const AI_TOOLS_LIST = [
  'ChatGPT',
  'Claude',
  'Midjourney',
  'Cursor',
  'Stable Diffusion',
  'Figma AI',
  'Mistral',
  'Adobe Firefly',
  'GitHub Copilot',
  'Gemini',
];

export function getDisplayOption(text) {
  return formatOption(text);
}

export function getStoredValue(displayText, options) {
  if (SHOW_SEGMENT_LABELS_TO_RESPONDENT) return displayText;
  const idx = options.findIndex(o => formatOption(o) === displayText);
  return idx >= 0 ? options[idx] : displayText;
}

export const INTRO_TEXT = `Hi!\nIf you have seen this, it is because you have been selected to be part of my study on AI Gen Tools for ideation tasks. I just need to check the basic eligibility with a short form that takes less than two minutes.`;

export const PRIVACY_TEXT = `This form collects your professional background, design tool usage, and contact availability for the sole purpose of determining eligibility for a UX research study. Your data is stored securely on the researcher's local system and is not shared with any third party. You may request withdrawal of your data at any time by contacting the researcher.`;

export const CONSENT_TEXT = `[PLACEHOLDER — The researcher must replace this text with the consent language approved by their institution's ethics review board before deploying the screener.]`;
