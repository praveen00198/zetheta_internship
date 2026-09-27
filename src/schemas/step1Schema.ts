import { z } from 'zod';
import { LOAN_LIMITS, TENURE_LIMITS, LOAN_PURPOSES } from '../utils/constants';
import type { LoanType } from '../types/form';

export const step1Schema = (initialLoanType?: LoanType) => {
  return z
    .object({
      loanType: z.enum(['personal', 'home', 'business'], {
        required_error: 'Please select a loan type.',
      }),
      loanAmount: z.number({
        required_error: 'Loan amount is required.',
        invalid_type_error: 'Loan amount must be a number.',
      }),
      tenure: z.number({
        required_error: 'Loan tenure is required.',
        invalid_type_error: 'Loan tenure must be a number.',
      }),
      purpose: z
        .string({ required_error: 'Loan purpose is required.' })
        .min(1, 'Please select a loan purpose.'),
      referralCode: z
        .string()
        .optional()
        .refine((v) => !v || /^[a-zA-Z0-9]{6,10}$/.test(v), {
          message: 'Referral code must be 6–10 alphanumeric characters.',
        }),
    })
    .superRefine((data, ctx) => {
      const lt = data.loanType || initialLoanType || 'personal';
      const limits = LOAN_LIMITS[lt];
      const tenureLimits = TENURE_LIMITS[lt];
      const purposes = LOAN_PURPOSES[lt];

      if (typeof data.loanAmount === 'number') {
        if (data.loanAmount < limits.min) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanAmount'],
            message: `Loan amount must be at least ₹${limits.min.toLocaleString('en-IN')} for ${lt} loan.`,
          });
        }
        if (data.loanAmount > limits.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loanAmount'],
            message: `Loan amount cannot exceed ₹${limits.max.toLocaleString('en-IN')} for ${lt} loan.`,
          });
        }
      }

      if (typeof data.tenure === 'number') {
        if (data.tenure < tenureLimits.min) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tenure'],
            message: `Tenure must be at least ${tenureLimits.min} months for ${lt} loan.`,
          });
        }
        if (data.tenure > tenureLimits.max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tenure'],
            message: `Tenure cannot exceed ${tenureLimits.max} months for ${lt} loan.`,
          });
        }
      }

      if (data.purpose && !purposes.includes(data.purpose)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['purpose'],
          message: 'Please select a valid loan purpose.',
        });
      }
    });
};

export type Step1Values = z.infer<ReturnType<typeof step1Schema>>;
