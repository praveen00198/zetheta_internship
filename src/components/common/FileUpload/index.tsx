import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { compressImage, fileToDataUrl } from '../../../utils/imageCompression';
import { formatFileSize } from '../../../utils/formatters';
import type { UploadedFile } from '../../../types/form';

interface FileUploadProps {
  label: string;
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  required?: boolean;
  value?: UploadedFile | UploadedFile[];
  onChange?: (files: UploadedFile | UploadedFile[] | undefined) => void;
  error?: string;
  helpText?: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function FileUpload({
  label,
  accept = ['application/pdf', 'image/jpeg', 'image/png'],
  maxSizeMB = 5,
  multiple = false,
  required = false,
  value,
  onChange,
  error,
  helpText,
}: FileUploadProps) {
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [compressionInfo, setCompressionInfo] = useState<Record<string, { orig: number; compressed: number; pct: number }>>({});
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (msg: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = msg;
    }
  };

  const processFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const isImage = file.type.match(/^image\/(jpeg|jpg|png)/i);

      if (file.size > maxBytes && !isImage) {
        announce(`File ${file.name} exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`);
        return null;
      }

      const id = generateId();

      // Compress images
      let finalFile = file;
      if (isImage) {
        try {
          const result = await compressImage(file);
          finalFile = result.file;
          if (result.reductionPercent > 0) {
            setCompressionInfo((prev) => ({
              ...prev,
              [id]: {
                orig: result.originalSize,
                compressed: result.compressedSize,
                pct: result.reductionPercent,
              },
            }));
          }
          // Check again after compression
          if (finalFile.size > maxBytes) {
            announce(`File ${file.name} is too large even after compression. Please use a PDF or smaller image.`);
            return null;
          }
        } catch {
          // Use original if compression fails
        }
      }

      // Simulate upload progress
      setUploading((prev) => ({ ...prev, [id]: 0 }));
      for (let p = 10; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 80));
        setUploading((prev) => ({ ...prev, [id]: p }));
      }
      setUploading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      let dataUrl: string | undefined;
      if (isImage) {
        try {
          dataUrl = await fileToDataUrl(finalFile);
        } catch {
          // non-critical
        }
      }

      announce(`${file.name} uploaded successfully.`);

      return {
        id,
        name: finalFile.name,
        size: file.size,
        compressedSize: finalFile.size !== file.size ? finalFile.size : undefined,
        type: finalFile.type,
        dataUrl,
        uploaded: true,
        uploadProgress: 100,
      };
    },
    [maxSizeMB],
  );

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      rejected.forEach(({ file, errors }) => {
        const msg = errors[0]?.code === 'file-too-large'
          ? `${file.name} exceeds ${maxSizeMB}MB limit.`
          : `${file.name} has an invalid file type.`;
        announce(msg);
      });

      for (const file of accepted) {
        const uploaded = await processFile(file);
        if (!uploaded) continue;

        if (multiple) {
          const current = (Array.isArray(value) ? value : []) as UploadedFile[];
          onChange?.([...current, uploaded]);
        } else {
          onChange?.(uploaded);
        }
      }
    },
    [multiple, value, onChange, processFile, maxSizeMB],
  );

  const removeFile = useCallback(
    (id: string) => {
      if (multiple) {
        const current = (Array.isArray(value) ? value : []) as UploadedFile[];
        onChange?.(current.filter((f) => f.id !== id));
      } else {
        onChange?.(undefined);
      }
      setCompressionInfo((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      announce('File removed.');
    },
    [multiple, value, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc: Record<string, string[]>, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    maxSize: maxSizeMB * 1024 * 1024 * (accept.some((a) => a.includes('image')) ? 10 : 1), // allow larger for images (will be compressed)
    multiple,
  });

  const files: UploadedFile[] = multiple
    ? (Array.isArray(value) ? value : [])
    : (value ? [value as UploadedFile] : []);

  const isPdf = (file: UploadedFile) => file.type === 'application/pdf';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-text-primary tracking-wide">
          {label}
        </span>
        {required && <span className="text-error text-sm" aria-hidden="true">*</span>}
      </div>

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${error ? 'dropzone-error' : ''}`}
        aria-label={`Upload ${label}. Drag and drop or click to browse.`}
      >
        <input {...getInputProps()} aria-label={`File input for ${label}`} />
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mb-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
        {isDragActive ? (
          <p className="text-sm font-medium text-text-primary">Drop files here</p>
        ) : (
          <>
            <p className="text-sm font-medium text-text-primary">
              Drag & drop or <span className="underline">click to browse</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              {accept.join(', ')} — max {maxSizeMB}MB{multiple ? ' each' : ''}
            </p>
          </>
        )}
      </div>

      {helpText && <p className="text-xs text-text-muted">{helpText}</p>}
      {error && (
        <p role="alert" aria-live="polite" className="text-xs text-error flex items-center gap-1">
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.75 2.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9z" />
          </svg>
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1" aria-label="Uploaded files">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-start gap-3 bg-surface border border-border rounded-md p-3"
            >
              {/* Preview */}
              <div className="shrink-0 w-10 h-10 rounded overflow-hidden border border-border bg-white flex items-center justify-center">
                {file.dataUrl && !isPdf(file) ? (
                  <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-neutral-400">
                    <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                  {compressionInfo[file.id] && (
                    <span className="badge-success text-xs">
                      −{compressionInfo[file.id].pct}% compressed
                    </span>
                  )}
                  {file.uploaded && (
                    <span className="text-xs text-success flex items-center gap-0.5">
                      <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <path fillRule="evenodd" d="M8.585 1.586a.5.5 0 0 1 0 .707L4 6.879l-2.293-2.293a.5.5 0 0 0-.707.707l2.646 2.646a.5.5 0 0 0 .707 0l5-5a.5.5 0 0 0-.707-.707L8.585 1.586z" />
                      </svg>
                      Uploaded
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {uploading[file.id] !== undefined && (
                  <div className="mt-1.5 h-1 bg-neutral-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={uploading[file.id]} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className="h-full bg-black rounded-full transition-all duration-100"
                      style={{ width: `${uploading[file.id]}%` }}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeFile(file.id)}
                aria-label={`Remove ${file.name}`}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 text-text-muted hover:text-error transition-colors"
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M11.854 2.146a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.708-.708l9-9a.5.5 0 0 1 .708 0z" />
                  <path d="M2.146 2.146a.5.5 0 0 0 0 .708l9 9a.5.5 0 0 0 .708-.708l-9-9a.5.5 0 0 0-.708 0z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
