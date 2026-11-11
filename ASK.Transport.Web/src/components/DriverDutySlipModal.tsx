import { useState } from 'react';
import { sendDriverWhatsAppDutySlip, type DutySlipRequest } from '../api/fleetApi';
import { X, Send, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';

interface DriverDutySlipModalProps {
  initialData?: Partial<DutySlipRequest>;
  onClose: () => void;
}

export default function DriverDutySlipModal({ initialData, onClose }: DriverDutySlipModalProps) {
  const [data] = useState<DutySlipRequest>({
    tripId: initialData?.tripId || 101,
    tripNumber: initialData?.tripNumber || 'TRIP-2026-98102',
    driverName: initialData?.driverName || 'Murugan Swamy',
    driverPhone: initialData?.driverPhone || '+91 98450 12890',
    vehicleNumber: initialData?.vehicleNumber || 'RJ-14-GH-4921',
    truckModel: initialData?.truckModel || 'Ashok Leyland 2820 (32ft MXL)',
    originHub: initialData?.originHub || 'Delhi SuperHub (Okhla)',
    destinationHub: initialData?.destinationHub || 'Mumbai Port (Nhava Sheva)',
    cargoDescription: initialData?.cargoDescription || 'Tata Steel Heavy Tubes (24.5 MT)',
    dieselAdvance: initialData?.dieselAdvance || 15000,
    bhattaAmount: initialData?.bhattaAmount || 2500,
    ewayBillNumber: initialData?.ewayBillNumber || '2410-9921-8841'
  });

  const [sending, setSending] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    whatsappUrl: string;
    messagePreview: string;
  } | null>(null);

  async function handleSend() {
    try {
      setSending(true);
      const res = await sendDriverWhatsAppDutySlip(data);
      setSuccessResult({
        whatsappUrl: res.whatsappUrl,
        messagePreview: res.messagePreview
      });
    } catch (err: any) {
      alert('Failed to send WhatsApp duty slip: ' + err?.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface, #0f172a)',
          border: '1px solid #10b981',
          borderRadius: '18px',
          maxWidth: '560px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.25)',
          color: 'var(--text-primary, #f8fafc)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Driver WhatsApp Highway Duty Slip</h3>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
              Automated load dispatch via Meta WhatsApp Business Cloud API
            </p>
          </div>
        </div>

        {!successResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* TRIP DETAILS STRIP */}
            <div
              style={{
                background: 'var(--bg-dark, #070d1e)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                fontSize: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Pilot Driver</span>
                <div style={{ fontWeight: 700 }}>{data.driverName}</div>
                <div style={{ fontSize: '11px', color: '#34d399', fontFamily: 'monospace' }}>{data.driverPhone}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Assigned Vehicle</span>
                <div style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'monospace' }}>{data.vehicleNumber}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{data.truckModel}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Highway Route</span>
                <div style={{ fontWeight: 700 }}>{data.originHub} ➔ {data.destinationHub}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Diesel Advance</span>
                <div style={{ fontWeight: 700, color: '#10b981' }}>₹{data.dieselAdvance.toLocaleString('en-IN')} (Card Loaded)</div>
              </div>
            </div>

            {/* PREVIEW WHATSAPP BUBBLE */}
            <div
              style={{
                background: '#122822',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '11.5px',
                lineHeight: 1.5,
                color: '#e2e8f0',
                boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>
                🚛 ASK TRANSPORT HIGHWAY LOAD ASSIGNMENT
              </div>
              <div>नमस्ते <strong>{data.driverName}</strong> जी,</div>
              <div style={{ margin: '4px 0' }}>आपकी आज की गाड़ी ड्यूटी असाइन कर दी गई है:</div>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '8px 10px', borderRadius: '8px', margin: '6px 0', fontFamily: 'monospace', fontSize: '11px' }}>
                <div>📍 गाड़ी: {data.vehicleNumber} ({data.truckModel})</div>
                <div>📦 रूट: {data.originHub} ➔ {data.destinationHub}</div>
                <div>🏷️ माल: {data.cargoDescription}</div>
                <div>⛽ डीजल एडवांस: ₹{data.dieselAdvance.toLocaleString('en-IN')} (IOCL Card)</div>
                <div>💵 रास्ते का भत्ता: ₹{data.bhattaAmount.toLocaleString('en-IN')}</div>
                <div>📜 E-Way Bill: {data.ewayBillNumber}</div>
              </div>
              <div style={{ color: '#93c5fd', fontSize: '11px' }}>
                🗺️ Google Maps Highway Route • 📑 Digital Bilty QR Pass
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Send size={14} />
                <span>{sending ? 'Dispatching via Meta API...' : '📲 Send Official WhatsApp Duty Slip'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={48} color="#10b981" />
            <h4 style={{ margin: 0, fontSize: '17px', color: '#10b981', fontWeight: 800 }}>Duty Slip Dispatched!</h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', maxWidth: '380px' }}>
              Driver <strong>{data.driverName}</strong> has been sent the complete load assignment &amp; navigation links on <strong>{data.driverPhone}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <a
                href={successResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25d366',
                  color: '#070d1e',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={13} />
                <span>Open in WhatsApp Web</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
