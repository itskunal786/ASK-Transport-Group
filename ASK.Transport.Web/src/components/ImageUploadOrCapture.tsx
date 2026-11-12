import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  placeholderText = 'Select an option below to provide photo evidence (Max 2 MB):'
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
        <div className="img-selected-preview-card">
          <div className="img-preview-top-bar">
            <span className="img-preview-status-badge">
              <CheckCircle2 size={15} /> Photo Evidence Selected
            </span>
            {onRemove && (
              <button
                type="button"
                className="img-btn-inline-remove"
                onClick={onRemove}
                title="Remove photo"
              >
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>

          <div className="img-preview-display">
            <img src={value} alt="Uploaded Proof Evidence" className="img-preview-image" />
          </div>

          <div className="img-change-options-bar">
            <button
              type="button"
              className="img-change-btn upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={15} /> 📁 Upload Different Image (Max {maxSizeMb} MB)
            </button>
            <button
              type="button"
              className="img-change-btn camera"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={15} /> 📷 Retake Photo with Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="img-selection-suite">
          {placeholderText && <p className="img-selection-hint">{placeholderText}</p>}
          <div className="img-two-options-grid">
            {/* OPTION 1: UPLOAD AN IMAGE */}
            <div
              className="img-option-card upload-card"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="img-card-icon-wrap upload">
                <UploadCloud size={28} />
              </div>
              <div className="img-card-text">
                <strong className="img-card-title">1. Upload an Image</strong>
                <span className="img-card-desc">Choose from device gallery / local file</span>
                <span className="img-card-limit">Max size {maxSizeMb} MB • JPG, PNG, WebP</span>
              </div>
              <button type="button" className="img-card-action-btn upload">
                Browse Files
              </button>
            </div>

            {/* OPTION 2: TAKE A PHOTO */}
            <div
              className="img-option-card camera-card"
              onClick={() => cameraInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  cameraInputRef.current?.click();
                }
              }}
            >
              <div className="img-card-icon-wrap camera">
                <Camera size={28} />
              </div>
              <div className="img-card-text">
                <strong className="img-card-title">2. Take a Photo</strong>
                <span className="img-card-desc">Capture directly with device camera</span>
                <span className="img-card-limit">Live snapshot • Auto-scaled proof</span>
              </div>
              <button type="button" className="img-card-action-btn camera">
                Open Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="img-upload-error">
          <AlertCircle size={15} /> {error}
        </div>
      )}
    </div>
  );
}
