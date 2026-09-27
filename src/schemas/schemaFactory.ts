// ─────────────────────────────────────────────
// SCHEMA FACTORY
// Centralized cross-step schema builder.
// Receives complete form state, returns appropriate schema.
// ─────────────────────────────────────────────

import type { LoanApplicationState, LoanType } from '../types/form';
import { step1Schema } from './step1Schema';
import { step2Schema } from './step2Schema';
import { step3Schema } from './step3Schema';
import { step4Schema } from './step4Schema';
import { step5Schema } from './step5Schema';
import { step6Schema } from './step6Schema';
import { step7Schema } from './step7Schema';
import { step8Schema } from './step8Schema';

export function getSchemaForStep(stepNumber: number, formData: Partial<LoanApplicationState>) {
  const loanType = (formData.step1?.loanType ?? 'personal') as LoanType;
  const loanAmount = formData.step1?.loanAmount ?? 0;
  const panVerified = formData.step3?.panVerified ?? false;
  const employmentType = (formData.step5 as { employmentType?: string })?.employmentType ?? 'salaried';

  switch (stepNumber) {
    case 1:
      return step1Schema(loanType);
    case 2:
      return step2Schema;
    case 3:
      return step3Schema(loanType, loanAmount);
    case 4:
      return step4Schema;
    case 5:
      return step5Schema(loanType);
    case 6:
      return step6Schema;
    case 7:
      return step7Schema(loanType, employmentType, panVerified);
    case 8:
      return step8Schema;
    default:
      throw new Error(`Unknown step: ${stepNumber}`);
  }
}

export {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
};
