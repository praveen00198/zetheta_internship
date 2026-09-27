import { useRef, useCallback, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  label?: string;
  value?: string;
  onChange?: (dataUrl: string) => void;
  error?: string;
  required?: boolean;
}

export default function SignaturePad({
  label = 'Signature',
  value,
  onChange,
  error,
  required,
}: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!value);

  useEffect(() => {
    if (value && sigRef.current && sigRef.current.isEmpty()) {
      try {
        sigRef.current.fromDataURL(value);
        setHasSignature(true);
      } catch {
        // ignore
      }
    }
  }, [value]);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.toDataURL('image/png');
      onChange?.(dataUrl);
      setHasSignature(true);
    }
  }, [onChange]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    onChange?.('');
    setHasSignature(false);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary tracking-wide">
          {label}
          {required && <span className="text-error ml-0.5" aria-hidden="true"> *</span>}
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="btn-ghost btn-sm text-xs"
          aria-label="Clear signature"
        >
          Clear
        </button>
      </div>

      <p className="text-xs text-text-muted">
        Sign using mouse or touchscreen in the area below.
      </p>

      <div
        className="signature-wrapper relative"
        style={{ height: '200px' }}
      >
        {/* Privacy overlay when canvas loses focus */}
        {isHidden && hasSignature && (
          <div
            className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 cursor-pointer rounded-lg"
            onClick={() => setIsHidden(false)}
            role="button"
            tabIndex={0}
            aria-label="Click to resume signing"
            onKeyDown={(e) => e.key === 'Enter' && setIsHidden(false)}
          >
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-2">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path fillRule="evenodd" d="M7 1a6 6 0 1 0 0 12A6 6 0 0 0 7 1zM5.25 4.5A.75.75 0 0 1 6 3.75h2A.75.75 0 0 1 8.75 4.5v.5a.75.75 0 0 1-.75.75H6A.75.75 0 0 1 5.25 5v-.5zm.75 2h2a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1 0-1.5z" />
                </svg>
              </div>
              <p className="text-xs text-text-secondary font-medium">Signature hidden for privacy</p>
              <p className="text-xs text-text-muted">Click to view and continue signing</p>
            </div>
          </div>
        )}

        <SignatureCanvas
          ref={sigRef}
          penColor="#000000"
          canvasProps={{
            style: { width: '100%', height: '200px' },
            'aria-label': 'Signature pad — draw your signature here',
          }}
          onEnd={handleEnd}
          onBegin={() => setIsHidden(false)}
        />
      </div>

      {/* Restore saved signature */}
      {value && !hasSignature && (
        <div className="flex items-center gap-2">
          <img src={value} alt="Saved signature" className="h-10 border border-border rounded" />
          <p className="text-xs text-text-muted">Saved signature</p>
        </div>
      )}

      <div
        className="flex items-center justify-between"
        onMouseLeave={() => hasSignature && setIsHidden(true)}
        onBlur={() => hasSignature && setIsHidden(true)}
      />

      {error && (
        <p role="alert" aria-live="polite" className="text-xs text-error flex items-center gap-1">
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zm-.75 2.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zM6 9a.75.75 0 1 1 0-1.5A.75.75 0 0 1 6 9z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
