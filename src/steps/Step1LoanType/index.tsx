import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { step1Schema } from '../../schemas/step1Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Select from '../../components/common/Select';
import CurrencyInput from '../../components/common/CurrencyInput';
import Input from '../../components/common/Input';
import { LOAN_LIMITS, TENURE_LIMITS, LOAN_PURPOSES } from '../../utils/constants';
import { formatCurrency, formatLoanType } from '../../utils/formatters';
import type { LoanType } from '../../types/form';

const LOAN_TYPES: { value: LoanType; label: string; description: string }[] = [
  {
    value: 'personal',
    label: 'Personal Loan',
    description: 'For medical, travel, wedding & personal needs. Up to ₹10,00,000.',
  },
  {
    value: 'home',
    label: 'Home Loan',
    description: 'Purchase, construction, or renovation. Up to ₹1,00,00,000.',
  },
  {
    value: 'business',
    label: 'Business Loan',
    description: 'Working capital, expansion & equipment. Up to ₹50,00,000.',
  },
];

export default function Step1LoanType({ formData, onUpdate, onNext }: StepProps) {
  const saved = formData.step1;
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType>(
    (saved?.loanType as LoanType) || 'personal',
  );

  const schema = step1Schema(selectedLoanType);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      loanType: saved?.loanType || 'personal',
      loanAmount: saved?.loanAmount || undefined,
      tenure: saved?.tenure || undefined,
      purpose: saved?.purpose || '',
      referralCode: saved?.referralCode || '',
    },
  });

  const watchedLoanType = watch('loanType') as LoanType;

  useEffect(() => {
    if (watchedLoanType && watchedLoanType !== selectedLoanType) {
      setSelectedLoanType(watchedLoanType);
      // Reset amount and tenure when loan type changes
      setValue('loanAmount', undefined as unknown as number);
      setValue('tenure', undefined as unknown as number);
      setValue('purpose', '');
    }
  }, [watchedLoanType, selectedLoanType, setValue]);

  const limits = LOAN_LIMITS[selectedLoanType];
  const tenureLimits = TENURE_LIMITS[selectedLoanType];
  const purposes = LOAN_PURPOSES[selectedLoanType];

  const onSubmit = (data: unknown) => {
    onUpdate('step1', data as typeof formData.step1);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 1 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Choose Your Loan
        </h1>
        <p className="text-text-secondary">
          Select the type of loan and configure your requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Loan Type Selection */}
        <section className="mb-8">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">
            Loan Type
          </h2>
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">Select loan type</legend>
            <div className="grid grid-cols-1 gap-3">
              {LOAN_TYPES.map((lt) => {
                const isSelected = watchedLoanType === lt.value;
                return (
                  <label
                    key={lt.value}
                    className={`radio-card cursor-pointer ${isSelected ? 'radio-card-selected' : ''}`}
                  >
                    <input
                      type="radio"
                      value={lt.value}
                      className="sr-only"
                      {...register('loanType')}
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{lt.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{lt.description}</p>
                      </div>
                      <span
                        aria-hidden="true"
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${
                          isSelected ? 'border-black bg-black' : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.loanType && (
              <p role="alert" className="text-xs text-error mt-2 flex items-center gap-1">
                <span>⚠</span> {errors.loanType.message}
              </p>
            )}
          </fieldset>
        </section>

        {/* Loan Amount */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">
            Loan Amount
          </h2>
          <Controller
            name="loanAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Loan Amount"
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.loanAmount?.message}
                helpText={`${formatCurrency(limits.min)} – ${formatCurrency(limits.max)} for ${formatLoanType(selectedLoanType)}`}
                min={limits.min}
                max={limits.max}
                placeholder={String(limits.min)}
              />
            )}
          />
        </section>

        {/* Tenure */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">
            Loan Tenure
          </h2>
          <Controller
            name="tenure"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="tenure"
                  className="text-sm font-medium text-text-primary tracking-wide after:content-['_*'] after:text-error"
                >
                  Tenure (months)
                </label>
                <input
                  id="tenure"
                  type="number"
                  inputMode="numeric"
                  min={tenureLimits.min}
                  max={tenureLimits.max}
                  placeholder={String(tenureLimits.min)}
                  aria-invalid={!!errors.tenure}
                  aria-describedby={errors.tenure ? 'tenure-error' : 'tenure-help'}
                  className={`field-input ${errors.tenure ? 'field-input-error' : ''}`}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                  value={field.value || ''}
                />
                <p id="tenure-help" className="text-xs text-text-muted">
                  {tenureLimits.min} – {tenureLimits.max} months for {formatLoanType(selectedLoanType)}
                </p>
                {errors.tenure && (
                  <p id="tenure-error" role="alert" className="text-xs text-error flex items-center gap-1">
                    <span aria-hidden="true">⚠</span> {errors.tenure.message}
                  </p>
                )}
              </div>
            )}
          />
        </section>

        {/* Purpose */}
        <section className="mb-6">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-4">
            Loan Purpose
          </h2>
          <Select
            label="Purpose"
            required
            options={purposes.map((p) => ({ value: p, label: p }))}
            error={errors.purpose?.message}
            {...register('purpose')}
          />
        </section>

        {/* Referral Code */}
        <section className="mb-8">
          <Input
            label="Referral Code"
            id="referralCode"
            placeholder="e.g. SWFT2024"
            helpText="Optional. 6–10 alphanumeric characters."
            error={errors.referralCode?.message}
            {...register('referralCode')}
          />
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-end pt-6 border-t border-border">
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
