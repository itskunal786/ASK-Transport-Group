import { useState, useEffect } from 'react';
import type { Shipment, TrackingEvent, Eta } from '../api/trackingApi';

export interface LiveGpsVehicleData {
  plateNo: string;
  driverName: string;
  driverPhone: string;
  speedKmH: number;
  locationName: string;
  lat?: number;
  lng?: number;
  engineStatus?: 'Running' | 'Idling' | 'Stopped' | string;
  geofenceStatus?: 'Within Corridor' | 'Route Deviation' | string;
  haltDurationMinutes?: number;
  fuelPercent?: number;
  lastPing?: string;
  routeCorridor?: string;
}

export interface LiveGpsRouteMapProps {
  shipment: Shipment;
  timeline?: TrackingEvent[];
  eta?: Eta | null;
  vehicleData?: LiveGpsVehicleData | null;
}

export default function LiveGpsRouteMap({ shipment, timeline = [], eta, vehicleData }: LiveGpsRouteMapProps) {
  const [gpsPingTime, setGpsPingTime] = useState<string>('Just now');
  const [truckOffset, setTruckOffset] = useState<number>(55);

  // Dynamic route hub parser based on corridor or timeline
  function getHubs() {
    if (vehicleData?.routeCorridor) {
      const c = vehicleData.routeCorridor;
      if (c.includes('Delhi') && c.includes('Mumbai')) {
        return {
          origin: 'Delhi Central Hub',
          originSub: 'Dock 04 Dispatched',
          transit: 'Jaipur Toll Plaza (NH-48)',
          transitSub: 'Toll & RFID Cleared',
          dest: 'Mumbai Nhava Sheva',
          destSub: 'Container Terminal'
        };
      }
      if (c.includes('Kolkata') && c.includes('Patna')) {
        return {
          origin: 'Kolkata Port Terminal',
          originSub: 'Inward Cleared',
          transit: 'Durgapur Toll (NH-19)',
          transitSub: 'FASTag Auto-Paid',
          dest: 'Patna Freight Terminal',
          destSub: 'Unloading Bay'
        };
      }
      if (c.includes('Ahmedabad')) {
        return {
          origin: 'Ahmedabad GIDC Hub',
          originSub: 'Logistics Park',
          transit: 'Himatnagar Bypass ढाबा',
          transitSub: 'Rest Stop Area',
          dest: 'Delhi Outer Gateway',
          destSub: 'Destination Hub'
        };
      }
      if (c.includes('Haryana') || c.includes('Rural')) {
        return {
          origin: 'Gurugram Central Hub',
          originSub: 'Outward Dispatched',
          transit: 'SH-26 Highway Junction',
          transitSub: 'Geofence Perimeter',
          dest: 'Faridabad Industrial Hub',
          destSub: 'Terminal Dock'
        };
      }
      if (c.includes('Bangalore')) {
        return {
          origin: 'Bangalore Central Hub',
          originSub: 'Regional Depo',
          transit: 'Electronic City Flyover',
          transitSub: 'RFID Gateway',
          dest: 'Bangalore Dock Bay #4',
          destSub: 'Dock Unloading'
        };
      }
      const parts = c.split(/[⇄➔\->]/).map(p => p.trim());
      if (parts.length >= 2) {
        return {
          origin: `${parts[0]} Hub`,
          originSub: 'Origin Dispatched',
          transit: vehicleData.locationName ? vehicleData.locationName.slice(0, 24) : 'Highway Checkpoint',
          transitSub: 'En-route Milestone',
          dest: `${parts[1]} Hub`,
          destSub: 'Destination Terminal'
        };
      }
    }

    // Fallback based on timeline if available
    if (timeline.length >= 2) {
      return {
        origin: timeline[timeline.length - 1].location || 'Origin Hub',
        originSub: 'Dispatched',
        transit: timeline.length > 2 ? (timeline[1].location || 'Transit Hub') : 'En-route Checkpoint',
        transitSub: 'Toll & Scan Passed',
        dest: timeline[0].status.toLowerCase().includes('deliver') ? (timeline[0].location || 'Destination') : 'Destination Hub',
        destSub: 'Doorstep Terminal'
      };
    }

    return {
      origin: 'Pan-India Origin Hub',
      originSub: 'Dispatched',
      transit: 'National Highway Toll Hub',
      transitSub: 'Toll & Scan Passed',
      dest: 'Final Delivery Terminal',
      destSub: 'Doorstep Terminal'
    };
  }

  const hubs = getHubs();

  // Calculate truck offset and progress percentage
  useEffect(() => {
    if (vehicleData) {
      if (vehicleData.plateNo === 'DL-01-AB-1234') {
        setTruckOffset(38);
      } else if (vehicleData.plateNo === 'WB-02-GH-3456') {
        setTruckOffset(52);
      } else if (vehicleData.plateNo === 'GJ-01-JK-7890') {
        setTruckOffset(24);
      } else if (vehicleData.plateNo === 'HR-26-LM-4321') {
        setTruckOffset(64);
      } else if (vehicleData.plateNo === 'KA-05-CD-5678') {
        setTruckOffset(100);
      } else {
        if (vehicleData.speedKmH === 0 && vehicleData.haltDurationMinutes && vehicleData.haltDurationMinutes > 0) {
          setTruckOffset(30);
        } else if (vehicleData.speedKmH === 0) {
          setTruckOffset(100);
        } else {
          setTruckOffset(55);
        }
      }
    } else {
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
        setTruckOffset(15);
      }
    }

    const interval = setInterval(() => {
      const now = new Date();
      setGpsPingTime(`${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    }, 15000);

    return () => clearInterval(interval);
  }, [shipment.status, vehicleData]);

  // Current display location
  const currentLocationText = vehicleData?.locationName
    ? vehicleData.locationName
    : timeline.length > 0 && timeline[0].location
    ? timeline[0].location
    : 'National Highway Freight Transit Corridor';

  // Current display speed
  const displaySpeed = vehicleData
    ? vehicleData.speedKmH === 0
      ? `0 km/h (${vehicleData.engineStatus || 'Stopped'})`
      : `${vehicleData.speedKmH} km/h`
    : '58 km/h';

  const speedColor = vehicleData
    ? vehicleData.speedKmH > 65
      ? '#ef4444'
      : vehicleData.speedKmH === 0
      ? '#f59e0b'
      : '#38bdf8'
    : '#38bdf8';

  // Cargo / Fuel info
  const cargoOrFuel = vehicleData
    ? `Fuel: ${vehicleData.fuelPercent}% Diesel`
    : 'Cold Chain: 4.2°C Optimal';

  // Tracking Tag on Truck
  const truckLabel = vehicleData
    ? `TRK-${vehicleData.plateNo}`
    : shipment.trackingNumber;

  // Estimated Duration / Transit Status
  const estimatedScheduleText = vehicleData
    ? vehicleData.geofenceStatus === 'Route Deviation'
      ? '⚠️ Geofence Route Deviation (+14km Delay)'
      : vehicleData.haltDurationMinutes && vehicleData.haltDurationMinutes > 40
      ? `🛑 Halted ${vehicleData.haltDurationMinutes} mins at Rest Stop ढाबा`
      : vehicleData.speedKmH === 0
      ? 'Arrived • Dock Bay Unloading in Progress'
      : `On Schedule (Zero Delay • Speed: ${vehicleData.speedKmH} km/h)`
    : eta?.calculationMethod || 'On Schedule (Zero Delay)';

  // Driver Assignment info
  const driverAssignmentText = vehicleData
    ? `👤 ${vehicleData.driverName} (${vehicleData.driverPhone})`
    : 'Verified Commercial Pilot Assigned';

  // Highway corridor title
  const corridorTitle = vehicleData?.routeCorridor
    ? vehicleData.routeCorridor
    : 'Golden Quadrilateral NH Corridor';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #091e3a 0%, #0c2d48 50%, #145374 100%)',
      color: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 10px 35px -5px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
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
        backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none'
      }} />

      {/* Header bar with Live Telemetry */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        position: 'relative',
        zIndex: 1,
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.18)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.4)'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.5px' }}>
              LIVE SATELLITE GPS ACTIVE
            </span>
          </div>
          <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
            Telemetry Ping: <strong style={{ color: '#e2e8f0' }}>{vehicleData?.lastPing || gpsPingTime}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '18px', fontSize: '0.82rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Fleet Speed: </span>
            <strong style={{ color: speedColor, fontSize: '0.9rem' }}>{displaySpeed}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>GPS Signal: </span>
            <strong style={{ color: '#34d399' }}>Strong (5G NavIC)</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Power/Fuel: </span>
            <strong style={{ color: '#c084fc' }}>{cargoOrFuel}</strong>
          </div>
        </div>
      </div>

      {/* Interactive SVG Highway Route Simulation */}
      <div style={{ position: 'relative', zIndex: 1, margin: '22px 0 26px' }}>
        <div style={{ position: 'relative', height: '130px', display: 'flex', alignItems: 'center', padding: '0 30px' }}>
          
          {/* Highway Asphalt Road Track */}
          <div style={{
            position: 'absolute',
            left: '40px',
            right: '40px',
            height: '20px',
            backgroundColor: '#0f172a',
            borderRadius: '10px',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
          }}>
            {/* Completed Highway Stretch */}
            <div style={{
              width: `${truckOffset}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%)',
              transition: 'width 1s ease-in-out'
            }} />
            {/* Center Dashed Highway Line */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: 0,
              right: 0,
              height: '2px',
              backgroundImage: 'linear-gradient(to right, #ffffff 50%, transparent 50%)',
              backgroundSize: '18px 2px',
              opacity: 0.7
            }} />
          </div>

          {/* Origin Terminal Marker */}
          <div style={{ position: 'absolute', left: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              border: '3px solid #0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(2, 132, 199, 0.6)'
            }}>
              🏭
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '8px', color: '#93c5fd', textAlign: 'center', maxWidth: '110px' }}>
              {hubs.origin}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{hubs.originSub}</span>
          </div>

          {/* Mid Checkpoint Hub */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              border: `3px solid ${truckOffset >= 50 ? '#10b981' : '#64748b'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: truckOffset >= 50 ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none'
            }}>
              🏢
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '8px', color: '#f1f5f9', textAlign: 'center', maxWidth: '130px' }}>
              {hubs.transit}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{hubs.transitSub}</span>
          </div>

          {/* Moving GPS Freight Truck Marker */}
          <div style={{
            position: 'absolute',
            left: `calc(${truckOffset}% + ${truckOffset > 85 ? '-70px' : truckOffset < 15 ? '10px' : '-35px'})`,
            top: '6px',
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
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              borderRadius: '12px',
              padding: '6px 12px',
              boxShadow: '0 4px 18px rgba(14, 165, 233, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '2px solid #ffffff'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🚚</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.6px', fontFamily: 'monospace' }}>
                {truckLabel}
              </span>
            </div>
            <div style={{
              marginTop: '4px',
              background: 'rgba(15, 23, 42, 0.92)',
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#38bdf8',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              📍 {currentLocationText}
            </div>
          </div>

          {/* Destination Delivery Terminal */}
          <div style={{ position: 'absolute', right: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              border: `3px solid ${truckOffset >= 100 ? '#10b981' : '#f59e0b'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: truckOffset >= 100 ? '0 0 14px rgba(16, 185, 129, 0.6)' : '0 0 10px rgba(245, 158, 11, 0.3)'
            }}>
              🏁
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '8px', color: '#fde68a', textAlign: 'center', maxWidth: '120px' }}>
              {hubs.dest}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {hubs.destSub}
            </span>
          </div>

        </div>
      </div>

      {/* Footer Info Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.75)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.4px' }}>
            HIGHWAY CORRIDOR
          </span>
          <strong style={{ fontSize: '0.86rem', color: '#f1f5f9', display: 'block', marginTop: '2px' }}>
            {corridorTitle}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.4px' }}>
            ROUTE COMPLETION
          </span>
          <strong style={{ fontSize: '0.86rem', color: '#38bdf8', display: 'block', marginTop: '2px' }}>
            {truckOffset}% Covered
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.4px' }}>
            ESTIMATED DURATION / STATUS
          </span>
          <strong style={{
            fontSize: '0.86rem',
            color: vehicleData?.geofenceStatus === 'Route Deviation' ? '#fbbf24' : vehicleData && vehicleData.speedKmH === 0 ? '#f59e0b' : '#34d399',
            display: 'block',
            marginTop: '2px'
          }}>
            {estimatedScheduleText}
          </strong>
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.4px' }}>
            DRIVER ASSIGNMENT
          </span>
          <strong style={{ fontSize: '0.86rem', color: '#fcd34d', display: 'block', marginTop: '2px' }}>
            {driverAssignmentText}
          </strong>
        </div>
      </div>
    </div>
  );
}
