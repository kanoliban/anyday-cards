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

export const ADC_VERSION_V2 = '2.0.6';

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
- "funny + heartfelt" → Humor AMPLIFIES warmth, doesn't undercut it. Lead with lightness, land on sincerity. Default to "feelSeen" depth — make them laugh AND feel known.
- "funny + nostalgic" → Playful callbacks to shared memories.
- "heartfelt + nostalgic" → Tender reflection on the journey.
- "heartfelt + grateful" → Deep appreciation. Specific about what they've done AND who they are. Let gratitude carry the emotion.
- "heartfelt + proud" → Celebrate them while showing you SEE them. Pride that feels earned, not patronizing.
- "heartfelt + encouraging" → Lift them up with genuine belief. You see their strength even when they can't.
- "grateful + proud" → Acknowledge what they've done AND what it took. Honor the journey.
- "grateful + nostalgic" → Thank them through the lens of shared history. "Remember when..." meets "thank you for..."
- "encouraging + proud" → Celebrate what they've done AND fuel what's next. Pride in their past, belief in their future.
- "playful + heartfelt" → Light energy that lands somewhere real. The playfulness makes the sincerity easier to say.
- "weird + heartfelt" → Absurdist wrapper around genuine emotion. The weird makes the heart hit harder.
- "weird + playful" → Pure chaos energy, delightfully unhinged. No emotional landing required.
- "weird + funny" → Absurdist humor, surreal jokes. Lean into the bizarre.
- "spicy + funny" → Flirty teasing, playful innuendo. The humor IS the flirtation. Think witty banter, not crass.
- "spicy + heartfelt" → Intimate vulnerability. Romantic depth with sensual undertones.
- "funny only" → Playful throughout, but never mean-spirited or try-hard.
- "heartfelt only" → Vulnerable but not melodramatic. Specific beats generic.
- "spicy" → ONLY for romantic relationships (partner, spouse). Suggestive warmth, not explicit.
- "nostalgic" → References to shared history, "remember when..." energy. Warm reflection on the past that honors the present. Can be bittersweet but never sad.
- "inspiring" / "encouraging" → Lift them up, acknowledge their strength.
- "weird" → Embrace the absurd. Non sequiturs, surreal imagery, unexpected tangents that somehow work. Think "Tim & Eric" meets greeting card. Weird is NOT the same as funny — weird can be sincere, tender, or contemplative through a surreal lens. Still lands emotionally — weird doesn't mean cold or detached.
- "grateful" → Genuine appreciation. What they did, why it mattered, how it affected you.
- "playful" → Light, teasing energy. Like funny but softer — more smile than laugh.
- "proud" → Acknowledge their achievement or growth. You see them, you're impressed.
- "apologetic" → Sincere, not groveling. Own it, express it, don't overdo it.

### Humor Types (when "funny" is selected)
Apply the specific humor style naturally:
- "insideJokes" → Reference shared experiences obliquely, like you're both in on it
- "playfulTeasing" → Gentle ribbing that shows you KNOW them. Affectionate, never mean.
- "absurdist" → Weird tangents, surreal imagery, non sequiturs that somehow work
- "dryDeadpan" → Understated delivery. Let them catch the joke. Less is more.
- "selfDeprecating" → Make fun of yourself, not them. Humble and endearing.
- "wholesomeSilly" → Pure goofiness, no edge. Smile-inducing, family-friendly funny.

### Inside Joke Content (regardless of humor type)
If the user provides inside joke CONTENT in their details (e.g., "Inside joke: we always say 'that's so us'"), USE IT — even if they didn't select "insideJokes" as the humor style. The content is a gift; weave it in naturally to make the message feel personal. This applies to all vibes, not just funny.

### Heartfelt Calibration (when "heartfelt" is selected)
Match the depth to what they chose:
- "lightWarmth" → Appreciative but not intense. Friendly warm.
- "feelSeen" → Acknowledge something SPECIFIC about who they are.
- "deepConnection" → Go deep. Be vulnerable. It's okay if they cry (happy tears).

