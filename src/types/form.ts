// ─────────────────────────────────────────────
// LOAN TYPE
// ─────────────────────────────────────────────
export type LoanType = 'personal' | 'home' | 'business';

// ─────────────────────────────────────────────
// STEP 1 — LOAN TYPE
// ─────────────────────────────────────────────
export interface Step1Data {
  loanType: LoanType;
  loanAmount: number;
  tenure: number;
  purpose: string;
  referralCode?: string;
}

// ─────────────────────────────────────────────
// STEP 2 — PERSONAL INFO
// ─────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Step2Data {
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  fathersName: string;
  mothersName: string;
  email: string;
  mobile: string;
  alternateMobile?: string;
}

// ─────────────────────────────────────────────
// STEP 3 — KYC
// ─────────────────────────────────────────────
export interface Step3Data {
  pan: string;
  panVerified: boolean;
  aadhaar: string;
  aadhaarVerified: boolean;
  aadhaarConsent: boolean;
  voterId?: string;
  passport?: string;
}

// ─────────────────────────────────────────────
// STEP 4 — ADDRESS
// ─────────────────────────────────────────────
export type ResidenceType = 'owned' | 'rented' | 'company' | 'family';

export interface AddressFields {
  addressLine1: string;
  addressLine2?: string;
  pinCode: string;
  city: string;
  state: string;
  postOffice?: string;
}

export interface Step4Data {
  current: AddressFields & {
    residenceType: ResidenceType;
    yearsAtAddress: number;
    monthlyRent?: number;
  };
  sameAsCurrent: boolean;
  previous?: AddressFields;
  permanent: AddressFields;
}

// ─────────────────────────────────────────────
// STEP 5 — EMPLOYMENT
// ─────────────────────────────────────────────
export type EmploymentType = 'salaried' | 'self_employed' | 'business_owner';
export type BusinessType = 'proprietorship' | 'partnership' | 'llp' | 'pvt_ltd' | 'public_ltd' | 'other';

export interface SalariedData {
  employmentType: 'salaried';
  companyName: string;
  designation: string;
  monthlyNetSalary: number;
  yearsOfExperience: number;
}

export interface SelfEmployedData {
  employmentType: 'self_employed';
  businessName: string;
  businessType: BusinessType;
  annualTurnover: number;
  yearsInBusiness: number;
  monthlyIncome: number;
  officeAddress: string;
}

export interface BusinessOwnerData {
  employmentType: 'business_owner';
  businessName: string;
  businessType: BusinessType;
  annualTurnover: number;
  yearsInBusiness: number;
  gstNumber: string;
  officeAddress: string;
  monthlyIncome: number;
}

export type Step5Data = SalariedData | SelfEmployedData | BusinessOwnerData;

// ─────────────────────────────────────────────
// STEP 6 — CO-APPLICANT
// ─────────────────────────────────────────────
export type Relationship = 'spouse' | 'parent' | 'sibling' | 'business_partner';

export interface Step6Data {
  name: string;
  relationship: Relationship;
  pan: string;
  panVerified: boolean;
  monthlyIncome: number;
  consent: boolean;
  signature: string; // base64
}

// ─────────────────────────────────────────────
// STEP 7 — DOCUMENTS
// ─────────────────────────────────────────────
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  compressedSize?: number;
  type: string;
  dataUrl?: string;
  uploadProgress?: number;
  uploaded?: boolean;
}

export interface Step7Data {
  panCard?: UploadedFile;
  aadhaarFront?: UploadedFile;
  aadhaarBack?: UploadedFile;
  salarySlips?: UploadedFile[];
  bankStatements?: UploadedFile[];
  itr?: UploadedFile[];
  propertyDocuments?: UploadedFile;
  businessRegistration?: UploadedFile;
  gstReturns?: UploadedFile[];
  photograph?: UploadedFile;
  signature: string; // base64
}

// ─────────────────────────────────────────────
// STEP 8 — CONSENTS
// ─────────────────────────────────────────────
export interface Step8Data {
  consentAccuracy: boolean;
  consentCibil: boolean;
  consentTerms: boolean;
  consentCommunication: boolean;
}

// ─────────────────────────────────────────────
// COMPLETE FORM STATE
// ─────────────────────────────────────────────
export interface LoanApplicationState {
  step1: Partial<Step1Data>;
  step2: Partial<Step2Data>;
  step3: Partial<Step3Data>;
  step4: Partial<Step4Data>;
  step5: Partial<Step5Data>;
  step6?: Partial<Step6Data>;
  step7: Partial<Step7Data>;
  step8: Partial<Step8Data>;
}

// ─────────────────────────────────────────────
// WIZARD STATE
// ─────────────────────────────────────────────
export interface WizardStep {
  id: number;
  key: string;
  title: string;
  shortTitle: string;
  isConditional: boolean;
  isVisible: boolean;
}

export interface WizardState {
  currentStep: number;
  steps: WizardStep[];
  formData: LoanApplicationState;
  isSubmitting: boolean;
  isSubmitted: boolean;
  referenceId?: string;
}

// ─────────────────────────────────────────────
// PIN CODE
// ─────────────────────────────────────────────
export interface PinCodeRecord {
  pinCode: string;
  city: string;
  state: string;
  postOffice: string;
}

// ─────────────────────────────────────────────
// DRAFT / PERSISTENCE
// ─────────────────────────────────────────────
export interface DraftMetadata {
  version: string;
  timestamp: string;
  step: number;
  loanType: LoanType | string;
}

export interface PersistedDraft {
  metadata: DraftMetadata;
  data: LoanApplicationState;
}

// ─────────────────────────────────────────────
// EMI CALCULATION
// ─────────────────────────────────────────────
export interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  processingFee: number;
  interestRate: number;
}

// ─────────────────────────────────────────────
// VERIFICATION
// ─────────────────────────────────────────────
export interface VerificationResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}
