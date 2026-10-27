import './ConsignmentLRModal.css';

export interface GstInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  bookingNumber: string;
  lrNumber: string;
  shipperName: string;
  shipperGstin?: string;
  shipperAddress?: string;
  consigneeName: string;
  consigneeAddress?: string;
  originCity: string;
  destinationCity: string;
  weightKg: number;
  packagesCount?: number;
  basicFreight: number;
  fuelSurcharge: number;
  handlingCharge: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount?: number;
  totalInvoiceAmount: number;
  paymentStatus: string;
}

interface Props {
  data: GstInvoiceData;
  onClose: () => void;
}

export default function GstTaxInvoiceModal({ data, onClose }: Props) {
  function handlePrint() {
    window.print();
  }

  const taxableValue = data.basicFreight + data.fuelSurcharge + data.handlingCharge;
  const isInterState = data.originCity.toLowerCase() !== data.destinationCity.toLowerCase();
  const taxTotal = (data.cgstAmount + data.sgstAmount) || data.igstAmount || Math.round(taxableValue * 0.18);

  return (
    <div className="lr-modal-overlay" onClick={onClose}>
      <div className="lr-modal-wrapper" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* TOOLBAR */}
        <div className="lr-toolbar" style={{ background: '#1e293b' }}>
          <span>🧾 Official GST Tax Invoice (Rule 46 Compliant)</span>
          <div className="lr-toolbar-actions">
            <button
              type="button"
              className="lr-btn-print"
              style={{ background: '#0284c7' }}
              onClick={handlePrint}
            >
              🖨️ Print / Download PDF
            </button>
            <button type="button" className="lr-btn-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET */}
        <div className="lr-sheet-container">
          <div className="lr-sheet" style={{ borderColor: '#0284c7' }}>
            {/* INVOICE HEADER */}
            <div className="lr-header" style={{ borderBottom: '2px solid #0284c7', paddingBottom: '14px' }}>
              <div className="lr-company-brand">
                <h1 style={{ color: '#0369a1' }}>ASK TRANSPORT GROUP</h1>
                <p className="lr-subtag">Goods Transport Agency (GTA) • Pan-India Logistics</p>
                <p className="lr-address">
                  Central Reg. Office: Plot 48, Sanjay Gandhi Transport Nagar, GT Karnal Road, Delhi 110042
                </p>
                <p className="lr-contact">
                  GSTIN: <strong>07AABCA9988F1Z9</strong> | PAN: AABCA9988F | State Code: 07 (Delhi)
                </p>
              </div>

              <div className="lr-meta-box">
                <div className="lr-title-badge" style={{ background: '#0284c7' }}>
                  TAX INVOICE
                </div>
                <div className="lr-meta-row">
                  <span>Invoice No:</span>
                  <strong style={{ color: '#0369a1' }}>{data.invoiceNumber}</strong>
                </div>
                <div className="lr-meta-row">
                  <span>Invoice Date:</span>
                  <strong>{data.invoiceDate}</strong>
                </div>
                <div className="lr-meta-row">
                  <span>Booking Ref:</span>
                  <strong>{data.bookingNumber}</strong>
                </div>
                <div className="lr-meta-row">
                  <span>Bilty / LR No:</span>
                  <strong style={{ color: '#059669' }}>{data.lrNumber}</strong>
                </div>
              </div>
            </div>

            {/* BILL TO & SHIP TO SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '14px 0' }}>
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Bill To (Billed Shipper / Customer)
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{data.shipperName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {data.shipperAddress || `${data.originCity} Logistics Park, Phase II`}
                </div>
                <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, marginTop: '4px' }}>
                  GSTIN: {data.shipperGstin || '07AABCR5544K1Z2 (Registered B2B)'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Ship To (Consignee Delivery Terminal)
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{data.consigneeName}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {data.consigneeAddress || `${data.destinationCity} Destination Godown`}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                  Corridor Route: <strong>{data.originCity} ➔ {data.destinationCity}</strong>
                </div>
              </div>
            </div>

            {/* LINE ITEMS TABLE */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>#</th>
                    <th style={{ padding: '8px 12px' }}>Service Description</th>
                    <th style={{ padding: '8px 12px' }}>SAC Code</th>
                    <th style={{ padding: '8px 12px' }}>Weight (KG)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Taxable Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px' }}>1</td>
                    <td style={{ padding: '10px 12px' }}>
                      <strong>Commercial Freight Transportation Service</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Route: {data.originCity} to {data.destinationCity} | LR No: {data.lrNumber}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}><strong>996511</strong></td>
                    <td style={{ padding: '10px 12px' }}>{data.weightKg} KG</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                      ₹{data.basicFreight.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px' }}>2</td>
                    <td style={{ padding: '8px 12px' }}>Diesel Fuel Price Surcharge Adjustment</td>
                    <td style={{ padding: '8px 12px' }}>996511</td>
                    <td style={{ padding: '8px 12px' }}>-</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      ₹{data.fuelSurcharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px' }}>3</td>
                    <td style={{ padding: '8px 12px' }}>Dock Handling, Loading &amp; Hamali Charges</td>
                    <td style={{ padding: '8px 12px' }}>996511</td>
                    <td style={{ padding: '8px 12px' }}>-</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      ₹{data.handlingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TOTALS & TAX BREAKDOWN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>Statutory GTA Declarations:</strong>
                <p style={{ margin: '4px 0' }}>
                  1. Services provided by Goods Transport Agency (GTA) in respect of transportation of goods by road.
                </p>
                <p style={{ margin: '4px 0' }}>
                  2. Reverse Charge Mechanism (RCM): <strong>Applicable under Section 9(3) CGST Act</strong>.
                </p>
                <div style={{ marginTop: '8px', padding: '6px 10px', background: '#ecfdf5', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#065f46', fontWeight: 700 }}>
                  Payment Status: {data.paymentStatus.toUpperCase()} ✓
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Total Taxable Value:</span>
                  <strong>₹{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>

                {isInterState ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                    <span>Integrated GST (IGST 18%):</span>
                    <strong>₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                      <span>Central GST (CGST 9%):</span>
                      <strong>₹{(taxTotal / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                      <span>State GST (SGST 9%):</span>
                      <strong>₹{(taxTotal / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0284c7', paddingTop: '8px', marginTop: '6px', fontSize: '14px', color: '#0369a1' }}>
                  <strong>Total Invoice Amount:</strong>
                  <strong>₹{data.totalInvoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            {/* BANK & SIGNATURE FOOTER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                <strong>Banking Details for RTGS / NEFT:</strong><br />
                Bank: HDFC Bank Ltd • Branch: Sanjay Gandhi Transport Nagar, Delhi<br />
                A/C No: 50200089218491 • IFSC: HDFC0001824 • UPI: asktransport@hdfcbank
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ border: '2px solid #0284c7', padding: '6px 14px', borderRadius: '6px', background: '#eff6ff', marginBottom: '4px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#0369a1' }}>ASK TRANSPORT GROUP</div>
                  <div style={{ fontSize: '9px', color: '#0284c7' }}>AUTHORIZED SIGNATORY</div>
                </div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>Computer Generated Digitally Sealed Invoice</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
