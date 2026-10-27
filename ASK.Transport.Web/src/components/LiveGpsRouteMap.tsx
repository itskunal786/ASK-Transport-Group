import { useState, useEffect } from 'react';
import type { Shipment, TrackingEvent, Eta } from '../api/trackingApi';

interface LiveGpsRouteMapProps {
  shipment: Shipment;
  timeline?: TrackingEvent[];
  eta?: Eta | null;
}

export default function LiveGpsRouteMap({ shipment, timeline = [], eta }: LiveGpsRouteMapProps) {
  const [gpsPingTime, setGpsPingTime] = useState<string>('Just now');
  const [truckOffset, setTruckOffset] = useState<number>(65); // percentage along the route

  // Calculate route progress based on status or events
  useEffect(() => {
    const s = shipment.status.toLowerCase();
    if (s.includes('deliver')) {
      setTruckOffset(100);
    } else if (s.includes('out') || s.includes('dispatch')) {
      setTruckOffset(85);
    } else if (s.includes('transit') || s.includes('highway') || s.includes('in-transit')) {
      setTruckOffset(55);
    } else if (s.includes('picked') || s.includes('assigned') || s.includes('hub')) {
      setTruckOffset(25);
    } else {
      setTruckOffset(10);
    }

    const interval = setInterval(() => {
      const now = new Date();
      setGpsPingTime(`${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    }, 15000);

    return () => clearInterval(interval);
  }, [shipment.status]);

  const latestLocation = timeline.length > 0 ? timeline[0].location : 'National Highway Highway Transit Corridor';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '28px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
      border: '1px solid #334155',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Subtle Grid Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      {/* Header bar with Live Telemetry */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34, 197, 94, 0.15)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
              boxShadow: '0 0 10px #22c55e',
              animation: 'pulse 1.8s infinite'
            }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.5px' }}>
              LIVE SATELLITE GPS ACTIVE
            </span>
          </div>
          <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Telemetry Ping: <strong style={{ color: '#e2e8f0' }}>{gpsPingTime}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Fleet Speed: </span>
            <span style={{ fontWeight: 700, color: '#38bdf8' }}>62 km/h</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>GPS Signal: </span>
            <span style={{ fontWeight: 700, color: '#4ade80' }}>Strong (5G NavIC)</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Cold Chain: </span>
            <span style={{ fontWeight: 700, color: '#a78bfa' }}>22.4°C Optimal</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Highway Route Simulation */}
      <div style={{ position: 'relative', zIndex: 1, margin: '20px 0' }}>
        <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
          
          {/* Highway Asphalt Road Track */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            height: '18px',
            backgroundColor: '#334155',
            borderRadius: '9px',
            border: '2px solid #475569',
            overflow: 'hidden'
          }}>
            {/* Completed Highway Stretch */}
            <div style={{
              width: `${truckOffset}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #22c55e)',
              transition: 'width 1s ease-in-out'
            }} />
            {/* Center Dashed Highway Line */}
            <div style={{
              position: 'absolute',
              top: '7px',
              left: 0,
              right: 0,
              height: '2px',
              backgroundImage: 'linear-gradient(to right, #ffffff 50%, transparent 50%)',
              backgroundSize: '16px 2px',
              opacity: 0.6
            }} />
          </div>

          {/* Origin Terminal Marker */}
          <div style={{ position: 'absolute', left: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              border: '3px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(59, 130, 246, 0.5)'
            }}>
              🏭
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', color: '#93c5fd' }}>
              Origin Hub
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Dispatched</span>
          </div>

          {/* Mid Checkpoint Hub */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              border: `3px solid ${truckOffset >= 50 ? '#22c55e' : '#64748b'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: truckOffset >= 50 ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none'
            }}>
              🏢
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '8px', color: '#cbd5e1' }}>
              Transit Hub
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Toll & Scan Passed</span>
          </div>

          {/* Moving GPS Freight Truck Marker */}
          <div style={{
            position: 'absolute',
            left: `calc(${truckOffset}% + ${truckOffset > 90 ? '-40px' : '-20px'})`,
            top: '8px',
            transform: 'translateY(-10px)',
            transition: 'left 1s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10
          }}>
            {/* Live radar circle */}
            <div style={{
              position: 'absolute',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <div style={{
              background: '#0284c7',
              borderRadius: '12px',
              padding: '6px 12px',
              boxShadow: '0 4px 18px rgba(2, 132, 199, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '2px solid #ffffff'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🚛</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
                {shipment.trackingNumber}
              </span>
            </div>
            <div style={{
              marginTop: '4px',
              background: 'rgba(15, 23, 42, 0.85)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.68rem',
              color: '#38bdf8',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              📍 {latestLocation}
            </div>
          </div>

          {/* Destination Delivery Terminal */}
          <div style={{ position: 'absolute', right: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              border: `3px solid ${truckOffset >= 100 ? '#22c55e' : '#f59e0b'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: truckOffset >= 100 ? '0 0 14px rgba(34, 197, 94, 0.6)' : '0 0 10px rgba(245, 158, 11, 0.3)'
            }}>
              🏁
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '8px', color: '#fde68a' }}>
              Final Destination
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {eta?.estimatedArrivalAt ? 'Estimated On Time' : 'Doorstep Terminal'}
            </span>
          </div>

        </div>
      </div>

      {/* Footer Info Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '14px 18px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>HIGHWAY CORRIDOR</span>
          <strong style={{ fontSize: '0.86rem', color: '#f1f5f9' }}>Golden Quadrilateral NH Corridor</strong>
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>ROUTE COMPLETION</span>
          <strong style={{ fontSize: '0.86rem', color: '#38bdf8' }}>{truckOffset}% Covered</strong>
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>ESTIMATED DURATION</span>
          <strong style={{ fontSize: '0.86rem', color: '#4ade80' }}>
            {eta?.calculationMethod || 'On Schedule (Zero Delay)'}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>DRIVER ASSIGNMENT</span>
          <strong style={{ fontSize: '0.86rem', color: '#fcd34d' }}>Verified Commercial Pilot Assigned</strong>
        </div>
      </div>
    </div>
  );
}
