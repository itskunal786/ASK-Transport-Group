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
  Truck
} from 'lucide-react';
import {
  getBulkSampleTemplate,
  previewBulkConsignments,
  processBulkBookings,
  type BulkConsignmentItem,
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
  const [previewData, setPreviewData] = useState<BulkImportPreviewResponse | null>(null);
  const [batchTitle, setBatchTitle] = useState('Tata AutoComp Systems - Monthly Hub Dispatch Batch #84');
  const [shipperName, setShipperName] = useState('Tata AutoComp Systems Ltd');
  const [processResult, setProcessResult] = useState<BulkProcessResponse | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Load sample demo consignment automatically on component mount
  useEffect(() => {
    handleLoadDemoData();
  }, []);

  async function handleLoadDemoData() {
    try {
      setLoading(true);
      const res = await previewBulkConsignments({});
      setPreviewData(res);
      setProcessResult(null);
    } catch (err: any) {
      console.warn('Could not load demo preview data:', err?.message);
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
            onClick={handleLoadDemoData}
            className="bulk-btn-action"
          >
            <Zap size={14} />
            <span>{t('Load Demo Consignments (8 Shipments)', 'डेमो कंसाइनमेंट्स लोड करें (8 शिपमेंट)')}</span>
          </button>
        </div>
      </div>

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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={handleParsePastedText}
              disabled={loading}
              className="bulk-btn-action"
            >
              {loading ? t('Parsing...', 'पार्सिंग...') : t('Parse & Preview', 'पार्स एवं प्रीव्यू')}
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
                  <th style={{ width: '45px' }}>#</th>
                  <th>{t('Consignee & Mobile', 'कंसाइनी एवं मोबाइल')}</th>
                  <th>{t('Destination & PIN', 'गंतव्य एवं पिन')}</th>
                  <th>{t('Goods Description', 'माल का विवरण')}</th>
                  <th>{t('Boxes', 'बॉक्स संख्या')}</th>
                  <th>{t('Weight (KG)', 'भार (किलो)')}</th>
                  <th>{t('Declared ₹', 'घोषित ₹')}</th>
                  <th>{t('Mode', 'भुगतान मोड')}</th>
                  <th>{t('Est. Freight ₹', 'अनुमानित भाड़ा ₹')}</th>
                  <th className="center">{t('Status', 'स्थिति')}</th>
                </tr>
              </thead>
              <tbody>
                {previewData.previewItems.map((item: BulkConsignmentItem) => (
                  <tr key={item.rowIndex} className={item.isValid ? '' : 'row-invalid'}>
                    {/* # ROW INDEX */}
                    <td>
                      <span className="b2b-index-chip">{item.rowIndex}</span>
                    </td>

                    {/* CONSIGNEE & MOBILE */}
                    <td>
                      <strong className="b2b-consignee-title">{item.consigneeName}</strong>
                      <span className="b2b-phone-chip">
                        <Phone size={11} />
                        {item.consigneePhone}
                      </span>
                    </td>

                    {/* DESTINATION & PIN */}
                    <td>
                      <div className="b2b-dest-city">{item.city}</div>
                      <span className="b2b-pin-badge">PIN: {item.pincode}</span>
                    </td>

                    {/* GOODS DESCRIPTION */}
                    <td>
                      <div className="b2b-goods-desc">{item.goodsDescription}</div>
                    </td>

                    {/* BOXES - ULTRA HIGH CONTRAST */}
                    <td>
                      <span className="b2b-boxes-chip">
                        <Box size={13} color="#2563eb" />
                        {item.packageCount}
                      </span>
                    </td>

                    {/* WEIGHT KG */}
                    <td>
                      <span className="b2b-weight-chip">
                        <Scale size={12} />
                        {item.weightKg} kg
                      </span>
                    </td>

                    {/* DECLARED CARGO VALUE - ULTRA HIGH CONTRAST */}
                    <td>
                      <span className="b2b-declared-chip">
                        ₹{(item.declaredValue ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* PAYMENT MODE */}
                    <td>
                      <span
                        className={`b2b-mode-badge ${
                          item.paymentMode === 'Prepaid'
                            ? 'prepaid'
                            : item.paymentMode === 'COD'
                            ? 'cod'
                            : 'topay'
                        }`}
                      >
                        {item.paymentMode}
                      </span>
                    </td>

                    {/* EST. FREIGHT */}
                    <td>
                      <span className="b2b-freight-chip">
                        ₹{(item.estimatedFreight ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td style={{ textAlign: 'center' }}>
                      {item.isValid ? (
                        <span className="b2b-status-pill valid">
                          <CheckCircle2 size={13} />
                          {t('Valid', 'मान्य')}
                        </span>
                      ) : (
                        <span
                          className="b2b-status-pill error"
                          title={item.validationErrors.join(', ')}
                        >
                          <AlertTriangle size={13} />
                          {t('Error', 'त्रुटि')}
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
        <div className="bulk-modal-overlay">
          <div className="bulk-modal-card">
            <div className="bulk-modal-header">
              <div>
                <h3 className="bulk-modal-title">
                  <CheckCircle2 size={24} color="#059669" />
                  <span>
                    {t('Bulk Dispatch Manifest Generated!', 'बल्क डिस्पैच मैनिफेस्ट सफलतापूर्वक जनरेट हुआ!')} (Batch #{processResult.batchId})
                  </span>
                </h3>
                <p className="bulk-modal-sub">
                  {t('Shipper', 'शिपर')}: <strong>{processResult.shipperName}</strong> • {processResult.totalProcessed} {t('Bilties with Scannable Barcodes Ready', 'स्कैनेबल बारकोड सहित बिल्टियां तैयार')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="bulk-modal-close-btn"
                title={t('Close', 'बंद करें')}
              >
                <X size={18} />
              </button>
            </div>

            {/* BATCH TOTALS STRIP */}
            <div className="bulk-manifest-strip">
              <div>
                <span className="bulk-manifest-item-label">{t('Total Consignments', 'कुल कंसाइनमेंट्स')}</span>
                <strong className="bulk-manifest-item-val">{processResult.totalProcessed} {t('Bilties', 'बिल्टियां')}</strong>
              </div>
              <div>
                <span className="bulk-manifest-item-label">{t('Total Gross Weight', 'कुल सकल भार')}</span>
                <strong className="bulk-manifest-item-val">{processResult.totalWeightKg.toLocaleString()} KG</strong>
              </div>
              <div>
                <span className="bulk-manifest-item-label">{t('Total Invoiced Freight', 'कुल इनवॉइस भाड़ा')}</span>
                <strong className="bulk-manifest-item-val">₹{processResult.totalFreightAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handlePrintLabels}
                  className="bulk-btn-process"
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  <Printer size={15} />
                  <span>{t('Print Labels & Manifest', 'लेबल एवं मैनिफेस्ट प्रिंट करें')}</span>
                </button>
              </div>
            </div>

            {/* BILTY & BARCODE CARDS LIST */}
            <div className="bulk-bilty-grid">
              {processResult.generatedBilties.map(b => (
                <div key={b.lrNumber} className="bulk-bilty-card">
                  <div className="bulk-bilty-card-top">
                    <strong className="bulk-bilty-lr">{b.lrNumber}</strong>
                    <span className="b2b-boxes-chip" style={{ padding: '2px 8px', fontSize: '11px' }}>
                      <Box size={11} /> {b.packages} {t('Boxes', 'बॉक्स')}
                    </span>
                  </div>

                  {/* VISUAL BARCODE */}
                  <div className="bulk-bilty-barcode-box">
                    {b.barcode}
                  </div>

                  <div style={{ fontSize: '12px' }}>
                    <strong style={{ display: 'block', fontSize: '13px' }}>{b.consigneeName}</strong>
                    <div style={{ color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>{b.consigneeCity}</div>
                    <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="b2b-weight-chip" style={{ padding: '3px 7px', fontSize: '11.5px' }}>
                        {b.weightKg} KG
                      </span>
                      <strong className="b2b-freight-chip" style={{ padding: '3px 7px', fontSize: '11.5px' }}>
                        ₹{b.freightAmount.toLocaleString('en-IN')} ({b.paymentMode})
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="bulk-btn-secondary"
                style={{ padding: '9px 24px', fontSize: '13px' }}
              >
                {t('Done / Close', 'पूर्ण / बंद करें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
