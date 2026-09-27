// ─────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────

import { ALL_PAN_ENTITIES } from './constants';

/**
 * Validate PAN format: AAAAA9999A
 * Returns null if valid, error string if invalid.
 */
export function validatePanFormat(pan: string): string | null {
  if (!pan) return 'PAN is required.';
  const trimmed = pan.trim().toUpperCase();
  if (trimmed.length !== 10) {
    return 'PAN must be exactly 10 characters in AAAAA9999A format.';
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(trimmed)) {
    return 'PAN must be in AAAAA9999A format (5 letters, 4 digits, 1 letter).';
  }
  return null;
}

/**
 * Validate PAN 4th character entity type.
 */
export function validatePanEntityType(pan: string, allowedTypes: string[]): string | null {
  if (!pan || pan.length < 4) return null;
  const entityChar = pan.trim().toUpperCase()[3];
  if (!ALL_PAN_ENTITIES[entityChar]) {
    return `PAN 4th character '${entityChar}' must indicate a valid entity type (P, C, H, A, B, G, J, L, F, T).`;
  }
  if (!allowedTypes.includes(entityChar)) {
    const allowed = allowedTypes.map(t => `${t} (${ALL_PAN_ENTITIES[t]})`).join(', ');
    return `PAN 4th character must indicate entity type. For this loan, allowed types are: ${allowed}.`;
  }
  return null;
}

/**
 * Verhoeff checksum for Aadhaar validation.
 * This is the ACTUAL Verhoeff algorithm, not just length check.
 */
export function verhoeffChecksum(num: string): boolean {
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];
  const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

  let c = 0;
  const reversed = num.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][parseInt(reversed[i], 10)]];
  }
  return inv[c] === 0;
}

/**
 * Validate Aadhaar number (12 digits + Verhoeff checksum).
 */
export function validateAadhaar(aadhaar: string): string | null {
  if (!aadhaar) return 'Aadhaar number is required.';
  const cleaned = aadhaar.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    return 'Aadhaar must be exactly 12 digits.';
  }
  if (!verhoeffChecksum(cleaned)) {
    return 'Aadhaar number is invalid. Please check and re-enter.';
  }
  return null;
}

/**
 * Validate mobile number (10 digits, starts with 6-9).
 */
export function validateMobile(mobile: string): string | null {
  if (!mobile) return 'Mobile number is required.';
  const cleaned = mobile.replace(/\s/g, '');
  if (!/^\d{10}$/.test(cleaned)) {
    return 'Mobile number must contain exactly 10 digits.';
  }
  if (!/^[6-9]/.test(cleaned)) {
    return 'Mobile number must start with 6, 7, 8, or 9.';
  }
  return null;
}

/**
 * Validate GST number format.
 * Format: 2 digits (state code) + 10 char PAN + 1 digit entity + Z + 1 checksum
 */
export function validateGst(gst: string): string | null {
  if (!gst) return 'GST number is required.';
  const trimmed = gst.trim().toUpperCase();
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(trimmed)) {
    return 'GST number must be in format: 2 digits + PAN + 1 digit + Z + 1 character (e.g., 27AABCU9603R1ZX).';
  }
  return null;
}

/**
 * Validate PIN code (exactly 6 digits).
 */
export function validatePinCode(pin: string): string | null {
  if (!pin) return 'PIN code is required.';
  if (!/^\d{6}$/.test(pin)) {
    return 'PIN code must be exactly 6 digits.';
  }
  return null;
}

/**
 * Validate email format.
 */
export function validateEmail(email: string): string | null {
  if (!email) return 'Email address is required.';
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

/**
 * Validate referral code (alphanumeric, 6-10 chars).
 */
export function validateReferralCode(code: string): string | null {
  if (!code) return null; // optional
  if (!/^[a-zA-Z0-9]{6,10}$/.test(code)) {
    return 'Referral code must be 6–10 alphanumeric characters.';
  }
  return null;
}

/**
 * Validate full name (2–100 chars, letters/spaces/periods).
 */
export function validateFullName(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  if (name.trim().length > 100) {
    return 'Full name must not exceed 100 characters.';
  }
  if (!/^[a-zA-Z .]+$/.test(name.trim())) {
    return 'Full name may only contain letters, spaces, and periods.';
  }
  return null;
}
