import { z } from 'zod';
import type { LoanType } from '../types/form';

const uploadedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  compressedSize: z.number().optional(),
  type: z.string(),
  dataUrl: z.string().optional(),
  uploadProgress: z.number().optional(),
  uploaded: z.boolean().optional(),
});

export const step7Schema = (
  loanType: LoanType,
  employmentType: string,
  panVerified: boolean,
) => {
  const isPanRequired = !panVerified;
  const isSalaried = employmentType === 'salaried';
  const isSelfOrBusiness = employmentType === 'self_employed' || employmentType === 'business_owner';
  const isBusinessLoan = loanType === 'business';
  const isHomeLoan = loanType === 'home';

  return z.object({
    panCard: isPanRequired
      ? uploadedFileSchema.optional().refine((v) => !!v, 'PAN Card upload is required (PAN not verified).')
      : uploadedFileSchema.optional(),

    aadhaarFront: uploadedFileSchema.optional()
      .refine((v) => !!v, 'Aadhaar front side is required.'),

    aadhaarBack: uploadedFileSchema.optional()
      .refine((v) => !!v, 'Aadhaar back side is required.'),

    salarySlips: isSalaried
      ? z.array(uploadedFileSchema).min(3, 'Please upload last 3 months salary slips.')
      : z.array(uploadedFileSchema).optional(),

    bankStatements: z.array(uploadedFileSchema).min(1, 'Please upload last 6 months bank statements.'),

    itr: isSelfOrBusiness
      ? z.array(uploadedFileSchema).min(2, 'Please upload ITR for last 2 years.')
      : z.array(uploadedFileSchema).optional(),

    propertyDocuments: isHomeLoan
      ? uploadedFileSchema.optional().refine((v) => !!v, 'Property documents are required for Home Loan.')
      : uploadedFileSchema.optional(),

    businessRegistration: isBusinessLoan
      ? uploadedFileSchema.optional().refine((v) => !!v, 'Business registration document is required.')
      : uploadedFileSchema.optional(),

    gstReturns: isBusinessLoan
      ? z.array(uploadedFileSchema).min(4, 'Please upload GST returns for last 4 quarters.')
      : z.array(uploadedFileSchema).optional(),

    photograph: uploadedFileSchema.optional()
      .refine((v) => !!v, 'Applicant photograph is required.'),

    signature: z
      .string({ required_error: 'E-signature is required.' })
      .min(1, 'E-signature is required. Please sign in the signature area.'),
  });
};

export type Step7Values = z.infer<ReturnType<typeof step7Schema>>;
