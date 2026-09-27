import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  lazy,
  Suspense,
} from 'react';
import type { LoanApplicationState } from '../../types/form';
import {
  buildStepRegistry,
  getVisibleSteps,
  getNextStep,
  getPreviousStep,
} from './StepRegistry';
import WizardProgress from './WizardProgress';
import { useAutoSave } from '../../hooks/useAutoSave';
import { ToastContainer } from '../common/Toast';
import { useToast } from '../../hooks/useToast';
import { submitApplication } from '../../services/submissionService';
import SuccessModal from '../layout/SuccessModal';

// Lazy-load steps for performance
const Step1 = lazy(() => import('../../steps/Step1LoanType'));
const Step2 = lazy(() => import('../../steps/Step2PersonalInfo'));
const Step3 = lazy(() => import('../../steps/Step3KYC'));
const Step4 = lazy(() => import('../../steps/Step4Address'));
const Step5 = lazy(() => import('../../steps/Step5Employment'));
const Step6 = lazy(() => import('../../steps/Step6CoApplicant'));
const Step7 = lazy(() => import('../../steps/Step7Documents'));
const Step8 = lazy(() => import('../../steps/Step8Review'));

const STEP_COMPONENTS: Record<number, React.LazyExoticComponent<React.ComponentType<StepProps>>> = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
  6: Step6,
  7: Step7,
  8: Step8,
};

export interface StepProps {
  formData: LoanApplicationState;
  onUpdate: (stepKey: keyof LoanApplicationState, data: Partial<LoanApplicationState[keyof LoanApplicationState]>) => void;
  onNext: () => void;
  onBack: () => void;
  onEdit?: (stepId: number) => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

const EMPTY_FORM: LoanApplicationState = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {},
  step6: undefined,
  step7: {},
  step8: {},
};

interface WizardProps {
  initialData?: LoanApplicationState;
  initialStep?: number;
}

export default function Wizard({ initialData = EMPTY_FORM, initialStep = 1 }: WizardProps) {
  const [formData, setFormData] = useState<LoanApplicationState>(initialData);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [successModal, setSuccessModal] = useState<{ open: boolean; referenceId?: string }>({
    open: false,
  });

  const mainContentRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, dismissToast } = useToast();
  const pendingNavigationRef = useRef(false);

  // Auto-save
  const { deleteDraft } = useAutoSave({
    formData,
    loanType: formData.step1?.loanType || 'personal',
    currentStep,
    onSaved: (ts) => {
      const time = ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      addToast(`Draft saved at ${time}`, 'info', 2000);
    },
  });

  const steps = buildStepRegistry(formData);
  const visibleSteps = getVisibleSteps(formData);

  // Focus management: move focus to main content on step change
  useEffect(() => {
    if (mainContentRef.current) {
      const firstFocusable = mainContentRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 150);
      }
    }
  }, [currentStep]);

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Recalculate step registry when loan type/amount changes
  // If Step 6 was the current step and it becomes hidden, skip forward
  useEffect(() => {
    const step6 = steps.find((s) => s.id === 6);
    if (currentStep === 6 && step6 && !step6.isVisible) {
      const next = getNextStep(6, formData);
      if (next) setCurrentStep(next);
    }
  }, [currentStep, steps, formData]);

  const updateFormData = useCallback(
    (
      stepKey: keyof LoanApplicationState,
      data: Partial<LoanApplicationState[keyof LoanApplicationState]>,
    ) => {
      setFormData((prev) => {
        const next = {
          ...prev,
          [stepKey]: {
            ...((prev[stepKey] as object) || {}),
            ...(data as object),
          },
        };
        formDataRef.current = next;
        return next;
      });
    },
    [],
  );

  const isLastStep = currentStep === visibleSteps[visibleSteps.length - 1]?.id;

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || pendingNavigationRef.current) return;
    pendingNavigationRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await submitApplication(formDataRef.current);
      if (result.success && result.referenceId) {
        deleteDraft();
        setSuccessModal({ open: true, referenceId: result.referenceId });
      } else {
        addToast(result.message || 'Submission failed. Please try again.', 'error', 4000);
      }
    } catch {
      addToast('An unexpected error occurred. Please try again.', 'error', 4000);
    } finally {
      setIsSubmitting(false);
      pendingNavigationRef.current = false;
    }
  }, [isSubmitting, deleteDraft, addToast]);

  const navigate = useCallback(
    (direction: 'next' | 'back') => {
      if (isTransitioning || pendingNavigationRef.current) return;
      pendingNavigationRef.current = true;
      setIsTransitioning(true);

      setTimeout(() => {
        if (direction === 'next') {
          setCompletedSteps((prev) => new Set([...prev, currentStep]));
          const next = getNextStep(currentStep, formDataRef.current);
          if (next) setCurrentStep(next);
        } else {
          const prev = getPreviousStep(currentStep, formDataRef.current);
          if (prev) setCurrentStep(prev);
        }
        setIsTransitioning(false);
        pendingNavigationRef.current = false;
      }, 150);
    },
    [currentStep, isTransitioning],
  );

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleSubmit();
    } else {
      navigate('next');
    }
  }, [isLastStep, handleSubmit, navigate]);

  const handleBack = useCallback(() => navigate('back'), [navigate]);

  const handleEdit = useCallback((stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center" aria-hidden="true">
                <span className="text-white text-xs font-bold">LS</span>
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary leading-none">LendSwift</p>
                <p className="text-xs text-text-muted mt-0.5 hidden sm:block">Digital Loan Application</p>
              </div>
            </div>
            {/* Desktop progress in header */}
            <div className="flex-1 max-w-2xl hidden lg:block">
              <WizardProgress
                steps={steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleEdit}
              />
            </div>
            <div className="text-xs text-text-muted shrink-0 hidden sm:flex items-center gap-1.5">
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-neutral-400">
                <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zM4.5 5.5a.75.75 0 0 1 1.5 0v2a.75.75 0 0 1-1.5 0v-2zM6 4a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
              </svg>
              Secured
            </div>
          </div>
        </div>
      </header>

      {/* Mobile progress bar */}
      <div className="lg:hidden bg-white border-b border-border px-4 py-3">
        <WizardProgress
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8" ref={mainContentRef}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-64" aria-live="polite" aria-label="Loading step">
              <div className="spinner w-8 h-8" />
            </div>
          }
        >
          {StepComponent && (
            <div
              key={currentStep}
              className={clsx(
                'transition-all duration-200',
                isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0',
              )}
            >
              <StepComponent
                formData={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                onEdit={handleEdit}
                isLastStep={isLastStep}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </Suspense>
      </main>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Success modal */}
      <SuccessModal
        isOpen={successModal.open}
        referenceId={successModal.referenceId || ''}
        formData={formData}
        onClose={() => {
          setSuccessModal({ open: false });
        }}
      />
    </div>
  );
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
