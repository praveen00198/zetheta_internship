// ─────────────────────────────────────────────
// SUBMISSION SERVICE — simulation layer
// Replace with real API in production.
// ─────────────────────────────────────────────

import type { LoanApplicationState } from '../types/form';
import { generateApplicationId } from '../utils/formatters';

export interface SubmissionResult {
  success: boolean;
  referenceId?: string;
  message: string;
  timestamp?: string;
}

/**
 * Simulate loan application submission (1–2s delay).
 */
export async function submitApplication(
  data: LoanApplicationState,
): Promise<SubmissionResult> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

  // Validate minimal required data exists
  if (!data.step1?.loanType || !data.step2?.email) {
    return {
      success: false,
      message: 'Application data is incomplete. Please review all steps.',
    };
  }

  const referenceId = generateApplicationId();

  return {
    success: true,
    referenceId,
    message: 'Your application has been submitted successfully.',
    timestamp: new Date().toISOString(),
  };
}
