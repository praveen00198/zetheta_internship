// ─────────────────────────────────────────────
// useFormPersistence — draft load, validation, and resume
// ─────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';
import { decryptData } from '../utils/encryption';
import { STORAGE_KEY_PREFIX, DRAFT_EXPIRY_HOURS, DRAFT_VERSION } from '../utils/constants';
import type { LoanApplicationState, PersistedDraft } from '../types/form';

export interface DraftInfo {
  loanType: string;
  step: number;
  timestamp: Date;
  key: string;
}

export interface UseDraftResult {
  draftInfo: DraftInfo | null;
  isChecking: boolean;
  loadDraft: () => Promise<{ data: LoanApplicationState; step: number } | null>;
  discardDraft: () => void;
  checkForDrafts: () => Promise<void>;
}

export function useFormPersistence(): UseDraftResult {
  const [draftInfo, setDraftInfo] = useState<DraftInfo | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const cachedDraftRef = useRef<{ key: string; draft: PersistedDraft } | null>(null);

  const checkForDrafts = useCallback(async () => {
    setIsChecking(true);
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_KEY_PREFIX));
      if (keys.length === 0) {
        setDraftInfo(null);
        cachedDraftRef.current = null;
        return;
      }

      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const draft = await decryptData<PersistedDraft>(raw);
        if (!draft || !draft.metadata) {
          localStorage.removeItem(key);
          continue;
        }

        // Validate version
        if (draft.metadata.version !== DRAFT_VERSION) {
          localStorage.removeItem(key);
          continue;
        }

        // Check expiry (72 hours)
        const savedAt = new Date(draft.metadata.timestamp);
        const hoursOld = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
        if (hoursOld > DRAFT_EXPIRY_HOURS) {
          localStorage.removeItem(key);
          continue;
        }

        cachedDraftRef.current = { key, draft };
        setDraftInfo({
          loanType: draft.metadata.loanType || key.replace(STORAGE_KEY_PREFIX, ''),
          step: draft.metadata.step || 1,
          timestamp: savedAt,
          key,
        });
        return;
      }

      setDraftInfo(null);
      cachedDraftRef.current = null;
    } catch {
      setDraftInfo(null);
      cachedDraftRef.current = null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const loadDraft = useCallback(async (): Promise<{ data: LoanApplicationState; step: number } | null> => {
    if (!draftInfo) return null;

    try {
      if (cachedDraftRef.current && cachedDraftRef.current.key === draftInfo.key) {
        const { draft } = cachedDraftRef.current;
        return {
          data: draft.data,
          step: draft.metadata.step,
        };
      }

      const raw = localStorage.getItem(draftInfo.key);
      if (!raw) {
        setDraftInfo(null);
        return null;
      }

      const draft = await decryptData<PersistedDraft>(raw);
      if (!draft || !draft.metadata) {
        localStorage.removeItem(draftInfo.key);
        setDraftInfo(null);
        return null;
      }

      return {
        data: draft.data,
        step: draft.metadata.step,
      };
    } catch (err) {
      console.warn('[FormPersistence] Error loading draft:', err);
      if (draftInfo?.key) {
        localStorage.removeItem(draftInfo.key);
      }
      setDraftInfo(null);
      return null;
    }
  }, [draftInfo]);

  const discardDraft = useCallback(() => {
    if (draftInfo?.key) {
      localStorage.removeItem(draftInfo.key);
    }
    cachedDraftRef.current = null;
    setDraftInfo(null);
  }, [draftInfo]);

  return { draftInfo, isChecking, loadDraft, discardDraft, checkForDrafts };
}
