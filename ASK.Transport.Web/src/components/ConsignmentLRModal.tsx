import './ConsignmentLRModal.css';

export interface ConsignmentLRData {
  bookingNumber: string;
  consignmentNumber?: string;
  date?: string;
  bookingDate?: string;
  senderName: string;
  senderPhone?: string;
  fromAddress?: string;
  fromCity: string;
  fromState?: string;
  fromPinCode?: string;
  receiverName: string;
  receiverPhone?: string;
  toAddress?: string;
  toCity: string;
  toState?: string;
  toPinCode?: string;
  goodsType?: string;
  goodsDescription?: string;
  weightKg?: number;
  weight?: number;
  quantity?: number;
  vehicleNumber?: string;
  driverName?: string;
  freightAmount?: number;
  gstAmount?: number;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  serviceType?: string;
}

interface Props {
  data: ConsignmentLRData;
  onClose: () => void;
}

export default function ConsignmentLRModal({ data, onClose }: Props) {
  const baseFreight = data.freightAmount || 1200;
  const fuelSurcharge = Math.round(baseFreight * 0.10);
  const gst = Math.round((baseFreight + fuelSurcharge) * 0.18);
  const totalAmount = baseFreight + fuelSurcharge + gst;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="lr-modal-overlay" onClick={onClose}>
      <div className="lr-modal-wrapper" onClick={e => e.stopPropagation()}>
        {/* TOP TOOLBAR */}
        <div className="lr-toolbar">
          <span>📄 Official Consignment Note &amp; Lorry Receipt (LR)</span>
          <div className="lr-toolbar-actions">
            <button type="button" className="lr-btn-print" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
            <button type="button" className="lr-btn-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* PRINTABLE SHEET */}
        <div className="lr-sheet-container">
          <div className="lr-sheet">
            {/* HEADER */}
            <div className="lr-header">
              <div className="lr-brand">
                <h1>ASK TRANSPORT GROUP</h1>
                <p>Enterprise Logistics &amp; Nationwide Surface Freight Carriers</p>
                <small style={{ color: '#64748b' }}>
                  Regd Office: Sector 18, Gurugram, Haryana | GSTIN: 07AAACA1234F1Z9 | CIN: U60200DL2026PTC109823
                </small>
              </div>

              <div className="lr-bilty-badge">
                <h2>LORRY RECEIPT (BILTY)</h2>
                <strong style={{ color: '#dc2626' }}>LR NO: LR-{data.bookingNumber}</strong>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Date: {data.date || data.bookingDate || new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* ROUTE & VEHICLE BAR */}
            <div className="lr-meta-grid">
              <div className="lr-meta-item">
                <small>Origin Hub</small>
                <strong>{data.fromCity} {data.fromPinCode ? `(${data.fromPinCode})` : ''}</strong>
              </div>
              <div className="lr-meta-item">
                <small>Destination Hub</small>
                <strong>{data.toCity} {data.toPinCode ? `(${data.toPinCode})` : ''}</strong>
              </div>
              <div className="lr-meta-item">
                <small>Vehicle Assigned</small>
                <strong>{data.vehicleNumber || 'HR-55-AB-7890 (32ft MXL)'}</strong>
              </div>
              <div className="lr-meta-item">
                <small>Assigned Driver</small>
                <strong>{data.driverName || 'Ramesh Singh (Commercial HMV)'}</strong>
              </div>
            </div>

            {/* PARTIES */}
            <div className="lr-parties-grid">
              <div className="lr-party-box">
                <h4>CONSIGNOR (SENDER)</h4>
                <strong>{data.senderName}</strong>
                <div style={{ color: '#475569', marginTop: '3px' }}>
                  {data.fromAddress || 'Industrial Focal Point, Hub Area'}
                </div>
                <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                  {data.fromCity}, {data.fromState || 'India'} - {data.fromPinCode}
                </div>
                <div style={{ color: '#64748b', marginTop: '2px' }}>
                  Phone: {data.senderPhone || '9876543210'}
                </div>
              </div>

              <div className="lr-party-box">
                <h4>CONSIGNEE (RECEIVER)</h4>
                <strong>{data.receiverName}</strong>
                <div style={{ color: '#475569', marginTop: '3px' }}>
                  {data.toAddress || 'Central Cargo Terminal, Port Zone'}
                </div>
                <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                  {data.toCity}, {data.toState || 'India'} - {data.toPinCode}
                </div>
                <div style={{ color: '#64748b', marginTop: '2px' }}>
                  Phone: {data.receiverPhone || '9820011223'}
                </div>
              </div>
            </div>

            {/* CARGO & CHARGES TABLE */}
            <table className="lr-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Pkgs / Qty</th>
                  <th>Description of Consignment (Said to Contain)</th>
                  <th style={{ width: '100px' }}>Weight (KG)</th>
                  <th style={{ width: '110px' }}>Service Mode</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Charges (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{data.quantity || 1} Units</td>
                  <td>
                    <strong>{data.goodsDescription || 'Commercial Freight / Palletized Cargo'}</strong>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>Carrier not responsible for internal packing breakage</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{data.weightKg || 50} KG</td>
                  <td>{data.serviceType || 'Surface Express Cargo'}</td>
                  <td style={{ textAlign: 'right' }}>₹{baseFreight.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: 'none' }} />
                  <td style={{ fontWeight: 600, background: '#f8fafc' }}>Fuel Surcharge (10%)</td>
                  <td style={{ textAlign: 'right', background: '#f8fafc' }}>₹{fuelSurcharge.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td colSpan={3} style={{ border: 'none' }} />
                  <td style={{ fontWeight: 600, background: '#f8fafc' }}>GST @ 18% (SAC 9965)</td>
                  <td style={{ textAlign: 'right', background: '#f8fafc' }}>₹{gst.toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ background: '#f1f5f9' }}>
                  <td colSpan={3} style={{ border: 'none' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      PAYMENT: {data.paymentStatus?.toUpperCase() || 'PAID'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '12px' }}>NET AMOUNT:</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '13px', color: '#09284a' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* FOOTER & SIGNATURE */}
            <div className="lr-footer">
              <div className="lr-terms">
                <strong>Standard Transport Conditions:</strong>
                <ol style={{ margin: '4px 0 0 14px', padding: 0 }}>
                  <li>Goods booked at Owner’s Risk unless covered by transit insurance.</li>
                  <li>Delivery will be made against surrender of original LR or verified digital OTP.</li>
                  <li>Jurisdiction: Subject strictly to Courts at Gurugram / New Delhi.</li>
                </ol>
              </div>

              <div className="lr-sign">
                <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                  ✓ Digitally Verified by ASK Platform
                </div>
                <div className="lr-sign-line">
                  For ASK Transport Group<br />
                  <small style={{ fontWeight: 400 }}>Authorized Signatory</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
