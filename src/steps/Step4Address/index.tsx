import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useCallback } from 'react';
import { step4Schema } from '../../schemas/step4Schema';
import type { Step4Values } from '../../schemas/step4Schema';
import type { StepProps } from '../../components/wizard/Wizard';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Checkbox from '../../components/common/Checkbox';
import CurrencyInput from '../../components/common/CurrencyInput';
import { usePinCodeLookup } from '../../hooks/usePinCodeLookup';
import { INDIAN_STATES } from '../../utils/constants';
import type { PinCodeRecord } from '../../types/form';

const RESIDENCE_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'company', label: 'Company Provided' },
  { value: 'family', label: 'Family Owned' },
];

const STATE_OPTIONS = INDIAN_STATES.map((s) => ({ value: s, label: s }));

type FormMethods = ReturnType<typeof useForm<Step4Values>>;

interface AddressBlockProps {
  prefix: 'current' | 'permanent' | 'previous';
  register: FormMethods['register'];
  control: FormMethods['control'];
  errors: Record<string, unknown>;
  setValue: FormMethods['setValue'];
  watch: FormMethods['watch'];
  showResidence?: boolean;
}

function AddressBlock({
  prefix,
  register,
  control,
  errors,
  setValue,
  watch,
  showResidence = false,
}: AddressBlockProps) {
  const pinValue = watch(`${prefix}.pinCode` as `current.pinCode` | `permanent.pinCode` | `previous.pinCode`);

  const { status: pinStatus, errorMessage, lookup } = usePinCodeLookup(
    useCallback(
      (r: PinCodeRecord) => {
        (setValue as (name: string, val: string) => void)(`${prefix}.city`, r.city);
        (setValue as (name: string, val: string) => void)(`${prefix}.state`, r.state);
        (setValue as (name: string, val: string) => void)(`${prefix}.postOffice`, r.postOffice);
      },
      [prefix, setValue],
    ),
  );

  useEffect(() => {
    if (pinValue && (pinValue as string).length === 6) {
      lookup(pinValue as string);
    }
  }, [pinValue, lookup]);

  const getError = (field: string): string | undefined => {
    let err: unknown = errors[prefix];
    if (err && typeof err === 'object') {
      err = (err as Record<string, unknown>)[field];
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return (err as { message: string }).message;
    }
    return undefined;
  };

  const residenceType = showResidence ? watch('current.residenceType') : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="sm:col-span-2">
        <Input
          label="Address Line 1"
          id={`${prefix}-line1`}
          required
          autoComplete={prefix === 'current' ? 'address-line1' : 'off'}
          placeholder="House/Flat No., Street, Area"
          error={getError('addressLine1')}
          {...register(`${prefix}.addressLine1` as `current.addressLine1` | `permanent.addressLine1` | `previous.addressLine1`)}
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="Address Line 2"
          id={`${prefix}-line2`}
          autoComplete={prefix === 'current' ? 'address-line2' : 'off'}
          placeholder="Landmark, Colony (optional)"
          error={getError('addressLine2')}
          {...register(`${prefix}.addressLine2` as `current.addressLine2` | `permanent.addressLine2` | `previous.addressLine2`)}
        />
      </div>
      <div>
        <Input
          label="PIN Code"
          id={`${prefix}-pin`}
          required
          inputMode="numeric"
          maxLength={6}
          autoComplete={prefix === 'current' ? 'postal-code' : 'off'}
          placeholder="6-digit PIN code"
          error={getError('pinCode')}
          suffix={
            pinStatus === 'loading' ? (
              <span className="spinner w-3 h-3" />
            ) : pinStatus === 'found' ? (
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-success">
                <path fillRule="evenodd" d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.25 7.25l4.97-4.97a.75.75 0 0 1 1.06 0z" />
              </svg>
            ) : undefined
          }
          {...register(`${prefix}.pinCode` as `current.pinCode` | `permanent.pinCode` | `previous.pinCode`)}
        />
        {pinStatus === 'not_found' && (
          <p className="text-xs text-text-muted mt-1">{errorMessage} Please enter manually.</p>
        )}
      </div>
      <div>
        <Input
          label="Post Office"
          id={`${prefix}-po`}
          autoComplete="off"
          placeholder="Auto-filled from PIN"
          error={getError('postOffice')}
          {...register(`${prefix}.postOffice` as `current.postOffice` | `permanent.postOffice` | `previous.postOffice`)}
        />
      </div>
      <div>
        <Input
          label="City"
          id={`${prefix}-city`}
          required
          autoComplete={prefix === 'current' ? 'address-level2' : 'off'}
          placeholder="City"
          error={getError('city')}
          {...register(`${prefix}.city` as `current.city` | `permanent.city` | `previous.city`)}
        />
      </div>
      <div>
        <Controller
          name={`${prefix}.state` as `current.state` | `permanent.state` | `previous.state`}
          control={control}
          render={({ field }) => (
            <Select
              label="State"
              required
              options={STATE_OPTIONS}
              error={getError('state')}
              value={(field.value as string) || ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
      {showResidence && (
        <>
          <div>
            <Controller
              name="current.residenceType"
              control={control}
              render={({ field }) => (
                <Select
                  label="Residence Type"
                  required
                  options={RESIDENCE_OPTIONS}
                  error={getError('residenceType')}
                  value={(field.value as string) || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="yearsAtAddress" className="text-sm font-medium text-text-primary tracking-wide after:content-['_*'] after:text-error">
                Years at Current Address
              </label>
              <input
                id="yearsAtAddress"
                type="number"
                inputMode="numeric"
                min={0}
                max={50}
                placeholder="0"
                className={`field-input ${getError('yearsAtAddress') ? 'field-input-error' : ''}`}
                aria-invalid={!!getError('yearsAtAddress')}
                {...register('current.yearsAtAddress', { valueAsNumber: true })}
              />
              {getError('yearsAtAddress') && (
                <p role="alert" className="text-xs text-error">{getError('yearsAtAddress')}</p>
              )}
            </div>
          </div>
          {residenceType === 'rented' && (
            <div>
              <Controller
                name="current.monthlyRent"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Monthly Rent"
                    required
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={getError('monthlyRent')}
                    placeholder="0"
                  />
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Step4Address({ formData, onUpdate, onNext, onBack }: StepProps) {
  const saved = formData.step4;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    mode: 'onBlur',
    defaultValues: {
      current: {
        addressLine1: saved?.current?.addressLine1 || '',
        addressLine2: saved?.current?.addressLine2 || '',
        pinCode: saved?.current?.pinCode || '',
        city: saved?.current?.city || '',
        state: saved?.current?.state || '',
        postOffice: saved?.current?.postOffice || '',
        residenceType: saved?.current?.residenceType || undefined,
        yearsAtAddress: saved?.current?.yearsAtAddress ?? undefined,
        monthlyRent: saved?.current?.monthlyRent || undefined,
      },
      sameAsCurrent: saved?.sameAsCurrent ?? false,
      permanent: {
        addressLine1: saved?.permanent?.addressLine1 || '',
        addressLine2: saved?.permanent?.addressLine2 || '',
        pinCode: saved?.permanent?.pinCode || '',
        city: saved?.permanent?.city || '',
        state: saved?.permanent?.state || '',
        postOffice: saved?.permanent?.postOffice || '',
      },
      previous: saved?.previous || undefined,
    },
  });

  const sameAsCurrent = watch('sameAsCurrent');
  const yearsAtAddress = watch('current.yearsAtAddress');
  const currentData = watch('current');

  useEffect(() => {
    if (sameAsCurrent) {
      setValue('permanent.addressLine1', currentData.addressLine1 || '');
      setValue('permanent.addressLine2', currentData.addressLine2 || '');
      setValue('permanent.pinCode', currentData.pinCode || '');
      setValue('permanent.city', currentData.city || '');
      setValue('permanent.state', currentData.state || '');
      setValue('permanent.postOffice', currentData.postOffice || '');
    }
  }, [sameAsCurrent, currentData, setValue]);

  const showPrevious = typeof yearsAtAddress === 'number' && yearsAtAddress < 1;

  const onSubmit = (data: Step4Values) => {
    const finalData = {
      ...data,
      permanent: data.sameAsCurrent
        ? {
            addressLine1: data.current.addressLine1,
            addressLine2: data.current.addressLine2,
            pinCode: data.current.pinCode,
            city: data.current.city,
            state: data.current.state,
            postOffice: data.current.postOffice,
          }
        : data.permanent,
      previous: (data.current.yearsAtAddress ?? 0) < 1 ? data.previous : undefined,
    };
    onUpdate('step4', finalData as unknown as typeof formData.step4);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
          Step 4 of 8
        </p>
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight mb-2">
          Address Details
        </h1>
        <p className="text-text-secondary">
          Please provide your current and permanent address information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Current Address */}
        <section className="card mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-5">Current Address</h2>
          <AddressBlock
            prefix="current"
            register={register}
            control={control}
            errors={errors as Record<string, unknown>}
            setValue={setValue}
            watch={watch}
            showResidence
          />
        </section>

        {/* Previous Address */}
        {showPrevious && (
          <section className="card mb-6 border-l-4 border-l-black animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-black" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-text-primary">
                Previous Address <span className="text-error">*</span>
              </h2>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Required because you have lived at your current address for less than 1 year.
            </p>
            <AddressBlock
              prefix="previous"
              register={register}
              control={control}
              errors={errors as Record<string, unknown>}
              setValue={setValue}
              watch={watch}
            />
          </section>
        )}

        {/* Permanent Address */}
        <section className="card mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-text-primary">Permanent Address</h2>
            <Controller
              name="sameAsCurrent"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Same as Current Address"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
          {!sameAsCurrent && (
            <AddressBlock
              prefix="permanent"
              register={register}
              control={control}
              errors={errors as Record<string, unknown>}
              setValue={setValue}
              watch={watch}
            />
          )}
          {sameAsCurrent && (
            <p className="text-sm text-text-muted">Permanent address copied from current address.</p>
          )}
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
