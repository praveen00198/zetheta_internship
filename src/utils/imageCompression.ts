// ─────────────────────────────────────────────
// IMAGE COMPRESSION via Canvas API
// ─────────────────────────────────────────────

const MAX_WIDTH = 1200;
const INITIAL_QUALITY = 0.7;
const MIN_QUALITY = 0.3;
const QUALITY_STEP = 0.1;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

/**
 * Load an image from a File using an object URL.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image.'));
    };
    img.src = url;
  });
}

/**
 * Compress a single image file using the Canvas API.
 * Algorithm:
 * 1. Load image
 * 2. Resize to max 1200px width (preserve aspect ratio)
 * 3. Draw on canvas
 * 4. Export as JPEG at quality 0.7
 * 5. If still > 2MB, reduce quality by 0.1 until 0.3
 *
 * Only compresses JPG/PNG. Returns original file for PDFs.
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  // Only compress images, not PDFs
  if (!file.type.match(/^image\/(jpeg|jpg|png)/i)) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercent: 0,
    };
  }

  const img = await loadImage(file);

  // Compute dimensions
  let { width, height } = img;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available.');

  ctx.drawImage(img, 0, 0, width, height);

  // Try compression at decreasing quality levels
  let quality = INITIAL_QUALITY;
  let blob: Blob | null = null;

  while (quality >= MIN_QUALITY) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });

    if (blob && blob.size <= MAX_FILE_SIZE) break;
    quality = Math.round((quality - QUALITY_STEP) * 10) / 10;
  }

  if (!blob) {
    // Fallback: return original
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      reductionPercent: 0,
    };
  }

  const compressedFile = new File(
    [blob],
    file.name.replace(/\.(png|jpg|jpeg)$/i, '.jpg'),
    { type: 'image/jpeg' },
  );

  const compressedSize = compressedFile.size;
  const reductionPercent = originalSize > 0
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    reductionPercent,
  };
}

/**
 * Convert a File to base64 data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}
