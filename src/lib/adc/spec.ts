import type { GenerationInput } from './types';

export type MessageSpec = GenerationInput;

function toSingleLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeHeartfeltDepth(depth?: string): string | undefined {
  if (!depth) return undefined;
  const key = toSingleLine(depth);

  // Wizard uses: warmLight | feelSeen | mightCry
  // ADC prompt mapping uses: lightWarmth | feelSeen | deepConnection
  const map: Record<string, string> = {
    warmLight: 'lightWarmth',
    mightCry: 'deepConnection',
    // Pass-through for already-normalized values
    lightWarmth: 'lightWarmth',
    feelSeen: 'feelSeen',
    deepConnection: 'deepConnection',
  };

  return map[key] ?? key;
}

function normalizeRelationshipDetails(
  details?: Record<string, string>,
): Record<string, string> | undefined {
  if (!details) return undefined;

  const keyMap: Record<string, string> = {
    // Partner
    partnerSubtype: 'partnerType',
    partnerRecentMoment: 'recentMoment',
    partnerTheirThing: 'theirThing',

    // Friend
    friendSharedMemory: 'friendMemory',
    friendTheyreTheOneWho: 'theyAlways',
    friendInsideJoke: 'insideJoke',

    // Parent
    parentWhich: 'whichParent',
    parentTaughtYou: 'parentLesson',
    parentChildhoodMemory: 'favoriteMemory',

    // Child
    childCurrentPhase: 'childPhase',
    childProudMoment: 'childProud',
    childPersonality: 'childKindOf',

    // Sibling
    siblingBirthOrder: 'birthOrder',
    siblingDynamicNow: 'siblingDynamic',
    siblingChildhoodMemory: 'siblingMemory',
    siblingInsideJoke: 'siblingJoke',

    // Professional
    professionalType: 'professionalWho',
    professionalWhatTheyDid: 'professionalDid',
    professionalToneCheck: 'professionalTone',

    // Dating
    datingHowLong: 'datingDuration',
    datingHowMet: 'howMet',
    datingWhatYouLike: 'whatLikeMost',
    datingCardIntensity: 'datingIntensity',

    // Grandparent
    grandparentWhich: 'whichGrandparent',
    grandparentTheyAlways: 'grandparentAlways',

    // Other
    otherDescribe: 'otherRelationship',
    otherWhyCard: 'otherContext',
    otherWhatToSay: 'otherSpecial',
  };

  const valueMap: Record<string, Record<string, string>> = {
    partnerDuration: {
      new: 'under1Year',
      '1year': 'under1Year',
      years: '1to5Years',
      decade: 'over10Years',
    },
    professionalWho: {
      colleague: 'coworker',
    },
    professionalTone: {
      warm: 'warmPro',
    },
    childAge: {
      youngAdult: 'adult',
    },
  };

  const normalized: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(details)) {
    const key = keyMap[rawKey] ?? rawKey;
    const value = toSingleLine(rawValue ?? '');
    if (!value) continue;
    normalized[key] = valueMap[key]?.[value] ?? value;
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function extractCoupleFieldsFromDetails(
  spec: MessageSpec,
  details?: Record<string, string>,
): Record<string, string> | undefined {
  if (!details) return details;
  const out = { ...details };

  // Wizard stores these as strings; API expects top-level typed fields.
  const coupleMode = out.coupleMode;
  if (!spec.coupleMode && (coupleMode === 'yes' || coupleMode === 'no')) {
    spec.coupleMode = coupleMode === 'yes';
    delete out.coupleMode;
  }

  if (!spec.senderName && out.senderName) {
    spec.senderName = out.senderName;
    delete out.senderName;
  }

  if (!spec.coupleStory && out.coupleStory) {
    spec.coupleStory = out.coupleStory;
    delete out.coupleStory;
  }

  return Object.keys(out).length ? out : undefined;
}

export function buildMessageSpec(input: GenerationInput): MessageSpec {
  const spec: MessageSpec = {
    ...input,
    recipientName: toSingleLine(input.recipientName),
    relationship: toSingleLine(input.relationship).toLowerCase(),
    occasion: toSingleLine(input.occasion),
    cardName: input.cardName ? toSingleLine(input.cardName) : undefined,
    cardTone: input.cardTone ? toSingleLine(input.cardTone) : undefined,
    vibes: input.vibes?.map(toSingleLine).filter(Boolean),
    humorType: input.humorType ? toSingleLine(input.humorType) : undefined,
    heartfeltDepth: normalizeHeartfeltDepth(input.heartfeltDepth),
    quickTraits: input.quickTraits?.map(toSingleLine).filter(Boolean),
    relationshipDetails: normalizeRelationshipDetails(input.relationshipDetails),
    details: input.details ? toSingleLine(input.details) : undefined,
  };

  spec.relationshipDetails = extractCoupleFieldsFromDetails(spec, spec.relationshipDetails);

  return spec;
}

