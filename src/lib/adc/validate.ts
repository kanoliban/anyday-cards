import type { GenerationInput } from './types';

export type MessageValidationIssue =
  | 'empty'
  | 'too_many_paragraphs'
  | 'starts_with_greeting'
  | 'starts_with_dear'
  | 'has_signoff'
  | 'sentence_count_out_of_range';

export type MessageValidationResult = {
  ok: boolean;
  issues: MessageValidationIssue[];
  sentenceCount: number;
};

function countSentences(text: string): number {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return 0;

  // Count sentence terminators, allowing trailing quotes/brackets.
  const matches = normalized.match(/[.!?]+(?:["')\]]+)?(?=\s|$)/g);
  const count = matches?.length ?? 0;
  return count === 0 ? 1 : count;
}

function hasSignoff(text: string): boolean {
  const trimmed = text.trim();
  // Common sign-offs (with optional trailing name/punctuation).
  return /(?:^|\n)\s*(love|with love|xoxo|xo|best|cheers|sincerely|yours truly|warmly|take care)\b[\s,!.:-]*(?:[A-Za-z][A-Za-z\s'.-]{0,40})?\s*$/i.test(
    trimmed,
  );
}

export function validateGeneratedMessage(
  message: string,
  _spec?: GenerationInput,
): MessageValidationResult {
  const issues: MessageValidationIssue[] = [];
  const trimmed = message.trim();

  if (!trimmed) {
    return { ok: false, issues: ['empty'], sentenceCount: 0 };
  }

  if (/\n{2,}/.test(trimmed)) {
    issues.push('too_many_paragraphs');
  }

  if (/^dear\b/i.test(trimmed)) {
    issues.push('starts_with_dear');
  }

  if (/^(hi|hello|hey)\b/i.test(trimmed)) {
    issues.push('starts_with_greeting');
  }

  if (hasSignoff(trimmed)) {
    issues.push('has_signoff');
  }

  const sentenceCount = countSentences(trimmed);
  if (sentenceCount < 2 || sentenceCount > 4) {
    issues.push('sentence_count_out_of_range');
  }

  return {
    ok: issues.length === 0,
    issues,
    sentenceCount,
  };
}

export function buildRepairPrompt(args: {
  userMessage: string;
  draft: string;
  validation: MessageValidationResult;
}): string {
  const issues = args.validation.issues.join(', ');
  return [
    args.userMessage.trim(),
    '',
    'Revise the draft message below to comply with the Output Requirements.',
    'Rules to enforce:',
    '- 2-4 sentences maximum',
    '- No greeting (no "Dear", no "Hi/Hello/Hey")',
    '- No sign-off ("Love,", "Best,", etc.)',
    '- Keep it personal and grounded in the provided details when available',
    '',
    `Validation issues: ${issues}`,
    '',
    'Draft message to revise:',
    `"""${args.draft.trim()}"""`,
    '',
    'Return ONLY the revised message.',
  ].join('\n');
}