NOTE: If heartfelt is combined with another vibe (funny, grateful, proud) and no depth is specified, default to "feelSeen" — make them feel known without going overwhelmingly deep.

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
- "catPerson" → "You've trained me as well as your cat has trained you"
- "hatesMornings" → "I know it's early for you (it's always early for you)"
- "overthinker" → "Stop analyzing this card and just feel it"
- "crierAtMovies" → "Get the tissues ready — yes, even for a birthday card"
- "plantParent" → "You nurture everything you touch, including me"
- "gamer" → "Achievement unlocked: another year of being awesome"
- "foodie" → "May your year be as satisfying as that perfect bite"
- "homebody" → "Here's to celebrating exactly where you love to be"
- "adventureSeeker" → "Another year of stories I can barely keep up with"
- "workaholic" → "Take a break — doctor's orders (me, I'm the doctor now)"

Examples of BAD trait integration (DON'T do this):
- "As someone who loves coffee and books..."
- "I know you're a total bookworm who also loves dogs..."
- Listing traits like a profile: "You're a coffee-loving, book-reading, dog person..."

### Relationship Awareness
Calibrate intimacy and tone to the relationship:
- "partner/spouse" → Intimate, can reference shared life, inside jokes, "spicy" allowed
- "dating" → Flirty potential but calibrate to stated intensity (light/flirty/earnest). Don't assume commitment level.
- "friend" → Casual warmth, inside joke territory, playful ribbing okay
- "parent" → Respectful appreciation, can acknowledge growth and gratitude
  - If "mom" specified: Can lean warmer, nurturing appreciation
  - If "dad" specified: Can acknowledge acts of service, quiet support
  - If "step-parent" or "parent figure": Honor the CHOICE to be in their life
- "sibling" → Can be more teasing, shared childhood memories. Birth order affects dynamic.
  - Older sibling: Can acknowledge their guidance/example
  - Younger sibling: Can be protective, proud of their growth
  - Twins: Unique bond, shared journey
- "grandparent" → Warm, respectful, acknowledging their role in your life
- "professional" → Warm but appropriate boundaries. CALIBRATE TO STATED TONE:
  - If "casual": Friendly, can use light humor, first names feel natural
  - If "warmPro" (warm but professional): Genuine appreciation, appropriate warmth, no oversharing
  - If "formal": Respectful, structured, avoid casual language, maintain dignity
  Then apply relationship context:
  - Boss/manager: Respectful, acknowledge their leadership
  - Coworker: Collegial warmth, can be more casual (if tone permits)
  - Mentor: Deep appreciation for guidance
  - Client: Professional gratitude
- "child" → Encouraging, proud, can be playful. Calibrate to age.
  - Baby/toddler: The card is really for the parents to keep
  - Kid: Simple, warm, celebratory
  - Teen: Respect their emerging identity
  - Adult child: Peer warmth, pride in who they've become

### Occasion Awareness
Let the occasion shape the message (values match wizard input):
- "birthday" → Celebration of THEM, not just the day
- "thanks" → Specific gratitude, what they did and why it mattered
  - If thanking for helping achieve something: Acknowledge THEIR role in YOUR success. Don't make it all about you — honor how they contributed.
- "congratulations" / "achievement" → Acknowledge the achievement, their journey to get there
- "anniversary" → Celebrate the relationship, shared journey
- "valentine" → Romantic appreciation (partners) or platonic love (others)
- "justBecause" → The fact there's no occasion IS the point — you thought of them
- "holiday" → Seasonal warmth, shared traditions
- "support" → They're going through something. Be present, not preachy. Acknowledge the hard, offer warmth.
  - DON'T: Give advice, silver-lining it, say "everything happens for a reason"
  - DO: Acknowledge the situation is hard, express you're there, honor their strength
- "miss" → You miss them. Express longing without guilt-tripping. Make them feel wanted.
  - DON'T: Make them feel bad for being away, passive-aggressive "must be nice"
  - DO: Genuine "thinking of you" energy, warmth without obligation
- "apology" → You messed up. Own it directly, express remorse, don't over-explain or make excuses.
  - DON'T: "I'm sorry you felt that way", justify, minimize
  - DO: "I was wrong", acknowledge impact, express genuine regret

### Context-Aware Trait Handling
Some traits become sensitive in certain contexts. BE CAREFUL:
- "workaholic" + "support" (job loss) → DON'T reference work ethic. Focus on who they ARE, not what they DO.
- "workaholic" + "support" (burnout) → Acknowledge the need for rest without judgment.
- "overthinker" + "apology" → DON'T say "I know you're overthinking this" — dismissive.
- "crierAtMovies" + "support" → Can gently acknowledge emotions are okay, but don't make them feel weak.
- "gymRat" + "support" (injury/health) → DON'T reference fitness. Focus on resilience, healing.
- "adventureSeeker" + "miss" → Can reference adventures, but don't make absence feel like abandonment.

When in doubt on sensitive occasions: Focus on WHO they are (character, heart, your relationship) not WHAT they do (hobbies, habits, achievements).

## Output Requirements
- 2-4 sentences MAXIMUM. Quality over quantity.
- NO "Dear [Name]" opening — the card design handles greetings
- NO sign-off ("Love," "Best," "Cheers," etc.) — the card handles that too
- The message should stand alone on a card interior
- First-person voice ("I" not "we") by default
- COUPLE MODE (when specified): Use "we/us/our" because BOTH partners are signing this card together to someone else. Couple mode is for cards TO friends/family FROM a couple — NOT for romantic cards between partners.

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
    cardName,
    cardTone,
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
  lines.push(`Generate a ${formatOccasion(occasion)} message for ${recipientName}.`);
  lines.push('');

  // Relationship context
  lines.push(`Relationship: ${relationship.toLowerCase()}`);

  // Card design metadata
  if (cardTone) {
    lines.push(`Card tone: ${cardTone}`);
  }
  if (cardName) {
    lines.push(`Card design: ${cardName}`);
  }

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
    const formattedTraits = quickTraits.map(formatTrait).join(', ');
    lines.push(`Their traits: ${formattedTraits}`);
  }

  // Relationship-specific details (from dynamic forms)
  if (relationshipDetails && Object.keys(relationshipDetails).length > 0) {
    lines.push('');
    lines.push('About them:');
    for (const [key, value] of Object.entries(relationshipDetails)) {
      if (value && value.trim()) {
        const formattedValue = formatDetailValue(key, value);
        lines.push(`- ${formatDetailKey(key)}: "${formattedValue}"`);
      }
    }
  }

  // Legacy details field
  if (details?.trim()) {
    lines.push(`Additional context: ${details}`);
  }

  // Couple mode (only for non-romantic recipients — both partners signing together)
  const isRomanticRecipient = ['partner', 'spouse', 'dating'].includes(relationship.toLowerCase());
  if (coupleMode && !isRomanticRecipient) {
    lines.push('');
    lines.push('COUPLE MODE: Both partners are signing this card together. Use "we/us/our" language.');
    if (senderName) {
      lines.push(`Signed by: ${senderName} and their partner`);
    }
    if (coupleStory) {
      lines.push(`How we know them: ${coupleStory}`);
    }
  } else if (coupleMode && isRomanticRecipient) {
    // Ignore couple mode for romantic recipients — it's a logical conflict
    // The message should remain first-person "I" when writing to your partner
  }

  return lines.join('\n');
}

