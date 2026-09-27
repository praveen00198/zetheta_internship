import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { step5Schema } from '../../schemas/step5Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import CurrencyInput from '../../components/common/CurrencyInput';
import RadioGroup from '../../components/common/RadioGroup';
import { BUSINESS_TYPES, MIN_SALARY, MIN_ANNUAL_TURNOVER } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import type { LoanType } from '../../types/form';

const EMPLOYMENT_OPTIONS = [
  { value: 'salaried', label: 'Salaried', description: 'Working for a company or organization.' },
  { value: 'self_employed', label: 'Self-Employed', description: 'Freelancer, consultant, or sole proprietor.' },
  { value: 'business_owner', label: 'Business Owner', description: 'Director or owner of a registered company.' },
];

interface Step5FormValues {
  employmentType: 'salaried' | 'self_employed' | 'business_owner';
  companyName?: string;
  designation?: string;
  yearsOfExperience?: number;
  monthlyNetSalary?: number;
  businessName?: string;
  businessType?: string;
  yearsInBusiness?: number;
  annualTurnover?: number;
  monthlyIncome?: number;
  gstNumber?: string;
  officeAddress?: string;
}

export default function Step5Employment({
  formData,
  onUpdate,
  onNext,
  onBack,
}: StepProps) {
  const saved = formData.step5 as Record<string, unknown>;
  const loanType = (formData.step1?.loanType || 'personal') as LoanType;
  const isBusinessLoan = loanType === 'business';

  // Business loans cannot use salaried
  const employmentOptions = isBusinessLoan
    ? EMPLOYMENT_OPTIONS.filter((o) => o.value !== 'salaried')
    : EMPLOYMENT_OPTIONS;

  const defaultEmploymentType = isBusinessLoan
    ? ((saved?.employmentType === 'salaried' ? 'business_owner' : saved?.employmentType) || 'business_owner')
    : (saved?.employmentType || 'salaried');

  const schema = step5Schema(loanType);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Step5FormValues>({
    resolver: zodResolver(schema) as any,
    mode: 'onBlur',
    defaultValues: {
      employmentType: defaultEmploymentType as any,
      ...(saved || {}),
    },
  });

  const employmentType = watch('employmentType');

  // Clear stale fields when employment type changes
  useEffect(() => {
    if (employmentType) {
      reset({
        employmentType,
      });
    }
  }, [employmentType, reset]);

  const getError = (field: string): string | undefined => {
    const err = errors[field as keyof typeof errors];
    if (err && typeof err === 'object' && 'message' in err) {
      return (err as { message: string }).message;
    }
    return undefined;
  };

  const onSubmit = (data: unknown) => {
    onUpdate('step5', data as typeof formData.step5);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 5 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Employment & Income
        </h1>
        <p className="text-text-secondary">
          Tell us about your employment and income details.
          {isBusinessLoan && (
            <span className="block mt-1 text-xs font-medium text-text-muted">
              Note: Salaried employment is not eligible for Business Loans.
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Employment Type */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Employment Type</h2>
          <Controller
            name="employmentType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                name="employmentType"
                required
                options={employmentOptions}
                value={field.value as string}
                onChange={field.onChange}
                layout="card"
                error={getError('employmentType')}
              />
            )}
          />
        </section>

        {/* Salaried Fields */}
        {employmentType === 'salaried' && (
          <section className="card mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-text-primary mb-5">Salaried Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Company Name"
                  id="companyName"
                  required
                  autoComplete="organization"
                  placeholder="Current employer name"
                  error={getError('companyName')}
                  {...register('companyName')}
                />
              </div>
              <Input
                label="Designation"
                id="designation"
                required
                placeholder="Your job title"
                error={getError('designation')}
                {...register('designation')}
              />
              <div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="yearsOfExperience" className="text-sm font-medium text-text-primary tracking-wide after:content-['_*'] after:text-error">
                    Years of Experience
                  </label>
                  <input
                    id="yearsOfExperience"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={50}
                    step={0.5}
                    placeholder="e.g. 3.5"
                    className={`field-input ${getError('yearsOfExperience') ? 'field-input-error' : ''}`}
                    aria-invalid={!!getError('yearsOfExperience')}
                    {...register('yearsOfExperience', { valueAsNumber: true })}
                  />
                  {getError('yearsOfExperience') && (
                    <p role="alert" className="text-xs text-error">{getError('yearsOfExperience')}</p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Controller
                  name="monthlyNetSalary"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      label="Monthly Net Salary"
                      required
                      value={field.value as number}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={getError('monthlyNetSalary')}
                      helpText={`Minimum ${formatCurrency(MIN_SALARY)} per month.`}
                    />
                  )}
                />
              </div>
            </div>
          </section>
        )}

        {/* Self-Employed Fields */}
        {employmentType === 'self_employed' && (
          <section className="card mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-text-primary mb-5">Self-Employment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Business / Practice Name"
                  id="businessName"
                  required
                  placeholder="Your business name"
                  error={getError('businessName')}
                  {...register('businessName')}
                />
              </div>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Business Type"
                    required
                    options={BUSINESS_TYPES as readonly { value: string; label: string }[]}
                    error={getError('businessType')}
                    value={(field.value as string) || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="yearsInBusiness" className="text-sm font-medium text-text-primary tracking-wide after:content-['_*'] after:text-error">
                    Years in Business
                  </label>
                  <input
                    id="yearsInBusiness"
                    type="number"
                    inputMode="numeric"
                    min={2}
                    max={60}
                    placeholder="e.g. 5"
                    className={`field-input ${getError('yearsInBusiness') ? 'field-input-error' : ''}`}
                    aria-invalid={!!getError('yearsInBusiness')}
                    {...register('yearsInBusiness', { valueAsNumber: true })}
                  />
                  {getError('yearsInBusiness') && (
                    <p role="alert" className="text-xs text-error">{getError('yearsInBusiness')}</p>
                  )}
                </div>
              </div>
              <Controller
                name="annualTurnover"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Annual Turnover"
                    required
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={getError('annualTurnover')}
                    helpText={`Minimum ${formatCurrency(MIN_ANNUAL_TURNOVER)}.`}
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
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={getError('monthlyIncome')}
                  />
                )}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Office / Business Address"
                  id="officeAddress"
                  required
                  placeholder="Complete office address"
                  error={getError('officeAddress')}
                  {...register('officeAddress')}
                />
              </div>
            </div>
          </section>
        )}

        {/* Business Owner Fields */}
        {employmentType === 'business_owner' && (
          <section className="card mb-6 animate-slide-up">
            <h2 className="text-sm font-semibold text-text-primary mb-5">Business Owner Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Business Name"
                  id="businessName"
                  required
                  placeholder="Registered business name"
                  error={getError('businessName')}
                  {...register('businessName')}
                />
              </div>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Business Type"
                    required
                    options={BUSINESS_TYPES as readonly { value: string; label: string }[]}
                    error={getError('businessType')}
                    value={(field.value as string) || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="yearsInBusiness2" className="text-sm font-medium text-text-primary tracking-wide after:content-['_*'] after:text-error">
                    Years in Business
                  </label>
                  <input
                    id="yearsInBusiness2"
                    type="number"
                    inputMode="numeric"
                    min={2}
                    max={60}
                    placeholder="e.g. 5"
                    className={`field-input ${getError('yearsInBusiness') ? 'field-input-error' : ''}`}
                    {...register('yearsInBusiness', { valueAsNumber: true })}
                  />
                  {getError('yearsInBusiness') && (
                    <p role="alert" className="text-xs text-error">{getError('yearsInBusiness')}</p>
                  )}
                </div>
              </div>
              <Controller
                name="annualTurnover"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Annual Turnover"
                    required
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={getError('annualTurnover')}
                    helpText={`Minimum ${formatCurrency(MIN_ANNUAL_TURNOVER)}.`}
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
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={getError('monthlyIncome')}
                  />
                )}
              />
              <div className="sm:col-span-2">
                <Input
                  label="GST Number"
                  id="gstNumber"
                  required
                  style={{ textTransform: 'uppercase' }}
                  autoComplete="off"
                  placeholder="e.g. 27AABCU9603R1ZX"
                  helpText="Format: 2 digits + PAN (10 chars) + 1 digit + Z + 1 char"
                  error={getError('gstNumber')}
                  {...register('gstNumber')}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    register('gstNumber').onChange(e);
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Office / Business Address"
                  id="officeAddress2"
                  required
                  placeholder="Complete office address"
                  error={getError('officeAddress')}
                  {...register('officeAddress')}
                />
              </div>
            </div>
          </section>
        )}

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
