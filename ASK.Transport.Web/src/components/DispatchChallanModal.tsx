import './ConsignmentLRModal.css';

export interface DispatchChallanData {
  challanNumber: string;
  bookingNumber: string;
  dispatchDate: string;
  originHub: string;
  destinationHub: string;
  consignorName: string;
  consigneeName: string;
  vehicleNumber: string;
  vehicleModel?: string;
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  ewayBillNumber?: string;
  goodsDescription?: string;
  packagesCount?: number;
  totalWeightKg?: number;
  dispatcherName?: string;
}

interface Props {
  data: DispatchChallanData;
  onClose: () => void;
}

export default function DispatchChallanModal({ data, onClose }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="lr-modal-overlay" onClick={onClose}>
      <div className="lr-modal-wrapper" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* TOOLBAR */}
        <div className="lr-toolbar" style={{ background: '#0f172a' }}>
          <span>🚛 Official Vehicle Dispatch Challan &amp; Gate Pass</span>
          <div className="lr-toolbar-actions">
            <button
              type="button"
              className="lr-btn-print"
              style={{ background: '#2563eb' }}
              onClick={handlePrint}
            >
              🖨️ Print Challan
            </button>
            <button type="button" className="lr-btn-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* PRINTABLE SHEET */}
        <div className="lr-sheet-container">
          <div className="lr-sheet" style={{ borderColor: '#2563eb' }}>
            {/* HEADER */}
            <div className="lr-header">
              <div className="lr-company-brand">
                <h1>ASK TRANSPORT GROUP</h1>
                <p className="lr-subtag">Pan-India Freight Logistics &amp; Express Cargo Network</p>
                <p className="lr-address">
                  Central Fleet Terminal: Sanjay Gandhi Transport Nagar, GT Karnal Road, Delhi 110042
                </p>
                <p className="lr-contact">
                  Fleet Ops: +91 98765 43210 | GSTIN: 07AABCA9988F1Z9 | CIN: U60200DL2021PTC384729
                </p>
              </div>

              <div className="lr-meta-box">
                <div className="lr-title-badge" style={{ background: '#2563eb' }}>
                  DISPATCH CHALLAN
                </div>
                <div className="lr-meta-row">
                  <span>Challan No:</span>
                  <strong style={{ color: '#2563eb' }}>{data.challanNumber}</strong>
                </div>
                <div className="lr-meta-row">
                  <span>Booking Ref:</span>
                  <strong>{data.bookingNumber}</strong>
                </div>
                <div className="lr-meta-row">
                  <span>Dispatch Date:</span>
                  <strong>{data.dispatchDate}</strong>
                </div>
                {data.ewayBillNumber && (
                  <div className="lr-meta-row">
                    <span>E-Way Bill:</span>
                    <strong style={{ color: '#059669' }}>{data.ewayBillNumber}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* ROUTE CORRIDOR BAR */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              margin: '14px 0'
            }}>
              <div>
                <small style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Origin Hub / Depot
                </small>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e3a8a' }}>
                  📍 {data.originHub}
                </div>
              </div>
              <div style={{ fontSize: '20px', color: '#2563eb', fontWeight: 800 }}>➔</div>
              <div>
                <small style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Destination Terminal / Delivery Point
                </small>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e3a8a' }}>
                  🏁 {data.destinationHub}
                </div>
              </div>
            </div>

            {/* TWO-COLUMN: VEHICLE & DRIVER PARTICULARS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                  🚛 ALLOTTED FLEET VEHICLE
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Vehicle Plate:</span>
                    <div style={{ fontWeight: 800, color: '#0b72e7', fontSize: '14px' }}>{data.vehicleNumber}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Truck Model:</span>
                    <div style={{ fontWeight: 600 }}>{data.vehicleModel || '32ft Multi-Axle (MXL)'}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>RC Status:</span>
                    <div style={{ color: '#16a34a', fontWeight: 700 }}>Verified Commercial HMV</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>GPS Telematics:</span>
                    <div style={{ color: '#16a34a', fontWeight: 700 }}>Active Online 🟢</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
                  👤 ASSIGNED COMMERCIAL DRIVER
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Driver Name:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{data.driverName}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Mobile Number:</span>
                    <div style={{ fontWeight: 600 }}>{data.driverPhone}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b' }}>Commercial Driving License (DL):</span>
                    <div style={{ fontWeight: 700, color: '#4338ca' }}>{data.driverLicense}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARGO MANIFEST DETAILS */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ background: '#f1f5f9', padding: '8px 12px', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                Consignment Manifest &amp; Cargo Handover
              </div>
              <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Consignor (Sender):</span>
                  <div style={{ fontWeight: 700 }}>{data.consignorName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Consignee (Receiver):</span>
                  <div style={{ fontWeight: 700 }}>{data.consigneeName}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Packages / Cartons:</span>
                  <div style={{ fontWeight: 700 }}>{data.packagesCount || 10} Units</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Manifest Gross Weight:</span>
                  <div style={{ fontWeight: 700 }}>{data.totalWeightKg || 450} KG</div>
                </div>
              </div>
            </div>

            {/* STATUTORY DECLARATION */}
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4, marginBottom: '20px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
              <strong>Carrier &amp; Driver Undertaking:</strong> The carrier driver acknowledges receipt of the above described consignment in good order and condition, with verified seals and intact packaging. Goods will be transported directly to the specified destination hub in compliance with Motor Vehicles Act 1988 and GST E-Way Bill provisions.
            </div>

            {/* SIGNATURE SEALS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px', borderTop: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '36px', borderBottom: '1px solid #94a3b8', width: '160px', marginBottom: '4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 700 }}>Fleet Driver Signature</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>({data.driverName})</div>
              </div>

              <div style={{ textAlign: 'center', border: '2px solid #2563eb', padding: '6px 14px', borderRadius: '6px', background: '#eff6ff' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e40af' }}>ASK TRANSPORT GROUP</div>
                <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>CENTRAL DISPATCH CONTROL</div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>GATE PASS VERIFIED &amp; APPROVED</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '36px', borderBottom: '1px solid #94a3b8', width: '160px', marginBottom: '4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 700 }}>Authorized Dispatch Officer</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{data.dispatcherName || 'Shift Operations Manager'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
