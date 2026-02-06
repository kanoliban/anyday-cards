import type {
  HeartfeltDepth,
  HumorType,
  OccasionType,
  QuickTrait,
  RelationshipType,
  VibeType,
  WizardStep,
} from '../models';

export const STEP_ORDER: WizardStep[] = [
  'name',
  'relationship',
  'occasion',
  'vibe',
  'humorType',
  'heartfeltDepth',
  'relationshipQuestions',
  'quickTraits',
  'preview',
];

export const STEP_LABELS: Record<WizardStep, string> = {
  name: 'Recipient',
  relationship: 'Relationship',
  occasion: 'Occasion',
  coupleMode: 'Couple Mode',
  senderName: 'Your Name',
  coupleStory: 'Your Story',
  vibe: 'Vibe',
  humorType: 'Humor Style',
  heartfeltDepth: 'Depth',
  relationshipQuestions: 'Details',
  quickTraits: 'Traits',
  preview: 'Preview',
};

export const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string; emoji: string }[] = [
  { value: 'partner', label: 'Partner', emoji: '💕' },
  { value: 'friend', label: 'Friend', emoji: '🤝' },
  { value: 'parent', label: 'Parent', emoji: '👨‍👩‍👧' },
  { value: 'child', label: 'Child', emoji: '👶' },
  { value: 'sibling', label: 'Sibling', emoji: '👯' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'dating', label: 'Dating', emoji: '💋' },
  { value: 'grandparent', label: 'Grandparent', emoji: '👴' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

export const OCCASION_OPTIONS: { value: OccasionType; label: string; emoji: string }[] = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { value: 'holiday', label: 'Holiday', emoji: '🎄' },
  { value: 'support', label: 'Support', emoji: '🤗' },
  { value: 'achievement', label: 'Achievement', emoji: '🏆' },
  { value: 'miss', label: 'Missing You', emoji: '💭' },
  { value: 'justBecause', label: 'Just Because', emoji: '💝' },
  { value: 'apology', label: 'Apology', emoji: '🙏' },
  { value: 'thanks', label: 'Thank You', emoji: '🙌' },
  { value: 'congratulations', label: 'Congrats', emoji: '🎉' },
];

export const VIBE_OPTIONS: { value: VibeType; label: string; emoji: string }[] = [
  { value: 'funny', label: 'Funny', emoji: '😂' },
  { value: 'heartfelt', label: 'Heartfelt', emoji: '❤️' },
  { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { value: 'weird', label: 'Weird', emoji: '🤪' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'nostalgic', label: 'Nostalgic', emoji: '📷' },
  { value: 'encouraging', label: 'Encouraging', emoji: '💪' },
  { value: 'apologetic', label: 'Apologetic', emoji: '😔' },
  { value: 'proud', label: 'Proud', emoji: '🌟' },
  { value: 'playful', label: 'Playful', emoji: '😜' },
];

export const HUMOR_OPTIONS: { value: HumorType; label: string; description: string }[] = [
  { value: 'insideJokes', label: 'Inside Jokes', description: 'References only you two get' },
  { value: 'playfulTeasing', label: 'Playful Teasing', description: 'Lovingly poking fun' },
  { value: 'absurdist', label: 'Absurdist', description: 'Random and chaotic' },
  { value: 'dryDeadpan', label: 'Dry & Deadpan', description: 'Subtle and understated' },
  { value: 'selfDeprecating', label: 'Self-Deprecating', description: 'Making fun of yourself' },
  { value: 'wholesomeSilly', label: 'Wholesome Silly', description: 'Sweet and goofy' },
];

export const HEARTFELT_OPTIONS: { value: HeartfeltDepth; label: string; description: string }[] = [
  { value: 'warmLight', label: 'Warm & Light', description: 'Sweet but not too heavy' },
  { value: 'feelSeen', label: 'Feel Seen', description: 'Deeply personal and meaningful' },
  { value: 'mightCry', label: 'Might Cry', description: 'All the feelings' },
];

export const QUICK_TRAIT_OPTIONS: { value: QuickTrait; label: string; emoji: string }[] = [
  { value: 'dogPerson', label: 'Dog Person', emoji: '🐕' },
  { value: 'catPerson', label: 'Cat Person', emoji: '🐱' },
  { value: 'coffeeAddict', label: 'Coffee Addict', emoji: '☕' },
  { value: 'teaDrinker', label: 'Tea Drinker', emoji: '🍵' },
  { value: 'gymRat', label: 'Gym Rat', emoji: '🏋️' },
  { value: 'hatesMornings', label: 'Hates Mornings', emoji: '😴' },
  { value: 'alwaysLate', label: 'Always Late', emoji: '⏰' },
  { value: 'plantParent', label: 'Plant Parent', emoji: '🌿' },
  { value: 'gamer', label: 'Gamer', emoji: '🎮' },
  { value: 'bookworm', label: 'Bookworm', emoji: '📚' },
  { value: 'foodie', label: 'Foodie', emoji: '🍜' },
  { value: 'homebody', label: 'Homebody', emoji: '🏠' },
  { value: 'overthinker', label: 'Overthinker', emoji: '🧠' },
  { value: 'crierAtMovies', label: 'Cries at Movies', emoji: '😭' },
  { value: 'neatFreak', label: 'Neat Freak', emoji: '✨' },
  { value: 'creativeMess', label: 'Creative Mess', emoji: '🎨' },
  { value: 'workaholic', label: 'Workaholic', emoji: '💻' },
  { value: 'adventureSeeker', label: 'Adventure Seeker', emoji: '🧗' },
  { value: 'introvert', label: 'Introvert', emoji: '🤫' },
  { value: 'lifeOfTheParty', label: 'Life of the Party', emoji: '🎊' },
];

// Relationship-specific questions
export interface RelationshipQuestion {
  key: string;
  question: string;
  type: 'text' | 'select' | 'pills';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const RELATIONSHIP_QUESTIONS: Record<RelationshipType, RelationshipQuestion[]> = {
  partner: [
    {
      key: 'partnerSubtype',
      question: 'What kind of partner?',
      type: 'pills',
      options: [
        { value: 'spouse', label: 'Spouse' },
        { value: 'boyfriend', label: 'Boyfriend' },
        { value: 'girlfriend', label: 'Girlfriend' },
        { value: 'partner', label: 'Partner' },
        { value: 'fiance', label: 'Fiancé(e)' },
      ],
    },
    {
      key: 'partnerDuration',
      question: 'How long have you been together?',
      type: 'pills',
      options: [
        { value: 'new', label: 'Just started' },
        { value: '1year', label: '~1 year' },
        { value: 'years', label: 'Several years' },
        { value: 'decade', label: 'A decade+' },
      ],
    },
    {
      key: 'partnerRecentMoment',
      question: 'A recent moment that made you smile?',
      type: 'text',
      placeholder: 'e.g., When they made me coffee without asking',
    },
    {
      key: 'partnerTheirThing',
      question: "What's something they're obsessed with?",
      type: 'text',
      placeholder: 'e.g., True crime podcasts, houseplants',
    },
    {
      key: 'partnerInsideJoke',
      question: 'An inside joke or phrase only you two get?',
      type: 'text',
      placeholder: 'Optional - makes it extra personal',
    },
  ],
  friend: [
    {
      key: 'friendTexture',
      question: 'What kind of friendship?',
      type: 'pills',
      options: [
        { value: 'bestie', label: 'Best friend' },
        { value: 'old', label: 'Old friend' },
        { value: 'new', label: 'New friend' },
        { value: 'workFriend', label: 'Work friend' },
        { value: 'distantClose', label: 'Distant but close' },
      ],
    },
    {
      key: 'friendHowMet',
      question: 'How did you meet?',
      type: 'text',
      placeholder: 'e.g., College roommates, through mutual friends',
    },
    {
      key: 'friendSharedMemory',
      question: 'A favorite memory together?',
      type: 'text',
      placeholder: 'e.g., That road trip where we got lost',
    },
    {
      key: 'friendTheyreTheOneWho',
      question: "They're the one who...",
      type: 'text',
      placeholder: 'e.g., always answers at 2am, makes the best playlists',
    },
    {
      key: 'friendInsideJoke',
      question: 'An inside joke?',
      type: 'text',
      placeholder: 'Optional',
    },
  ],
  parent: [
    {
      key: 'parentWhich',
      question: 'Which parent?',
      type: 'pills',
      options: [
        { value: 'mom', label: 'Mom' },
        { value: 'dad', label: 'Dad' },
        { value: 'stepmom', label: 'Stepmom' },
        { value: 'stepdad', label: 'Stepdad' },
        { value: 'parentFigure', label: 'Parent figure' },
      ],
    },
    {
      key: 'parentRelationshipVibe',
      question: "What's your relationship like?",
      type: 'pills',
      options: [
        { value: 'close', label: 'Very close' },
        { value: 'loving', label: 'Loving but distant' },
        { value: 'complicated', label: 'Complicated' },
        { value: 'reconnecting', label: 'Reconnecting' },
      ],
    },
    {
      key: 'parentTaughtYou',
      question: 'Something they taught you?',
      type: 'text',
      placeholder: 'e.g., How to change a tire, to always be kind',
    },
    {
      key: 'parentAlwaysSays',
      question: 'Something they always say?',
      type: 'text',
      placeholder: 'e.g., "Call me when you get home"',
    },
    {
      key: 'parentChildhoodMemory',
      question: 'A childhood memory with them?',
      type: 'text',
      placeholder: 'Optional',
    },
  ],
  child: [
    {
      key: 'childAge',
      question: 'How old are they?',
      type: 'pills',
      options: [
        { value: 'baby', label: 'Baby/Toddler' },
        { value: 'kid', label: 'Kid (5-12)' },
        { value: 'teen', label: 'Teen' },
        { value: 'youngAdult', label: 'Young adult' },
        { value: 'adult', label: 'Adult' },
      ],
    },
    {
      key: 'childCurrentPhase',
      question: "What's their current phase?",
      type: 'text',
      placeholder: 'e.g., Dinosaurs, starting college, new job',
    },
    {
      key: 'childProudMoment',
      question: 'Something that made you proud recently?',
      type: 'text',
      placeholder: 'e.g., Stood up for a friend, got their first job',
    },
    {
      key: 'childPersonality',
      question: "They're the kind of kid who...",
      type: 'text',
      placeholder: 'e.g., makes everyone laugh, always has a book',
    },
  ],
  sibling: [
    {
      key: 'siblingType',
      question: 'What kind of sibling?',
      type: 'pills',
      options: [
        { value: 'sister', label: 'Sister' },
        { value: 'brother', label: 'Brother' },
        { value: 'stepSibling', label: 'Step-sibling' },
        { value: 'halfSibling', label: 'Half-sibling' },
        { value: 'siblingInLaw', label: 'In-law' },
      ],
    },
    {
      key: 'siblingBirthOrder',
      question: 'Birth order?',
      type: 'pills',
      options: [
        { value: 'older', label: 'Older than me' },
        { value: 'younger', label: 'Younger than me' },
        { value: 'twin', label: 'Twin' },
      ],
    },
    {
      key: 'siblingDynamicNow',
      question: "What's your dynamic now?",
      type: 'pills',
      options: [
        { value: 'bestFriends', label: 'Best friends' },
        { value: 'closeish', label: 'Close-ish' },
        { value: 'lovinglyAnnoying', label: 'Lovingly annoying' },
        { value: 'reconnecting', label: 'Reconnecting' },
      ],
    },
    {
      key: 'siblingChildhoodMemory',
      question: 'A childhood memory together?',
      type: 'text',
      placeholder: 'e.g., Building forts, fighting over the remote',
    },
    {
      key: 'siblingInsideJoke',
      question: 'An inside joke?',
      type: 'text',
      placeholder: 'Optional',
    },
  ],
  professional: [
    {
      key: 'professionalType',
      question: 'Who are they to you?',
      type: 'pills',
      options: [
        { value: 'boss', label: 'Boss/Manager' },
        { value: 'colleague', label: 'Colleague' },
        { value: 'mentor', label: 'Mentor' },
        { value: 'client', label: 'Client' },
        { value: 'employee', label: 'Employee' },
      ],
    },
    {
      key: 'professionalContext',
      question: "What's the context?",
      type: 'text',
      placeholder: 'e.g., Leaving the company, promotion, project completed',
    },
    {
      key: 'professionalWhatTheyDid',
      question: 'What did they do that matters?',
      type: 'text',
      placeholder: 'e.g., Mentored me, helped land a big deal',
    },
    {
      key: 'professionalToneCheck',
      question: 'How formal should this be?',
      type: 'pills',
      options: [
        { value: 'formal', label: 'Keep it professional' },
        { value: 'warm', label: 'Warm but appropriate' },
        { value: 'casual', label: 'We joke around' },
      ],
    },
  ],
  dating: [
    {
      key: 'datingHowLong',
      question: 'How long have you been seeing each other?',
      type: 'pills',
      options: [
        { value: 'justMet', label: 'Just met' },
        { value: 'fewDates', label: 'A few dates' },
        { value: 'coupleMonths', label: 'Couple months' },
        { value: 'gettingSerious', label: 'Getting serious' },
      ],
    },
    {
      key: 'datingHowMet',
      question: 'How did you meet?',
      type: 'text',
      placeholder: 'e.g., Dating app, through friends, coffee shop',
    },
    {
      key: 'datingWhatYouLike',
      question: 'What do you like most about them?',
      type: 'text',
      placeholder: "e.g., Their laugh, how they listen, they're so weird",
    },
    {
      key: 'datingCardIntensity',
      question: 'How intense should the card be?',
      type: 'pills',
      options: [
        { value: 'light', label: 'Keep it light' },
        { value: 'flirty', label: 'Flirty' },
        { value: 'earnest', label: 'Earnest' },
      ],
    },
  ],
  grandparent: [
    {
      key: 'grandparentWhich',
      question: 'Which grandparent?',
      type: 'pills',
      options: [
        { value: 'grandma', label: 'Grandma' },
        { value: 'grandpa', label: 'Grandpa' },
        { value: 'greatGrandparent', label: 'Great-grandparent' },
      ],
    },
    {
      key: 'grandparentRelationship',
      question: "What's your relationship like?",
      type: 'pills',
      options: [
        { value: 'veryClose', label: 'Very close' },
        { value: 'loving', label: 'Loving' },
        { value: 'reconnecting', label: 'Reconnecting' },
        { value: 'memorial', label: 'Honoring their memory' },
      ],
    },
    {
      key: 'grandparentMemory',
      question: 'A memory with them?',
      type: 'text',
      placeholder: 'e.g., Baking cookies together, their stories',
    },
    {
      key: 'grandparentTheyAlways',
      question: 'They always...',
      type: 'text',
      placeholder: 'e.g., slip you money, make the best pie',
    },
  ],
  other: [
    {
      key: 'otherDescribe',
      question: 'How would you describe this person?',
      type: 'text',
      placeholder: 'e.g., Neighbor, teacher, therapist, online friend',
    },
    {
      key: 'otherWhyCard',
      question: 'Why are you sending this card?',
      type: 'text',
      placeholder: 'e.g., They helped me through something, moving away',
    },
    {
      key: 'otherWhatToSay',
      question: 'What do you most want to say?',
      type: 'text',
      placeholder: 'The heart of your message',
    },
  ],
};

