import { useState, type ChangeEvent } from 'react';
import { createBooking } from '../api/createBookingApi';
import type { TransportService } from '../types/createBooking';
import { useNavigate } from 'react-router-dom';

interface BulkBookingUploadProps {
  services: TransportService[];
}

interface ParsedRow {
  rowNum: number;
  senderName: string;
  senderPhone: string;
  pickupAddress: string;
  pickupPinCode: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryPinCode: string;
  goodsType: string;
  weightKg: number;
  quantity: number;
  description: string;
  status: 'pending' | 'valid' | 'invalid' | 'success' | 'failed';
  errorMessage?: string;
  bookingNumber?: string;
  consignmentNumber?: string;
}

export default function BulkBookingUpload({ services }: BulkBookingUploadProps) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    services.length > 0 ? services[0].id : 1
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [uploadSummary, setUploadSummary] = useState<{ total: number; success: number; failed: number } | null>(null);

  // Generate and download a sample CSV
  const handleDownloadSample = () => {
    const csvContent =
      'SenderName,SenderPhone,PickupAddress,PickupPinCode,ReceiverName,ReceiverPhone,DeliveryAddress,DeliveryPinCode,GoodsType,WeightKg,Quantity,Description\n' +
      'Rajesh Sharma,9876543210,Sector 18 Industrial Area New Delhi,110001,Amit Verma,9812345678,Andheri East MIDC Mumbai,400001,General Cargo,45,2,Machine spare parts\n' +
      'Pooja Patel,9898989898,GIDC Phase 2 Ahmedabad,380001,Sanjay Kumar,9765432109,Peenya Industrial Area Bengaluru,560058,Electronics,120,5,Computer monitors and cables\n' +
      'Vikram Malhotra,9123456780,Civil Lines Kanpur,208001,Kunal Singh,9834567890,Salt Lake Sector 5 Kolkata,700091,Textiles,80,10,Cotton fabric rolls';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ASK_Bulk_Booking_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple CSV Line Parser handling quotes
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV file is empty or contains only headers.');
        return;
      }

      const parsed: ParsedRow[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 10) continue;

        const row: ParsedRow = {
          rowNum: i,
          senderName: cols[0] || '',
          senderPhone: cols[1] || '',
          pickupAddress: cols[2] || '',
          pickupPinCode: cols[3] || '',
          receiverName: cols[4] || '',
          receiverPhone: cols[5] || '',
          deliveryAddress: cols[6] || '',
          deliveryPinCode: cols[7] || '',
          goodsType: cols[8] || 'General Cargo',
          weightKg: parseFloat(cols[9]) || 1,
          quantity: parseInt(cols[10], 10) || 1,
          description: cols[11] || 'Bulk consignment item',
          status: 'pending',
        };

        // Validate
        if (!row.senderName || !row.senderPhone || row.senderPhone.length !== 10) {
          row.status = 'invalid';
          row.errorMessage = 'Invalid sender phone (must be 10 digits)';
        } else if (!/^[1-9][0-9]{5}$/.test(row.pickupPinCode)) {
          row.status = 'invalid';
          row.errorMessage = 'Invalid pickup PIN code';
        } else if (!row.receiverName || !row.receiverPhone || row.receiverPhone.length !== 10) {
          row.status = 'invalid';
          row.errorMessage = 'Invalid receiver phone (must be 10 digits)';
        } else if (!/^[1-9][0-9]{5}$/.test(row.deliveryPinCode)) {
          row.status = 'invalid';
          row.errorMessage = 'Invalid delivery PIN code';
        } else if (row.pickupPinCode === row.deliveryPinCode) {
          row.status = 'invalid';
          row.errorMessage = 'Pickup and delivery PIN cannot be identical';
        } else {
          row.status = 'valid';
        }

        parsed.push(row);
      }

      setRows(parsed);
      setUploadSummary(null);
    };

    reader.readAsText(file);
  };

  const handleProcessBulk = async () => {
    if (rows.length === 0) return;
    const validRows = rows.filter((r) => r.status === 'valid');
    if (validRows.length === 0) {
      alert('No valid consignments to book. Please check validation errors.');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failedCount = 0;
    const updated = [...rows];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'valid') continue;

      try {
        const res = await createBooking({
          orderType: 'Bulk',
          senderName: updated[i].senderName,
          senderPhone: updated[i].senderPhone,
          fromAddress: updated[i].pickupAddress,
          fromPinCode: updated[i].pickupPinCode,
          receiverName: updated[i].receiverName,
          receiverPhone: updated[i].receiverPhone,
          toAddress: updated[i].deliveryAddress,
          toPinCode: updated[i].deliveryPinCode,
          goodsType: updated[i].goodsType,
          weight: updated[i].weightKg,
          quantity: updated[i].quantity,
          goodsDescription: updated[i].description,
          transportServiceId: selectedServiceId,
          pickupDate: todayStr,
          discountAmount: 0,
          items: [],
        });

        updated[i].status = 'success';
        updated[i].bookingNumber = res.booking.bookingNumber;
        updated[i].consignmentNumber = 'LR-' + res.booking.bookingNumber;
        successCount++;
      } catch (err: any) {
        updated[i].status = 'failed';
        updated[i].errorMessage = err?.message || 'Booking submission failed';
        failedCount++;
      }

      setProcessedCount(successCount + failedCount);
      setRows([...updated]);
    }

    setIsProcessing(false);
    setUploadSummary({
      total: validRows.length,
      success: successCount,
      failed: failedCount,
    });
  };

  return (
    <div style={{ background: 'var(--bg-card, #ffffff)', borderRadius: '16px', padding: '28px', border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📑</span> B2B Bulk Excel / CSV Consignment Upload
          </h2>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem' }}>
            Upload hundreds of shipments in 1 click. Instant official consignment LR numbers & dispatch tags are generated automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadSample}
          style={{
            background: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            transition: 'all 0.2s',
          }}
        >
          ⬇️ Download Sample CSV Template
        </button>
      </div>

      {/* Service Selector & File Input Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px', background: 'var(--bg-subtle, #f8fafc)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--border, #cbd5e1)' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-primary, #1e293b)' }}>
            Select Fleet / Transport Service
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(Number(e.target.value))}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-card, #ffffff)', color: 'var(--text-primary, #0f172a)' }}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-primary, #1e293b)' }}>
            Upload Filled CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            disabled={isProcessing}
            onChange={handleFileUpload}
            style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)', background: 'var(--bg-card, #ffffff)', color: 'var(--text-primary, #0f172a)' }}
          />
        </div>
      </div>

      {/* Upload Summary Banner */}
      {uploadSummary && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          background: uploadSummary.failed === 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
          border: uploadSummary.failed === 0 ? '1px solid #86efac' : '1px solid #fde047',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <strong style={{ color: uploadSummary.failed === 0 ? '#15803d' : '#a16207', fontSize: '1rem' }}>
              Batch Processing Finished!
            </strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--text-primary, #334155)' }}>
              Successfully Booked: <strong>{uploadSummary.success}</strong> | Failed: <strong>{uploadSummary.failed}</strong> out of {uploadSummary.total} consignments.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📋 Go to My Bookings
          </button>
        </div>
      )}

      {/* Parsed Rows Preview Table */}
      {rows.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary, #1e293b)' }}>
              Uploaded Consignments Preview ({rows.length} records found)
            </span>
            <button
              type="button"
              disabled={isProcessing || rows.filter(r => r.status === 'valid').length === 0}
              onClick={handleProcessBulk}
              style={{
                background: isProcessing ? '#94a3b8' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '11px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s',
              }}
            >
              {isProcessing ? `Processing... (${processedCount}/${rows.filter(r => r.status === 'valid').length})` : `🚀 Confirm & Book ${rows.filter(r => r.status === 'valid').length} Consignments`}
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border, #e2e8f0)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle, #f1f5f9)', color: 'var(--text-secondary, #475569)', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
                  <th style={{ padding: '10px 12px' }}>#</th>
                  <th style={{ padding: '10px 12px' }}>Sender</th>
                  <th style={{ padding: '10px 12px' }}>Pickup PIN</th>
                  <th style={{ padding: '10px 12px' }}>Receiver</th>
                  <th style={{ padding: '10px 12px' }}>Delivery PIN</th>
                  <th style={{ padding: '10px 12px' }}>Goods & Wt</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>LR / Booking #</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNum} style={{ borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.rowNum}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{r.senderName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>{r.senderPhone}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{r.pickupPinCode}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{r.receiverName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>{r.receiverPhone}</div>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{r.deliveryPinCode}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>{r.goodsType} ({r.weightKg} kg)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>Qty: {r.quantity}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {r.status === 'valid' && (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }}>
                          ✓ Ready
                        </span>
                      )}
                      {r.status === 'invalid' && (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem' }} title={r.errorMessage}>
                          ✕ {r.errorMessage}
                        </span>
                      )}
                      {r.status === 'success' && (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#15803d', fontWeight: 700, fontSize: '0.75rem' }}>
                          ✓ Booked
                        </span>
                      )}
                      {r.status === 'failed' && (
                        <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#b91c1c', fontWeight: 700, fontSize: '0.75rem' }} title={r.errorMessage}>
                          ✕ Failed
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                      {r.consignmentNumber || r.bookingNumber || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
