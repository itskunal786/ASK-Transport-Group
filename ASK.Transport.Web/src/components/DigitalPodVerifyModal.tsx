import React, { useState, useRef, useEffect } from 'react';
import type { PodData } from './ElectronicPodModal';
import './DigitalPodVerifyModal.css';

export interface PodPreset {
  id: string;
  name: string;
  category: string;
  badge: string;
  url: string;
  notes: string;
}

export const SAMPLE_POD_PRESETS: PodPreset[] = [
  {
    id: 'preset-standard-bilty',
    name: 'Standard Stamped Bilty (LR)',
    category: 'FTL Freight',
    badge: 'Stamp Verified ✓',
    url: '',
    notes: 'Consignment verified in intact condition. No transit damages or seal tampering.'
  },
  {
    id: 'preset-delivery-challan',
    name: 'Express Delivery Challan',
    category: 'PTL / Parcel',
    badge: 'Signed & Acknowledged ✓',
    url: '',
    notes: 'Cartons count matched with invoice items. Delivered to designated consignee reception desk.'
  },
  {
    id: 'preset-jnpt-gatepass',
    name: 'JNPT Port Container Gate Pass',
    category: 'Port EXIM',
    badge: 'Port Authority Sealed ✓',
    url: '',
    notes: 'Customs seal verified intact at JNPT Nhava Sheva Terminal Gate 2. Container clearance approved.'
  },
  {
    id: 'preset-cold-chain',
    name: 'Cold-Chain Delivery Receipt',
    category: 'Reefer / Pharma',
    badge: 'Temperature Compliant ✓',
    url: '',
    notes: 'Temperature log verified: maintained between +2°C to +8°C throughout transit. Zero thaw reported.'
  }
];

interface Props {
  bookingNumber: string;
  customer: string;
  route: string;
  initialPod?: PodData | null;
  initialPhotoUrl?: string;
  onClose: () => void;
  onApprove: (pod: PodData) => void;
  onReject: (reason: string) => void;
}

