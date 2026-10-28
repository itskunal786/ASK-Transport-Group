import React, { useState } from 'react';
import {
  getBulkSampleTemplate,
  previewBulkConsignments,
  processBulkBookings,
  type BulkConsignmentItem,
  type BulkImportPreviewResponse,
  type BulkProcessResponse
} from '../api/enterpriseApi';

export default function BulkExcelBookingEngine() {
  const [csvText, setCsvText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<BulkImportPreviewResponse | null>(null);
  const [batchTitle, setBatchTitle] = useState('Tata AutoComp Systems - Monthly Hub Dispatch Batch #84');
  const [shipperName, setShipperName] = useState('Tata AutoComp Systems Ltd');
  const [processResult, setProcessResult] = useState<BulkProcessResponse | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Load sample demo consignment on start
  async function handleLoadDemoData() {
    try {
      setLoading(true);
      const res = await previewBulkConsignments({});
      setPreviewData(res);
      setProcessResult(null);
    } catch (err: any) {
      alert('Error loading preview: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadTemplate() {
    try {
      const data = await getBulkSampleTemplate();
      const blob = new Blob([data.sampleCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'ASK_Bulk_Consignment_Template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Failed to download template: ' + err?.message);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      try {
        setLoading(true);
        const res = await previewBulkConsignments({ csvText: text });
        setPreviewData(res);
        setProcessResult(null);
      } catch (err: any) {
        alert('Failed to parse uploaded CSV: ' + err?.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }

  async function handleParsePastedText() {
    if (!csvText.trim()) return;
    try {
      setLoading(true);
      const res = await previewBulkConsignments({ csvText });
      setPreviewData(res);
      setShowPasteBox(false);
    } catch (err: any) {
      alert('Failed to parse pasted text: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateBilties() {
    if (!previewData || previewData.previewItems.length === 0) return;
    try {
      setLoading(true);
      const res = await processBulkBookings({
        batchTitle,
        shipperName,
        items: previewData.previewItems
      });
      setProcessResult(res);
      setShowResultModal(true);
    } catch (err: any) {
      alert('Failed to generate bulk bilties: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePrintLabels() {
    window.print();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER ACTION CONTROLS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span> Bulk Excel / CSV Booking Engine (B2B Enterprise)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Upload single CSV/Excel containing 10 to 500 factory consignments. Auto-validate PIN codes, compute freight &amp; generate bulk LR Bilties with barcodes in 1 click.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            style={{ padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📥</span> Download CSV Template
          </button>

          <label style={{ padding: '8px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📁</span> Upload .CSV / .XLSX
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            style={{ padding: '8px 14px', background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            {showPasteBox ? 'Hide Paste Box' : '📋 Paste CSV Text'}
          </button>

          <button
            type="button"
            onClick={handleLoadDemoData}
            style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>⚡</span> Load Demo Consignments (8 Shipments)
          </button>
        </div>
      </div>

      {/* PASTE CSV DRAWER */}
      {showPasteBox && (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>Paste Raw CSV Lines (Comma-Separated):</label>
          <textarea
            rows={5}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="ConsignorName,ConsigneeName,ConsigneePhone,DeliveryAddress,Pincode,City,GoodsDescription,PackageCount,WeightKg,DeclaredValue,PaymentMode..."
            style={{ width: '100%', padding: '10px', fontSize: '12px', fontFamily: 'monospace', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleParsePastedText}
              disabled={loading}
              style={{ padding: '8px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              Parse &amp; Preview
            </button>
          </div>
        </div>
      )}

      {/* KPI SUMMARY CARDS */}
      {previewData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #2563eb' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL SHIPMENTS</span>
            <strong style={{ fontSize: '24px', color: '#0f172a', display: 'block', margin: '4px 0' }}>
              {previewData.totalRecords} Consignments
            </strong>
            <span style={{ fontSize: '11.5px', color: previewData.errorCount > 0 ? '#ef4444' : '#16a34a', fontWeight: 700 }}>
              ✓ {previewData.validCount} Valid {previewData.errorCount > 0 && `• ⚠ ${previewData.errorCount} Errors`}
            </span>
          </div>

          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL GROSS WEIGHT</span>
            <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
              {(previewData.totalWeightKg / 1000).toFixed(2)} Metric Tons
            </strong>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              {previewData.totalWeightKg.toLocaleString('en-IN')} KG • {previewData.totalPackages} Boxes
            </span>
          </div>

          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ESTIMATED TOTAL FREIGHT</span>
            <strong style={{ fontSize: '24px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
              ₹{previewData.totalEstimatedFreight.toLocaleString('en-IN')}
            </strong>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>Includes 5% Fuel Surcharge</span>
          </div>

          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>DECLARED CARGO VALUE</span>
            <strong style={{ fontSize: '24px', color: '#d97706', display: 'block', margin: '4px 0' }}>
              ₹{previewData.totalDeclaredValue.toLocaleString('en-IN')}
            </strong>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>Factory Commercial Invoices</span>
          </div>
        </div>
      )}

      {/* BATCH CONFIG & PROCESS TRIGGER */}
      {previewData && (
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>BATCH TITLE:</label>
              <input
                type="text"
                value={batchTitle}
                onChange={e => setBatchTitle(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', width: '320px', fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>SHIPPER CLIENT:</label>
              <input
                type="text"
                value={shipperName}
                onChange={e => setShipperName(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', width: '220px' }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loading || previewData.validCount === 0}
            onClick={handleGenerateBilties}
            style={{
              padding: '12px 24px',
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}
          >
            <span>⚡</span>
            {loading ? 'Processing...' : `Generate ${previewData.validCount} Bulk Bilties & Barcode Manifest`}
          </button>
        </div>
      )}

      {/* PREVIEW DATA GRID */}
      {previewData && (
        <div style={{ background: 'var(--bg-surface, #ffffff)', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '13px', color: '#0f172a' }}>Pre-Dispatch Verification Grid ({previewData.previewItems.length} Rows)</strong>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>Every consignment undergoes auto PIN-code validation before LR generation</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '850px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '10px 14px' }}>#</th>
                  <th style={{ padding: '10px 14px' }}>Consignee &amp; Mobile</th>
                  <th style={{ padding: '10px 14px' }}>Destination &amp; PIN</th>
                  <th style={{ padding: '10px 14px' }}>Goods Description</th>
                  <th style={{ padding: '10px 14px' }}>Boxes</th>
                  <th style={{ padding: '10px 14px' }}>Weight (KG)</th>
                  <th style={{ padding: '10px 14px' }}>Declared ₹</th>
                  <th style={{ padding: '10px 14px' }}>Mode</th>
                  <th style={{ padding: '10px 14px' }}>Est. Freight ₹</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.previewItems.map((item: BulkConsignmentItem) => (
                  <tr key={item.rowIndex} style={{ borderBottom: '1px solid #f1f5f9', background: item.isValid ? '#ffffff' : '#fff5f5' }}>
                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontWeight: 700 }}>{item.rowIndex}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{item.consigneeName}</strong>
                      <span style={{ fontSize: '11px', color: '#2563eb' }}>{item.consigneePhone}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ color: '#334155' }}>{item.city}</div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>PIN: {item.pincode}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{item.goodsDescription}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{item.packageCount}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a' }}>{item.weightKg} kg</td>
                    <td style={{ padding: '10px 14px' }}>₹{item.declaredValue.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: item.paymentMode === 'Prepaid' ? '#dcfce7' : item.paymentMode === 'COD' ? '#fef3c7' : '#eff6ff', color: item.paymentMode === 'Prepaid' ? '#166534' : item.paymentMode === 'COD' ? '#92400e' : '#1e40af' }}>
                        {item.paymentMode}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#7c3aed' }}>
                      ₹{item.estimatedFreight.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {item.isValid ? (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 700 }}>
                          ✓ Valid
                        </span>
                      ) : (
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 700 }} title={item.validationErrors.join(', ')}>
                          ⚠ Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL: GENERATED BILTY & BARCODE MANIFEST */}
      {showResultModal && processResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '880px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🎉</span>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                    Bulk Dispatch Manifest Generated! (Batch #{processResult.batchId})
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Shipper: <strong>{processResult.shipperName}</strong> • {processResult.totalProcessed} Bilties with Scannable Barcodes Ready
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* BATCH TOTALS STRIP */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Total Consignments</span>
                <strong style={{ fontSize: '18px', color: '#14532d', display: 'block' }}>{processResult.totalProcessed} Bilties</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Total Gross Weight</span>
                <strong style={{ fontSize: '18px', color: '#14532d', display: 'block' }}>{processResult.totalWeightKg.toLocaleString()} KG</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Total Invoiced Freight</span>
                <strong style={{ fontSize: '18px', color: '#15803d', display: 'block' }}>₹{processResult.totalFreightAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrintLabels}
                  style={{ padding: '8px 16px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>🖨️</span> Print Labels &amp; Manifest
                </button>
              </div>
            </div>

            {/* BILTY & BARCODE CARDS LIST */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {processResult.generatedBilties.map(b => (
                <div key={b.lrNumber} style={{ border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#2563eb' }}>{b.lrNumber}</strong>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', fontWeight: 700 }}>
                      {b.packages} Boxes
                    </span>
                  </div>

                  {/* VISUAL BARCODE */}
                  <div style={{ background: '#0f172a', color: '#ffffff', padding: '8px', borderRadius: '6px', textAlign: 'center', letterSpacing: '6px', fontFamily: 'monospace', fontSize: '14px', fontWeight: 900 }}>
                    {b.barcode}
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#334155' }}>
                    <strong style={{ display: 'block', color: '#0f172a' }}>{b.consigneeName}</strong>
                    <div style={{ color: '#64748b' }}>{b.consigneeCity}</div>
                    <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>{b.weightKg} KG</span>
                      <strong style={{ color: '#7c3aed' }}>₹{b.freightAmount.toLocaleString('en-IN')} ({b.paymentMode})</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                style={{ padding: '8px 20px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
