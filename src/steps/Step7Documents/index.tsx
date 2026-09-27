import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step7Schema } from '../../schemas/step7Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import FileUpload from '../../components/common/FileUpload';
import SignaturePad from '../../components/common/SignatureCanvas';
import type { LoanType } from '../../types/form';

export default function Step7Documents({ formData, onUpdate, onNext, onBack }: StepProps) {
  const saved = formData.step7;
  const loanType = (formData.step1?.loanType || 'personal') as LoanType;
  const panVerified = formData.step3?.panVerified || false;
  const step5Data = formData.step5 as Record<string, unknown>;
  const employmentType = (step5Data?.employmentType as string) || 'salaried';

  const schema = step7Schema(loanType, employmentType, panVerified);

  const isSalaried = employmentType === 'salaried';
  const isSelfOrBusiness = ['self_employed', 'business_owner'].includes(employmentType);
  const isHomeLoan = loanType === 'home';
  const isBusinessLoan = loanType === 'business';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      panCard: saved?.panCard || undefined,
      aadhaarFront: saved?.aadhaarFront || undefined,
      aadhaarBack: saved?.aadhaarBack || undefined,
      salarySlips: saved?.salarySlips || [],
      bankStatements: saved?.bankStatements || [],
      itr: saved?.itr || [],
      propertyDocuments: saved?.propertyDocuments || undefined,
      businessRegistration: saved?.businessRegistration || undefined,
      gstReturns: saved?.gstReturns || [],
      photograph: saved?.photograph || undefined,
      signature: saved?.signature || '',
    },
  });

  const onSubmit = (data: unknown) => {
    onUpdate('step7', data as typeof formData.step7);
    onNext();
  };

  const PDF_JPG_PNG = ['application/pdf', 'image/jpeg', 'image/png'];
  const PDF_ONLY = ['application/pdf'];
  const JPG_PNG = ['image/jpeg', 'image/png'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 7 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Documents & E-Signature
        </h1>
        <p className="text-text-secondary">
          Upload your documents and provide your digital signature.
          Images will be automatically compressed for optimal size.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Identity Documents */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Identity Documents</h2>
          <div className="flex flex-col gap-6">
            {!panVerified && (
              <Controller
                name="panCard"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="PAN Card"
                    accept={PDF_JPG_PNG}
                    maxSizeMB={5}
                    required={!panVerified}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.panCard?.message as string}
                    helpText={panVerified ? 'Optional — PAN already verified.' : 'Required — PAN not yet verified.'}
                  />
                )}
              />
            )}
            {panVerified && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-green-600 shrink-0">
                  <path fillRule="evenodd" d="M12.28 3.28a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l2.47 2.47 5.97-5.97a.75.75 0 0 1 1.06 0z" />
                </svg>
                <p className="text-xs text-green-700 font-medium">PAN Card upload optional — PAN verified electronically.</p>
              </div>
            )}
            <Controller
              name="aadhaarFront"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Aadhaar Card — Front Side"
                  accept={PDF_JPG_PNG}
                  maxSizeMB={5}
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.aadhaarFront?.message as string}
                />
              )}
            />
            <Controller
              name="aadhaarBack"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Aadhaar Card — Back Side"
                  accept={PDF_JPG_PNG}
                  maxSizeMB={5}
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.aadhaarBack?.message as string}
                />
              )}
            />
            <Controller
              name="photograph"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Recent Photograph"
                  accept={JPG_PNG}
                  maxSizeMB={2}
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.photograph?.message as string}
                  helpText="Passport-size photograph, clear background."
                />
              )}
            />
          </div>
        </section>

        {/* Income Documents */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Income Documents</h2>
          <div className="flex flex-col gap-6">
            {isSalaried && (
              <Controller
                name="salarySlips"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="Salary Slips — Last 3 Months"
                    accept={PDF_ONLY}
                    maxSizeMB={5}
                    multiple
                    required
                    value={field.value}
                    onChange={field.onChange as (v: unknown) => void}
                    error={errors.salarySlips?.message as string}
                    helpText="Upload 3 separate salary slips."
                  />
                )}
              />
            )}
            {isSelfOrBusiness && (
              <Controller
                name="itr"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="Income Tax Returns — Last 2 Years"
                    accept={PDF_ONLY}
                    maxSizeMB={5}
                    multiple
                    required
                    value={field.value}
                    onChange={field.onChange as (v: unknown) => void}
                    error={errors.itr?.message as string}
                    helpText="Upload ITR for last 2 financial years."
                  />
                )}
              />
            )}
            <Controller
              name="bankStatements"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Bank Statements — Last 6 Months"
                  accept={PDF_ONLY}
                  maxSizeMB={10}
                  multiple
                  required
                  value={field.value}
                  onChange={field.onChange as (v: unknown) => void}
                  error={errors.bankStatements?.message as string}
                  helpText="Upload statements from all active accounts."
                />
              )}
            />
          </div>
        </section>

        {/* Loan-specific Documents */}
        {(isHomeLoan || isBusinessLoan) && (
          <section className="card mb-6">
            <h2 className="text-sm font-semibold text-text-primary mb-5">
              {isHomeLoan ? 'Property Documents' : 'Business Documents'}
            </h2>
            <div className="flex flex-col gap-6">
              {isHomeLoan && (
                <Controller
                  name="propertyDocuments"
                  control={control}
                  render={({ field }) => (
                    <FileUpload
                      label="Property Documents"
                      accept={PDF_ONLY}
                      maxSizeMB={10}
                      required
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.propertyDocuments?.message as string}
                      helpText="Sale deed, title deed, or allotment letter."
                    />
                  )}
                />
              )}
              {isBusinessLoan && (
                <>
                  <Controller
                    name="businessRegistration"
                    control={control}
                    render={({ field }) => (
                      <FileUpload
                        label="Business Registration Document"
                        accept={PDF_ONLY}
                        maxSizeMB={5}
                        required
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.businessRegistration?.message as string}
                        helpText="Certificate of Incorporation, Partnership Deed, etc."
                      />
                    )}
                  />
                  <Controller
                    name="gstReturns"
                    control={control}
                    render={({ field }) => (
                      <FileUpload
                        label="GST Returns — Last 4 Quarters"
                        accept={PDF_ONLY}
                        maxSizeMB={5}
                        multiple
                        required
                        value={field.value}
                        onChange={field.onChange as (v: unknown) => void}
                        error={errors.gstReturns?.message as string}
                        helpText="Upload GSTR-3B for each of last 4 quarters."
                      />
                    )}
                  />
                </>
              )}
            </div>
          </section>
        )}

        {/* E-Signature */}
        <section className="card mb-8">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Applicant E-Signature</h2>
          <p className="text-xs text-text-muted mb-4">
            Your signature confirms that all information provided is accurate and you consent to the terms of this application.
          </p>
          <Controller
            name="signature"
            control={control}
            render={({ field }) => (
              <SignaturePad
                label="Your Signature"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.signature?.message as string}
              />
            )}
          />
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button type="button" onClick={onBack} className="btn-secondary">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M11.78 4.22a.75.75 0 0 1 0 1.06L7.56 9.5l4.22 4.22a.75.75 0 0 1-1.06 1.06L5.97 10.03a.75.75 0 0 1 0-1.06l4.75-4.75a.75.75 0 0 1 1.06 0z" />
            </svg>
            Back
          </button>
          <button type="submit" className="btn-primary btn-lg">
            Review Application
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L8.44 6.5 4.22 2.28a.75.75 0 0 1 1.06-1.06l4.75 4.75a.75.75 0 0 1 0 1.06l-4.75 4.75a.75.75 0 0 1-1.06 0z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
