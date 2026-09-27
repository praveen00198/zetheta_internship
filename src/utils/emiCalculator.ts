// ─────────────────────────────────────────────
// EMI CALCULATOR
// ─────────────────────────────────────────────

import {
  INTEREST_RATES,
  PROCESSING_FEE_RATE,
  PROCESSING_FEE_MIN,
  PROCESSING_FEE_MAX,
} from './constants';
import type { EmiResult, LoanType } from '../types/form';

/**
 * Calculate EMI using the standard reducing-balance formula:
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param principal - Loan amount in INR
 * @param annualRate - Annual interest rate (%)
 * @param tenureMonths - Loan tenure in months
 */
export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (!principal || !annualRate || !tenureMonths) return 0;
  const r = annualRate / 12 / 100; // monthly rate
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Calculate processing fee (1% of principal, min ₹2000, max ₹25000).
 */
export function calculateProcessingFee(principal: number): number {
  const fee = principal * PROCESSING_FEE_RATE;
  return Math.min(PROCESSING_FEE_MAX, Math.max(PROCESSING_FEE_MIN, Math.round(fee)));
}

/**
 * Full loan cost breakdown.
 */
export function calculateLoanCosts(
  loanType: LoanType,
  principal: number,
  tenureMonths: number,
): EmiResult {
  const interestRate = INTEREST_RATES[loanType];
  const emi = calculateEmi(principal, interestRate, tenureMonths);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  const processingFee = calculateProcessingFee(principal);

  return {
    emi,
    totalPayment,
    totalInterest,
    processingFee,
    interestRate,
  };
}

/**
 * Check EMI affordability (EMI must not exceed 50% of monthly income).
 *
 * @param emi - Monthly EMI
 * @param monthlyIncome - Applicant monthly income
 * @param coApplicantMonthlyIncome - Optional co-applicant income
 */
export function checkEmiAffordability(
  emi: number,
  monthlyIncome: number,
  coApplicantMonthlyIncome = 0,
): { affordable: boolean; ratio: number; combinedIncome: number } {
  const combinedIncome = monthlyIncome + coApplicantMonthlyIncome;
  const ratio = combinedIncome > 0 ? emi / combinedIncome : Infinity;
  return {
    affordable: ratio <= 0.5,
    ratio,
    combinedIncome,
  };
}

/**
 * Get monthly income from Step 5 data.
 */
export function getMonthlyIncome(step5: Record<string, unknown>): number {
  if (!step5) return 0;
  const et = step5.employmentType as string;
  if (et === 'salaried') return Number(step5.monthlyNetSalary) || 0;
  if (et === 'self_employed' || et === 'business_owner') {
    return Number(step5.monthlyIncome) || 0;
  }
  return 0;
}
