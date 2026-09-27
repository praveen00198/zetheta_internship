import { z } from 'zod';
import type { LoanType } from '../types/form';
import { MIN_SALARY, MIN_ANNUAL_TURNOVER, MIN_YEARS_IN_BUSINESS } from '../utils/constants';

const businessTypeEnum = z.enum(
  ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd', 'other'],
  { required_error: 'Business type is required.' },
);

const salariedSchema = z.object({
  employmentType: z.literal('salaried'),
  companyName: z
    .string({ required_error: 'Company name is required.' })
    .min(2, 'Company name must be at least 2 characters.')
    .max(200, 'Company name must not exceed 200 characters.'),
  designation: z
    .string({ required_error: 'Designation is required.' })
    .min(2, 'Designation must be at least 2 characters.')
    .max(100, 'Designation must not exceed 100 characters.'),
  monthlyNetSalary: z
    .number({
      required_error: 'Monthly net salary is required.',
      invalid_type_error: 'Monthly net salary must be a number.',
    })
    .min(MIN_SALARY, `Monthly net salary must be at least ₹${MIN_SALARY.toLocaleString('en-IN')}.`),
  yearsOfExperience: z
    .number({
      required_error: 'Years of experience is required.',
      invalid_type_error: 'Must be a valid number.',
    })
    .min(0, 'Years of experience cannot be negative.')
    .max(50, 'Years of experience cannot exceed 50.'),
});

const selfEmployedSchema = z.object({
  employmentType: z.literal('self_employed'),
  businessName: z
    .string({ required_error: 'Business name is required.' })
    .min(2, 'Business name must be at least 2 characters.')
    .max(200, 'Business name must not exceed 200 characters.'),
  businessType: businessTypeEnum,
  annualTurnover: z
    .number({
      required_error: 'Annual turnover is required.',
      invalid_type_error: 'Annual turnover must be a number.',
    })
    .min(MIN_ANNUAL_TURNOVER, `Annual turnover must be at least ₹${MIN_ANNUAL_TURNOVER.toLocaleString('en-IN')}.`),
  yearsInBusiness: z
    .number({
      required_error: 'Years in business is required.',
      invalid_type_error: 'Must be a valid number.',
    })
    .min(MIN_YEARS_IN_BUSINESS, `Must have been in business for at least ${MIN_YEARS_IN_BUSINESS} years.`)
    .max(60, 'Years in business cannot exceed 60.'),
  monthlyIncome: z
    .number({
      required_error: 'Monthly income is required.',
      invalid_type_error: 'Monthly income must be a number.',
    })
    .min(1, 'Monthly income must be greater than 0.'),
  officeAddress: z
    .string({ required_error: 'Office/Business address is required.' })
    .min(10, 'Office address must be at least 10 characters.')
    .max(300, 'Office address must not exceed 300 characters.'),
});

const businessOwnerSchema = z.object({
  employmentType: z.literal('business_owner'),
  businessName: z
    .string({ required_error: 'Business name is required.' })
    .min(2, 'Business name must be at least 2 characters.')
    .max(200, 'Business name must not exceed 200 characters.'),
  businessType: businessTypeEnum,
  annualTurnover: z
    .number({
      required_error: 'Annual turnover is required.',
      invalid_type_error: 'Annual turnover must be a number.',
    })
    .min(MIN_ANNUAL_TURNOVER, `Annual turnover must be at least ₹${MIN_ANNUAL_TURNOVER.toLocaleString('en-IN')}.`),
  yearsInBusiness: z
    .number({
      required_error: 'Years in business is required.',
      invalid_type_error: 'Must be a valid number.',
    })
    .min(MIN_YEARS_IN_BUSINESS, `Must have been in business for at least ${MIN_YEARS_IN_BUSINESS} years.`)
    .max(60, 'Years in business cannot exceed 60.'),
  gstNumber: z
    .string({ required_error: 'GST number is required.' })
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/,
      'GST number must be in format: 27AABCU9603R1ZX (2 digits + PAN + 1 digit + Z + 1 char).',
    ),
  officeAddress: z
    .string({ required_error: 'Office/Business address is required.' })
    .min(10, 'Office address must be at least 10 characters.')
    .max(300, 'Office address must not exceed 300 characters.'),
  monthlyIncome: z
    .number({
      required_error: 'Monthly income is required.',
      invalid_type_error: 'Monthly income must be a number.',
    })
    .min(1, 'Monthly income must be greater than 0.'),
});

export const step5Schema = (loanType: LoanType) => {
  const union = z.discriminatedUnion('employmentType', [
    salariedSchema,
    selfEmployedSchema,
    businessOwnerSchema,
  ]);

  if (loanType === 'business') {
    return union.superRefine((data, ctx) => {
      if (data.employmentType === 'salaried') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Salaried employment is not eligible for Business Loans. Please select Business Owner or Self-Employed.',
          path: ['employmentType'],
        });
      }
    });
  }

  return union;
};

export type Step5Values = z.infer<ReturnType<typeof step5Schema>>;
export type SalariedValues = z.infer<typeof salariedSchema>;
export type SelfEmployedValues = z.infer<typeof selfEmployedSchema>;
export type BusinessOwnerValues = z.infer<typeof businessOwnerSchema>;
