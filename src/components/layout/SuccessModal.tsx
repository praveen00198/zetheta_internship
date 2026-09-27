import Modal from '../common/Modal';
import type { LoanApplicationState } from '../../types/form';
import { formatCurrency, formatLoanType, formatTenure } from '../../utils/formatters';
import { calculateLoanCosts } from '../../utils/emiCalculator';
import type { LoanType } from '../../types/form';

interface SuccessModalProps {
  isOpen: boolean;
  referenceId: string;
  formData: LoanApplicationState;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  referenceId,
  formData,
  onClose,
}: SuccessModalProps) {
  const loanType = formData.step1?.loanType as LoanType;
  const loanAmount = formData.step1?.loanAmount || 0;
  const tenure = formData.step1?.tenure || 0;
  const emi = loanType ? calculateLoanCosts(loanType, loanAmount, tenure).emi : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Submitted!"
      size="md"
      preventClose={false}
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4">
          <svg aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="white">
            <path fillRule="evenodd" d="M27.405 8.22a1.5 1.5 0 0 1 0 2.12l-14 14a1.5 1.5 0 0 1-2.12 0l-6-6a1.5 1.5 0 1 1 2.12-2.12l4.94 4.94 12.94-12.94a1.5 1.5 0 0 1 2.12 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-1">
          Thank you, {formData.step2?.fullName?.split(' ')[0] || 'Applicant'}!
        </h3>
        <p className="text-sm text-text-secondary">
          Your loan application has been submitted successfully.
          Our team will review it and get back to you within 2–3 business days.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-4 mb-5">
        <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-1">
          Application Reference
        </p>
        <p className="text-base font-mono font-semibold text-text-primary break-all">
          {referenceId}
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {[
          { label: 'Loan Type', value: formatLoanType(loanType || '') },
          { label: 'Loan Amount', value: formatCurrency(loanAmount) },
          { label: 'Tenure', value: formatTenure(tenure) },
          { label: 'Estimated EMI', value: formatCurrency(emi) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0">
            <span className="text-xs text-text-muted">{label}</span>
            <span className="text-sm font-medium text-text-primary">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50 rounded-lg px-4 py-3 mb-5">
        <p className="text-xs text-text-muted text-center">
          Please save your reference ID for future correspondence.
          You will receive a confirmation on your registered email and mobile.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-primary flex-1"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
