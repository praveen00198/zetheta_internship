import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step8Schema } from '../../schemas/step8Schema';
import type { Step8Values } from '../../schemas/step8Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Checkbox from '../../components/common/Checkbox';
import { calculateLoanCosts, checkEmiAffordability, getMonthlyIncome } from '../../utils/emiCalculator';
import {
  formatCurrency,
  formatDate,
  formatLoanType,
  formatTenure,
  formatEmploymentType,
  formatResidenceType,
  formatRelationship,
  maskAadhaar,
  maskPan,
  maskMobile,
} from '../../utils/formatters';
import type { LoanType } from '../../types/form';

interface ReviewRowProps {
  label: string;
  value: string | undefined | null;
}

function ReviewRow({ label, value }: ReviewRowProps) {
  if (!value) return null;
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
    </div>
  );
}

interface ReviewSectionProps {
  title: string;
  stepId: number;
  onEdit?: (step: number) => void;
  children: React.ReactNode;
}

function ReviewSection({ title, stepId, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="review-section">
      <div className="review-section-header">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(stepId)}
            className="text-xs font-medium text-text-secondary hover:text-black underline underline-offset-2 transition-colors"
            aria-label={`Edit ${title}`}
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Step8Review({
  formData,
  onUpdate,
  onNext,
  onBack,
  onEdit,
  isSubmitting,
}: StepProps) {
  const { step1, step2, step3, step4, step5, step6, step7 } = formData;
  const saved = formData.step8;

  const loanType = (step1?.loanType || 'personal') as LoanType;
  const loanAmount = step1?.loanAmount || 0;
  const tenure = step1?.tenure || 0;

  const costs = loanType ? calculateLoanCosts(loanType, loanAmount, tenure) : null;
  const step5Data = step5 as Record<string, unknown>;
  const monthlyIncome = getMonthlyIncome(step5Data);
  const coApplicantIncome = step6?.monthlyIncome || 0;
  const affordability = costs ? checkEmiAffordability(costs.emi, monthlyIncome, coApplicantIncome) : null;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step8Values>({
    resolver: zodResolver(step8Schema),
    mode: 'onBlur',
    defaultValues: {
      consentAccuracy: saved?.consentAccuracy || false,
      consentCibil: saved?.consentCibil || false,
      consentTerms: saved?.consentTerms || false,
      consentCommunication: saved?.consentCommunication || false,
    },
  });

  const onSubmit = (data: Step8Values) => {
    onUpdate('step8', data);
    onNext(); // triggers submit in Wizard
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 8 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Review & Submit
        </h1>
        <p className="text-text-secondary">
          Please review all the information below carefully before submitting your application.
        </p>
      </div>

      {/* EMI Summary Card */}
      {costs && (
        <div className="bg-black text-white rounded-xl p-6 mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-white/60 mb-4">
            Pre-Approval Summary
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-xs text-white/60 mb-1">Loan Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(loanAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Tenure</p>
              <p className="text-lg font-semibold">{formatTenure(tenure)}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Interest Rate</p>
              <p className="text-lg font-semibold">{costs.interestRate}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Est. Monthly EMI</p>
              <p className="text-2xl font-bold">{formatCurrency(costs.emi)}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Total Interest</p>
              <p className="text-lg font-semibold">{formatCurrency(costs.totalInterest)}</p>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-1">Processing Fee</p>
              <p className="text-lg font-semibold">{formatCurrency(costs.processingFee)}</p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/60">Total Cost of Borrowing</p>
              <p className="text-sm font-semibold">{formatCurrency(costs.totalPayment)}</p>
            </div>
          </div>
        </div>
      )}

      {/* EMI Affordability Warning */}
      {affordability && !affordability.affordable && (
        <div className="border border-warning bg-amber-50 rounded-lg px-4 py-3 mb-6" role="alert" aria-live="assertive">
          <div className="flex gap-2">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-warning shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">EMI Affordability Notice</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your estimated EMI ({formatCurrency(costs?.emi || 0)}) exceeds 50% of your combined monthly income ({formatCurrency(affordability.combinedIncome)}).
                Lenders typically recommend EMI not exceeding 50% of income.
                You may proceed, but approval is subject to lender discretion.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Step 1 Review */}
        <ReviewSection title="Loan Details" stepId={1} onEdit={onEdit}>
          <ReviewRow label="Loan Type" value={formatLoanType(step1?.loanType || '')} />
          <ReviewRow label="Loan Amount" value={formatCurrency(step1?.loanAmount || 0)} />
          <ReviewRow label="Tenure" value={step1?.tenure ? formatTenure(step1.tenure) : undefined} />
          <ReviewRow label="Purpose" value={step1?.purpose} />
          <ReviewRow label="Referral Code" value={step1?.referralCode} />
        </ReviewSection>

        {/* Step 2 Review */}
        <ReviewSection title="Personal Information" stepId={2} onEdit={onEdit}>
          <ReviewRow label="Full Name" value={step2?.fullName} />
          <ReviewRow label="Date of Birth" value={step2?.dateOfBirth ? formatDate(step2.dateOfBirth) : undefined} />
          <ReviewRow label="Gender" value={step2?.gender ? step2.gender.charAt(0).toUpperCase() + step2.gender.slice(1) : undefined} />
          <ReviewRow label="Marital Status" value={step2?.maritalStatus ? step2.maritalStatus.charAt(0).toUpperCase() + step2.maritalStatus.slice(1) : undefined} />
          <ReviewRow label="Father's Name" value={step2?.fathersName} />
          <ReviewRow label="Mother's Name" value={step2?.mothersName} />
          <ReviewRow label="Email" value={step2?.email} />
          <ReviewRow label="Mobile" value={step2?.mobile ? maskMobile(step2.mobile) : undefined} />
          <ReviewRow label="Alternate Mobile" value={step2?.alternateMobile ? maskMobile(step2.alternateMobile) : undefined} />
        </ReviewSection>

        {/* Step 3 Review */}
        <ReviewSection title="KYC" stepId={3} onEdit={onEdit}>
          <ReviewRow label="PAN" value={step3?.pan ? maskPan(step3.pan) : undefined} />
          <ReviewRow label="PAN Status" value={step3?.panVerified ? '✓ Verified' : 'Not Verified'} />
          <ReviewRow label="Aadhaar" value={step3?.aadhaar ? maskAadhaar(step3.aadhaar) : undefined} />
          <ReviewRow label="Aadhaar Status" value={step3?.aadhaarVerified ? '✓ Verified' : 'Not Verified'} />
          <ReviewRow label="Voter ID" value={step3?.voterId} />
          <ReviewRow label="Passport" value={step3?.passport} />
        </ReviewSection>

        {/* Step 4 Review */}
        <ReviewSection title="Address" stepId={4} onEdit={onEdit}>
          <ReviewRow label="Current Address" value={[step4?.current?.addressLine1, step4?.current?.city, step4?.current?.state, step4?.current?.pinCode].filter(Boolean).join(', ')} />
          <ReviewRow label="Residence Type" value={step4?.current?.residenceType ? formatResidenceType(step4.current.residenceType) : undefined} />
          <ReviewRow label="Years at Address" value={step4?.current?.yearsAtAddress !== undefined ? `${step4.current.yearsAtAddress} year(s)` : undefined} />
          <ReviewRow label="Monthly Rent" value={step4?.current?.monthlyRent ? formatCurrency(step4.current.monthlyRent) : undefined} />
          <ReviewRow label="Permanent Address" value={[step4?.permanent?.addressLine1, step4?.permanent?.city, step4?.permanent?.state].filter(Boolean).join(', ')} />
        </ReviewSection>

        {/* Step 5 Review */}
        <ReviewSection title="Employment & Income" stepId={5} onEdit={onEdit}>
          <ReviewRow label="Employment Type" value={step5Data?.employmentType ? formatEmploymentType(step5Data.employmentType as string) : undefined} />
          {step5Data?.employmentType === 'salaried' && (
            <>
              <ReviewRow label="Company Name" value={step5Data.companyName as string} />
              <ReviewRow label="Designation" value={step5Data.designation as string} />
              <ReviewRow label="Monthly Salary" value={step5Data.monthlyNetSalary ? formatCurrency(Number(step5Data.monthlyNetSalary)) : undefined} />
            </>
          )}
          {(step5Data?.employmentType === 'self_employed' || step5Data?.employmentType === 'business_owner') && (
            <>
              <ReviewRow label="Business Name" value={step5Data.businessName as string} />
              <ReviewRow label="Annual Turnover" value={step5Data.annualTurnover ? formatCurrency(Number(step5Data.annualTurnover)) : undefined} />
              <ReviewRow label="Monthly Income" value={step5Data.monthlyIncome ? formatCurrency(Number(step5Data.monthlyIncome)) : undefined} />
            </>
          )}
        </ReviewSection>

        {/* Step 6 Review (if exists) */}
        {step6 && (
          <ReviewSection title="Co-Applicant" stepId={6} onEdit={onEdit}>
            <ReviewRow label="Name" value={step6.name} />
            <ReviewRow label="Relationship" value={step6.relationship ? formatRelationship(step6.relationship) : undefined} />
            <ReviewRow label="PAN Status" value={step6.panVerified ? '✓ Verified' : 'Not Verified'} />
            <ReviewRow label="Monthly Income" value={step6.monthlyIncome ? formatCurrency(step6.monthlyIncome) : undefined} />
            {step6.signature && (
              <div className="review-row">
                <span className="review-label">Signature</span>
                <img src={step6.signature} alt="Co-applicant signature" className="h-12 border border-border rounded" />
              </div>
            )}
          </ReviewSection>
        )}

        {/* Step 7 — Signature preview */}
        {step7?.signature && (
          <ReviewSection title="Documents & Signature" stepId={7} onEdit={onEdit}>
            <div className="review-row">
              <span className="review-label">Applicant Signature</span>
              <img src={step7.signature} alt="Applicant signature" className="h-12 border border-border rounded bg-white" />
            </div>
          </ReviewSection>
        )}

        {/* Final Consents */}
        <section className="card mb-8">
          <h2 className="text-sm font-semibold text-text-primary mb-2">Declarations & Consent</h2>
          <p className="text-xs text-text-muted mb-5">
            Please read and check each declaration individually. All four are required.
          </p>
          <div className="flex flex-col gap-4">
            <Controller
              name="consentAccuracy"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I confirm that all information provided in this application is accurate, complete, and true to the best of my knowledge."
                  required
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.consentAccuracy?.message}
                />
              )}
            />
            <Controller
              name="consentCibil"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I authorise LendSwift and its authorised representatives to access and verify my credit information from CIBIL, Equifax, or any other credit bureau."
                  required
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.consentCibil?.message}
                />
              )}
            />
            <Controller
              name="consentTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={
                    <span>
                      I have read, understood, and agree to the{' '}
                      <a href="#terms" className="underline hover:text-black">Terms and Conditions</a>{' '}
                      and{' '}
                      <a href="#privacy" className="underline hover:text-black">Privacy Policy</a>{' '}
                      of LendSwift.
                    </span>
                  }
                  required
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.consentTerms?.message}
                />
              )}
            />
            <Controller
              name="consentCommunication"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="I consent to receive communications, updates, and promotional information regarding this application and LendSwift's products via SMS, email, and WhatsApp."
                  required
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.consentCommunication?.message}
                />
              )}
            />
          </div>
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button type="button" onClick={onBack} className="btn-secondary">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.78 4.22a.75.75 0 0 1 0 1.06L7.56 9.5l4.22 4.22a.75.75 0 0 1-1.06 1.06L5.97 10.03a.75.75 0 0 1 0-1.06l4.75-4.75a.75.75 0 0 1 1.06 0z" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary btn-lg flex items-center gap-2"
            aria-describedby="submit-info"
          >
            {isSubmitting ? (
              <>
                <span className="spinner w-4 h-4 border-white/30 border-t-white" aria-hidden="true" />
                Submitting Application...
              </>
            ) : (
              <>
                Submit Application
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M2.22 8a.75.75 0 0 1 .75-.75h9.44L9.72 4.53a.75.75 0 0 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06l2.69-2.72H2.97A.75.75 0 0 1 2.22 8z" />
                </svg>
              </>
            )}
          </button>
        </div>
        <p id="submit-info" className="text-xs text-text-muted text-center mt-3">
          By submitting, you confirm all declarations above are accepted.
        </p>
      </form>
    </div>
  );
}
