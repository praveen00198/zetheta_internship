import { z } from 'zod';
import type { LoanType } from '../types/form';
import { PAN_ENTITY_TYPES, ALL_PAN_ENTITIES } from '../utils/constants';
import { verhoeffChecksum } from '../utils/validators';

export const step3Schema = (loanType: LoanType, loanAmount: number) => {
  const allowedEntities = PAN_ENTITY_TYPES[loanType];
  const showPassport = loanType === 'home' && loanAmount > 50_00_000;

  return z.object({
    pan: z
      .string({ required_error: 'PAN is required.' })
      .toUpperCase()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'PAN must be in AAAAA9999A format (5 letters, 4 digits, 1 letter).')
      .refine((pan) => {
        const entity = pan[3];
        return ALL_PAN_ENTITIES[entity] !== undefined;
      }, 'PAN 4th character must indicate a valid entity type (P, C, H, A, B, G, J, L, F, T).')
      .refine((pan) => {
        const entity = pan[3];
        return allowedEntities.includes(entity);
      }, (pan) => ({
        message: `PAN 4th character '${pan?.[3] ?? '?'}' must indicate entity type. For this loan, allowed: ${allowedEntities.map(e => `${e} (${ALL_PAN_ENTITIES[e]})`).join(', ')}.`,
      })),

    panVerified: z
      .boolean()
      .refine((v) => v === true, 'PAN must be verified before proceeding.'),

    aadhaar: z
      .string({ required_error: 'Aadhaar number is required.' })
      .regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits.')
      .refine((v) => verhoeffChecksum(v), 'Aadhaar number is invalid. Please check and re-enter.'),

    aadhaarVerified: z
      .boolean()
      .refine((v) => v === true, 'Aadhaar must be verified before proceeding.'),

    aadhaarConsent: z
      .boolean()
      .refine((v) => v === true, 'You must provide Aadhaar consent to proceed.'),

    voterId: z
      .string()
      .optional()
      .refine((v) => !v || v.length >= 10, 'Voter ID must be at least 10 characters.'),

    passport: showPassport
      ? z
          .string({ required_error: 'Passport number is required for Home Loans above ₹50 lakh.' })
          .min(8, 'Passport number must be at least 8 characters.')
      : z.string().optional(),
  });
};

export type Step3Values = z.infer<ReturnType<typeof step3Schema>>;
