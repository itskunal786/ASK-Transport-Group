import React, { useRef, useState } from 'react';
import './ImageUploadOrCapture.css';

interface ImageUploadOrCaptureProps {
  value?: string | null;
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  label?: string;
  maxSizeMb?: number;
  placeholderText?: string;
}

export default function ImageUploadOrCapture({
  value,
  onChange,
  onRemove,
  label,
  maxSizeMb = 2,
  placeholderText = 'Upload an image (Max 2 MB) or take a photo'
}: ImageUploadOrCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file?: File) => {
    if (!file) return;
    setError(null);

    // Validate size (Max 2 MB by default)
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File size is ${actualMb} MB. Please upload an image under ${maxSizeMb} MB.`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  return (
    <div className="img-upload-capture-container">
      {label && <label className="img-upload-label">{label}</label>}

      {/* Hidden native inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="img-preview-box">
          <img src={value} alt="Uploaded Proof" className="img-preview-image" />
          <div className="img-preview-overlay">
            <div className="img-preview-actions">
              <button
                type="button"
                className="img-btn-action change"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload New (Max {maxSizeMb} MB)
              </button>
              <button
                type="button"
                className="img-btn-action camera"
                onClick={() => cameraInputRef.current?.click()}
              >
                Take Photo
              </button>
              {onRemove && (
                <button
                  type="button"
                  className="img-btn-action remove"
                  onClick={onRemove}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="img-dropzone">
          <p className="img-dropzone-text">{placeholderText}</p>
          <div className="img-button-group">
            <button
              type="button"
              className="img-upload-btn upload"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image (Max {maxSizeMb} MB)
            </button>
            <button
              type="button"
              className="img-upload-btn camera"
              onClick={() => cameraInputRef.current?.click()}
            >
              Take a Photo
            </button>
          </div>
        </div>
      )}

      {error && <div className="img-upload-error">{error}</div>}
    </div>
  );
}