/**
 * Format occasion for human readability
 */
function formatOccasion(occasion: string): string {
  const mapping: Record<string, string> = {
    birthday: 'birthday',
    valentine: "Valentine's Day",
    anniversary: 'anniversary',
    holiday: 'holiday',
    support: 'supportive',
    achievement: 'congratulations',
    miss: '"I miss you"',
    justBecause: '"just because"',
    apology: 'apology',
    thanks: 'thank you',
    congratulations: 'congratulations',
  };
  return mapping[occasion] || occasion.toLowerCase();
}

/**
 * Format trait for human readability
 */
function formatTrait(trait: string): string {
  const mapping: Record<string, string> = {
    coffeeAddict: 'coffee addict',
    bookworm: 'bookworm',
    dogPerson: 'dog person',
    catPerson: 'cat person',
    hatesMornings: 'hates mornings',
    nightOwl: 'night owl',
    overthinker: 'overthinker',
    crierAtMovies: 'cries at movies',
    plantParent: 'plant parent',
    gamer: 'gamer',
    foodie: 'foodie',
    homebody: 'homebody',
    adventureSeeker: 'adventure seeker',
    workaholic: 'workaholic',
    gymRat: 'gym rat',
    musicLover: 'music lover',
    techNerd: 'tech nerd',
    artsy: 'artsy',
    outdoorsy: 'outdoorsy',
    shopaholic: 'shopaholic',
    sportsLover: 'sports lover',
    tvBinger: 'TV binger',
    earlyBird: 'early bird',
    socialButterfly: 'social butterfly',
    introvert: 'introvert',
    oldSoul: 'old soul',
    youngAtHeart: 'young at heart',
    alwaysLate: 'always late',
    organizedAF: 'super organized',
    creativeType: 'creative type',
    teaDrinker: 'tea drinker',
    neatFreak: 'neat freak',
    creativeMess: 'creative mess',
    lifeOfTheParty: 'life of the party',
  };
  return mapping[trait] || trait.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
}

