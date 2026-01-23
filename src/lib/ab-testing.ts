/**
 * A/B Testing Utility for ADC Foundation Model
 *
 * Manages cohort assignment for comparing v1 (concatenation) vs v2 (composition-aware)
 * prompt strategies.
 *
 * Approach: localStorage cohort assignment (simple, consistent UX, no dependencies)
 * - User is assigned to a cohort on first visit
 * - Cohort persists across sessions for consistent experience
 * - All analytics events are tagged with cohort for comparison
 */

const COHORT_KEY = 'adc_cohort';
const COHORTS = ['v1', 'v2'] as const;
export type Cohort = (typeof COHORTS)[number];

/**
 * Get the user's assigned cohort
 *
 * On first visit, randomly assigns to v1 or v2 (50/50 split)
 * On subsequent visits, returns the persisted cohort
 *
 * @returns The user's cohort ('v1' or 'v2')
 */
export function getCohort(): Cohort {
  // SSR fallback - default to v1 during server-side rendering
  if (typeof window === 'undefined') {
    return 'v1';
  }

  let cohort = localStorage.getItem(COHORT_KEY) as Cohort | null;

  // Validate cohort value
  if (!cohort || !COHORTS.includes(cohort)) {
    // Assign randomly with 50/50 split
    cohort = Math.random() < 0.5 ? 'v1' : 'v2';
    localStorage.setItem(COHORT_KEY, cohort);
  }

  return cohort;
}

/**
 * Get the appropriate API endpoint based on cohort assignment
 *
 * @returns '/api/generate' for v1, '/api/generate-v2' for v2
 */
export function getGenerateEndpoint(): string {
  const cohort = getCohort();
  return cohort === 'v2' ? '/api/generate-v2' : '/api/generate';
}

/**
 * Force a specific cohort (for testing/debugging)
 *
 * @param cohort The cohort to force ('v1' or 'v2')
 */
export function forceCohort(cohort: Cohort): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COHORT_KEY, cohort);
}

/**
 * Clear cohort assignment (triggers re-assignment on next getCohort call)
 */
export function clearCohort(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COHORT_KEY);
}

/**
 * Check if A/B testing is enabled
 *
 * Can be controlled via environment variable
 */
export function isABTestingEnabled(): boolean {
  // Default to enabled unless explicitly disabled
  return process.env.NEXT_PUBLIC_AB_TESTING_ENABLED !== 'false';
}

/**
 * Get cohort with A/B testing check
 *
 * If A/B testing is disabled, always returns 'v2' (latest version)
 */
export function getEffectiveCohort(): Cohort {
  if (!isABTestingEnabled()) {
    return 'v2';
  }
  return getCohort();
}

/**
 * Get endpoint with A/B testing check
 *
 * If A/B testing is disabled, always returns v2 endpoint
 */
export function getEffectiveEndpoint(): string {
  if (!isABTestingEnabled()) {
    return '/api/generate-v2';
  }
  return getGenerateEndpoint();
}
