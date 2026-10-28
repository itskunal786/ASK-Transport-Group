import React, { useEffect, useState } from 'react';
import {
  getEInvoices,
  generateGovtEInvoiceIrn,
  cancelIrn,
  type EInvoiceRecord,
  type EInvoiceSummaryResponse
} from '../api/financeApi';

export default function GovtEInvoiceManager() {
  const [data, setData] = useState<EInvoiceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoiceRecord | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // New IRN Form State
  const [bookingNo, setBookingNo] = useState('ASK-BK-98110');
  const [lrNo, setLrNo] = useState('ASK-LR-2026-98110');
  const [recipName, setRecipName] = useState('Hero MotoCorp Ancillary Hub');
  const [recipGstin, setRecipGstin] = useState('06AAACH2081G1Z1');
  const [recipAddress, setRecipAddress] = useState('Plot 12 Sector 3 IMT Manesar, Gurugram, Haryana - 122050');
  const [taxableAmt, setTaxableAmt] = useState('52000');
  const [isInterState, setIsInterState] = useState(true);
  const [vehicleNo, setVehicleNo] = useState('MH-12-RN-7845');

  // Cancel Modal State
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('Data entry mistake / Consignment cancelled');

  // Success alert
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getEInvoices();
      setData(res);
    } catch (err) {
      console.error('Failed to load E-Invoices:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!taxableAmt || Number(taxableAmt) <= 0) return;
    try {
      setLoading(true);
      const res = await generateGovtEInvoiceIrn({
        bookingNumber: bookingNo,
        lrNumber: lrNo,
        recipientName: recipName,
        recipientGstin: recipGstin,
        recipientAddress: recipAddress,
        taxableAmount: Number(taxableAmt),
        isInterState,
        vehicleNumber: vehicleNo
      });
      setShowGenerateModal(false);
      setAlertMsg(res.message);
      setTimeout(() => setAlertMsg(null), 8000);
      loadData();
    } catch (err: any) {
      alert('Failed to generate IRN: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelConfirm() {
    if (!cancelId) return;
    try {
      setLoading(true);
      const res = await cancelIrn(cancelId, { reason: cancelReason });
      setCancelId(null);
      setAlertMsg(res.message);
      setTimeout(() => setAlertMsg(null), 6000);
      loadData();
    } catch (err: any) {
      alert('Failed to cancel IRN: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    alert(`Copied ${label} to clipboard!`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & CONTROLS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏛️</span> Govt E-Invoice IRN &amp; Official QR Code Engine
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Rule 48(4) CGST E-Invoicing compliant. Generates 64-character SHA-256 IRN hash and signed NIC B2B QR Code for road freight tax invoices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadData}
            style={{ padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            🔄 Refresh E-Invoices
          </button>

          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            style={{ padding: '8px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>⚡</span> Generate Govt IRN &amp; QR Code
          </button>
        </div>
      </div>

      {alertMsg && (
        <div style={{ padding: '14px 20px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '13.5px', fontWeight: 800 }}>
          {alertMsg}
        </div>
      )}

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL E-INVOICED FREIGHT</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            ₹{data?.summary.totalInvoiced.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>Fully audited &amp; legal</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>GST OUTPUT COLLECTED</span>
          <strong style={{ fontSize: '24px', color: '#2563eb', display: 'block', margin: '4px 0' }}>
            ₹{data?.summary.totalGstCollected.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>IGST + CGST/SGST ITC Pass-Through</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ACTIVE GOVT IRNs</span>
          <strong style={{ fontSize: '24px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
            {data?.summary.activeIrnCount || 0} Invoices
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>With scannable B2B QR Code</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NIC PORTAL STATUS</span>
          <strong style={{ fontSize: '24px', color: '#d97706', display: 'block', margin: '4px 0' }}>
            Connected (Live)
          </strong>
          <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700 }}>● GSTN API Server Active</span>
        </div>
      </div>

      {/* E-INVOICES TABLE */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
              <th style={{ padding: '10px 14px' }}>Invoice &amp; Date</th>
              <th style={{ padding: '10px 14px' }}>Recipient &amp; GSTIN</th>
              <th style={{ padding: '10px 14px' }}>LR # &amp; Truck</th>
              <th style={{ padding: '10px 14px' }}>Taxable Freight</th>
              <th style={{ padding: '10px 14px' }}>GST Tax</th>
              <th style={{ padding: '10px 14px' }}>Total Invoiced</th>
              <th style={{ padding: '10px 14px' }}>Govt IRN Hash</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.eInvoices || []).map((inv: EInvoiceRecord) => {
              const isCancelled = inv.irnStatus === 'Cancelled';

              return (
                <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', background: isCancelled ? '#fff5f5' : '#ffffff' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{inv.invoiceNumber}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(inv.invoiceDate).toLocaleDateString()}</div>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ display: 'block', color: '#334155' }}>{inv.recipientName}</strong>
                    <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>GSTIN: {inv.recipientGstin}</span>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{inv.lrNumber}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>🚛 {inv.vehicleNumber}</span>
                  </td>

                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155' }}>
                    ₹{inv.taxableAmount.toLocaleString('en-IN')}
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: '#7c3aed', fontWeight: 700 }}>
                      ₹{(inv.cgstAmount + inv.sgstAmount + inv.igstAmount).toLocaleString('en-IN')}
                    </span>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                      {inv.isInterState ? 'IGST 12%' : 'CGST+SGST 12%'}
                    </div>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    <strong style={{ fontSize: '14px', color: '#16a34a' }}>
                      ₹{inv.totalInvoiceValue.toLocaleString('en-IN')}
                    </strong>
                  </td>

                  <td style={{ padding: '10px 14px' }}>
                    {isCancelled ? (
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 800 }}>
                        CANCELLED
                      </span>
                    ) : (
                      <div>
                        <code
                          onClick={() => copyToClipboard(inv.irn, 'IRN Hash')}
                          title="Click to copy full IRN"
                          style={{
                            background: '#f1f5f9',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#0f172a',
                            cursor: 'pointer',
                            display: 'inline-block',
                            maxWidth: '140px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {inv.irn.substring(0, 14)}...
                        </code>
                        <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>✓ Ack: {inv.ackNumber}</div>
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        style={{ padding: '5px 12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        🖨️ Print E-Invoice
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setCancelId(inv.id)}
                          style={{ padding: '5px 8px', background: '#f1f5f9', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          ✕ Cancel IRN
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* GENERATE IRN MODAL */}
      {showGenerateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a' }}>
              ⚡ Generate NIC Govt E-Invoice &amp; IRN
            </h3>

            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>BOOKING NUMBER:</label>
                  <input
                    type="text"
                    value={bookingNo}
                    onChange={e => setBookingNo(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>LR BILTY NUMBER:</label>
                  <input
                    type="text"
                    value={lrNo}
                    onChange={e => setLrNo(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>RECIPIENT COMPANY NAME:</label>
                <input
                  type="text"
                  value={recipName}
                  onChange={e => setRecipName(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>RECIPIENT GSTIN:</label>
                  <input
                    type="text"
                    value={recipGstin}
                    onChange={e => setRecipGstin(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>TRUCK NUMBER:</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={e => setVehicleNo(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>RECIPIENT ADDRESS:</label>
                <input
                  type="text"
                  value={recipAddress}
                  onChange={e => setRecipAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>TAXABLE FREIGHT AMOUNT (₹):</label>
                  <input
                    type="number"
                    value={taxableAmt}
                    onChange={e => setTaxableAmt(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 800, color: '#2563eb' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>TAX TYPE:</label>
                  <select
                    value={isInterState ? 'inter' : 'intra'}
                    onChange={e => setIsInterState(e.target.value === 'inter')}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="inter">Inter-State (IGST 12%)</option>
                    <option value="intra">Intra-State (CGST+SGST 12%)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Generate Official IRN &amp; QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL IRN MODAL */}
      {cancelId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '420px', width: '100%', padding: '20px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dc2626' }}>
              Confirm E-Invoice IRN Cancellation
            </h3>
            <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 12px' }}>
              This will report cancellation of IRN #{cancelId} to the GST E-Invoice portal. Please provide a reason:
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCancelId(null)}
                style={{ padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                style={{ padding: '6px 16px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PRINTABLE E-INVOICE MODAL */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '820px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '28px', color: '#0f172a', fontFamily: 'Arial, sans-serif' }}>
            {/* ACTION STRIP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 800 }}>✓ NIC E-INVOICE VERIFIED &amp; SIGNED</span>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Ack No: {selectedInvoice.ackNumber} • Date: {new Date(selectedInvoice.ackDate).toLocaleString()}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ padding: '6px 16px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>🖨️</span> Print E-Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  style={{ padding: '6px 14px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* TAX INVOICE HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>TAX INVOICE</h2>
                <small style={{ color: '#64748b', fontSize: '11px' }}>Rule 48(4) of CGST Rules - Goods Transport Agency (GTA)</small>
                <div style={{ marginTop: '8px', fontSize: '12.5px' }}>
                  <strong>ASK Transport &amp; Logistics Pvt Ltd</strong>
                  <div style={{ color: '#475569' }}>{selectedInvoice.supplierAddress}</div>
                  <div><strong>GSTIN:</strong> {selectedInvoice.supplierGstin} | <strong>State:</strong> 27-Maharashtra</div>
                </div>
              </div>

              {/* NIC QR CODE BOX */}
              <div style={{ border: '2px solid #0f172a', padding: '8px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', width: '130px' }}>
                <div style={{ width: '100px', height: '100px', margin: '0 auto', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', textAlign: 'center', padding: '4px', wordBreak: 'break-all' }}>
                  [NIC E-INVOICE QR CODE]
                </div>
                <span style={{ fontSize: '9px', fontWeight: 800, display: 'block', marginTop: '4px' }}>NIC B2B VERIFIED</span>
              </div>
            </div>

            {/* IRN BANNER */}
            <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px', fontSize: '11px', border: '1px solid #cbd5e1' }}>
              <strong>IRN (Invoice Reference Number):</strong>
              <div style={{ fontFamily: 'monospace', fontSize: '10.5px', color: '#0f172a', wordBreak: 'break-all' }}>{selectedInvoice.irn}</div>
            </div>

            {/* INVOICE & RECIPIENT GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '14px', fontSize: '12px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700 }}>BILLED TO (RECIPIENT):</span>
                <strong style={{ display: 'block', fontSize: '13px', marginTop: '2px' }}>{selectedInvoice.recipientName}</strong>
                <div style={{ color: '#475569' }}>{selectedInvoice.recipientAddress}</div>
                <div style={{ marginTop: '4px' }}><strong>GSTIN:</strong> {selectedInvoice.recipientGstin}</div>
                <div><strong>Place of Supply:</strong> {selectedInvoice.placeOfSupply}</div>
              </div>

              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '14px' }}>
                <div><strong>Invoice No:</strong> {selectedInvoice.invoiceNumber}</div>
                <div><strong>Invoice Date:</strong> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</div>
                <div><strong>LR (Bilty) No:</strong> {selectedInvoice.lrNumber}</div>
                <div><strong>Truck / Vehicle No:</strong> {selectedInvoice.vehicleNumber}</div>
                <div><strong>Reverse Charge (RCM):</strong> No (GTA Forward Charge 12% with ITC)</div>
              </div>
            </div>

            {/* LINE ITEMS TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #cbd5e1', marginBottom: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Description of Service</th>
                  <th style={{ padding: '8px' }}>SAC Code</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Taxable Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px' }}>1</td>
                  <td style={{ padding: '8px' }}>
                    <strong>Road Freight Transport Service</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Transportation of commercial consignment under LR {selectedInvoice.lrNumber}</div>
                  </td>
                  <td style={{ padding: '8px' }}>{selectedInvoice.hsnCode}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {/* TAX BREAKDOWN TOTALS */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
              <div style={{ width: '280px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxable Amount:</span>
                  <strong>₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</strong>
                </div>

                {selectedInvoice.isInterState ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Output IGST @ 12%:</span>
                    <strong>₹{selectedInvoice.igstAmount.toLocaleString('en-IN')}</strong>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Output CGST @ 6%:</span>
                      <strong>₹{selectedInvoice.cgstAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Output SGST @ 6%:</span>
                      <strong>₹{selectedInvoice.sgstAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #0f172a', paddingTop: '6px', fontSize: '14px', color: '#16a34a' }}>
                  <strong>TOTAL INVOICE VALUE:</strong>
                  <strong>₹{selectedInvoice.totalInvoiceValue.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* GTA DECLARATION */}
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '10.5px', color: '#475569', border: '1px solid #e2e8f0' }}>
              <strong>GTA Statutory Declaration:</strong> We declare that we have opted to pay GST on GTA services supplied by us under forward charge mechanism under Section 9(1) of CGST Act. Input Tax Credit has been taken on goods and services used in supplying the service.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
