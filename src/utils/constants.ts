// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

import type { LoanType } from '../types/form';

// Loan Amount Limits (in INR)
export const LOAN_LIMITS: Record<LoanType, { min: number; max: number }> = {
  personal: { min: 50_000, max: 10_00_000 },
  home: { min: 50_000, max: 1_00_00_000 },
  business: { min: 50_000, max: 50_00_000 },
};

// Tenure Limits (in months)
export const TENURE_LIMITS: Record<LoanType, { min: number; max: number }> = {
  personal: { min: 12, max: 60 },
  home: { min: 60, max: 360 },
  business: { min: 12, max: 120 },
};

// Interest Rates (annual %)
export const INTEREST_RATES: Record<LoanType, number> = {
  personal: 10.5,
  home: 8.5,
  business: 14,
};

// Processing Fee
export const PROCESSING_FEE_RATE = 0.01; // 1%
export const PROCESSING_FEE_MIN = 2_000;
export const PROCESSING_FEE_MAX = 25_000;

// EMI Affordability Threshold
export const EMI_INCOME_RATIO = 0.5; // 50%

// Co-applicant thresholds (in INR)
export const CO_APPLICANT_THRESHOLD: Partial<Record<LoanType, number>> = {
  personal: 5_00_000,
  business: 20_00_000,
};

// Passport required for Home Loan above this amount
export const PASSPORT_THRESHOLD = 50_00_000;

// Auto-save interval (ms)
export const AUTO_SAVE_INTERVAL = 30_000;

// Draft expiry (hours)
export const DRAFT_EXPIRY_HOURS = 72;

// LocalStorage key prefix
export const STORAGE_KEY_PREFIX = 'lendswift_draft_';

// Draft version
export const DRAFT_VERSION = '1.0';

// Loan Purposes
export const LOAN_PURPOSES: Record<LoanType, string[]> = {
  personal: [
    'Medical Emergency',
    'Wedding Expenses',
    'Travel & Vacation',
    'Home Renovation',
    'Education Fees',
    'Debt Consolidation',
    'Consumer Goods Purchase',
    'Other Personal Expenses',
  ],
  home: [
    'Purchase of New Home',
    'Purchase of Plot',
    'Construction of Home',
    'Home Renovation / Extension',
    'Home Improvement',
    'Balance Transfer',
    'Other',
  ],
  business: [
    'Working Capital',
    'Business Expansion',
    'Equipment Purchase',
    'Inventory Financing',
    'Office Renovation',
    'Technology Upgrade',
    'Debt Refinancing',
    'Other Business Purpose',
  ],
};

// Minimum age for loan application
export const MIN_AGE = 21;
export const MAX_AGE = 65;

// Income minimums
export const MIN_SALARY = 15_000;
export const MIN_ANNUAL_TURNOVER = 3_00_000;
export const MIN_YEARS_IN_BUSINESS = 2;

// Business Types
export const BUSINESS_TYPES = [
  { value: 'proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp', label: 'LLP' },
  { value: 'pvt_ltd', label: 'Private Limited' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'other', label: 'Other' },
] as const;

// PAN Entity types allowed per loan type
export const PAN_ENTITY_TYPES: Record<LoanType, string[]> = {
  personal: ['P'],
  home: ['P'],
  business: ['P', 'C', 'F'],
};

// All valid PAN entity types
export const ALL_PAN_ENTITIES: Record<string, string> = {
  P: 'Individual',
  C: 'Company',
  H: 'HUF',
  A: 'AOP',
  B: 'BOI',
  G: 'Government',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  F: 'Firm',
  T: 'Trust',
};

// Indian States list
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
