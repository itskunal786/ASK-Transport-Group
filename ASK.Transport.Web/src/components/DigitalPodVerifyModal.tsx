import React, { useState } from 'react';
import type { PodData } from './ElectronicPodModal';

interface Props {
  bookingNumber: string;
  customer: string;
  route: string;
  initialPod?: PodData | null;
  onClose: () => void;
  onApprove: (pod: PodData) => void;
  onReject: (reason: string) => void;
}

export default function DigitalPodVerifyModal({
  bookingNumber,
  customer,
  route,
  initialPod,
  onClose,
  onApprove,
  onReject
}: Props) {
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
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=700&q=80'
  );
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  function handleApprove() {
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
      driverName: driverName.trim()
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
    <div className="lr-modal-overlay" onClick={onClose}>
      <div className="lr-modal-wrapper" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div className="lr-toolbar" style={{ background: '#065f46' }}>
          <span>📋 Digital Proof of Delivery (POD) Verification &amp; Approval</span>
          <div className="lr-toolbar-actions">
            <button type="button" className="lr-btn-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '72vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SUMMARY STRIP */}
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Consignment Reference</div>
              <strong style={{ fontSize: '16px', color: '#065f46' }}>{bookingNumber}</strong>
              <div style={{ fontSize: '12px', color: '#065f46' }}>Client: {customer} | Route: {route}</div>
            </div>
            <div style={{ background: '#10b981', color: '#ffffff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
              Physical POD Scanned
            </div>
          </div>

          {/* TWO COLUMNS: SCANNED BILTY PHOTO & VERIFICATION DATA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* PHOTO CARD */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>📸 Receiver Signed Physical Bilty</span>
                <span style={{ color: '#059669', fontSize: '11px' }}>Stamp Verified ✓</span>
              </div>
              <div style={{
                height: '220px',
                background: '#e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Scanned Signed POD"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                    No POD Photo Attached
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(6, 95, 70, 0.85)',
                  color: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700
                }}>
                  SEAL &amp; SIGNED
                </div>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <label style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#0f172a'
                }}>
                  📷 Upload New POD Photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setUploadedImage(url);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* VERIFICATION FORM */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                ✍️ Consignee Handover Particulars
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Received By (Person Name) *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Receiver Contact Number</label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={e => setReceiverPhone(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Delivery Destination Address</label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={e => setDeliveryLocation(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              {/* OTP VALIDATION STATUS */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534' }}>Delivery OTP: {otpCode}</div>
                  <div style={{ fontSize: '10px', color: '#15803d' }}>Consignee mobile terminal authenticated</div>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpVerified(!otpVerified)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: otpVerified ? '#10b981' : '#cbd5e1',
                    background: otpVerified ? '#10b981' : '#ffffff',
                    color: otpVerified ? '#ffffff' : '#64748b'
                  }}
                >
                  {otpVerified ? '✓ OTP Match' : 'Manual Sign'}
                </button>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Driver Remarks / Seal Notes</label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* REJECT DRAWER IF TRIGGERED */}
          {rejectMode && (
            <form onSubmit={handleRejectSubmit} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                ⚠️ Specify POD Rejection Reason:
              </div>
              <input
                type="text"
                placeholder="e.g. Signature blurred, receiver stamp missing, carton leakage reported"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #f87171', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  style={{ padding: '4px 10px', fontSize: '11px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '4px 12px', fontSize: '11px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Rejection &amp; Flag Consignment
                </button>
              </div>
            </form>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {!rejectMode && (
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                style={{ padding: '8px 14px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                ❌ Reject POD (Flag Issue)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="lr-btn-close"
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApprove}
              style={{
                padding: '8px 20px',
                background: '#059669',
                color: '#ffffff',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
              }}
            >
              ✓ Approve POD &amp; Seal Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
