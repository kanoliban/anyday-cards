/**
 * ADC v2 — Text Generation Prompts
 *
 * Composition-aware system prompt approach.
 * Instead of hand-coded composition rules (v1), we encode the "artist" knowledge
 * directly into Gemini's system prompt so it knows HOW to blend tones, weight traits, etc.
 *
 * Key insight: Composition reasoning > concatenation
 */

import type { GenerationInput } from '../../types';

export const ADC_VERSION_V2 = '2.0.0';

/**
 * The "Artist" System Prompt
 *
 * This encodes the tacit knowledge that a skilled prompt engineer develops:
 * - How to blend funny + heartfelt
 * - How to weight traits by relationship
 * - What makes a message feel personal vs generic
 * - Craft guidance (subtle references, not forced)
 */
export const SYSTEM_PROMPT_V2 = `You are AnydayCard's message generator. You create personalized greeting card messages that feel genuine, not generic.

## Your Craft (Composition Rules)

### Tone Blending
When multiple vibes are selected, they work TOGETHER:
- "funny + heartfelt" → Humor AMPLIFIES warmth, doesn't undercut it. Lead with lightness, land on sincerity.
- "funny + nostalgic" → Playful callbacks to shared memories.
- "heartfelt + nostalgic" → Tender reflection on the journey.
- "funny only" → Playful throughout, but never mean-spirited or try-hard.
- "heartfelt only" → Vulnerable but not melodramatic. Specific beats generic.
- "spicy" → ONLY for romantic relationships (partner, spouse). Suggestive warmth, not explicit.
- "nostalgic" → References to shared history, "remember when..." energy.
- "inspiring" → Lift them up, acknowledge their strength.

### Humor Types (when "funny" is selected)
Apply the specific humor style naturally:
- "insideJokes" → Reference shared experiences obliquely, like you're both in on it
- "dryWit" → Understated, deadpan delivery. Let them catch the joke.
- "overTheTop" → Go big, be dramatic, lean into absurdity
- "punny" → Clever wordplay, but make it land (no groaners)

### Heartfelt Calibration (when "heartfelt" is selected)
Match the depth to what they chose:
- "lightWarmth" → Appreciative but not intense. Friendly warm.
- "feelSeen" → Acknowledge something SPECIFIC about who they are.
- "deepConnection" → Go deep. Be vulnerable. It's okay if they cry (happy tears).

### Trait Integration
When personality traits are provided (coffeeAddict, bookworm, dogPerson, etc.):
- Weave them in NATURALLY, like a friend would
- Don't list traits — reference them in context
- One or two trait references is better than forcing all of them
- The trait should feel like YOU know this about them, not like you're reading a profile

Examples of GOOD trait integration:
- "coffeeAddict" → "Here's to another year of you being unreachable before your third cup"
- "bookworm" → "You deserve a day as good as the last chapter of a book you couldn't put down"
- "dogPerson" → "May your day have as much joy as your dog when you come home"

Examples of BAD trait integration (DON'T do this):
- "As someone who loves coffee and books..."
- "I know you're a total bookworm who also loves dogs..."

### Relationship Awareness
Calibrate intimacy and tone to the relationship:
- "partner/spouse" → Intimate, can reference shared life, inside jokes, "spicy" allowed
- "friend" → Casual warmth, inside joke territory, playful ribbing okay
- "parent" → Respectful appreciation, can acknowledge growth and gratitude
- "sibling" → Can be more teasing, shared childhood memories
- "grandparent" → Warm, respectful, acknowledging their role in your life
- "coworker/boss" → Warm but appropriate boundaries, professional-adjacent
- "child" → Encouraging, proud, can be playful

### Occasion Awareness
Let the occasion shape the message:
- "Birthday" → Celebration of THEM, not just the day
- "Thank You" → Specific gratitude, what they did and why it mattered
- "Congratulations" → Acknowledge the achievement, their journey to get there
- "Anniversary" → Celebrate the relationship, shared journey
- "Valentine's Day" → Romantic appreciation (partners) or platonic love (others)
- "Just Because" → The fact there's no occasion IS the point — you thought of them
- "Holiday" → Seasonal warmth, shared traditions

## Output Requirements
- 2-4 sentences MAXIMUM. Quality over quantity.
- NO "Dear [Name]" opening — the card design handles greetings
- NO sign-off ("Love," "Best," "Cheers," etc.) — the card handles that too
- The message should stand alone on a card interior
- First-person voice ("I" not "we") — unless couple mode is specified

## Quality Standard
The recipient should feel:
1. This was written FOR them, not a template filled in
2. The sender actually knows them (specific > generic)
3. Genuine emotion appropriate to the tone selected
4. A smile, a warm feeling, or happy tears — depending on the vibe

Write ONLY the message. Nothing else.`;

export interface TextPromptV2Result {
  systemPrompt: string;
  userMessage: string;
  version: string;
}

/**
 * Build the structured user message from wizard inputs
 *
 * The system prompt handles the HOW (composition craft).
 * The user message provides the WHAT (wizard data).
 */
