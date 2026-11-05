import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  ClipboardPaste,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Printer,
  X,
  Phone,
  Box,
  Scale,
  IndianRupee,
  Package,
  Layers,
  Truck,
  RefreshCw
} from 'lucide-react';
import {
  getBulkSampleTemplate,
  previewBulkConsignments,
  processBulkBookings,
  computeBulkPreview,
  DEFAULT_DEMO_BULK_CONSIGNMENTS,
  type BulkImportPreviewResponse,
  type BulkProcessResponse
} from '../api/enterpriseApi';
import { useLanguage } from '../context/LanguageContext';
import './BulkExcelBookingEngine.css';

export default function BulkExcelBookingEngine() {
  const { t } = useLanguage();
  const [csvText, setCsvText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justLoaded, setJustLoaded] = useState(false);

  // Initialize immediately with 8 demo consignments so it's never empty
  const [previewData, setPreviewData] = useState<BulkImportPreviewResponse | null>(() => {
    return computeBulkPreview(DEFAULT_DEMO_BULK_CONSIGNMENTS);
  });

  const [batchTitle, setBatchTitle] = useState('Tata AutoComp Systems - Monthly Hub Dispatch Batch #84');
  const [shipperName, setShipperName] = useState('Tata AutoComp Systems Ltd');
  const [processResult, setProcessResult] = useState<BulkProcessResponse | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 7000);
  };

  // Re-verify on mount or keep initial state
  useEffect(() => {
    handleLoadDemoData(false);
  }, []);

  async function handleLoadDemoData(isManual: boolean = true) {
    try {
      setLoading(true);
      const res = await previewBulkConsignments({});
      setPreviewData(res);
      setProcessResult(null);
      if (isManual) {
        setJustLoaded(true);
        setTimeout(() => setJustLoaded(false), 2500);
        showNotification(
          t('8 Factory Demo Consignments Loaded & 6-Digit PIN Codes Validated! ✓', '8 फैक्ट्री डेमो कंसाइनमेंट्स लोड हो गए एवं 6-अंकीय पिन कोड सत्यापित! ✓'),
          'success'
        );
      }
    } catch (err: any) {
      console.warn('Could not load demo preview data from server, using local fallback:', err?.message);
      setPreviewData(computeBulkPreview(DEFAULT_DEMO_BULK_CONSIGNMENTS));
      if (isManual) {
        setJustLoaded(true);
        setTimeout(() => setJustLoaded(false), 2500);
        showNotification(
          t('8 Factory Demo Consignments Loaded from local registry! ✓', '8 फैक्ट्री डेमो कंसाइनमेंट्स लोकल रजिस्ट्री से लोड हो गए! ✓'),
          'success'
        );
      }
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
      showNotification(t('Template downloaded successfully!', 'टेम्पलेट सफलतापूर्वक डाउनलोड हो गया!'), 'success');
    } catch (err: any) {
      showNotification(t('Failed to download template: ', 'टेम्पलेट डाउनलोड करने में विफल: ') + err?.message, 'error');
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
        showNotification(
          t(`Successfully parsed ${res.totalRecords} consignments from ${file.name}!`, `${file.name} से ${res.totalRecords} कंसाइनमेंट्स सफलतापूर्वक पार्स किए गए!`),
          'success'
        );
      } catch (err: any) {
        showNotification(t('Failed to parse uploaded CSV: ', 'अपलोड की गई CSV को पार्स करने में विफल: ') + err?.message, 'error');
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
      showNotification(
        t(`Parsed ${res.totalRecords} consignments from pasted text!`, `पेस्ट किए गए टेक्स्ट से ${res.totalRecords} कंसाइनमेंट्स पार्स किए गए!`),
        'success'
      );
    } catch (err: any) {
      showNotification(t('Failed to parse pasted text: ', 'पेस्ट किए गए टेक्स्ट को पार्स करने में विफल: ') + err?.message, 'error');
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
      showNotification(
        t(`Batch ${res.batchId} processed! ${res.totalProcessed} Bilties generated with barcodes.`, `बैच ${res.batchId} प्रोसेस हुआ! बारकोड के साथ ${res.totalProcessed} बिल्टी जनरेट हुईं।`),
        'success'
      );
    } catch (err: any) {
      showNotification(t('Failed to generate bulk bilties: ', 'बल्क बिल्टी जनरेट करने में विफल: ') + err?.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handlePrintLabels() {
    window.print();
  }

  return (
    <div className="bulk-engine-container">
      {/* HEADER ACTION CONTROLS */}
      <div className="bulk-controls-card">
        <div className="bulk-controls-info">
          <h2 className="bulk-controls-title">
            <FileSpreadsheet size={20} color="#2563eb" />
            <span>{t('Bulk Excel / CSV Booking Engine (B2B Enterprise)', 'बल्क एक्सेल / सीएसवी बुकिंग इंजन (बी2बी एंटरप्राइज)')}</span>
          </h2>
          <p className="bulk-controls-sub">
            {t(
              'Upload single CSV/Excel containing 10 to 500 factory consignments. Auto-validate PIN codes, compute freight & generate bulk LR Bilties with barcodes in 1 click.',
              '10 से 500 फैक्ट्री कंसाइनमेंट्स वाली सिंगल CSV/Excel अपलोड करें। ऑटो पिन-कोड सत्यापन, भाड़ा गणना और 1 क्लिक में बारकोड सहित बल्क एलआर बिल्टी जनरेट करें।'
            )}
          </p>
        </div>

        <div className="bulk-controls-actions">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="bulk-btn-secondary"
          >
            <Download size={14} />
            <span>{t('Download CSV Template', 'सीएसवी टेम्पलेट डाउनलोड')}</span>
          </button>

          <label className="bulk-file-label">
            <UploadCloud size={14} />
            <span>{t('Upload .CSV / .XLSX', '.CSV / .XLSX अपलोड करें')}</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            type="button"
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="bulk-btn-secondary"
          >
            <ClipboardPaste size={14} />
            <span>{showPasteBox ? t('Hide Paste Box', 'पेस्ट बॉक्स छिपाएं') : t('Paste CSV Text', 'सीएसवी टेक्स्ट पेस्ट')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleLoadDemoData(true)}
            disabled={loading}
            className="bulk-btn-action"
            style={
              justLoaded
                ? {
                    background: '#059669',
                    borderColor: '#10b981',
                    boxShadow: '0 0 14px rgba(16, 185, 129, 0.45)'
                  }
                : undefined
            }
          >
            {justLoaded ? (
              <>
                <CheckCircle2 size={15} />
                <span>{t('Demo Loaded! ✓ (8 Shipments)', 'डेमो लोड हो गया! ✓ (8 शिपमेंट)')}</span>
              </>
            ) : loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>{t('Loading Demo...', 'लोड हो रहा है...')}</span>
              </>
            ) : (
              <>
                <Zap size={14} />
                <span>{t('Load Demo Consignments (8 Shipments)', 'डेमो कंसाइनमेंट्स लोड करें (8 शिपमेंट)')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* TOAST / NOTICE BANNER */}
      {notice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background:
              notice.type === 'error'
                ? '#fef2f2'
                : notice.type === 'info'
                ? '#eff6ff'
                : '#ecfdf5',
            color:
              notice.type === 'error'
                ? '#991b1b'
                : notice.type === 'info'
                ? '#1e40af'
                : '#065f46',
            border:
              notice.type === 'error'
                ? '1px solid #fecaca'
                : notice.type === 'info'
                ? '1px solid #bfdbfe'
                : '1px solid #a7f3d0'
          }}
        >
          {notice.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* PASTE CSV DRAWER */}
      {showPasteBox && (
        <div className="bulk-paste-drawer">
          <label className="bulk-paste-label">
            <ClipboardPaste size={15} />
            <span>{t('Paste Raw CSV Lines (Comma-Separated):', 'रॉ सीएसवी लाइनें पेस्ट करें (कॉमा-सेपरेटेड):')}</span>
          </label>
          <textarea
            rows={5}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="ConsignorName,ConsigneeName,ConsigneePhone,DeliveryAddress,Pincode,City,GoodsDescription,PackageCount,WeightKg,DeclaredValue,PaymentMode..."
            className="bulk-paste-textarea"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setCsvText(
                  `ConsignorName,ConsigneeName,ConsigneePhone,DeliveryAddress,Pincode,City,GoodsDescription,PackageCount,WeightKg,DeclaredValue,PaymentMode\n` +
                  `Tata Motors Ltd,North Star Auto,9811044219,Plot 88 Phase 2 IMT Manesar,122050,Gurugram,Auto Gear Castings,24,650.0,78000,To-Pay\n` +
                  `Bajaj Industrial,Speedway Logistics,9823011452,Warehouse 4 GIDC Naroda,382330,Ahmedabad,Two-Wheeler Brake Discs,16,420.0,46000,Prepaid\n` +
                  `Bharat Forge Ltd,Kirloskar Engine Hub,9890044123,Plot 14 Industrial Area,560058,Bengaluru,Forged Crankshafts,8,890.0,125000,To-Pay`
                );
              }}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ⚡ {t('Insert Sample CSV Rows', 'सैंपल CSV पंक्तियाँ डालें')}
            </button>
            <button
              type="button"
              onClick={handleParsePastedText}
              disabled={loading}
              className="bulk-btn-action"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>{t('Parsing...', 'पार्सिंग...')}</span>
                </>
              ) : (
                <span>{t('Parse & Preview', 'पार्स एवं प्रीव्यू')}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* KPI SUMMARY CARDS */}
      {previewData && (
        <div className="bulk-kpis-grid">
          <div className="bulk-kpi-card blue">
            <span className="bulk-kpi-label">
              <Package size={13} color="#2563eb" />
              {t('Total Shipments', 'कुल शिपमेंट्स')}
            </span>
            <strong className="bulk-kpi-value blue">
              {previewData.totalRecords} {t('Consignments', 'कंसाइनमेंट्स')}
            </strong>
            <span className={`bulk-kpi-sub ${previewData.errorCount > 0 ? 'error' : 'valid'}`}>
              ✓ {previewData.validCount} {t('Valid', 'मान्य')} {previewData.errorCount > 0 && `• ⚠ ${previewData.errorCount} ${t('Errors', 'त्रुटियां')}`}
            </span>
          </div>

          <div className="bulk-kpi-card green">
            <span className="bulk-kpi-label">
              <Scale size={13} color="#10b981" />
              {t('Total Gross Weight', 'कुल सकल भार')}
            </span>
            <strong className="bulk-kpi-value green">
              {((previewData.totalWeightKg ?? 0) / 1000).toFixed(2)} MT
            </strong>
            <span className="bulk-kpi-sub">
              {(previewData.totalWeightKg ?? 0).toLocaleString('en-IN')} KG • {previewData.totalPackages ?? 0} {t('Boxes', 'बॉक्स')}
            </span>
          </div>

          <div className="bulk-kpi-card purple">
            <span className="bulk-kpi-label">
              <Truck size={13} color="#8b5cf6" />
              {t('Estimated Total Freight', 'अनुमानित कुल भाड़ा')}
            </span>
            <strong className="bulk-kpi-value purple">
              ₹{(previewData.totalEstimatedFreight ?? 0).toLocaleString('en-IN')}
            </strong>
            <span className="bulk-kpi-sub">
              {t('Includes 5% Fuel Surcharge', '5% फ्यूल अधिभार सहित')}
            </span>
          </div>

          <div className="bulk-kpi-card amber">
            <span className="bulk-kpi-label">
              <IndianRupee size={13} color="#f59e0b" />
              {t('Declared Cargo Value', 'घोषित माल मूल्य')}
            </span>
            <strong className="bulk-kpi-value amber">
              ₹{(previewData.totalDeclaredValue ?? 0).toLocaleString('en-IN')}
            </strong>
            <span className="bulk-kpi-sub">
              {t('Factory Commercial Invoices', 'फैक्ट्री कमर्शियल इनवॉइस')}
            </span>
          </div>
        </div>
      )}

      {/* BATCH CONFIG & PROCESS TRIGGER */}
      {previewData && (
        <div className="bulk-batch-strip">
          <div className="bulk-batch-inputs">
            <div className="bulk-batch-field">
              <label className="bulk-batch-field-label">{t('Batch Title:', 'बैच शीर्षक:')}</label>
              <input
                type="text"
                value={batchTitle}
                onChange={e => setBatchTitle(e.target.value)}
                className="bulk-batch-input"
                style={{ width: '320px' }}
              />
            </div>
            <div className="bulk-batch-field">
              <label className="bulk-batch-field-label">{t('Shipper Client:', 'शिपर ग्राहक:')}</label>
              <input
                type="text"
                value={shipperName}
                onChange={e => setShipperName(e.target.value)}
                className="bulk-batch-input"
                style={{ width: '240px' }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={loading || previewData.validCount === 0}
            onClick={handleGenerateBilties}
            className="bulk-btn-process"
          >
            <Zap size={16} />
            <span>
              {loading
                ? t('Processing...', 'प्रोसेसिंग...')
                : t(
                    `Generate ${previewData.validCount} Bulk Bilties & Barcode Manifest`,
                    `${previewData.validCount} बल्क बिल्टी एवं बारकोड मैनिफेस्ट जनरेट करें`
                  )}
            </span>
          </button>
        </div>
      )}

      {/* PREVIEW DATA GRID - ULTRA HIGH CONTRAST & THEME ADAPTIVE */}
      {previewData && (
        <div className="bulk-table-card">
          <div className="bulk-table-header-strip">
            <div className="bulk-table-title">
              <Layers size={16} color="#2563eb" />
              <strong>{t(`Pre-Dispatch Verification Grid (${previewData.previewItems.length} Rows)`, `प्री-डिस्पैच सत्यापन ग्रिड (${previewData.previewItems.length} पंक्तियाँ)`)}</strong>
            </div>
            <span className="bulk-table-subtitle">
              {t('Every consignment undergoes auto PIN-code validation before LR generation', 'एलआर जनरेशन से पहले प्रत्येक कंसाइनमेंट का ऑटो पिन-कोड सत्यापन होता है')}
            </span>
          </div>

          <div className="bulk-table-scroll">
            <table className="bulk-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>{t('Status', 'स्थिति')}</th>
                  <th>{t('Consignee & Phone', 'प्राप्तकर्ता एवं फोन')}</th>
                  <th>{t('Delivery Destination', 'डिलीवरी गंतव्य')}</th>
                  <th>{t('PIN Code', 'पिन कोड')}</th>
                  <th>{t('Goods Description', 'माल का विवरण')}</th>
                  <th>{t('Pkgs', 'पैकेज')}</th>
                  <th>{t('Weight (KG)', 'वजन (किग्रा)')}</th>
                  <th>{t('Declared Val', 'घोषित मूल्य')}</th>
                  <th>{t('Freight (Est)', 'भाड़ा (अनुमानित)')}</th>
                  <th>{t('Payment', 'भुगतान')}</th>
                </tr>
              </thead>
              <tbody>
                {previewData.previewItems.map(row => (
                  <tr key={row.rowIndex} className={row.isValid ? 'valid-row' : 'error-row'}>
                    <td style={{ fontWeight: 800, color: 'var(--text-secondary, #64748b)' }}>{row.rowIndex}</td>
                    <td>
                      {row.isValid ? (
                        <span className="bulk-badge valid">
                          <CheckCircle2 size={12} />
                          {t('Ready', 'तैयार')}
                        </span>
                      ) : (
                        <span className="bulk-badge error" title={row.validationErrors.join(', ')}>
                          <AlertTriangle size={12} />
                          {t('Fix', 'सुधारें')}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="bulk-consignee-cell">
                        <strong>{row.consigneeName}</strong>
                        <small className="bulk-consignee-phone">
                          <Phone size={11} /> {row.consigneePhone}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="bulk-address-cell">
                        <span>{row.deliveryAddress}</span>
                        <small className="bulk-city-label">{row.city}</small>
                      </div>
                    </td>
                    <td>
                      <span className="bulk-pincode-pill">{row.pincode}</span>
                    </td>
                    <td>
                      <span className="bulk-goods-desc">{row.goodsDescription}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      <span className="bulk-pkgs-pill">
                        <Box size={11} /> {row.packageCount}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>
                      {row.weightKg.toLocaleString('en-IN')} kg
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary, #64748b)' }}>
                      ₹{row.declaredValue.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                      ₹{row.estimatedFreight.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`bulk-paymode-badge ${row.paymentMode.toLowerCase()}`}>
                        {row.paymentMode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POST-PROCESS BATCH DISPATCH SUCCESS MODAL */}
      {showResultModal && processResult && (
        <div className="bulk-modal-overlay">
          <div className="bulk-modal-card">
            <div className="bulk-modal-header">
              <div>
                <h3 className="bulk-modal-title">
                  <CheckCircle2 size={22} color="#10b981" />
                  <span>{t('Bulk Dispatch Generated Successfully!', 'बल्क डिस्पैच सफलतापूर्वक जनरेट हुआ!')}</span>
                </h3>
                <span className="bulk-modal-sub">
                  {processResult.batchTitle} • {t('Batch ID:', 'बैच आईडी:')} <strong>{processResult.batchId}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="bulk-modal-close"
              >
                <X size={18} />
              </button>
            </div>

            {/* BATCH MANIFEST SUMMARY STRIP */}
            <div className="bulk-manifest-strip">
              <div className="bulk-manifest-item">
                <span className="bulk-manifest-item-label">{t('Total Bilties Generated', 'कुल जनरेटेड बिल्टी')}</span>
                <strong className="bulk-manifest-item-val">{processResult.totalProcessed} Official LRs</strong>
              </div>
              <div className="bulk-manifest-item">
                <span className="bulk-manifest-item-label">{t('Gross Cargo Weight', 'सकल कार्गो भार')}</span>
                <strong className="bulk-manifest-item-val">{((processResult.totalWeightKg ?? 0) / 1000).toFixed(2)} MT</strong>
              </div>
              <div className="bulk-manifest-item">
                <span className="bulk-manifest-item-label">{t('Total Packages', 'कुल पैकेज')}</span>
                <strong className="bulk-manifest-item-val">{processResult.totalPackages} Boxes</strong>
              </div>
              <div className="bulk-manifest-item">
                <span className="bulk-manifest-item-label">{t('Total Freight Value', 'कुल भाड़ा मूल्य')}</span>
                <strong className="bulk-manifest-item-val" style={{ color: '#10b981' }}>
                  ₹{(processResult.totalFreightAmount ?? 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* GENERATED BILTIES & BARCODES SCROLLER */}
            <div className="bulk-modal-body">
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
                {t('Consignment Barcodes & Official Bilties Preview:', 'कंसाइनमेंट बारकोड एवं ऑफिशियल बिल्टी प्रीव्यू:')}
              </h4>
              <div className="bulk-bilties-grid">
                {processResult.generatedBilties.map((bilty, idx) => (
                  <div key={idx} className="bulk-bilty-card">
                    <div className="bulk-bilty-head">
                      <div>
                        <span className="bulk-bilty-lr">{bilty.lrNumber}</span>
                        <div className="bulk-bilty-dest">{bilty.consigneeName}</div>
                        <small className="bulk-bilty-city">{bilty.consigneeCity}</small>
                      </div>
                      <span className="bulk-bilty-pay">{bilty.paymentMode}</span>
                    </div>

                    {/* SVG HIGH CONTRAST DIGITAL BARCODE */}
                    <div className="bulk-barcode-box">
                      <div className="bulk-barcode-bars">
                        {Array.from({ length: 38 }).map((_, barIdx) => (
                          <div
                            key={barIdx}
                            style={{
                              width: (barIdx % 3 === 0 || barIdx % 5 === 0) ? '3px' : '1.5px',
                              height: '38px',
                              background: '#0f172a',
                              display: 'inline-block'
                            }}
                          />
                        ))}
                      </div>
                      <span className="bulk-barcode-text">{bilty.barcode}</span>
                    </div>

                    <div className="bulk-bilty-foot">
                      <span>{bilty.packages} Pkgs • {bilty.weightKg} kg</span>
                      <strong style={{ color: '#10b981' }}>₹{bilty.freightAmount.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bulk-modal-footer">
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="bulk-btn-secondary"
              >
                {t('Close', 'बंद करें')}
              </button>
              <button
                type="button"
                onClick={handlePrintLabels}
                className="bulk-btn-action"
                style={{ background: '#10b981' }}
              >
                <Printer size={15} />
                <span>{t('Print All Barcode Stickers & Bilties', 'सभी बारकोड स्टिकर व बिल्टी प्रिंट करें')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
