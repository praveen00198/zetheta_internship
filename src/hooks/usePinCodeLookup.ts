// ─────────────────────────────────────────────
// usePinCodeLookup — debounced PIN code lookup
// ─────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';
import { lookupPinCode } from '../services/pinCodeService';
import type { PinCodeRecord } from '../types/form';

export type PinLookupStatus = 'idle' | 'loading' | 'found' | 'not_found' | 'error';

export interface UsePinCodeLookupReturn {
  status: PinLookupStatus;
  record: PinCodeRecord | null;
  errorMessage: string;
  lookup: (pinCode: string) => void;
  reset: () => void;
}

export function usePinCodeLookup(
  onFound?: (record: PinCodeRecord) => void,
): UsePinCodeLookupReturn {
  const [status, setStatus] = useState<PinLookupStatus>('idle');
  const [record, setRecord] = useState<PinCodeRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inProgressRef = useRef(false);

  const lookup = useCallback((pinCode: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!pinCode || pinCode.length !== 6) {
      setStatus('idle');
      setRecord(null);
      setErrorMessage('');
      return;
    }

    setStatus('loading');

    debounceRef.current = setTimeout(async () => {
      if (inProgressRef.current) return;
      inProgressRef.current = true;

      try {
        const result = await lookupPinCode(pinCode);
        if (result.found && result.record) {
          setStatus('found');
          setRecord(result.record);
          setErrorMessage('');
          onFound?.(result.record);
        } else {
          setStatus('not_found');
          setRecord(null);
          setErrorMessage(result.error || 'PIN code not found.');
        }
      } catch {
        setStatus('error');
        setRecord(null);
        setErrorMessage('Unable to lookup PIN code. Please enter city and state manually.');
      } finally {
        inProgressRef.current = false;
      }
    }, 500);
  }, [onFound]);

  const reset = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatus('idle');
    setRecord(null);
    setErrorMessage('');
    inProgressRef.current = false;
  }, []);

  return { status, record, errorMessage, lookup, reset };
}
