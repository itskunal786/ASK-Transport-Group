import React, { useState } from 'react';
import type { ConsignmentLRData } from './ConsignmentLRModal';

interface Props {
  onClose: () => void;
  onSubmit: (lrData: ConsignmentLRData) => void;
}

export default function ManualBiltyModal({ onClose, onSubmit }: Props) {
  // Consignor / Sender State
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [fromCity, setFromCity] = useState('Delhi Hub');
  const [fromAddress, setFromAddress] = useState('Sanjay Gandhi Transport Nagar, Delhi');
  const [senderGstin, setSenderGstin] = useState('');

  // Consignee / Receiver State
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [toCity, setToCity] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [toPinCode, setToPinCode] = useState('');

  // Goods Details
  const [goodsType, setGoodsType] = useState('Industrial Goods & Machinery');
  const [quantity, setQuantity] = useState('15');
  const [weightKg, setWeightKg] = useState('420');
  const [serviceType, setServiceType] = useState('Standard Surface');

  // Commercials
  const [paymentMode, setPaymentMode] = useState<'To-Pay' | 'Paid' | 'T.B.B.'>('To-Pay');
  const [baseFreight, setBaseFreight] = useState('3800');
  const [handlingFee, setHandlingFee] = useState('250');
  const [doorDeliveryFee, setDoorDeliveryFee] = useState('350');
  const [gstPercent] = useState('18');

  // Calculated Total
  const subTotal = (parseFloat(baseFreight) || 0) + (parseFloat(handlingFee) || 0) + (parseFloat(doorDeliveryFee) || 0);
  const gstAmount = Math.round(subTotal * (parseFloat(gstPercent) / 100));
  const totalAmount = subTotal + gstAmount;

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!senderName.trim() || !receiverName.trim() || !toCity.trim()) {
      alert('Please enter Sender Name, Receiver Name, and Destination City.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const lrNumber = `LR-2026-M${randomSuffix}`;
    const bookingNumber = `BK-MAN-${randomSuffix}`;

    const lrData: ConsignmentLRData = {
      bookingNumber,
      consignmentNumber: lrNumber,
      bookingDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      senderName: senderName.trim(),
      senderPhone: senderPhone.trim() || '9876543210',
      fromCity: fromCity.trim(),
      fromAddress: fromAddress.trim(),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim() || '9812345678',
      toCity: toCity.trim(),
      toAddress: toAddress.trim() || `${toCity.trim()} City Delivery Center`,
      toPinCode: toPinCode.trim() || '400001',
      goodsType: goodsType,
      goodsDescription: `${quantity} packages of ${goodsType} (Actual: ${weightKg} KG)`,
      weightKg: parseFloat(weightKg) || 100,
      quantity: parseInt(quantity) || 1,
      freightAmount: subTotal,
      gstAmount,
      totalAmount,
      status: 'In Transit',
      paymentStatus: paymentMode === 'Paid' ? 'Paid at Counter' : 'To-Pay on Delivery',
      serviceType
    };

    onSubmit(lrData);
  }

  return (
    <div className="lr-modal-overlay" onClick={onClose}>
      <div className="lr-modal-wrapper" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="lr-toolbar" style={{ background: '#0369a1' }}>
          <span>📝 Manual Bilty Entry &amp; Counter Booking (LR Generation)</span>
          <div className="lr-toolbar-actions">
            <button type="button" className="lr-btn-close" onClick={onClose}>
              ✕ Cancel
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '72vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#0369a1' }}>
              ℹ️ <strong>Counter Operations:</strong> Create official consignments for walk-in shippers and counter consignments. Generating this entry immediately allocates an official digital LR (Lorry Receipt) in the database.
            </div>

            {/* SENDER & RECEIVER COLUMNS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* SENDER */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                  📤 Consignor (Sender Details)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Sender / Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Industrial Solutions"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={senderPhone}
                      onChange={e => setSenderPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Origin Hub *</label>
                      <input
                        type="text"
                        required
                        value={fromCity}
                        onChange={e => setFromCity(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>GSTIN (Optional)</label>
                      <input
                        type="text"
                        placeholder="07AABCA..."
                        value={senderGstin}
                        onChange={e => setSenderGstin(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Origin Address</label>
                    <input
                      type="text"
                      placeholder="Hub / Warehouse address"
                      value={fromAddress}
                      onChange={e => setFromAddress(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* RECEIVER */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                  📥 Consignee (Receiver Details)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Receiver / Consignee Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shreenath Logistics Agency"
                      value={receiverName}
                      onChange={e => setReceiverName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Receiver Mobile *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9811223344"
                      value={receiverPhone}
                      onChange={e => setReceiverPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Destination City *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mumbai Hub"
                        value={toCity}
                        onChange={e => setToCity(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Pin Code</label>
                      <input
                        type="text"
                        placeholder="400001"
                        value={toPinCode}
                        onChange={e => setToPinCode(e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Delivery Destination Address</label>
                    <input
                      type="text"
                      placeholder="Receiver door / godown address"
                      value={toAddress}
                      onChange={e => setToAddress(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GOODS & COMMODITY PARTICULARS */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                📦 Cargo Specification &amp; Packaging
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Commodity Type</label>
                  <select
                    value={goodsType}
                    onChange={e => setGoodsType(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="Industrial Goods &amp; Machinery">Machinery &amp; Parts</option>
                    <option value="Textiles &amp; Garments">Textiles &amp; Apparel</option>
                    <option value="FMCG &amp; Packaged Foods">FMCG &amp; Food Cargo</option>
                    <option value="Automotive Spare Parts">Automotive Parts</option>
                    <option value="Electronic &amp; IT Hardware">Electronics &amp; IT</option>
                    <option value="Chemical Drums (Non-Haz)">Non-Haz Chemicals</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>No. of Packages</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Actual Weight (KG)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={e => setWeightKg(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Transport Service</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="Standard Surface">Standard Surface (PTL)</option>
                    <option value="Full Truckload">Full Truckload (FTL)</option>
                    <option value="Priority Express">Priority Express</option>
                  </select>
                </div>
              </div>
            </div>

            {/* COMMERCIALS & FREIGHT CHARGES */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                  💳 Commercial Billing &amp; Payment Mode
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['To-Pay', 'Paid', 'T.B.B.'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: paymentMode === mode ? '#0284c7' : '#cbd5e1',
                        background: paymentMode === mode ? '#0284c7' : '#ffffff',
                        color: paymentMode === mode ? '#ffffff' : '#475569'
                      }}
                    >
                      {mode === 'To-Pay' ? '💵 To-Pay (Consignee)' : mode === 'Paid' ? '💳 Paid (Counter)' : '📑 T.B.B. (Account)'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Base Freight (₹)</label>
                  <input
                    type="number"
                    value={baseFreight}
                    onChange={e => setBaseFreight(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Hamali &amp; Loading (₹)</label>
                  <input
                    type="number"
                    value={handlingFee}
                    onChange={e => setHandlingFee(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Door Delivery (₹)</label>
                  <input
                    type="number"
                    value={doorDeliveryFee}
                    onChange={e => setDoorDeliveryFee(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ background: '#ecfdf5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  <small style={{ fontSize: '10px', color: '#047857', fontWeight: 700 }}>Total Bilty Net (₹)</small>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#065f46' }}>
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '9px', color: '#059669' }}>Includes 18% GST (₹{gstAmount})</div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="lr-btn-close"
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 20px',
                background: '#0284c7',
                color: '#ffffff',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)'
              }}
            >
              ✓ Generate Manual Bilty &amp; Print LR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
