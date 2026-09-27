import { useState, useEffect } from 'react';
import Wizard from '../components/wizard/Wizard';
import Modal from '../components/common/Modal';
import { useFormPersistence } from '../hooks/useFormPersistence';
import type { LoanApplicationState } from '../types/form';
import { formatLoanType } from '../utils/formatters';

export default function App() {
  const { draftInfo, isChecking, loadDraft, discardDraft, checkForDrafts } = useFormPersistence();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [initialData, setInitialData] = useState<LoanApplicationState | undefined>();
  const [initialStep, setInitialStep] = useState(1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkForDrafts();
  }, [checkForDrafts]);

  useEffect(() => {
    if (!isChecking) {
      if (draftInfo) {
        setShowResumeModal(true);
      } else {
        setIsReady(true);
      }
    }
  }, [isChecking, draftInfo]);

  const handleResume = async () => {
    setShowResumeModal(false);
    const result = await loadDraft();
    if (result) {
      setInitialData(result.data);
      setInitialStep(result.step);
    }
    setIsReady(true);
  };

  const handleStartFresh = () => {
    discardDraft();
    setShowResumeModal(false);
    setIsReady(true);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" aria-label="Loading application" />
          <p className="text-sm text-text-muted">Loading LendSwift...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Resume Draft Modal */}
      <Modal
        isOpen={showResumeModal}
        title="Resume Application"
        preventClose
        showCloseButton={false}
        size="sm"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-border flex items-center justify-center mx-auto mb-4">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-text-secondary">
              <path fillRule="evenodd" d="M1 10a9 9 0 1 1 18 0 9 9 0 0 1-18 0zm9-4a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 6zm0 7.25a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">Saved Application Found</h3>
          <p className="text-sm text-text-secondary">
            You have a saved{' '}
            <strong>{draftInfo ? formatLoanType(draftInfo.loanType) : ''}</strong>{' '}
            application.
          </p>
          {draftInfo && (
            <p className="text-xs text-text-muted mt-1">
              From step {draftInfo.step} · Saved {draftInfo.timestamp.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResume}
            className="btn-primary w-full"
          >
            Resume Application
          </button>
          <button
            type="button"
            onClick={handleStartFresh}
            className="btn-secondary w-full"
          >
            Start Fresh
          </button>
        </div>
        <p className="text-xs text-text-muted text-center mt-3">
          Starting fresh will permanently delete your saved progress.
        </p>
      </Modal>

      {/* Main Wizard */}
      {isReady && !showResumeModal && (
        <Wizard
          initialData={initialData}
          initialStep={initialStep}
        />
      )}
    </>
  );
}
