import { z } from 'zod';
import { calculateAge } from '../utils/formatters';
import { MIN_AGE, MAX_AGE } from '../utils/constants';

export const step2Schema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required.' })
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must not exceed 100 characters.')
    .regex(/^[a-zA-Z .]+$/, 'Full name may only contain letters, spaces, and periods.'),

  dateOfBirth: z
    .string({ required_error: 'Date of birth is required.' })
    .min(1, 'Date of birth is required.')
    .refine((dob) => {
      const age = calculateAge(dob);
      return age >= MIN_AGE;
    }, `Applicant must be at least ${MIN_AGE} years old.`)
    .refine((dob) => {
      const age = calculateAge(dob);
      return age <= MAX_AGE;
    }, `Applicant must not be older than ${MAX_AGE} years.`),

  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender.',
  }),

  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
    required_error: 'Please select marital status.',
  }),

  fathersName: z
    .string({ required_error: "Father's name is required." })
    .min(2, "Father's name must be at least 2 characters.")
    .max(100, "Father's name must not exceed 100 characters.")
    .regex(/^[a-zA-Z .]+$/, "Father's name may only contain letters, spaces, and periods."),

  mothersName: z
    .string({ required_error: "Mother's name is required." })
    .min(2, "Mother's name must be at least 2 characters.")
    .max(100, "Mother's name must not exceed 100 characters.")
    .regex(/^[a-zA-Z .]+$/, "Mother's name may only contain letters, spaces, and periods."),

  email: z
    .string({ required_error: 'Email address is required.' })
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address.'),

  mobile: z
    .string({ required_error: 'Mobile number is required.' })
    .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits.')
    .refine((v) => /^[6-9]/.test(v), 'Mobile number must start with 6, 7, 8, or 9.'),

  alternateMobile: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{10}$/.test(v), 'Alternate mobile must be exactly 10 digits.')
    .refine((v) => !v || /^[6-9]/.test(v), 'Alternate mobile must start with 6, 7, 8, or 9.'),
}).superRefine((data, ctx) => {
  if (data.alternateMobile && data.alternateMobile === data.mobile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Alternate mobile number must be different from primary mobile number.',
      path: ['alternateMobile'],
    });
  }
});

export type Step2Values = z.infer<typeof step2Schema>;
