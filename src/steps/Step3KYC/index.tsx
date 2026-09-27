import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { step3Schema } from '../../schemas/step3Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';
import { useVerification } from '../../hooks/useVerification';
import { verifyPan, verifyAadhaar } from '../../services/verificationService';
import type { LoanType } from '../../types/form';

export default function Step3KYC({ formData, onUpdate, onNext, onBack }: StepProps) {
  const saved = formData.step3;
  const loanType = (formData.step1?.loanType || 'personal') as LoanType;
  const loanAmount = formData.step1?.loanAmount || 0;
  const showPassport = loanType === 'home' && loanAmount > 50_00_000;

  const schema = step3Schema(loanType, loanAmount);

  const [panVerified, setPanVerified] = useState(saved?.panVerified || false);
  const [aadhaarVerified, setAadhaarVerified] = useState(saved?.aadhaarVerified || false);

  const panVerification = useVerification(verifyPan);
  const aadhaarVerification = useVerification(verifyAadhaar);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      pan: saved?.pan || '',
      panVerified: saved?.panVerified || false,
      aadhaar: saved?.aadhaar || '',
      aadhaarVerified: saved?.aadhaarVerified || false,
      aadhaarConsent: saved?.aadhaarConsent || false,
      voterId: saved?.voterId || '',
      passport: saved?.passport || '',
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
  }, [getValues, panVerification, setValue, setPanVerified]);

  const handleVerifyAadhaar = useCallback(async () => {
    const aadhaar = getValues('aadhaar');
    const success = await aadhaarVerification.verify(aadhaar);
    if (success) {
      setAadhaarVerified(true);
      setValue('aadhaarVerified', true);
    } else {
      setAadhaarVerified(false);
      setValue('aadhaarVerified', false);
    }
  }, [getValues, aadhaarVerification, setValue, setAadhaarVerified]);

  const onSubmit = (data: Record<string, unknown>) => {
    onUpdate('step3', { ...data, panVerified, aadhaarVerified } as typeof formData.step3);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 3 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          KYC Verification
        </h1>
        <p className="text-text-secondary">
          Verify your identity documents. All verification is performed securely.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-neutral-50 border border-border rounded-lg px-4 py-3 mb-6">
        <p className="text-xs text-text-muted">
          <span className="font-medium text-text-secondary">Note:</span> This is a simulation.
          Verification does not contact NSDL or UIDAI systems.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* PAN */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-1">PAN Card</h2>
          <p className="text-xs text-text-muted mb-5">Format: AAAAA9999A</p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="PAN Number"
                id="pan"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                autoComplete="off"
                placeholder="ABCDE1234F"
                error={errors.pan?.message}
                helpText={`For ${loanType} loan, 4th character must be: ${loanType === 'business' ? 'P (Individual), C (Company), or F (Firm)' : 'P (Individual) only'}`}
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
              aria-label="Verify PAN number"
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
              PAN Verified Successfully
            </div>
          )}
          {panVerification.status === 'error' && (
            <p role="alert" className="text-xs text-error mt-2">{panVerification.message}</p>
          )}
          {errors.panVerified && !panVerified && (
            <p role="alert" className="text-xs text-error mt-2">{errors.panVerified.message}</p>
          )}
        </section>

        {/* Aadhaar */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Aadhaar Card</h2>
          <p className="text-xs text-text-muted mb-5">12-digit Aadhaar number with Verhoeff validation</p>

          <div className="mb-4">
            <Controller
              name="aadhaarConsent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label={
                    <span>
                      I consent to the use of my Aadhaar for verification purposes as per UIDAI guidelines.{' '}
                      <span className="text-error font-medium">Required.</span>
                    </span>
                  }
                  required
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  error={errors.aadhaarConsent?.message}
                />
              )}
            />
          </div>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Aadhaar Number"
                id="aadhaar"
                required
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                placeholder="12-digit Aadhaar number"
                error={errors.aadhaar?.message}
                {...register('aadhaar')}
                onChange={(e) => {
                  register('aadhaar').onChange(e);
                  if (aadhaarVerified) {
                    setAadhaarVerified(false);
                    setValue('aadhaarVerified', false);
                    aadhaarVerification.reset();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleVerifyAadhaar}
              disabled={aadhaarVerification.status === 'loading' || aadhaarVerified}
              className="btn-secondary h-11 shrink-0"
              aria-label="Verify Aadhaar number"
            >
              {aadhaarVerification.status === 'loading' ? (
                <span className="spinner" aria-hidden="true" />
              ) : aadhaarVerified ? (
                '✓ Verified'
              ) : (
                'Verify'
              )}
            </button>
          </div>
          {aadhaarVerified && (
            <div className="verification-badge mt-3 w-fit" aria-live="polite">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path fillRule="evenodd" d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.25 7.25l4.97-4.97a.75.75 0 0 1 1.06 0z" />
              </svg>
              Aadhaar Verified Successfully
            </div>
          )}
          {aadhaarVerification.status === 'error' && (
            <p role="alert" className="text-xs text-error mt-2">{aadhaarVerification.message}</p>
          )}
          {errors.aadhaarVerified && !aadhaarVerified && (
            <p role="alert" className="text-xs text-error mt-2">{errors.aadhaarVerified.message}</p>
          )}
        </section>

        {/* Optional Documents */}
        <section className="card mb-8">
          <h2 className="text-sm font-semibold text-text-primary mb-5">
            Additional Documents <span className="text-text-muted font-normal">(Optional)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Voter ID"
              id="voterId"
              autoComplete="off"
              placeholder="ELC0000000"
              error={errors.voterId?.message}
              {...register('voterId')}
            />
            {showPassport ? (
              <Input
                label="Passport Number"
                id="passport"
                required
                autoComplete="off"
                placeholder="A1234567"
                helpText="Required for Home Loan above ₹50 lakh."
                error={errors.passport?.message}
                {...register('passport')}
              />
            ) : (
              <Input
                label="Passport Number"
                id="passport"
                autoComplete="off"
                placeholder="A1234567 (optional)"
                error={errors.passport?.message}
                {...register('passport')}
              />
            )}
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
