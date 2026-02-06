import type { WizardAnswers } from '~/src/app/create/models';

const STORAGE_KEY = 'anyday.quick_create_draft.v1';
const LEGACY_MESSAGE_KEY = 'wizardMessage';
const LEGACY_ANSWERS_KEY = 'wizardAnswers';
const SCHEMA_VERSION = 1;
const TTL_MS = 24 * 60 * 60 * 1000;

export const QUICK_CREATE_DRAFT_CHANGED_EVENT = 'anyday:quick-create-draft-changed';

export type QuickCreateDraft = {
  recipientName: string;
  relationship: string;
  occasion: string;
  message: string;
  wizardAnswers: Partial<WizardAnswers>;
  generatedAt: string;
  expiresAt: string;
  schemaVersion: number;
};

type QuickCreateDraftInput = {
  recipientName: string;
  relationship: string;
  occasion: string;
  message: string;
  wizardAnswers: Partial<WizardAnswers>;
  generatedAt?: string;
  expiresAt?: string;
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toValidIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

function isExpired(expiresAt: string): boolean {
  const timestamp = Date.parse(expiresAt);
  if (Number.isNaN(timestamp)) return true;
  return Date.now() > timestamp;
}

function dispatchDraftChanged(): void {
  if (!isClient()) return;
  window.dispatchEvent(new Event(QUICK_CREATE_DRAFT_CHANGED_EVENT));
}

function clearLegacyStorage(): void {
  if (!isClient()) return;
  try {
    window.sessionStorage.removeItem(LEGACY_MESSAGE_KEY);
    window.sessionStorage.removeItem(LEGACY_ANSWERS_KEY);
  } catch {
    // Ignore storage access errors
  }
}

function removeCurrentDraft(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors
  }
}

function normalizeDraft(candidate: unknown): QuickCreateDraft | null {
  if (!isRecord(candidate)) return null;

  const recipientName = toNonEmptyString(candidate.recipientName);
  const relationship = toNonEmptyString(candidate.relationship);
  const occasion = toNonEmptyString(candidate.occasion);
  const message = toNonEmptyString(candidate.message);
  const generatedAt = toValidIsoDate(candidate.generatedAt);
  const expiresAt = toValidIsoDate(candidate.expiresAt);
  const schemaVersion = candidate.schemaVersion;

  if (!recipientName || !relationship || !occasion || !message) return null;
  if (!generatedAt || !expiresAt) return null;
  if (schemaVersion !== SCHEMA_VERSION) return null;
  if (!isRecord(candidate.wizardAnswers)) return null;
  if (isExpired(expiresAt)) return null;

  return {
    recipientName,
    relationship,
    occasion,
    message,
    wizardAnswers: candidate.wizardAnswers as Partial<WizardAnswers>,
    generatedAt,
    expiresAt,
    schemaVersion: SCHEMA_VERSION,
  };
}

function readCurrentDraft(): QuickCreateDraft | null {
  if (!isClient()) return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    const normalized = normalizeDraft(parsed);
    if (normalized) return normalized;
  } catch {
    // Invalid JSON falls through to cleanup
  }

  removeCurrentDraft();
  dispatchDraftChanged();
  return null;
}

function readLegacyDraft(): QuickCreateDraft | null {
  if (!isClient()) return null;

  let legacyMessage: string | null = null;
  let legacyAnswersRaw: string | null = null;

  try {
    legacyMessage = window.sessionStorage.getItem(LEGACY_MESSAGE_KEY);
    legacyAnswersRaw = window.sessionStorage.getItem(LEGACY_ANSWERS_KEY);
  } catch {
    return null;
  }

  if (!legacyMessage || !legacyAnswersRaw) return null;

  const message = toNonEmptyString(legacyMessage);
  if (!message) {
    clearLegacyStorage();
    return null;
  }

  let parsedAnswers: unknown;
  try {
    parsedAnswers = JSON.parse(legacyAnswersRaw);
  } catch {
    clearLegacyStorage();
    return null;
  }

  if (!isRecord(parsedAnswers)) {
    clearLegacyStorage();
    return null;
  }

  const recipientName = toNonEmptyString(parsedAnswers.name);
  const relationship = toNonEmptyString(parsedAnswers.relationshipType);
  const occasion = toNonEmptyString(parsedAnswers.occasion);
  const generatedAt = toValidIsoDate(parsedAnswers.generatedAt) ?? new Date().toISOString();
  const expiresAt = new Date(Date.parse(generatedAt) + TTL_MS).toISOString();

  if (!recipientName || !relationship || !occasion) {
    clearLegacyStorage();
    return null;
  }

  const draft: QuickCreateDraft = {
    recipientName,
    relationship,
    occasion,
    message,
    wizardAnswers: parsedAnswers as Partial<WizardAnswers>,
    generatedAt,
    expiresAt,
    schemaVersion: SCHEMA_VERSION,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Keep best-effort fallback: still return draft for this session
  }

  clearLegacyStorage();
  dispatchDraftChanged();
  return draft;
}

export function saveQuickCreateDraft(input: QuickCreateDraftInput): QuickCreateDraft | null {
  if (!isClient()) return null;

  const recipientName = toNonEmptyString(input.recipientName);
  const relationship = toNonEmptyString(input.relationship);
  const occasion = toNonEmptyString(input.occasion);
  const message = toNonEmptyString(input.message);

  if (!recipientName || !relationship || !occasion || !message) {
    return null;
  }

  const generatedAt = toValidIsoDate(input.generatedAt) ?? new Date().toISOString();
  const expiresAt =
    toValidIsoDate(input.expiresAt) ?? new Date(Date.parse(generatedAt) + TTL_MS).toISOString();

  const draft: QuickCreateDraft = {
    recipientName,
    relationship,
    occasion,
    message,
    wizardAnswers: input.wizardAnswers,
    generatedAt,
    expiresAt,
    schemaVersion: SCHEMA_VERSION,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    clearLegacyStorage();
    dispatchDraftChanged();
    return draft;
  } catch {
    return null;
  }
}

export function peekQuickCreateDraft(): QuickCreateDraft | null {
  const current = readCurrentDraft();
  if (current) return current;
  return readLegacyDraft();
}

export function clearQuickCreateDraft(): void {
  if (!isClient()) return;
  removeCurrentDraft();
  clearLegacyStorage();
  dispatchDraftChanged();
}

export function consumeQuickCreateDraft(): QuickCreateDraft | null {
  const draft = peekQuickCreateDraft();
  if (!draft) return null;
  clearQuickCreateDraft();
  return draft;
}
