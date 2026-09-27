import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { step6Schema } from '../../schemas/step6Schema';
import type { Step6Values } from '../../schemas/step6Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import CurrencyInput from '../../components/common/CurrencyInput';
import Checkbox from '../../components/common/Checkbox';
import { useVerification } from '../../hooks/useVerification';
import { verifyPan } from '../../services/verificationService';

const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'business_partner', label: 'Business Partner' },
];

export default function Step6CoApplicant({
  formData,
  onUpdate,
  onNext,
  onBack,
}: StepProps) {
  const saved = formData.step6;
  const isMarried = formData.step2?.maritalStatus === 'married';
  const defaultRelationship = isMarried ? 'spouse' : (saved?.relationship || 'parent');

  const [panVerified, setPanVerified] = useState(saved?.panVerified || false);
  const panVerification = useVerification(verifyPan);
  const sigRef = useRef<SignatureCanvas>(null);
  const [canvasHidden, setCanvasHidden] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<Step6Values>({
    resolver: zodResolver(step6Schema),
    mode: 'onBlur',
    defaultValues: {
      name: saved?.name || '',
      relationship: defaultRelationship as Step6Values['relationship'],
      pan: saved?.pan || '',
      panVerified: saved?.panVerified || false,
      monthlyIncome: saved?.monthlyIncome || undefined,
      consent: saved?.consent || false,
      signature: saved?.signature || '',
    },
  });

  const handleVerifyPan = useCallback(async () => {
    const pan = getValues('pan');
    const success = await panVerification.verify(pan);
    if (success) {
      setPanVerified(true);
      setValue('panVerified', true);
    } else {
      setPanVerified(false);
      setValue('panVerified', false);
    }
  }, [getValues, panVerification, setValue]);

  const handleClearSignature = useCallback(() => {
    sigRef.current?.clear();
    setValue('signature', '');
  }, [setValue]);

  const handleSignatureEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.toDataURL('image/png');
      setValue('signature', dataUrl);
    }
  }, [setValue]);

  const onSubmit = (data: Step6Values) => {
    onUpdate('step6', { ...data, panVerified } as typeof formData.step6);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 6 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Co-Applicant Details
        </h1>
        <p className="text-text-secondary">
          A co-applicant improves loan eligibility and may increase your loan limit.
          {isMarried && (
            <span className="block mt-1 text-xs text-text-muted">
              Relationship defaulted to Spouse based on your marital status.
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Basic Info */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Co-Applicant Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="Co-Applicant Full Name"
                id="coName"
                required
                autoComplete="off"
                placeholder="As on official ID"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Select
                  label="Relationship"
                  required
                  options={RELATIONSHIP_OPTIONS}
                  error={errors.relationship?.message}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  label="Monthly Income"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.monthlyIncome?.message}
                />
              )}
            />
          </div>
        </section>

        {/* Co-applicant PAN */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Co-Applicant PAN</h2>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="PAN Number"
                id="coPan"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                autoComplete="off"
                placeholder="ABCDE1234F"
                error={errors.pan?.message}
                {...register('pan')}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  register('pan').onChange(e);
                  if (panVerified) {
                    setPanVerified(false);
                    setValue('panVerified', false);
                    panVerification.reset();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyPan}
              disabled={panVerification.status === 'loading' || panVerified}
              className="btn-secondary h-11 shrink-0"
              aria-label="Verify co-applicant PAN"
            >
              {panVerification.status === 'loading' ? (
                <span className="spinner" aria-hidden="true" />
              ) : panVerified ? (
                '✓ Verified'
              ) : (
                'Verify'
              )}
            </button>
          </div>
          {panVerified && (
            <div className="verification-badge mt-3 w-fit" aria-live="polite">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path fillRule="evenodd" d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.25 7.25l4.97-4.97a.75.75 0 0 1 1.06 0z" />
              </svg>
              PAN Verified
            </div>
          )}
          {panVerification.status === 'error' && (
            <p role="alert" className="text-xs text-error mt-2">{panVerification.message}</p>
          )}
          {errors.panVerified && !panVerified && (
            <p role="alert" className="text-xs text-error mt-2">{errors.panVerified.message}</p>
          )}
        </section>

        {/* Signature */}
        <section className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Co-Applicant Signature</h2>
            <button type="button" onClick={handleClearSignature} className="btn-ghost btn-sm">
              Clear
            </button>
          </div>
          <p className="text-xs text-text-muted mb-3">
            Sign using mouse or touchscreen in the area below.
          </p>
          <div
            className="signature-wrapper"
            style={{ height: '180px' }}
            onMouseLeave={() => setCanvasHidden(true)}
            onFocus={() => setCanvasHidden(false)}
          >
            {canvasHidden && (
              <div
                className="absolute inset-0 bg-neutral-50/80 flex items-center justify-center cursor-pointer z-10"
                onClick={() => setCanvasHidden(false)}
                role="button"
                tabIndex={0}
                aria-label="Click to resume signing"
                onKeyDown={(e) => e.key === 'Enter' && setCanvasHidden(false)}
              >
                <p className="text-xs text-text-muted">Click to resume signing</p>
              </div>
            )}
            <SignatureCanvas
              ref={sigRef}
              penColor="#000000"
              canvasProps={{
                style: { width: '100%', height: '180px' },
                'aria-label': 'Co-applicant signature pad',
              }}
              onEnd={handleSignatureEnd}
            />
          </div>
          {errors.signature && (
            <p role="alert" className="text-xs text-error mt-2">{errors.signature.message}</p>
          )}
        </section>

        {/* Consent */}
        <section className="card mb-8">
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="I, the co-applicant, consent to this loan application and authorise LendSwift to process my information for credit evaluation purposes."
                required
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                error={errors.consent?.message}
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
            Continue
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L8.44 6.5 4.22 2.28a.75.75 0 0 1 1.06-1.06l4.75 4.75a.75.75 0 0 1 0 1.06l-4.75 4.75a.75.75 0 0 1-1.06 0z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
