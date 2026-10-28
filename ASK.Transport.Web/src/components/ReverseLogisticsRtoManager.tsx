import React, { useEffect, useState } from 'react';
import {
  getReverseLogisticsCases,
  initiateRtoCase,
  updateRtoStatus,
  type RtoReturnCase,
  type RtoSummaryResponse
} from '../api/enterpriseApi';

export default function ReverseLogisticsRtoManager() {
  const [data, setData] = useState<RtoSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // New RTO Modal
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [origBooking, setOrigBooking] = useState('ASK-BK-9182');
  const [origLr, setOrigLr] = useState('ASK-LR-2026-98102');
  const [originFactory, setOriginFactory] = useState('North Star Auto Components (Pune Factory)');
  const [consigneeName, setConsigneeName] = useState('Speedcraft Motors Depot (Gurugram)');
  const [returnReason, setReturnReason] = useState('Damaged in Transit / Water Ingress');
  const [damageSeverity, setDamageSeverity] = useState('Major Goods Damaged');
  const [claimAmount, setClaimAmount] = useState('48500');
  const [damagePhoto, setDamagePhoto] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400');

  // Success Notification
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getReverseLogisticsCases();
      setData(res);
    } catch (err) {
      console.error('Failed to load RTO cases:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleInitiateRto(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await initiateRtoCase({
        originalBookingNumber: origBooking,
        originalLrNumber: origLr,
        originFactory,
        consigneeWhoRejected: consigneeName,
        returnReason,
        damageSeverity,
        claimAmount: Number(claimAmount) || 0,
        damagePhotoUrl: damagePhoto
      });
      setShowInitiateModal(false);
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(null), 8000);
      loadData();
    } catch (err: any) {
      alert('Failed to initiate RTO: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvanceStatus(caseId: number, nextStatus: string, currentHub: string) {
    try {
      setLoading(true);
      await updateRtoStatus(caseId, {
        status: nextStatus,
        currentHub,
        notes: `Consignment milestone updated to ${nextStatus.replace(/_/g, ' ')}.`
      });
      loadData();
    } catch (err: any) {
      alert('Failed to update status: ' + err?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & CONTROLS */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔄</span> Reverse Logistics &amp; Damaged Goods Return (RTO Management)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
            Automate consignee rejections, damage inspection photo logging, reverse waybill (RLR) creation, and tracking back to origin manufacturing hub.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={loadData}
            style={{ padding: '8px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            🔄 Refresh Cases
          </button>

          <button
            type="button"
            onClick={() => setShowInitiateModal(true)}
            style={{ padding: '8px 16px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>+</span> Initiate Return / RTO Case
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 20px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', color: '#15803d', fontSize: '13.5px', fontWeight: 800 }}>
          {successMsg}
        </div>
      )}

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL RTO CASES</span>
          <strong style={{ fontSize: '24px', color: '#dc2626', display: 'block', margin: '4px 0' }}>
            {data?.metrics.totalReturns || 0} Returns
          </strong>
          <span style={{ fontSize: '11.5px', color: '#b91c1c' }}>Rejected or damaged shipments</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>REVERSE IN-TRANSIT</span>
          <strong style={{ fontSize: '24px', color: '#d97706', display: 'block', margin: '4px 0' }}>
            {data?.metrics.inTransit || 0} Returning
          </strong>
          <span style={{ fontSize: '11.5px', color: '#b45309' }}>En route to source manufacturing hub</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #7c3aed' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>DAMAGE CLAIMS VALUE</span>
          <strong style={{ fontSize: '24px', color: '#7c3aed', display: 'block', margin: '4px 0' }}>
            ₹{data?.metrics.totalClaims.toLocaleString('en-IN') || 0}
          </strong>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Cargo insurance inspection ready</span>
        </div>

        <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>RESTOCKED TO FACTORY</span>
          <strong style={{ fontSize: '24px', color: '#16a34a', display: 'block', margin: '4px 0' }}>
            {data?.metrics.restocked || 0} Consignments
          </strong>
          <span style={{ fontSize: '11.5px', color: '#059669' }}>QC inspected &amp; inventory reconciled</span>
        </div>
      </div>

      {/* RTO CASES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(data?.cases || []).map((c: RtoReturnCase) => {
          const isRestocked = c.status === 'Restocked_To_Factory';
          const isInTransit = c.status === 'Reverse_In_Transit';

          return (
            <div
              key={c.id}
              style={{
                background: 'var(--bg-surface, #ffffff)',
                borderRadius: '14px',
                border: isRestocked ? '2px solid #10b981' : isInTransit ? '1.5px solid #f59e0b' : '1px solid var(--border-color, #e2e8f0)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {/* TOP HEADER */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: 800 }}>
                    {c.caseNumber}
                  </span>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>Reason: {c.returnReason}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Original LR: <strong>{c.originalLrNumber}</strong> → Reverse LR: <strong style={{ color: '#2563eb' }}>{c.reverseLrNumber}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    background: c.damageSeverity.includes('Major') ? '#fee2e2' : c.damageSeverity.includes('None') ? '#dcfce7' : '#fef3c7',
                    color: c.damageSeverity.includes('Major') ? '#dc2626' : c.damageSeverity.includes('None') ? '#15803d' : '#b45309'
                  }}>
                    {c.damageSeverity}
                  </span>

                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    background: isRestocked ? '#dcfce7' : '#eff6ff',
                    color: isRestocked ? '#15803d' : '#1d4ed8'
                  }}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* ROUTE & DAMAGE EVIDENCE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>ORIGIN FACTORY (RECIPIENT OF RETURN):</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    🏭 {c.originFactory}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>REJECTED BY CONSIGNEE:</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
                    🏢 {c.consigneeWhoRejected}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CURRENT REVERSE HUB:</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                    📍 {c.currentReverseHub}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CUSTOMER CLAIM AMOUNT:</span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#7c3aed', marginTop: '2px' }}>
                    {c.customerRefundClaimed > 0 ? `₹${c.customerRefundClaimed.toLocaleString('en-IN')}` : 'Nil (Stock Exchange)'}
                  </div>
                </div>
              </div>

              {/* PHOTO PROOF & PROGRESSION CONTROLS */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={c.damagePhotoUrl}
                    alt="Damage Evidence"
                    onClick={() => setSelectedPhoto(c.damagePhotoUrl)}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block' }}>
                      📸 Transit Damage Proof Photo
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(c.damagePhotoUrl)}
                      style={{ padding: '2px 8px', background: 'transparent', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer', paddingLeft: 0 }}
                    >
                      Click to inspect full photo ↗
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {c.status === 'RTO_Initiated' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleAdvanceStatus(c.id, 'Reverse_In_Transit', 'Agra Highway Transit Hub')}
                      style={{ padding: '8px 14px', background: '#d97706', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      🛣️ Dispatch on Reverse Truck
                    </button>
                  )}

                  {c.status === 'Reverse_In_Transit' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleAdvanceStatus(c.id, 'Arrived_At_Source_Hub', 'Pune Chakan Hub Gate')}
                      style={{ padding: '8px 14px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      📍 Mark Arrived at Source Hub
                    </button>
                  )}

                  {c.status === 'Arrived_At_Source_Hub' && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleAdvanceStatus(c.id, 'Restocked_To_Factory', 'Pune Factory Central Warehouse')}
                      style={{ padding: '8px 16px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      ✓ Pass QC &amp; Restock to Inventory
                    </button>
                  )}

                  {isRestocked && (
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 800 }}>
                      ✓ Case Closed &amp; Restocked
                    </span>
                  )}
                </div>
              </div>

              {/* TIMELINE STEPS */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  REVERSE AUDIT TIMELINE:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {c.timeline.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#2563eb' }}>●</span>
                      <strong style={{ color: '#0f172a' }}>{ev.title}:</strong>
                      <span style={{ color: '#475569' }}>{ev.description}</span>
                      <small style={{ color: '#94a3b8', marginLeft: 'auto' }}>{new Date(ev.timestamp).toLocaleTimeString()}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INITIATE RETURN MODAL */}
      {showInitiateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', color: '#0f172a' }}>
              🔄 Initiate Consignment Return / RTO
            </h3>

            <form onSubmit={handleInitiateRto} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>ORIGINAL BOOKING #:</label>
                  <input
                    type="text"
                    value={origBooking}
                    onChange={e => setOrigBooking(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>ORIGINAL LR BILTY #:</label>
                  <input
                    type="text"
                    value={origLr}
                    onChange={e => setOrigLr(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>ORIGIN FACTORY (RETURN DESTINATION):</label>
                <input
                  type="text"
                  value={originFactory}
                  onChange={e => setOriginFactory(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>CONSIGNEE WHO REFUSED DELIVERY:</label>
                <input
                  type="text"
                  value={consigneeName}
                  onChange={e => setConsigneeName(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>RETURN REASON:</label>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="Damaged in Transit / Water Ingress">Damaged in Transit / Water Ingress</option>
                    <option value="Consignee Refused Delivery">Consignee Refused Delivery</option>
                    <option value="Wrong Item Dispatched by Factory">Wrong Item Dispatched</option>
                    <option value="Seal Broken / Tampered Outer Carton">Seal Broken / Tampered Outer</option>
                    <option value="Pincode Unserviceable / Rerouted">Pincode Unserviceable</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>DAMAGE SEVERITY:</label>
                  <select
                    value={damageSeverity}
                    onChange={e => setDamageSeverity(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="Major Goods Damaged">Major Goods Damaged</option>
                    <option value="Minor Packaging Damage">Minor Packaging Damage</option>
                    <option value="None - Intact Return">None - Intact Return</option>
                    <option value="Total Loss">Total Loss</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>CLAIM / REFUND AMOUNT (₹):</label>
                  <input
                    type="number"
                    value={claimAmount}
                    onChange={e => setClaimAmount(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>DAMAGE PHOTO URL:</label>
                  <input
                    type="text"
                    value={damagePhoto}
                    onChange={e => setDamagePhoto(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 20px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Generate Reverse LR &amp; Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO PREVIEW MODAL */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', maxWidth: '640px', width: '100%', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#0f172a' }}>Damage Evidence Inspection</h4>
            <img src={selectedPhoto} alt="Full Damage Proof" style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: '8px', objectFit: 'contain' }} />
            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                style={{ padding: '6px 20px', background: '#334155', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
