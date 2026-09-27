// ─────────────────────────────────────────────
// STEP REGISTRY — centralized step definitions
// ─────────────────────────────────────────────

import type { LoanApplicationState, WizardStep } from '../../types/form';
import { CO_APPLICANT_THRESHOLD } from '../../utils/constants';

const ALL_STEPS: Omit<WizardStep, 'isVisible'>[] = [
  { id: 1, key: 'loan-type',       title: 'Loan Type & Basics',    shortTitle: 'Loan',         isConditional: false },
  { id: 2, key: 'personal-info',   title: 'Personal Information',  shortTitle: 'Personal',     isConditional: false },
  { id: 3, key: 'kyc',             title: 'KYC Verification',      shortTitle: 'KYC',          isConditional: false },
  { id: 4, key: 'address',         title: 'Address Details',       shortTitle: 'Address',      isConditional: false },
  { id: 5, key: 'employment',      title: 'Employment & Income',   shortTitle: 'Employment',   isConditional: false },
  { id: 6, key: 'co-applicant',    title: 'Co-Applicant Details',  shortTitle: 'Co-Applicant', isConditional: true  },
  { id: 7, key: 'documents',       title: 'Documents & Signature', shortTitle: 'Documents',    isConditional: false },
  { id: 8, key: 'review',          title: 'Review & Submit',       shortTitle: 'Review',       isConditional: false },
];

/**
 * Determine if Step 6 (Co-Applicant) should be visible.
 *
 * Personal Loan:  visible when amount > ₹5,00,000 (STRICTLY greater than)
 * Home Loan:      ALWAYS visible
 * Business Loan:  visible when amount > ₹20,00,000 (STRICTLY greater than)
 */
export function isStep6Visible(formData: Partial<LoanApplicationState>): boolean {
  const loanType = formData.step1?.loanType;
  const loanAmount = formData.step1?.loanAmount ?? 0;

  if (!loanType) return false;

  switch (loanType) {
    case 'home':
      return true;
    case 'personal': {
      const threshold = CO_APPLICANT_THRESHOLD.personal ?? 0;
      return loanAmount > threshold; // strictly greater
    }
    case 'business': {
      const threshold = CO_APPLICANT_THRESHOLD.business ?? 0;
      return loanAmount > threshold; // strictly greater
    }
    default:
      return false;
  }
}

/**
 * Build the complete step list with visibility flags.
 */
export function buildStepRegistry(
  formData: Partial<LoanApplicationState>,
): WizardStep[] {
  const step6Visible = isStep6Visible(formData);

  return ALL_STEPS.map((step) => ({
    ...step,
    isVisible: step.id === 6 ? step6Visible : true,
  }));
}

/**
 * Get only visible steps.
 */
export function getVisibleSteps(formData: Partial<LoanApplicationState>): WizardStep[] {
  return buildStepRegistry(formData).filter((s) => s.isVisible);
}

/**
 * Get the next visible step after a given step id.
 */
export function getNextStep(
  currentStepId: number,
  formData: Partial<LoanApplicationState>,
): number | null {
  const visible = getVisibleSteps(formData);
  const idx = visible.findIndex((s) => s.id === currentStepId);
  if (idx === -1 || idx >= visible.length - 1) return null;
  return visible[idx + 1].id;
}

/**
 * Get the previous visible step.
 */
export function getPreviousStep(
  currentStepId: number,
  formData: Partial<LoanApplicationState>,
): number | null {
  const visible = getVisibleSteps(formData);
  const idx = visible.findIndex((s) => s.id === currentStepId);
  if (idx <= 0) return null;
  return visible[idx - 1].id;
}

/**
 * Get progress percentage for current step.
 */
export function getProgressPercent(
  currentStepId: number,
  formData: Partial<LoanApplicationState>,
): number {
  const visible = getVisibleSteps(formData);
  const idx = visible.findIndex((s) => s.id === currentStepId);
  if (idx === -1 || visible.length <= 1) return 0;
  return Math.round((idx / (visible.length - 1)) * 100);
}
