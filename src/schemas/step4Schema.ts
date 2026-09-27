import { z } from 'zod';

export const addressSchema = z.object({
  addressLine1: z
    .string({ required_error: 'Address Line 1 is required.' })
    .min(5, 'Address Line 1 must be at least 5 characters.')
    .max(200, 'Address Line 1 must not exceed 200 characters.'),
  addressLine2: z.string().max(200).optional(),
  pinCode: z
    .string({ required_error: 'PIN code is required.' })
    .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits.'),
  city: z
    .string({ required_error: 'City is required.' })
    .min(2, 'City must be at least 2 characters.'),
  state: z
    .string({ required_error: 'State is required.' })
    .min(2, 'State is required.'),
  postOffice: z.string().optional(),
});

const optionalAddressSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  pinCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postOffice: z.string().optional(),
});

export const step4Schema = z
  .object({
    current: addressSchema.extend({
      residenceType: z.enum(['owned', 'rented', 'company', 'family'], {
        required_error: 'Residence type is required.',
      }),
      yearsAtAddress: z
        .number({
          required_error: 'Years at current address is required.',
          invalid_type_error: 'Must be a valid number.',
        })
        .min(0, 'Years at address must be 0 or more.')
        .max(50, 'Years at address must not exceed 50.'),
      monthlyRent: z.number().optional(),
    }),
    sameAsCurrent: z.boolean(),
    previous: optionalAddressSchema.optional(),
    permanent: optionalAddressSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // Rent amount required if residence is rented
    if (data.current.residenceType === 'rented') {
      if (!data.current.monthlyRent || data.current.monthlyRent <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Monthly rent amount is required for rented residences.',
          path: ['current', 'monthlyRent'],
        });
      }
    }

    // Permanent address required if not same as current
    if (!data.sameAsCurrent) {
      if (!data.permanent?.addressLine1 || data.permanent.addressLine1.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Address Line 1 is required (at least 5 characters).',
          path: ['permanent', 'addressLine1'],
        });
      }
      if (!data.permanent?.pinCode || !/^\d{6}$/.test(data.permanent.pinCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PIN code must be exactly 6 digits.',
          path: ['permanent', 'pinCode'],
        });
      }
      if (!data.permanent?.city || data.permanent.city.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required.',
          path: ['permanent', 'city'],
        });
      }
      if (!data.permanent?.state || data.permanent.state.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'State is required.',
          path: ['permanent', 'state'],
        });
      }
    }

    // Previous address required if years < 1
    if (data.current.yearsAtAddress < 1) {
      if (!data.previous?.addressLine1 || data.previous.addressLine1.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Previous address Line 1 is required (at least 5 characters).',
          path: ['previous', 'addressLine1'],
        });
      }
      if (!data.previous?.pinCode || !/^\d{6}$/.test(data.previous.pinCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PIN code must be exactly 6 digits.',
          path: ['previous', 'pinCode'],
        });
      }
      if (!data.previous?.city || data.previous.city.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required.',
          path: ['previous', 'city'],
        });
      }
      if (!data.previous?.state || data.previous.state.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'State is required.',
          path: ['previous', 'state'],
        });
      }
    }
  });

export type Step4Values = z.infer<typeof step4Schema>;
export type AddressValues = z.infer<typeof addressSchema>;