/**
 * Format humor type for readability
 */
function formatHumorType(humorType: string): string {
  const mapping: Record<string, string> = {
    insideJokes: 'reference shared experiences and inside jokes',
    playfulTeasing: 'playful teasing, gentle ribbing',
    absurdist: 'absurdist, weird tangents, surreal',
    dryDeadpan: 'dry, deadpan delivery — understated',
    selfDeprecating: 'self-deprecating, make fun of yourself',
    wholesomeSilly: 'wholesome silly, pure goofiness',
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
 * Format pill/select values for readability
 */
function formatDetailValue(key: string, value: string): string {
  const valueMapping: Record<string, Record<string, string>> = {
    friendTexture: {
      bestie: 'best friend',
      old: 'old friend',
      new: 'new friend',
      workFriend: 'work friend',
      distantClose: 'distant but close',
    },
    friendDuration: {
      newFriend: 'pretty new',
      fewYears: 'a few years',
      longTime: 'a long time',
      forever: 'forever',
    },
    partnerDuration: {
      under1Year: 'under 1 year',
      '1to5Years': '1-5 years',
      '5to10Years': '5-10 years',
      over10Years: '10+ years',
    },
    partnerType: {
      spouse: 'spouse',
      longTermPartner: 'long-term partner',
      engaged: 'engaged',
      boyfriend: 'boyfriend',
      girlfriend: 'girlfriend',
      partner: 'partner',
      fiance: 'fiance(e)',
    },
    datingDuration: {
      justMet: 'just met',
      fewDates: 'a few dates',
      coupleMonths: 'a couple months',
      gettingSerious: 'getting serious',
    },
    datingIntensity: {
      light: 'keep it light',
      flirty: 'flirty',
      earnest: 'earnest',
    },
    whichParent: {
      mom: 'Mom',
      dad: 'Dad',
      stepParent: 'step-parent',
      parentFigure: 'parent figure',
      stepmom: 'Stepmom',
      stepdad: 'Stepdad',
    },
    childAge: {
      baby: 'baby/toddler',
      kid: 'kid (3-12)',
      teen: 'teenager',
      adult: 'adult',
      youngAdult: 'young adult',
    },
    siblingType: {
      brother: 'brother',
      sister: 'sister',
      stepSibling: 'step-sibling',
      halfSibling: 'half-sibling',
      siblingInLaw: 'in-law',
    },
    birthOrder: {
      older: 'they\'re older',
      younger: 'they\'re younger',
      twin: 'we\'re twins',
    },
    whichGrandparent: {
      grandma: 'Grandma',
      grandpa: 'Grandpa',
      nana: 'Nana',
      papa: 'Papa',
      greatGrandparent: 'great-grandparent',
    },
    grandparentStyle: {
      spoiler: 'the spoiler',
      storyteller: 'the storyteller',
      advisor: 'the wise advisor',
      adventurer: 'still adventurous',
    },
    professionalWho: {
      boss: 'boss/manager',
      coworker: 'coworker',
      mentor: 'mentor',
      client: 'client',
      employee: 'employee',
      colleague: 'coworker',
    },
    professionalTone: {
      casual: 'pretty casual',
      warmPro: 'warm but professional',
      formal: 'formal',
      warm: 'warm but appropriate',
    },
    parentRelationshipVibe: {
      close: 'very close',
      loving: 'loving but distant',
      complicated: 'complicated',
      reconnecting: 'reconnecting',
    },
    grandparentRelationship: {
      veryClose: 'very close',
      loving: 'loving',
      reconnecting: 'reconnecting',
      memorial: 'honoring their memory',
    },
  };

  return valueMapping[key]?.[value] || value;
}

/**
 * Format relationship detail keys for readability
 */
function formatDetailKey(key: string): string {
  const mapping: Record<string, string> = {
    // Generic
    theyAlways: 'They always',
    favoriteMemory: 'Favorite memory',
    whatYouAdmire: 'What I admire',
    insideJoke: 'Inside joke',
    sharedExperience: 'Shared experience',
    howTheyveHelped: 'How they\'ve helped',
    whatMakesThemSpecial: 'What makes them special',
    // Friend
    friendTexture: 'Friendship type',
    friendDuration: 'How long we\'ve been friends',
    friendHowMet: 'How we met',
    friendSpecial: 'What makes them a good friend',
    friendMemory: 'A memory we share',
    // Partner
    partnerType: 'Relationship',
    partnerDuration: 'Together for',
    recentMoment: 'Recent moment I loved',
    theirThing: 'Their thing',
    partnerInsideJoke: 'Inside joke',
    // Dating
    datingDuration: 'How long we\'ve been seeing each other',
    howMet: 'How we met',
    whatLikeMost: 'What I like most about them',
    datingIntensity: 'Card intensity',
    // Parent
    whichParent: 'Which parent',
    parentRelationshipVibe: 'Relationship vibe',
    parentMeaning: 'What they mean to me',
    parentLesson: 'A lesson they taught me',
    parentAlways: 'They always',
    // Sibling
    siblingType: 'Sibling',
    birthOrder: 'Birth order',
    siblingDynamic: 'Our dynamic',
    siblingMemory: 'Childhood memory',
    siblingJoke: 'Inside joke',
    // Grandparent
    whichGrandparent: 'Grandparent',
    grandparentStyle: 'Their style',
    grandparentRelationship: 'Relationship vibe',
    grandparentMemory: 'A memory with them',
    grandparentAlways: 'They always',
    // Child
    childAge: 'Age',
    childPhase: 'Current phase',
    childProud: 'Something that made me proud',
    childKindOf: 'They\'re the kind of kid who',
    // Professional
    professionalWho: 'Who they are',
    professionalContext: 'Context',
    professionalDid: 'What they did',
    professionalTone: 'Formality level',
    // Other
    otherRelationship: 'How I know them',
    otherContext: 'Context for this card',
    otherSpecial: 'What makes them special',
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
