import './ConsignmentLRModal.css';

export interface PodData {
  bookingNumber: string;
  shipmentNumber?: string;
  deliveredDate: string;
  receiverName: string;
  receiverPhone?: string;
  deliveredLocation: string;
  otpVerified: boolean;
  notes?: string;
  driverName?: string;
}

interface Props {
  data: PodData;
  onClose: () => void;
}

export default function ElectronicPodModal({ data, onClose }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="lr-modal-overlay" onClick={onClose}>
      <div className="lr-modal-wrapper" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <div className="lr-toolbar" style={{ background: '#065f46' }}>
          <span>✅ Electronic Proof of Delivery (e-POD) Certificate</span>
          <div className="lr-toolbar-actions">
            <button type="button" className="lr-btn-print" style={{ background: '#059669' }} onClick={handlePrint}>
              🖨️ Print Certificate
            </button>
            <button type="button" className="lr-btn-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        <div className="lr-sheet-container">
          <div className="lr-sheet" style={{ borderColor: '#059669' }}>
            {/* BADGE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #059669', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#065f46', fontWeight: 900 }}>
                  ASK TRANSPORT GROUP
                </h1>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>
                  Electronic Delivery Verification Certificate
                </p>
              </div>

              <div style={{
                background: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '8px',
                padding: '6px 14px',
                textAlign: 'center',
                color: '#065f46',
                fontWeight: 800
              }}>
                ✓ CONSIGNMENT DELIVERED
              </div>
            </div>

            {/* DETAILS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Consignment Number</small>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{data.bookingNumber}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Timestamp</small>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{data.deliveredDate}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Received In Good Condition By</small>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{data.receiverName}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Phone: {data.receiverPhone || 'Verified'}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Delivery Destination</small>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{data.deliveredLocation}</div>
              </div>
            </div>

            {/* VERIFICATION METHOD */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ color: '#166534', fontSize: '13px' }}>Authentication Protocol: Secure Delivery OTP</strong>
                <p style={{ margin: '2px 0 0', color: '#15803d', fontSize: '11px' }}>
                  Handover authenticated via single-use numeric code sent to consignee's mobile terminal.
                </p>
              </div>
              <span style={{ background: '#16a34a', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                VERIFIED ✓
              </span>
            </div>

            {data.notes && (
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                <strong>Delivery Remarks:</strong> {data.notes}
              </div>
            )}

            {/* DIGITAL SIGNATURE STAMP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Delivering Fleet Operator:</div>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{data.driverName || 'Commercial Fleet Driver'}</strong>
              </div>

              <div style={{ textAlign: 'center', border: '2px dashed #059669', padding: '8px 16px', borderRadius: '8px', background: '#ecfdf5' }}>
                <div style={{ fontSize: '16px' }}>🖋️</div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#065f46' }}>ELECTRONIC SIGNATURE</div>
                <div style={{ fontSize: '9px', color: '#047857' }}>Digitally Sealed &amp; Stamped</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