function buildUserMessage(input: GenerationInput): string {
  const {
    recipientName,
    relationship,
    occasion,
    vibes,
    humorType,
    heartfeltDepth,
    quickTraits,
    relationshipDetails,
    details,
    coupleMode,
    senderName,
    coupleStory,
  } = input;

  const lines: string[] = [];

  // Core request
  lines.push(`Generate a ${occasion.toLowerCase()} message for ${recipientName}.`);
  lines.push('');

  // Relationship context
  lines.push(`Relationship: ${relationship.toLowerCase()}`);

  // Vibes/tones
  if (vibes?.length) {
    lines.push(`Vibes: ${vibes.join(', ')}`);
  }

  // Humor style (if funny is selected)
  if (humorType && vibes?.includes('funny')) {
    lines.push(`Humor style: ${formatHumorType(humorType)}`);
  }

  // Heartfelt depth (if heartfelt is selected)
  if (heartfeltDepth && vibes?.includes('heartfelt')) {
    lines.push(`Depth: ${formatHeartfeltDepth(heartfeltDepth)}`);
  }

  // Personality traits
  if (quickTraits?.length) {
    lines.push(`Their traits: ${quickTraits.join(', ')}`);
  }

  // Relationship-specific details (from dynamic forms)
  if (relationshipDetails && Object.keys(relationshipDetails).length > 0) {
    lines.push('');
    lines.push('About them:');
    for (const [key, value] of Object.entries(relationshipDetails)) {
      if (value && value.trim()) {
        lines.push(`- ${formatDetailKey(key)}: "${value}"`);
      }
    }
  }

  // Legacy details field
  if (details?.trim()) {
    lines.push(`Additional context: ${details}`);
  }

  // Couple mode
  if (coupleMode) {
    lines.push('');
    lines.push('COUPLE MODE: This message is from a couple. Use "we/us/our" language.');
    if (senderName) {
      lines.push(`Senders: ${senderName} and partner`);
    }
    if (coupleStory) {
      lines.push(`Couple's connection: ${coupleStory}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format humor type for readability
 */
function formatHumorType(humorType: string): string {
  const mapping: Record<string, string> = {
    insideJokes: 'reference shared experiences and inside jokes',
    dryWit: 'dry, deadpan wit — understated humor',
    overTheTop: 'over-the-top, dramatic, go big',
    punny: 'clever wordplay and puns',
  };
  return mapping[humorType] || humorType;
}

/**
 * Format heartfelt depth for readability
 */
function formatHeartfeltDepth(depth: string): string {
  const mapping: Record<string, string> = {
    lightWarmth: 'light and warm — appreciative but not intense',
    feelSeen: 'make them feel seen — acknowledge who they are',
    deepConnection: 'deep and vulnerable — okay if they happy-cry',
  };
  return mapping[depth] || depth;
}

/**
 * Format relationship detail keys for readability
 */
function formatDetailKey(key: string): string {
  const mapping: Record<string, string> = {
    theyAlways: 'They always',
    favoriteMemory: 'Favorite memory',
    whatYouAdmire: 'What I admire',
    insideJoke: 'Inside joke',
    sharedExperience: 'Shared experience',
    howTheyveHelped: 'How they\'ve helped',
    whatMakesThemSpecial: 'What makes them special',
  };
  return mapping[key] || key.replace(/([A-Z])/g, ' $1').trim();
}

/**
 * Build a v2.0 text generation prompt
 *
 * Returns both the system prompt (composition rules) and user message (data).
 * The API route calls Gemini with both.
 */
export function buildTextPromptV2(input: GenerationInput): TextPromptV2Result {
  return {
    systemPrompt: SYSTEM_PROMPT_V2,
    userMessage: buildUserMessage(input),
    version: ADC_VERSION_V2,
  };
}

/**
 * Get fallback message for v2 (reuse v1 fallbacks)
 *
 * The fallback logic doesn't change between versions.
 */
export function getTextFallbackV2(input: GenerationInput): {
  message: string;
  version: string;
  isFallback: true;
} {
  // Inline fallback to avoid circular dependency with v1
  const FALLBACK_TEMPLATES: Record<string, string[]> = {
    Birthday: [
      '{name}, another year of amazing memories with you! Here\'s to celebrating everything that makes you special.',
      'Happy birthday to the most wonderful {relationship}! May this year bring you all the joy you deserve.',
    ],
    'Thank You': [
      '{name}, your kindness means more than words can say. Thank you for being such an incredible {relationship}.',
    ],
    Congratulations: [
      '{name}, this achievement is so well-deserved! I\'m incredibly proud of everything you\'ve accomplished.',
    ],
    Holiday: [
      '{name}, wishing you warmth, joy, and all the magic this season has to offer.',
    ],
    "Valentine's Day": [
      '{name}, you make my heart skip a beat in the best possible way. Happy Valentine\'s Day to someone truly special.',
    ],
    Anniversary: [
      '{name}, every moment with you has been a gift. Here\'s to many more years together.',
    ],
    'Just Because': [
      '{name}, just wanted you to know how much you mean to me. No special occasion needed.',
    ],
  };

  const COUPLE_TEMPLATES: string[] = [
    '{name}, every moment with you is a gift I never knew I needed. Here\'s to us and all the adventures still to come.',
  ];

  let template: string;
  if (input.coupleMode && input.senderName) {
    template = COUPLE_TEMPLATES[0];
  } else {
    const templates = FALLBACK_TEMPLATES[input.occasion] || FALLBACK_TEMPLATES['Birthday'];
    template = templates[Math.floor(Math.random() * templates.length)];
  }

  const message = template
    .replace('{name}', input.recipientName)
    .replace('{relationship}', input.relationship.toLowerCase());

  return {
    message,
    version: ADC_VERSION_V2,
    isFallback: true,
  };
}
