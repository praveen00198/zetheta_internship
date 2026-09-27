import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '../../schemas/step2Schema';
import type { Step2Values } from '../../schemas/step2Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import RadioGroup from '../../components/common/RadioGroup';
import { getMaxDobDate, getMinDobDate } from '../../utils/formatters';
import { MIN_AGE, MAX_AGE } from '../../utils/constants';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export default function Step2PersonalInfo({
  formData,
  onUpdate,
  onNext,
  onBack,
}: StepProps) {
  const saved = formData.step2;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: {
      fullName: saved?.fullName || '',
      dateOfBirth: saved?.dateOfBirth || '',
      gender: saved?.gender || undefined,
      maritalStatus: saved?.maritalStatus || undefined,
      fathersName: saved?.fathersName || '',
      mothersName: saved?.mothersName || '',
      email: saved?.email || '',
      mobile: saved?.mobile || '',
      alternateMobile: saved?.alternateMobile || '',
    },
  });

  const onSubmit = (data: Step2Values) => {
    onUpdate('step2', data);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 2 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Personal Information
        </h1>
        <p className="text-text-secondary">
          Please provide your personal details as they appear on your government ID.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Name & DOB */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Basic Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                id="fullName"
                required
                autoComplete="name"
                placeholder="As on Aadhaar / PAN"
                error={errors.fullName?.message}
                {...register('fullName')}
              />
            </div>
            <div>
              <Input
                label="Date of Birth"
                id="dateOfBirth"
                type="date"
                required
                autoComplete="bday"
                max={getMaxDobDate(MIN_AGE)}
                min={getMinDobDate(MAX_AGE)}
                error={errors.dateOfBirth?.message}
                helpText={`Must be ${MIN_AGE}–${MAX_AGE} years old.`}
                {...register('dateOfBirth')}
              />
            </div>
            <div>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    name="gender"
                    label="Gender"
                    required
                    options={GENDER_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    layout="horizontal"
                    error={errors.gender?.message}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Marital Status"
                    required
                    options={MARITAL_STATUS_OPTIONS}
                    error={errors.maritalStatus?.message}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
          </div>
        </section>

        {/* Parents */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Parent Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Father's Name"
              id="fathersName"
              required
              autoComplete="off"
              placeholder="As on official records"
              error={errors.fathersName?.message}
              {...register('fathersName')}
            />
            <Input
              label="Mother's Name"
              id="mothersName"
              required
              autoComplete="off"
              placeholder="As on official records"
              error={errors.mothersName?.message}
              {...register('mothersName')}
            />
          </div>
        </section>

        {/* Contact */}
        <section className="card mb-8">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>
            <div>
              <Input
                label="Mobile Number"
                id="mobile"
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                helpText="Must start with 6, 7, 8, or 9."
                error={errors.mobile?.message}
                {...register('mobile')}
              />
            </div>
            <div>
              <Input
                label="Alternate Mobile"
                id="alternateMobile"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="Optional alternate number"
                helpText="Must differ from primary mobile."
                error={errors.alternateMobile?.message}
                {...register('alternateMobile')}
              />
            </div>
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
