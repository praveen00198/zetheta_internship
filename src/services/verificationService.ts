// ─────────────────────────────────────────────
// VERIFICATION SERVICE — simulation layer
// This is a FRONTEND SIMULATION only.
// It does NOT call NSDL, UIDAI, or any real API.
// Replace with real API calls in production.
// ─────────────────────────────────────────────

import type { VerificationResult } from '../types/form';
import { validatePanFormat, validateAadhaar } from '../utils/validators';

const VERIFICATION_DELAY_MS = 1500;

/**
 * Simulate PAN verification (1.5s delay).
 * Accepts any PAN that passes format validation.
 */
export async function verifyPan(pan: string): Promise<VerificationResult> {
  await new Promise((r) => setTimeout(r, VERIFICATION_DELAY_MS));

  const formatError = validatePanFormat(pan);
  if (formatError) {
    return { success: false, message: formatError };
  }

  // Simulate: PAN starting with "ZZZZZ" always fails (for testing)
  if (pan.toUpperCase().startsWith('ZZZZZ')) {
    return { success: false, message: 'PAN verification failed. Record not found.' };
  }

  return {
    success: true,
    message: 'PAN verified successfully.',
    data: { pan: pan.toUpperCase(), status: 'ACTIVE' },
  };
}

/**
 * Simulate Aadhaar verification (1.5s delay).
 * Validates Verhoeff checksum before simulating.
 */
export async function verifyAadhaar(aadhaar: string): Promise<VerificationResult> {
  await new Promise((r) => setTimeout(r, VERIFICATION_DELAY_MS));

  const error = validateAadhaar(aadhaar);
  if (error) {
    return { success: false, message: error };
  }

  // Simulate: Aadhaar starting with "0000" always fails (for testing)
  if (aadhaar.startsWith('0000')) {
    return { success: false, message: 'Aadhaar verification failed. Record not found.' };
  }

  return {
    success: true,
    message: 'Aadhaar verified successfully.',
    data: { masked: `XXXX XXXX ${aadhaar.slice(-4)}` },
  };
}
