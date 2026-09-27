// ─────────────────────────────────────────────
// INDIAN NUMBER FORMATTER
// ─────────────────────────────────────────────

/**
 * Formats a number using Indian numbering system (lakhs/crores).
 * E.g. 100000 → "1,00,000"
 */
export function formatIndianNumber(value: number): string {
  if (isNaN(value)) return '0';
  const parts = Math.abs(value).toString().split('.');
  const intPart = parts[0];
  const decPart = parts[1] ? `.${parts[1]}` : '';

  // Indian grouping: last 3 digits, then groups of 2
  let result = '';
  if (intPart.length <= 3) {
    result = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const groups: string[] = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    result = groups.join(',') + ',' + last3;
  }

  return (value < 0 ? '-' : '') + result + decPart;
}

/**
 * Formats a number as Indian currency with ₹ symbol.
 * E.g. 500000 → "₹5,00,000"
 */
export function formatCurrency(value: number): string {
  return `₹${formatIndianNumber(value)}`;
}

/**
 * Parses a string that may have commas back to number.
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Format a number in lakhs or crores for display.
 */
export function formatLakhCrore(value: number): string {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(2)} L`;
  }
  return formatCurrency(value);
}

// ─────────────────────────────────────────────
// DATE FORMATTERS
// ─────────────────────────────────────────────

/**
 * Format ISO date string to Indian DD/MM/YYYY format.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate age from date of birth string (YYYY-MM-DD).
 */
export function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get maximum date for DOB (must be at least minAge years old).
 */
export function getMaxDobDate(minAge: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date.toISOString().split('T')[0];
}

/**
 * Get minimum date for DOB (must not be older than maxAge years).
 */
export function getMinDobDate(maxAge: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - maxAge);
  return date.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
// FILE SIZE FORMATTER
// ─────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─────────────────────────────────────────────
// STRING FORMATTERS
// ─────────────────────────────────────────────

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 4) return aadhaar;
  return `XXXX XXXX ${aadhaar.slice(-4)}`;
}

export function maskPan(pan: string): string {
  if (!pan || pan.length < 4) return pan;
  return `XXXXX${pan.slice(5, 9)}X`;
}

export function maskMobile(mobile: string): string {
  if (!mobile || mobile.length < 4) return mobile;
  return `XXXXXX${mobile.slice(-4)}`;
}

export function formatTenure(months: number): string {
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years} year${years > 1 ? 's' : ''} ${rem} month${rem > 1 ? 's' : ''}`;
}

export function generateApplicationId(): string {
  const hex = () => Math.random().toString(16).substr(2);
  const p1 = hex().padEnd(8, '0').slice(0, 8);
  const p2 = hex().padEnd(4, '0').slice(0, 4);
  const p3 = hex().padEnd(4, '0').slice(0, 4);
  const p4 = hex().padEnd(4, '0').slice(0, 4);
  const p5 = hex().padEnd(12, '0').slice(0, 12);
  return `LS-${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export function formatLoanType(loanType: string): string {
  switch (loanType) {
    case 'personal': return 'Personal Loan';
    case 'home': return 'Home Loan';
    case 'business': return 'Business Loan';
    default: return loanType;
  }
}

export function formatEmploymentType(type: string): string {
  switch (type) {
    case 'salaried': return 'Salaried';
    case 'self_employed': return 'Self-Employed';
    case 'business_owner': return 'Business Owner';
    default: return type;
  }
}

export function formatResidenceType(type: string): string {
  switch (type) {
    case 'owned': return 'Owned';
    case 'rented': return 'Rented';
    case 'company': return 'Company Provided';
    case 'family': return 'Family Owned';
    default: return type;
  }
}

export function formatRelationship(type: string): string {
  switch (type) {
    case 'spouse': return 'Spouse';
    case 'parent': return 'Parent';
    case 'sibling': return 'Sibling';
    case 'business_partner': return 'Business Partner';
    default: return type;
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
