import { z } from 'zod';

export const step8Schema = z.object({
  consentAccuracy: z
    .boolean()
    .refine((v) => v === true, 'You must confirm that all information is accurate.'),
  consentCibil: z
    .boolean()
    .refine((v) => v === true, 'You must authorise LendSwift to check your credit score.'),
  consentTerms: z
    .boolean()
    .refine((v) => v === true, 'You must agree to the Terms and Conditions.'),
  consentCommunication: z
    .boolean()
    .refine((v) => v === true, 'You must consent to receive communications.'),
});

export type Step8Values = z.infer<typeof step8Schema>;
