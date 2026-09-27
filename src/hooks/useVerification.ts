// ─────────────────────────────────────────────
// useVerification — PAN/Aadhaar verification with loading state
// ─────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import type { VerificationResult } from '../types/form';

export type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseVerificationReturn {
  status: VerificationStatus;
  message: string;
  verify: (value: string) => Promise<boolean>;
  reset: () => void;
}

export function useVerification(
  verifyFn: (value: string) => Promise<VerificationResult>,
): UseVerificationReturn {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [message, setMessage] = useState('');
  const inProgressRef = useRef(false);

  const verify = useCallback(async (value: string): Promise<boolean> => {
    // Prevent duplicate calls
    if (inProgressRef.current) return false;
    inProgressRef.current = true;

    setStatus('loading');
    setMessage('');

    try {
      const result = await verifyFn(value);
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        return true;
      } else {
        setStatus('error');
        setMessage(result.message);
        return false;
      }
    } catch {
      setStatus('error');
      setMessage('Verification service unavailable. Please try again.');
      return false;
    } finally {
      inProgressRef.current = false;
    }
  }, [verifyFn]);

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage('');
    inProgressRef.current = false;
  }, []);

  return { status, message, verify, reset };
}
