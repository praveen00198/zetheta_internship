import { clsx } from '../../utils/clsx';
import type { WizardStep } from '../../types/form';

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (stepId: number) => void;
}

export default function WizardProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  const visibleSteps = steps.filter((s) => s.isVisible);
  const currentIndex = visibleSteps.findIndex((s) => s.id === currentStep);
  const progressPct = visibleSteps.length > 1
    ? Math.round((currentIndex / (visibleSteps.length - 1)) * 100)
    : 0;

  return (
    <>
      {/* Desktop progress */}
      <nav
        aria-label="Application progress"
        className="hidden lg:block"
      >
        <ol className="flex items-start gap-0">
          {visibleSteps.map((step, idx) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = step.id === currentStep;
            const isClickable = isCompleted && onStepClick;
            const isLast = idx === visibleSteps.length - 1;

            return (
              <li
                key={step.id}
                className={clsx('flex items-start flex-1', !isLast && 'pr-2')}
              >
                <div className="flex flex-col items-center w-full">
                  {/* Line + circle row */}
                  <div className="flex items-center w-full">
                    {/* Circle */}
                    <button
                      type="button"
                      onClick={() => isClickable && onStepClick(step.id)}
                      disabled={!isClickable}
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-label={`Step ${idx + 1}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                      className={clsx(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-200',
                        isCompleted
                          ? 'bg-black border-black text-white cursor-pointer hover:bg-neutral-800'
                          : isCurrent
                          ? 'bg-white border-black text-black'
                          : 'bg-white border-neutral-300 text-text-muted cursor-default',
                        !isClickable && 'cursor-default',
                      )}
                    >
                      {isCompleted ? (
                        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path fillRule="evenodd" d="M10.28 2.28a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06L4.25 7.25l4.97-4.97a.75.75 0 0 1 1.06 0z" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </button>
                    {/* Connector line */}
                    {!isLast && (
                      <div className="flex-1 h-px mx-2 mt-0 transition-all duration-500">
                        <div
                          className={clsx(
                            'h-px w-full transition-all duration-500',
                            isCompleted ? 'bg-black' : 'bg-neutral-200',
                          )}
                        />
                      </div>
                    )}
                  </div>
                  {/* Label */}
                  <p
                    className={clsx(
                      'mt-2 text-2xs text-center leading-tight max-w-[70px]',
                      isCurrent ? 'text-text-primary font-medium' : 'text-text-muted',
                      isCompleted && 'text-text-secondary',
                    )}
                  >
                    {step.shortTitle}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile compact progress */}
      <div className="lg:hidden" aria-label="Application progress">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-text-primary">
            Step {currentIndex + 1} of {visibleSteps.length}
          </p>
          <p className="text-sm text-text-muted">{visibleSteps[currentIndex]?.title}</p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Application progress: step ${currentIndex + 1} of ${visibleSteps.length}`}
          className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-black rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </>
  );
}
