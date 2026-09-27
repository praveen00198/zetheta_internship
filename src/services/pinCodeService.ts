// ─────────────────────────────────────────────
// PIN CODE SERVICE — simulation layer
// Replace this with a real API call in production.
// ─────────────────────────────────────────────

import type { PinCodeRecord } from '../types/form';
import pinCodeData from '../data/pinCodeData.json';

const data = pinCodeData as PinCodeRecord[];

const DB: Map<string, PinCodeRecord> = new Map(
  data.map((r) => [r.pinCode, r]),
);

export interface PinCodeLookupResult {
  found: boolean;
  record?: PinCodeRecord;
  error?: string;
}

/**
 * Simulate a PIN code lookup (latency: 400–700ms).
 */
export async function lookupPinCode(pinCode: string): Promise<PinCodeLookupResult> {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));

  if (!pinCode || !/^\d{6}$/.test(pinCode)) {
    return { found: false, error: 'Invalid PIN code format.' };
  }

  const record = DB.get(pinCode);
  if (!record) {
    return { found: false, error: 'No records found for this PIN code. Please enter city and state manually.' };
  }

  return { found: true, record };
}
