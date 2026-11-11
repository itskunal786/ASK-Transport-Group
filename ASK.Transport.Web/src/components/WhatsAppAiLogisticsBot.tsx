import './WhatsAppAiLogisticsBot.css';
import { useState, useRef, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  cardType?: 'tracking' | 'tariff_quote' | 'bilty_doc' | 'invoice_doc' | 'escalation';
  cardData?: Record<string, any>;
}

export interface InboundChatSession {
  id: string;
  customerName: string;
  customerPhone: string;
  companyName: string;
  lastQuery: string;
  intent: 'Tracking' | 'Tariff Quote' | 'Document Request' | 'Complaint / Escalation';
  status: 'Auto-Resolved' | 'Active Chat' | 'Escalated to Agent';
  timestamp: string;
  unreadCount?: number;
}

// ==========================================
// INITIAL CONVERSATION SAMPLES
// ==========================================
const INITIAL_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'm-1',
    sender: 'user',
    text: 'Track LR-2410-8891',
    time: '10:14 AM'
  },
  {
    id: 'm-2',
    sender: 'bot',
    text: 'Namaste! 🙏 Welcome to ASK Transport 24×7 AI Service.\n\nHere is your live consignment tracking status:',
    time: '10:14 AM',
    cardType: 'tracking',
    cardData: {
      lrNo: 'LR-2410-8891',
      status: '🚚 In-Transit (On-Time)',
      origin: 'Delhi Central Hub',
      destination: 'Pune Industrial Area',
      currentLocation: 'NH-48 near Vadodara Bypass, Gujarat',
      gpsCoords: { lat: 22.3072, lng: 73.1812 },
      eta: 'Tomorrow by 11:30 AM',
      remainingKm: 420,
      driverName: 'Ramesh Yadav',
      driverPhone: '+91 98765 43210',
      vehicleNo: 'GJ-01-XY-9876'
    }
  },
  {
    id: 'm-3',
    sender: 'user',
    text: 'Delhi to Pune 20 Ton 16-Wheeler ka rate kya hai?',
    time: '10:16 AM'
  },
  {
    id: 'm-4',
    sender: 'bot',
    text: 'Here is your instant algorithmic freight quotation for Delhi ➔ Pune (20 Ton Heavy FTL):',
    time: '10:16 AM',
    cardType: 'tariff_quote',
    cardData: {
      origin: 'Delhi NCR Hub',
      destination: 'Pune MIDC (1,420 KM)',
      vehicleType: '16-Wheeler Multi-Axle (20 Ton Capacity)',
      baseFreight: 48500,
      fuelSurcharge: 5577,
      tollHandling: 3200,
      gst18: 10310,
      netTotal: 67587,
      estimatedTransitHours: '42 - 48 Hours',
      validUntil: 'Valid for next 48 Hours'
    }
  }
];

const RECENT_CUSTOMER_SESSIONS: InboundChatSession[] = [
  {
    id: 's-1',
    customerName: 'Anand Rathi (Dispatch Head)',
    customerPhone: '+91 98112 34567',
    companyName: 'Tata AutoComp Systems Ltd',
    lastQuery: 'Track LR-2410-8891 status & live map',
    intent: 'Tracking',
    status: 'Auto-Resolved',
    timestamp: '2 mins ago'
  },
  {
    id: 's-2',
    customerName: 'Priya Sundaram (Logistics VP)',
    customerPhone: '+91 98401 99887',
    companyName: 'Bajaj Electricals Pune',
    lastQuery: 'Delhi to Pune 20 Ton 16-Wheeler quotation',
    intent: 'Tariff Quote',
    status: 'Auto-Resolved',
    timestamp: '8 mins ago'
  },
  {
    id: 's-3',
    customerName: 'Rajesh Mittal (CFO)',
    customerPhone: '+91 99200 44551',
    companyName: 'Speedcraft Industrial Gearings',
    lastQuery: 'Please send stamped bilty LR-2410-9011 copy',
    intent: 'Document Request',
    status: 'Auto-Resolved',
    timestamp: '25 mins ago'
  },
  {
    id: 's-4',
    customerName: 'Vikram Joshi (Factory Mgr)',
    customerPhone: '+91 97230 11223',
    companyName: 'Mahindra Logistics Vendor Dock',
    lastQuery: 'Driver phone not reachable at loading dock',
    intent: 'Complaint / Escalation',
    status: 'Escalated to Agent',
    timestamp: '1 hour ago'
  }
];

