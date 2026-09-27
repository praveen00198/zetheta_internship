// ─────────────────────────────────────────────
// AES-256-GCM ENCRYPTION using Web Crypto API
// ─────────────────────────────────────────────

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits

/**
 * Derive a CryptoKey from a passphrase using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Convert Uint8Array to base64 string.
 */
function arrayToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array.
 */
function base64ToArray(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Get or create a stable passphrase for this browser session.
 * We use a combination of fixed string + tab-specific UUID.
 */
function getPassphrase(): string {
  const STORAGE_KEY = 'ls_enc_key';
  let stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const arr = new Uint8Array(32);
      crypto.getRandomValues(arr);
      stored = arrayToBase64(arr.buffer);
    }
    localStorage.setItem(STORAGE_KEY, stored);
  }
  return `LendSwift_v1_${stored}`;
}

/**
 * Encrypt a JSON-serializable value using AES-256-GCM.
 * Returns a base64-encoded string containing salt + iv + ciphertext.
 */
export async function encryptData(data: unknown): Promise<string> {
  const passphrase = getPassphrase();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintext,
  );

  // Combine: salt (16) + iv (12) + ciphertext
  const combined = new Uint8Array(16 + IV_LENGTH + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, 16);
  combined.set(new Uint8Array(ciphertext), 16 + IV_LENGTH);

  return arrayToBase64(combined.buffer);
}

/**
 * Decrypt data previously encrypted with encryptData().
 * Returns the original value, or null on failure.
 */
export async function decryptData<T = unknown>(encrypted: string): Promise<T | null> {
  try {
    const passphrase = getPassphrase();
    const combined = base64ToArray(encrypted);

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 16 + IV_LENGTH);
    const ciphertext = combined.slice(16 + IV_LENGTH);

    const key = await deriveKey(passphrase, salt);

    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext,
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(plaintext)) as T;
  } catch {
    return null;
  }
}
