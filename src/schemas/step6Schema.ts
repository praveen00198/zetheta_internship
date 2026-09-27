import { z } from 'zod';
import { verhoeffChecksum } from '../utils/validators';

export const step6Schema = z.object({
  name: z
    .string({ required_error: "Co-applicant's name is required." })
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must not exceed 100 characters.')
    .regex(/^[a-zA-Z .]+$/, 'Name may only contain letters, spaces, and periods.'),

  relationship: z.enum(['spouse', 'parent', 'sibling', 'business_partner'], {
    required_error: 'Relationship is required.',
  }),

  pan: z
    .string({ required_error: "Co-applicant's PAN is required." })
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'PAN must be in AAAAA9999A format.')
    .refine((pan) => pan[3] === 'P', "Co-applicant PAN must be of type P (Individual)."),

  panVerified: z
    .boolean()
    .refine((v) => v === true, "Co-applicant's PAN must be verified."),

  monthlyIncome: z
    .number({
      required_error: "Co-applicant's monthly income is required.",
      invalid_type_error: 'Monthly income must be a number.',
    })
    .min(1, 'Monthly income must be greater than 0.'),

  consent: z
    .boolean()
    .refine((v) => v === true, "Co-applicant's consent is required."),

  signature: z
    .string({ required_error: "Co-applicant's signature is required." })
    .min(1, "Co-applicant's signature is required."),
});

export type Step6Values = z.infer<typeof step6Schema>;

// Re-export for use in schemaFactory
export { verhoeffChecksum };