export default function DigitalPodVerifyModal({
  bookingNumber,
  customer,
  route,
  initialPod,
  initialPhotoUrl,
  onClose,
  onApprove,
  onReject
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [receiverName, setReceiverName] = useState(initialPod?.receiverName || customer);
  const [receiverPhone, setReceiverPhone] = useState(initialPod?.receiverPhone || '9876543210');
  const [deliveryLocation, setDeliveryLocation] = useState(
    initialPod?.deliveredLocation || (route.split('→')[1]?.trim() || 'Destination Warehouse')
  );
  const [otpCode] = useState('6492');
  const [otpVerified, setOtpVerified] = useState(initialPod ? initialPod.otpVerified : true);
  const [driverName] = useState(initialPod?.driverName || 'Gurpreet Singh (DL-102016009988)');
  const [deliveryNotes, setDeliveryNotes] = useState(
    initialPod?.notes || 'Consignment verified in intact condition. No transit damages or seal tampering.'
  );

  // Photo & Upload State
  const [uploadedImage, setUploadedImage] = useState<string | null>(() => {
    if (initialPod?.podPhotoUrl) return initialPod.podPhotoUrl;
    if (initialPhotoUrl) return initialPhotoUrl;
    try {
      const stored = localStorage.getItem(`ask_pod_photo_${bookingNumber}`);
      if (stored) return stored;
    } catch {
      // fallback
    }
    // Route-specific default preset so different bookings don't all look identical
    return null;
  });

  const [photoMeta, setPhotoMeta] = useState<{
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
    source?: string;
  }>(() => {
    if (initialPod?.photoMeta) return initialPod.photoMeta;
    return {
      fileName: 'Signed_Physical_Bilty.jpg',
      fileSize: '342 KB',
      uploadedAt: 'Verified on Delivery',
      source: 'Default Bilty Record'
    };
  });

  const [activePresetId, setActivePresetId] = useState<string>('preset-standard-bilty');
  const [isDragging, setIsDragging] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Rejection Drawer
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Persist image changes to localStorage for this specific booking
  useEffect(() => {
    if (uploadedImage) {
      try {
        localStorage.setItem(`ask_pod_photo_${bookingNumber}`, uploadedImage);
      } catch (err) {
        console.warn('Could not cache POD photo:', err);
      }
    }
  }, [uploadedImage, bookingNumber]);

  // Process File from input or dropzone
  function processFile(file: File, sourceName: string) {
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif|heic|bmp)$/i)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert(`File size is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Please upload an image under 2 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);
      setActivePresetId('');
      setPhotoMeta({
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: sourceName
      });
      setUploadToast(`✓ New POD photo uploaded successfully (${file.name})!`);
      setTimeout(() => setUploadToast(null), 3500);
    };
    reader.onerror = () => {
      alert('Failed to read photo file. Please try again.');
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, sourceName: string) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, sourceName);
    }
    // Reset file input so user can re-select same file if needed
    e.target.value = '';
  }

  // Select a preset template
  function handleSelectPreset(preset: PodPreset) {
    setUploadedImage(preset.url);
    setActivePresetId(preset.id);
    setPhotoMeta({
      fileName: `${preset.name.replace(/\s+/g, '_')}.jpg`,
      fileSize: '480 KB',
      uploadedAt: 'Template Loaded',
      source: preset.name
    });
    setDeliveryNotes(preset.notes);
    setUploadToast(`✓ Loaded preset: ${preset.name}`);
    setTimeout(() => setUploadToast(null), 3000);
  }

  // Remove photo
  function handleRemovePhoto() {
    setUploadedImage(null);
    setActivePresetId('');
    setPhotoMeta({});
    try {
      localStorage.removeItem(`ask_pod_photo_${bookingNumber}`);
    } catch {
      // ignore
    }
    setUploadToast('Photo removed. Please upload or choose a sample POD.');
    setTimeout(() => setUploadToast(null), 3000);
  }

  // Drag and Drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, 'Drag & Drop');
    }
  }

  // Final Approval
  function handleApprove() {
    if (!uploadedImage) {
      const confirmProceed = window.confirm(
        'Warning: No physical POD bilty photo is attached. Do you wish to approve without a photo?'
      );
      if (!confirmProceed) return;
    }

    const pod: PodData = {
      bookingNumber,
      shipmentNumber: `SHP-${bookingNumber}`,
      deliveredDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      deliveredLocation: deliveryLocation.trim(),
      otpVerified,
      notes: deliveryNotes.trim(),
      driverName: driverName.trim(),
      podPhotoUrl: uploadedImage || undefined,
      photoMeta: photoMeta.fileName ? photoMeta : undefined
    };

    onApprove(pod);
  }

  function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please state the discrepancy reason for rejecting this POD.');
      return;
    }
    onReject(rejectReason.trim());
  }

  return (
    <div className="pod-verify-overlay" onClick={onClose}>
      <div className="pod-verify-wrapper" onClick={e => e.stopPropagation()}>
        {/* 1. HEADER */}
        <div className="pod-verify-header">
          <div className="pod-verify-header-title">
            <span>📋 Digital Proof of Delivery (POD) Verification &amp; Approval</span>
          </div>
          <button type="button" className="pod-verify-btn-close" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* 2. BODY */}
        <div className="pod-verify-body">
          {/* TOAST FEEDBACK NOTIFICATION */}
          {uploadToast && (
            <div style={{
              background: '#065f46',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(6, 95, 70, 0.35)',
              animation: 'podFadeIn 0.2s ease-out'
            }}>
              <span>📸</span>
              <span>{uploadToast}</span>
            </div>
          )}

          {/* SUMMARY STRIP */}
          <div className="pod-summary-strip">
            <div>
              <div className="pod-summary-ref-label">Consignment Reference</div>
              <div className="pod-summary-ref-number">{bookingNumber}</div>
              <div className="pod-summary-meta">Client: <strong>{customer}</strong> | Route: <strong>{route}</strong></div>
            </div>
            <div className="pod-status-badge">
              <span>✓</span> Physical POD Scanned &amp; Ready
            </div>
          </div>

          {/* TWO COLUMNS: SCANNED BILTY PHOTO & VERIFICATION DATA */}
          <div className="pod-content-grid">
            {/* LEFT: PHOTO CARD WITH UPLOAD, CAMERA, PRESETS & ZOOM */}
            <div className="pod-photo-card">
              <div className="pod-photo-header">
                <span>📸 Receiver Signed Physical Bilty</span>
                <span className="pod-stamp-tag">Stamp Verified ✓</span>
              </div>

              {/* DROPZONE IMAGE PREVIEW */}
              <div
                className={`pod-photo-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => uploadedImage && setShowLightbox(true)}
                title={uploadedImage ? 'Click to inspect in fullscreen' : 'Drop photo here or upload'}
              >
                {uploadedImage ? (
                  <>
                    <img
                      src={uploadedImage}
                      alt="Scanned Signed POD Bilty"
                      className="pod-photo-image"
                    />
                    <div className="pod-seal-overlay">
                      <span>✓</span> SEAL &amp; SIGNED
                    </div>
                    <button
                      type="button"
                      className="pod-zoom-overlay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLightbox(true);
                      }}
                      title="Inspect full resolution"
                    >
                      <span>🔍</span> Fullscreen
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#f8fafc' }}>
                      No POD Photo Attached
                    </strong>
                    <span style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      Drag &amp; drop an image here or click buttons below
                    </span>
                  </div>
                )}
              </div>

              {/* UPLOAD & CAMERA BUTTONS */}
              <div className="pod-upload-actions-grid">
                {/* 1. File Upload */}
                <button
                  type="button"
                  className="pod-btn-upload-primary"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload from computer or smartphone storage"
                >
                  <span>📁</span> Upload New POD Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(e, 'Device Upload')}
                />

                {/* 2. Direct Camera Capture */}
                <button
                  type="button"
                  className="pod-btn-camera"
                  onClick={() => cameraInputRef.current?.click()}
                  title="Capture snapshot using mobile phone or webcam"
                >
                  <span>📷</span> Take Photo (Camera)
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={e => handleFileChange(e, 'Camera Snapshot')}
                />
              </div>

              {/* SAMPLE POD PRESETS (NO MORE STUCK WITH SAME IMAGE!) */}
              <div className="pod-presets-section">
                <div className="pod-presets-title">
                  <span>⚡ Quick Sample POD Presets</span>
                  {uploadedImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '10.5px',
                        fontWeight: 700
                      }}
                      title="Clear attached photo"
                    >
                      🗑️ Remove Photo
                    </button>
                  )}
                </div>

                <div className="pod-presets-chips">
                  {SAMPLE_POD_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`pod-preset-chip ${activePresetId === preset.id ? 'active' : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                      title={`${preset.name} (${preset.category})`}
                    >
                      <span>📄</span> {preset.name.split(' ')[0]} ({preset.category.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* ATTACHMENT METADATA STRIP */}
              {photoMeta.fileName && (
                <div className="pod-meta-strip">
                  <span>
                    File: <strong>{photoMeta.fileName}</strong> {photoMeta.fileSize ? `(${photoMeta.fileSize})` : ''}
                  </span>
                  <span>{photoMeta.source || 'Verified'}</span>
                </div>
              )}
            </div>

            {/* RIGHT: HANDOVER PARTICULARS & OTP VERIFICATION */}
            <div className="pod-form-card">
              <div className="pod-form-title">
                ✍️ Consignee Handover Particulars
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Received By (Person Name) *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="pod-form-input"
                  placeholder="Full name of consignee representative"
                  required
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Receiver Contact Number</label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={e => setReceiverPhone(e.target.value)}
                  className="pod-form-input"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Delivery Destination Address</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={e => setDeliveryLocation(e.target.value)}
                  className="pod-form-input"
                  placeholder="Warehouse bay or unloading hub"
                />
              </div>

              {/* OTP VALIDATION STATUS */}
              <div className="pod-otp-box">
                <div>
                  <div className="pod-otp-title">Delivery OTP: {otpCode}</div>
                  <div className="pod-otp-sub">Consignee mobile terminal authenticated</div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpVerified(!otpVerified)}
                  className={`pod-otp-btn ${otpVerified ? 'matched' : 'unmatched'}`}
                >
                  {otpVerified ? '✓ OTP Match' : 'Manual Sign'}
                </button>
              </div>

              <div className="pod-form-group">
                <label className="pod-form-label">Driver Remarks / Seal Notes</label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  className="pod-form-textarea"
                  placeholder="Notes on packaging condition, seals, or pallet integrity..."
                />
              </div>
            </div>
          </div>

          {/* REJECT DRAWER IF TRIGGERED */}
          {rejectMode && (
            <form onSubmit={handleRejectSubmit} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>
                ⚠️ Specify POD Discrepancy / Rejection Reason:
              </div>
              <input
                type="text"
                placeholder="e.g. Signature blurred, receiver rubber stamp missing, carton leakage reported"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #f87171', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  style={{ padding: '6px 12px', fontSize: '11.5px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 14px', fontSize: '11.5px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Confirm Rejection &amp; Flag Consignment
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. FOOTER ACTIONS */}
        <div className="pod-verify-footer">
          <div>
            {!rejectMode && (
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                className="pod-btn-reject"
              >
                <span>❌</span> Reject POD (Flag Issue)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="pod-btn-dismiss"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="pod-btn-approve"
            >
              <span>✓</span> Approve POD &amp; Seal Delivery
            </button>
          </div>
        </div>
      </div>

      {/* 4. FULLSCREEN LIGHTBOX FOR SIGNATURE & STAMP INSPECTION */}
      {showLightbox && uploadedImage && (
        <div className="pod-lightbox-overlay" onClick={() => setShowLightbox(false)}>
          <div className="pod-lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="pod-lightbox-close"
              onClick={() => setShowLightbox(false)}
            >
              ✕ Close Preview
            </button>
            <img
              src={uploadedImage}
              alt="High-Res POD Bilty"
              className="pod-lightbox-image"
            />
            <div className="pod-lightbox-caption">
              <span>📄 {bookingNumber}</span>
              <span>•</span>
              <span>{customer}</span>
              <span>•</span>
              <span>{photoMeta.fileName || 'Signed Physical Bilty'}</span>
              <span>•</span>
              <span style={{ color: '#34d399' }}>Seal Verified ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