export default function WhatsAppAiLogisticsBot() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'live_chats' | 'bot_config' | 'api_telemetry'>('simulator');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [triggers, setTriggers] = useState({
    departHub: true,
    otpConsignee: true,
    podSignature: true,
    billingAlert: true
  });

  const toggleTrigger = (key: keyof typeof triggers) => {
    setTriggers(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast('⚡ WhatsApp Broadcast Automation Rule updated and deployed live!');
      return updated;
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Natural Language Logic for WhatsApp Bot
  const processQuery = (rawText: string) => {
    const q = rawText.toLowerCase().trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // User Message
    const userMsg: WhatsAppMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: rawText,
      time: nowTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let botResponse: WhatsAppMessage;

      // 1. TRACKING QUERY
      if (q.includes('track') || q.includes('lr') || q.includes('bilty') || q.includes('kahan') || q.includes('status') || q.includes('location')) {
        const extractedLr = rawText.match(/LR-\d{4}-\d{4}/i)?.[0]?.toUpperCase() || 'LR-2410-8891';
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Found active consignment for *${extractedLr}*. Here is your real-time GPS radar link:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cardType: 'tracking',
          cardData: {
            lrNo: extractedLr,
            status: '🚚 In-Transit (On-Time)',
            origin: 'Delhi Central Logistics Hub',
            destination: 'Pune Industrial Area',
            currentLocation: 'NH-48 near Vadodara Bypass (Live Radar)',
            gpsCoords: { lat: 22.3072, lng: 73.1812 },
            eta: 'Tomorrow by 11:30 AM',
            remainingKm: 420,
            driverName: 'Ramesh Yadav',
            driverPhone: '+91 98765 43210',
            vehicleNo: 'GJ-01-XY-9876'
          }
        };
      }
      // 2. TARIFF / FREIGHT QUOTE QUERY
      else if (q.includes('rate') || q.includes('bhav') || q.includes('quote') || q.includes('price') || q.includes('ton') || q.includes('pune') || q.includes('delhi') || q.includes('mumbai') || q.includes('bangalore') || q.includes('wheeler')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Official freight rate calculated based on live diesel index & national highway toll tariffs:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cardType: 'tariff_quote',
          cardData: {
            origin: 'Delhi NCR Logistics Hub',
            destination: 'Pune Industrial Area (1,420 KM)',
            vehicleType: '16-Wheeler 20-Ton FTL Container',
            baseFreight: 48500,
            fuelSurcharge: 5577,
            tollHandling: 3200,
            gst18: 10310,
            netTotal: 67587,
            estimatedTransitHours: '42 - 48 Hours',
            validUntil: 'Locked for next 48 Hours'
          }
        };
      }
      // 3. INVOICE REQUEST
      else if (q.includes('invoice') || q.includes('gst') || q.includes('tax') || q.includes('bill')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Here is your official GST Tax Invoice copy with NIC E-Invoice IRN & QR verification:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cardType: 'invoice_doc',
          cardData: {
            invoiceNo: 'INV-2026-104',
            clientName: 'Tata AutoComp Systems Ltd',
            irnNumber: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
            totalAmount: 67587,
            gstAmount: 10310,
            status: 'NIC Verified & Digitally Signed'
          }
        };
      }
      // 4. BILTY DOCUMENT REQUEST
      else if (q.includes('document') || q.includes('copy') || q.includes('lr copy') || q.includes('pod') || q.includes('paper')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Here is your official stamped & signed Consignment Note (Bilty) ready for 1-tap download:`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cardType: 'bilty_doc',
          cardData: {
            biltyNo: 'LR-2410-8891',
            consignor: 'Tata Motors Ancillary Hub, Delhi',
            consignee: 'Pune Assembly Plant, Dock #4',
            weightKg: 18500,
            packages: 120,
            sealNo: 'ASK-SEAL-8991'
          }
        };
      }
      // 5. ESCALATION / HUMAN AGENT
      else if (q.includes('agent') || q.includes('human') || q.includes('call') || q.includes('complaint') || q.includes('help')) {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Connecting you to ASK Transport Senior Operations Desk. Priority Token generated: *#ESC-4401*. Support manager is joining within 60 seconds.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cardType: 'escalation',
          cardData: {
            ticketId: 'ESC-4401',
            priority: 'High Priority',
            supportManager: 'Kunal Sharma (HQ Operations Desk)',
            phone: '+91 98100 24000'
          }
        };
      }
      // 6. DEFAULT NATURAL FALLBACK
      else {
        botResponse = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `Namaste! 🙏 I can assist you 24×7 with:\n\n1️⃣ Send *Track [Bilty No]* for Live GPS\n2️⃣ Send *[Origin] to [Destination] [Tonnage]* for instant Quote\n3️⃣ Send *Bilty* or *Invoice* to download signed PDFs\n4️⃣ Send *Agent* to speak with our support manager.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }

      setMessages(prev => [...prev, botResponse]);
    }, 850);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    processQuery(inputText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#075e54',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 99999,
            fontSize: '13px',
            fontWeight: 700,
            borderLeft: '4px solid #25D366'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* HERO BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #075e54 0%, #128c7e 50%, #25D366 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px -5px rgba(18, 140, 126, 0.4)'
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.6px',
              marginBottom: '8px'
            }}
          >
            <span>💬</span> 24×7 AUTONOMOUS WHATSAPP AI LOGISTICS AGENT
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            WhatsApp AI Logistics Bot (Consignee &amp; Shipper Self-Service)
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#e8f5e9', lineHeight: 1.5 }}>
            Empowers shippers and consignees to track live GPS bilty locations, calculate instant multi-axle freight quotations, and download stamped LR copies and GST tax invoices 24×7 directly on WhatsApp without calling support.
          </p>
        </div>

        {/* METRICS PILL */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(6px)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>82%</div>
            <div style={{ fontSize: '11px', color: '#dcfce7', fontWeight: 700 }}>Call Volume Cut</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(6px)', padding: '12px 18px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900 }}>&lt; 1.2s</div>
            <div style={{ fontSize: '11px', color: '#dcfce7', fontWeight: 700 }}>AI Response SLA</div>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="bot-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`bot-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
        >
          <span>📱</span> WhatsApp Interactive Simulator Preview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live_chats')}
          className={`bot-tab-btn ${activeTab === 'live_chats' ? 'active' : ''}`}
        >
          <span>💬</span> Live Inbound WhatsApp Feed ({RECENT_CUSTOMER_SESSIONS.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bot_config')}
          className={`bot-tab-btn ${activeTab === 'bot_config' ? 'active' : ''}`}
        >
          <span>⚙️</span> NLP Trigger &amp; Template Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api_telemetry')}
          className={`bot-tab-btn ${activeTab === 'api_telemetry' ? 'active' : ''}`}
        >
          <span>⚡</span> Meta Cloud API &amp; Webhook Gateway
        </button>
      </div>

      {/* TAB 1: WHATSAPP INTERACTIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: '24px', alignItems: 'flex-start' }}>
          {/* PHONE FRAME */}
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              height: '680px',
              background: '#0b141a',
              borderRadius: '36px',
              border: '8px solid #1f2c34',
              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* WHATSAPP TOP BAR */}
            <div
              style={{
                background: '#1f2c34',
                padding: '14px 16px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #128c7e 0%, #25D366 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '16px',
                  color: '#ffffff'
                }}
              >
                🚚
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '14px', letterSpacing: '0.2px' }}>ASK Transport AI</strong>
                  <span style={{ color: '#25D366', fontSize: '13px' }} title="Meta Verified Business Account">
                    ☑️
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#8696a0' }}>
                  {isTyping ? 'typing...' : '🟢 Online 24×7 Logistics Assistant'}
                </div>
              </div>

              <div style={{ fontSize: '16px', color: '#8696a0', cursor: 'pointer' }}>⋮</div>
            </div>

            {/* CHAT MESSAGES BODY */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: '#0b141a',
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            >
              <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
                <span style={{ background: '#182229', color: '#8696a0', fontSize: '10px', padding: '3px 10px', borderRadius: '6px', letterSpacing: '0.3px' }}>
                  🔒 End-to-end encrypted by Meta Cloud API
                </span>
              </div>

              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isUser ? '#005c4b' : '#202c33',
                      color: '#e9edef',
                      padding: '8px 12px',
                      borderRadius: isUser ? '10px 10px 0 10px' : '10px 10px 10px 0',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      fontSize: '12.5px',
                      lineHeight: 1.45,
                      wordBreak: 'break-word'
                    }}
                  >
                    <div>{msg.text}</div>

                    {/* CARD: LIVE TRACKING */}
                    {msg.cardType === 'tracking' && msg.cardData && (
                      <div style={{ marginTop: '8px', background: '#111b21', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#38bdf8' }}>{msg.cardData.lrNo}</span>
                          <span style={{ color: '#25D366', fontSize: '11px', fontWeight: 700 }}>{msg.cardData.status}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1' }}>
                          📍 <strong>Location:</strong> {msg.cardData.currentLocation}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1', marginTop: '2px' }}>
                          ⏱️ <strong>ETA:</strong> {msg.cardData.eta} ({msg.cardData.remainingKm} KM remaining)
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1', marginTop: '2px' }}>
                          👨‍✈️ <strong>Driver:</strong> {msg.cardData.driverName} ({msg.cardData.driverPhone})
                        </div>
                        <a
                          href={`https://maps.google.com/?q=${msg.cardData.gpsCoords.lat},${msg.cardData.gpsCoords.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'block',
                            marginTop: '8px',
                            padding: '6px',
                            background: '#00a884',
                            color: '#111b21',
                            textAlign: 'center',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontWeight: 800,
                            fontSize: '11px'
                          }}
                        >
                          🗺️ Open Live Google Maps Route
                        </a>
                      </div>
                    )}

                    {/* CARD: TARIFF QUOTE */}
                    {msg.cardType === 'tariff_quote' && msg.cardData && (
                      <div style={{ marginTop: '8px', background: '#111b21', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#f59e0b' }}>OFFICIAL FREIGHT QUOTE</span>
                          <span style={{ color: '#8696a0', fontSize: '10px' }}>{msg.cardData.validUntil}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1' }}>
                          🛣️ <strong>Route:</strong> {msg.cardData.origin} ➔ {msg.cardData.destination}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1', marginTop: '2px' }}>
                          🚛 <strong>Vehicle:</strong> {msg.cardData.vehicleType}
                        </div>
                        <div style={{ marginTop: '6px', padding: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
                          <div>Base Freight: ₹{msg.cardData.baseFreight.toLocaleString('en-IN')}</div>
                          <div>Fuel Surcharge (11.5%): ₹{msg.cardData.fuelSurcharge.toLocaleString('en-IN')}</div>
                          <div>Toll &amp; Handling: ₹{msg.cardData.tollHandling.toLocaleString('en-IN')}</div>
                          <div>GST (18%): ₹{msg.cardData.gst18.toLocaleString('en-IN')}</div>
                          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, color: '#25D366', fontSize: '13px' }}>
                            Net Total: ₹{msg.cardData.netTotal.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('✓ Official PDF Freight Quotation generated and downloaded!')}
                          style={{
                            width: '100%',
                            marginTop: '8px',
                            padding: '6px',
                            background: '#0b72e7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          📄 Download Official PDF Quotation
                        </button>
                      </div>
                    )}

                    {/* CARD: BILTY DOC */}
                    {msg.cardType === 'bilty_doc' && msg.cardData && (
                      <div style={{ marginTop: '8px', background: '#111b21', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#38bdf8' }}>📑 DIGITAL BILTY (LR)</span>
                          <span style={{ color: '#25D366', fontSize: '10px' }}>STAMPED &amp; VERIFIED</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1' }}>
                          Bilty No: <strong>{msg.cardData.biltyNo}</strong>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1' }}>
                          Weight: {msg.cardData.weightKg} KG • {msg.cardData.packages} Pkgs
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('✓ Stamped Bilty (LR) PDF downloaded successfully!')}
                          style={{
                            width: '100%',
                            marginTop: '8px',
                            padding: '6px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          📥 Download Stamped Bilty PDF
                        </button>
                      </div>
                    )}

                    {/* CARD: INVOICE DOC */}
                    {msg.cardType === 'invoice_doc' && msg.cardData && (
                      <div style={{ marginTop: '8px', background: '#111b21', borderRadius: '8px', padding: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#10b981' }}>💳 GST TAX INVOICE</span>
                          <span style={{ color: '#38bdf8', fontSize: '10px' }}>NIC IRN SYNCED</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1' }}>
                          Invoice: <strong>{msg.cardData.invoiceNo}</strong>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#aebac1' }}>
                          Amount: ₹{msg.cardData.totalAmount.toLocaleString('en-IN')} (GST: ₹{msg.cardData.gstAmount.toLocaleString('en-IN')})
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('✓ Official GST Tax Invoice PDF downloaded!')}
                          style={{
                            width: '100%',
                            marginTop: '8px',
                            padding: '6px',
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 800,
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          📥 Download GST E-Invoice PDF
                        </button>
                      </div>
                    )}

                    <div style={{ fontSize: '10px', color: '#8696a0', textAlign: 'right', marginTop: '4px' }}>
                      {msg.time} {isUser && '✓✓'}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#202c33', padding: '8px 14px', borderRadius: '10px', color: '#25D366', fontSize: '12px' }}>
                  AI Assistant is typing... 💬
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK SAMPLE BUTTON CHIPS */}
            <div style={{ background: '#182229', padding: '8px', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                type="button"
                onClick={() => processQuery('Track LR-2410-8891')}
                style={{ background: '#202c33', color: '#38bdf8', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}
              >
                📍 Track Bilty
              </button>
              <button
                type="button"
                onClick={() => processQuery('Delhi to Pune 20 Ton 16-Wheeler ka rate kya hai?')}
                style={{ background: '#202c33', color: '#f59e0b', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}
              >
                💰 Delhi-Pune Rate
              </button>
              <button
                type="button"
                onClick={() => processQuery('Bilty copy download karni hai')}
                style={{ background: '#202c33', color: '#059669', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}
              >
                📄 Get Bilty
              </button>
              <button
                type="button"
                onClick={() => processQuery('Send GST Tax Invoice')}
                style={{ background: '#202c33', color: '#a78bfa', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}
              >
                💳 Get Invoice
              </button>
            </div>

            {/* INPUT BAR */}
            <div style={{ background: '#202c33', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type a query (e.g. rate, bilty, track)..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  background: '#2a3942',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '9px 14px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#00a884',
                  border: 'none',
                  color: '#111b21',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 900
                }}
              >
                ➤
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: BUSINESS ADVANTAGES & LIVE METRICS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* VALUE PROPOSITION CARD */}
            <div className="bot-card">
              <h3 className="bot-card-title">
                <span>🚀</span> Why Shippers &amp; Consignees Love This AI Bot
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '16px' }}>
                <div className="bot-rule-item">
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📍</div>
                  <strong className="bot-rule-name" style={{ color: '#0284c7' }}>Instant 1-Tap Tracking</strong>
                  <p className="bot-rule-detail">
                    Customers type LR number and receive live Google Maps radar coordinates, remaining KM, and driver contact instantly.
                  </p>
                </div>

                <div className="bot-rule-item">
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>💰</div>
                  <strong className="bot-rule-name" style={{ color: '#d97706' }}>Algorithmic Freight Quotes</strong>
                  <p className="bot-rule-detail">
                    Instant natural language parsing: calculates base freight, fuel surcharge, toll and GST, plus delivers an official PDF.
                  </p>
                </div>

                <div className="bot-rule-item">
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>📄</div>
                  <strong className="bot-rule-name" style={{ color: '#059669' }}>Stamped Bilty &amp; Tax Invoice</strong>
                  <p className="bot-rule-detail">
                    Consignees download signed proof of delivery and IRN tax invoices directly on WhatsApp without office follow-ups.
                  </p>
                </div>

                <div className="bot-rule-item">
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>🛡️</div>
                  <strong className="bot-rule-name" style={{ color: '#6366f1' }}>24×7 Zero Call Center Load</strong>
                  <p className="bot-rule-detail">
                    Automates 80%+ of repetitive "Gadi kahan hai?" calls, freeing operations managers for profitable load generation.
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE KPI COUNTER */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Monthly Cost Savings</span>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                  ₹1,45,000 Saved
                </div>
                <div style={{ fontSize: '12px', color: '#166534' }}>
                  By eliminating 4 customer support shift operators
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('✓ WhatsApp Business Webhook simulated: Meta API ping 200 OK')}
                style={{
                  padding: '10px 18px',
                  background: '#075e54',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📡 Test Live Webhook Ping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE INBOUND CHAT STREAM */}
      {activeTab === 'live_chats' && (
        <div className="bot-table-container">
          <div className="bot-table-head-strip">
            <h3 className="bot-card-title" style={{ margin: 0 }}>
              <span>💬</span> Inbound WhatsApp Customer Queries (Live Stream)
            </h3>
            <span style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
              ● 24×7 AI Auto-Answering Active
            </span>
          </div>

          <table className="bot-table">
            <thead>
              <tr>
                <th className="bot-th">Customer &amp; Company</th>
                <th className="bot-th">Phone</th>
                <th className="bot-th">Last WhatsApp Query</th>
                <th className="bot-th">Detected Intent</th>
                <th className="bot-th">Resolution Status</th>
                <th className="bot-th">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_CUSTOMER_SESSIONS.map(session => (
                <tr key={session.id}>
                  <td className="bot-td">
                    <div style={{ fontWeight: 800 }}>{session.customerName}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary, #64748b)', marginTop: '2px' }}>
                      🏢 {session.companyName}
                    </div>
                  </td>
                  <td className="bot-td" style={{ fontWeight: 700 }}>
                    {session.customerPhone}
                  </td>
                  <td className="bot-td">
                    💬 <em style={{ fontStyle: 'normal' }}>"{session.lastQuery}"</em>
                  </td>
                  <td className="bot-td">
                    <span className="bot-code-pill" style={{ fontSize: '11px' }}>
                      {session.intent}
                    </span>
                  </td>
                  <td className="bot-td">
                    <span
                      style={{
                        background: session.status === 'Auto-Resolved' ? '#dcfce7' : '#fee2e2',
                        color: session.status === 'Auto-Resolved' ? '#15803d' : '#b91c1c',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800
                      }}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="bot-td" style={{ color: 'var(--text-secondary, #64748b)', whiteSpace: 'nowrap' }}>
                    {session.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BOT RULES & CONFIG */}
      {activeTab === 'bot_config' && (
        <div className="bot-rules-grid">
          {/* LEFT: NLP INTENT MATCHERS */}
          <div className="bot-card">
            <h3 className="bot-card-title">
              <span>🤖</span> NLP Intent Matchers &amp; Keywords
            </h3>
            <div className="bot-rules-list">
              <div className="bot-rule-item">
                <strong className="bot-rule-name" style={{ color: '#0284c7' }}>
                  1. Live Odometer Tracking
                </strong>
                <div className="bot-rule-detail">
                  <span style={{ fontWeight: 700 }}>Regex:</span> <code className="bot-code-pill">LR-\d{4}-\d{4}</code>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontWeight: 700 }}>Keywords:</span> <span className="bot-keywords-text">track, bilty status, gadi kahan hai, live location</span>
                  </div>
                </div>
              </div>

              <div className="bot-rule-item">
                <strong className="bot-rule-name" style={{ color: '#d97706' }}>
                  2. Multi-Axle Tariff Quotation
                </strong>
                <div className="bot-rule-detail">
                  <span style={{ fontWeight: 700 }}>Keywords:</span> <span className="bot-keywords-text">rate, bhav, quotation, per ton, 16-wheeler, 20-ton, delhi to pune, freight cost</span>
                </div>
              </div>

              <div className="bot-rule-item">
                <strong className="bot-rule-name" style={{ color: '#059669' }}>
                  3. Digital Bilty &amp; Tax Invoice Dispenser
                </strong>
                <div className="bot-rule-detail">
                  <span style={{ fontWeight: 700 }}>Keywords:</span> <span className="bot-keywords-text">bilty copy, stamped bilty, gst invoice, tax invoice, pod, e-invoice irn</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AUTOMATED BROADCAST TRIGGERS */}
          <div className="bot-card">
            <h3 className="bot-card-title">
              <span>⚡</span> Automated Broadcast Triggers
            </h3>
            <div className="bot-triggers-list">
              <label className="bot-trigger-label" onClick={() => toggleTrigger('departHub')}>
                <input
                  type="checkbox"
                  checked={triggers.departHub}
                  onChange={() => {}}
                  className="bot-trigger-checkbox"
                />
                <span className="bot-trigger-text">
                  Auto-dispatch WhatsApp link when Vehicle departs loading hub
                </span>
              </label>

              <label className="bot-trigger-label" onClick={() => toggleTrigger('otpConsignee')}>
                <input
                  type="checkbox"
                  checked={triggers.otpConsignee}
                  onChange={() => {}}
                  className="bot-trigger-checkbox"
                />
                <span className="bot-trigger-text">
                  Send 4-digit Delivery OTP to Consignee 1 hour before arrival
                </span>
              </label>

              <label className="bot-trigger-label" onClick={() => toggleTrigger('podSignature')}>
                <input
                  type="checkbox"
                  checked={triggers.podSignature}
                  onChange={() => {}}
                  className="bot-trigger-checkbox"
                />
                <span className="bot-trigger-text">
                  Send Stamped POD Bilty PDF once driver uploads delivery signature
                </span>
              </label>

              <label className="bot-trigger-label" onClick={() => toggleTrigger('billingAlert')}>
                <input
                  type="checkbox"
                  checked={triggers.billingAlert}
                  onChange={() => {}}
                  className="bot-trigger-checkbox"
                />
                <span className="bot-trigger-text">
                  Automated 15/30-Day billing statement alert with payment UPI link
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API TELEMETRY */}
      {activeTab === 'api_telemetry' && (
        <div className="bot-card">
          <h3 className="bot-card-title">
            <span>⚡</span> Meta Cloud WhatsApp API Gateway Configuration
          </h3>
          <div className="bot-telemetry-grid">
            <div className="bot-telemetry-card">
              <div className="bot-telemetry-title">WhatsApp Business Number</div>
              <div className="bot-telemetry-val">+91 98100 24000</div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 800, marginTop: '4px' }}>
                ● Verified Green Tick Official Channel
              </div>
            </div>

            <div className="bot-telemetry-card">
              <div className="bot-telemetry-title">Webhook Callback URL</div>
              <div className="bot-telemetry-val" style={{ fontSize: '13.5px', color: '#0284c7' }}>
                https://api.asktransport.com/api/webhook/whatsapp
              </div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 800, marginTop: '4px' }}>
                ● Status: Listening (200 OK)
              </div>
            </div>

            <div className="bot-telemetry-card">
              <div className="bot-telemetry-title">AI NLP Orchestrator</div>
              <div className="bot-telemetry-val">Gemini 1.5 Flash Intent Router</div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: 800, marginTop: '4px' }}>
                ● Avg Latency: 840ms
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
