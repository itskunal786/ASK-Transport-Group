import { useState, useEffect } from 'react';
import { getFleetTyres, inflateTyre, sendTyreForColdRetread } from '../api/tyreApi';

// ============================================================================
// TYRE TELEMATICS & RETREADING MODELS
// ============================================================================

export type WheelPositionKey = 
  | 'FL' | 'FR' 
  | 'R1_LO' | 'R1_LI' | 'R1_RI' | 'R1_RO' 
  | 'R2_LO' | 'R2_LI' | 'R2_RI' | 'R2_RO'
  | 'LIFT_L' | 'LIFT_R';

export interface TyreItem {
  id: string;
  serialNumber: string;
  brand: 'Apollo EnduRace' | 'MRF Steel Muscle' | 'JK Tyre Jetsteel' | 'CEAT Winmile';
  sizePattern: string; // e.g. 10.00R20 16PR
  position: WheelPositionKey;
  positionName: string;
  
  // Live TPMS Telematics
  pressurePsi: number;
  temperatureC: number;
  status: 'OPTIMAL' | 'WARNING_LOW' | 'CRITICAL_PUNCTURE' | 'OVER_HEATED';
  treadDepthMm: number; // 0 to 16mm (new: 14-16mm, retread threshold: 3mm)
  
  // Financial & Retreading Life Cycle
  stage: 'Virgin (Original)' | '1st Retread (Cold)' | '2nd Retread' | 'Scrap';
  purchaseCostInr: number;
  retreadingCostsInr: number;
  totalKmRun: number;
  costPerKmInr: number; // (purchaseCost + retreadCosts) / totalKmRun
  
  // Maintenance & Rotation
  fittedDate: string;
  lastInspectionDate: string;
  recommendedAction?: string;
}

export interface TruckTyreFleetRecord {
  plateNo: string;
  truckModel: string;
  configuration: '10-Wheeler (6x4)' | '16-Wheeler Multi-Axle (8x2)';
  driverName: string;
  driverPhone: string;
  currentLocation: string;
  totalTyresCount: number;
  criticalAlertCount: number;
  avgFleetPsi: number;
  avgTreadDepthMm: number;
  tyres: TyreItem[];
}

// ============================================================================
// MOCK DATA: 10-WHEELER & 16-WHEELER TRUCKS
// ============================================================================

const INITIAL_TRUCK_TYRES: TruckTyreFleetRecord[] = [
  {
    plateNo: 'MH-12-PQ-9081',
    truckModel: 'Tata Signa 4825.TK 16-Wheeler',
    configuration: '16-Wheeler Multi-Axle (8x2)',
    driverName: 'Suresh Rawat',
    driverPhone: '+91 98230 45678',
    currentLocation: 'NH-48 Kasara Ghat Bypass',
    totalTyresCount: 10,
    criticalAlertCount: 1,
    avgFleetPsi: 112,
    avgTreadDepthMm: 8.4,
    tyres: [
      {
        id: 'TY-01',
        serialNumber: 'AP-2026-99214',
        brand: 'Apollo EnduRace',
        sizePattern: '295/90 R20 Steer Highway',
        position: 'FL',
        positionName: 'Front Steer Left',
        pressurePsi: 120,
        temperatureC: 44,
        status: 'OPTIMAL',
        treadDepthMm: 11.2,
        stage: 'Virgin (Original)',
        purchaseCostInr: 26500,
        retreadingCostsInr: 0,
        totalKmRun: 58000,
        costPerKmInr: 0.45,
        fittedDate: '12-Feb-2026',
        lastInspectionDate: '26-Oct-2026'
      },
      {
        id: 'TY-02',
        serialNumber: 'AP-2026-99215',
        brand: 'Apollo EnduRace',
        sizePattern: '295/90 R20 Steer Highway',
        position: 'FR',
        positionName: 'Front Steer Right',
        pressurePsi: 118,
        temperatureC: 46,
        status: 'OPTIMAL',
        treadDepthMm: 10.8,
        stage: 'Virgin (Original)',
        purchaseCostInr: 26500,
        retreadingCostsInr: 0,
        totalKmRun: 58000,
        costPerKmInr: 0.45,
        fittedDate: '12-Feb-2026',
        lastInspectionDate: '26-Oct-2026'
      },
      // DRIVE AXLE 1
      {
        id: 'TY-03',
        serialNumber: 'MRF-90812-SM',
        brand: 'MRF Steel Muscle',
        sizePattern: '10.00R20 Traction Lug',
        position: 'R1_LO',
        positionName: 'Axle 1 Rear Left-Outer',
        pressurePsi: 78, // CRITICAL LOW!
        temperatureC: 72, // HIGH TEMP!
        status: 'CRITICAL_PUNCTURE',
        treadDepthMm: 6.5,
        stage: '1st Retread (Cold)',
        purchaseCostInr: 24000,
        retreadingCostsInr: 4800,
        totalKmRun: 114000,
        costPerKmInr: 0.25,
        fittedDate: '10-Nov-2025',
        lastInspectionDate: '28-Oct-2026',
        recommendedAction: '🚨 Immediate roadside halt. Slow valve pin leakage detected.'
      },
      {
        id: 'TY-04',
        serialNumber: 'MRF-90813-SM',
        brand: 'MRF Steel Muscle',
        sizePattern: '10.00R20 Traction Lug',
        position: 'R1_LI',
        positionName: 'Axle 1 Rear Left-Inner',
        pressurePsi: 115,
        temperatureC: 50,
        status: 'OPTIMAL',
        treadDepthMm: 7.2,
        stage: '1st Retread (Cold)',
        purchaseCostInr: 24000,
        retreadingCostsInr: 4800,
        totalKmRun: 114000,
        costPerKmInr: 0.25,
        fittedDate: '10-Nov-2025',
        lastInspectionDate: '28-Oct-2026'
      },
      {
        id: 'TY-05',
        serialNumber: 'JK-7712-JS',
        brand: 'JK Tyre Jetsteel',
        sizePattern: '10.00R20 Heavy Lug',
        position: 'R1_RI',
        positionName: 'Axle 1 Rear Right-Inner',
        pressurePsi: 112,
        temperatureC: 52,
        status: 'OPTIMAL',
        treadDepthMm: 8.0,
        stage: 'Virgin (Original)',
        purchaseCostInr: 25000,
        retreadingCostsInr: 0,
        totalKmRun: 72000,
        costPerKmInr: 0.34,
        fittedDate: '15-Dec-2025',
        lastInspectionDate: '26-Oct-2026'
      },
      {
        id: 'TY-06',
        serialNumber: 'JK-7713-JS',
        brand: 'JK Tyre Jetsteel',
        sizePattern: '10.00R20 Heavy Lug',
        position: 'R1_RO',
        positionName: 'Axle 1 Rear Right-Outer',
        pressurePsi: 114,
        temperatureC: 51,
        status: 'OPTIMAL',
        treadDepthMm: 7.8,
        stage: 'Virgin (Original)',
        purchaseCostInr: 25000,
        retreadingCostsInr: 0,
        totalKmRun: 72000,
        costPerKmInr: 0.34,
        fittedDate: '15-Dec-2025',
        lastInspectionDate: '26-Oct-2026'
      },
      // DRIVE AXLE 2
      {
        id: 'TY-07',
        serialNumber: 'CEAT-4412-WM',
        brand: 'CEAT Winmile',
        sizePattern: '10.00R20 All-Position',
        position: 'R2_LO',
        positionName: 'Axle 2 Rear Left-Outer',
        pressurePsi: 110,
        temperatureC: 49,
        status: 'OPTIMAL',
        treadDepthMm: 3.2, // Ready for retreading!
        stage: 'Virgin (Original)',
        purchaseCostInr: 23800,
        retreadingCostsInr: 0,
        totalKmRun: 94000,
        costPerKmInr: 0.25,
        fittedDate: '05-Aug-2025',
        lastInspectionDate: '25-Oct-2026',
        recommendedAction: '⚠️ Tread depth below 4mm. Send to cold retreading batch at hub.'
      },
      {
        id: 'TY-08',
        serialNumber: 'CEAT-4413-WM',
        brand: 'CEAT Winmile',
        sizePattern: '10.00R20 All-Position',
        position: 'R2_LI',
        positionName: 'Axle 2 Rear Left-Inner',
        pressurePsi: 116,
        temperatureC: 48,
        status: 'OPTIMAL',
        treadDepthMm: 3.5,
        stage: 'Virgin (Original)',
        purchaseCostInr: 23800,
        retreadingCostsInr: 0,
        totalKmRun: 94000,
        costPerKmInr: 0.25,
        fittedDate: '05-Aug-2025',
        lastInspectionDate: '25-Oct-2026'
      },
      {
        id: 'TY-09',
        serialNumber: 'AP-1109-ER',
        brand: 'Apollo EnduRace',
        sizePattern: '10.00R20 Mileage Rib',
        position: 'R2_RI',
        positionName: 'Axle 2 Rear Right-Inner',
        pressurePsi: 114,
        temperatureC: 47,
        status: 'OPTIMAL',
        treadDepthMm: 9.8,
        stage: '2nd Retread',
        purchaseCostInr: 25000,
        retreadingCostsInr: 9200, // 2 retreads @ 4600 each
        totalKmRun: 168000,
        costPerKmInr: 0.20, // Low cost per KM!
        fittedDate: '20-Jan-2025',
        lastInspectionDate: '26-Oct-2026'
      },
      {
        id: 'TY-10',
        serialNumber: 'AP-1110-ER',
        brand: 'Apollo EnduRace',
        sizePattern: '10.00R20 Mileage Rib',
        position: 'R2_RO',
        positionName: 'Axle 2 Rear Right-Outer',
        pressurePsi: 115,
        temperatureC: 48,
        status: 'OPTIMAL',
        treadDepthMm: 9.6,
        stage: '2nd Retread',
        purchaseCostInr: 25000,
        retreadingCostsInr: 9200,
        totalKmRun: 168000,
        costPerKmInr: 0.20,
        fittedDate: '20-Jan-2025',
        lastInspectionDate: '26-Oct-2026'
      }
    ]
  },
  {
    plateNo: 'DL-01-AB-1234',
    truckModel: 'BharatBenz 3528R Multi-Axle',
    configuration: '10-Wheeler (6x4)',
    driverName: 'Ramesh Yadav',
    driverPhone: '+91 98112 23344',
    currentLocation: 'NH-52 Dhule Bypass Interchange',
    totalTyresCount: 10,
    criticalAlertCount: 0,
    avgFleetPsi: 116,
    avgTreadDepthMm: 10.2,
    tyres: [
      {
        id: 'TY-11',
        serialNumber: 'MRF-77401-SM',
        brand: 'MRF Steel Muscle',
        sizePattern: '295/90 R20 Steer Highway',
        position: 'FL',
        positionName: 'Front Steer Left',
        pressurePsi: 118,
        temperatureC: 45,
        status: 'OPTIMAL',
        treadDepthMm: 12.0,
        stage: 'Virgin (Original)',
        purchaseCostInr: 26000,
        retreadingCostsInr: 0,
        totalKmRun: 42000,
        costPerKmInr: 0.61,
        fittedDate: '10-Apr-2026',
        lastInspectionDate: '27-Oct-2026'
      },
      {
        id: 'TY-12',
        serialNumber: 'MRF-77402-SM',
        brand: 'MRF Steel Muscle',
        sizePattern: '295/90 R20 Steer Highway',
        position: 'FR',
        positionName: 'Front Steer Right',
        pressurePsi: 116,
        temperatureC: 46,
        status: 'OPTIMAL',
        treadDepthMm: 11.8,
        stage: 'Virgin (Original)',
        purchaseCostInr: 26000,
        retreadingCostsInr: 0,
        totalKmRun: 42000,
        costPerKmInr: 0.61,
        fittedDate: '10-Apr-2026',
        lastInspectionDate: '27-Oct-2026'
      }
    ]
  }
];

export default function TyreLifecycleTpmsRadar() {
  const [fleetList, setFleetList] = useState<TruckTyreFleetRecord[]>(INITIAL_TRUCK_TYRES);
  const [selectedTruckIndex, setSelectedTruckIndex] = useState<number>(0);
  const [selectedTyre, setSelectedTyre] = useState<TyreItem | null>(INITIAL_TRUCK_TYRES[0].tyres[2]); // Default to the critical tyre
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    getFleetTyres().then(data => {
      if (data && data.length > 0) setFleetList(data);
    }).catch(() => {});
  }, []);

  const activeTruck = fleetList[selectedTruckIndex] || fleetList[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleSimulateInflate = (tyreId: string) => {
    inflateTyre(activeTruck.plateNo, tyreId, 118).catch(() => {});
    setFleetList(prev => prev.map((trk, tIdx) => {
      if (tIdx !== selectedTruckIndex) return trk;
      const updatedTyres = trk.tyres.map(ty => {
        if (ty.id === tyreId) {
          return {
            ...ty,
            pressurePsi: 118,
            temperatureC: 46,
            status: 'OPTIMAL' as const,
            recommendedAction: undefined
          };
        }
        return ty;
      });
      const newCriticalCount = updatedTyres.filter(t => t.status === 'CRITICAL_PUNCTURE').length;
      return {
        ...trk,
        tyres: updatedTyres,
        criticalAlertCount: newCriticalCount
      };
    }));

    if (selectedTyre && selectedTyre.id === tyreId) {
      setSelectedTyre(prev => prev ? {
        ...prev,
        pressurePsi: 118,
        temperatureC: 46,
        status: 'OPTIMAL',
        recommendedAction: undefined
      } : null);
    }

    showToast(`✓ Tyre pressure corrected to 118 PSI! Status: Optimal.`);
  };

  const handleSendForRetreading = (tyreId: string) => {
    sendTyreForColdRetread(activeTruck.plateNo, tyreId).catch(() => {});
    setFleetList(prev => prev.map((trk, tIdx) => {
      if (tIdx !== selectedTruckIndex) return trk;
      const updatedTyres = trk.tyres.map(ty => {
        if (ty.id === tyreId) {
          const nextStage = ty.stage === 'Virgin (Original)' ? '1st Retread (Cold)' : '2nd Retread';
          return {
            ...ty,
            stage: nextStage as TyreItem['stage'],
            treadDepthMm: 14.5,
            retreadingCostsInr: ty.retreadingCostsInr + 4800,
            recommendedAction: `✓ Retreaded via Cold Process. Next inspection at +40,000 KM.`
          };
        }
        return ty;
      });
      return { ...trk, tyres: updatedTyres };
    }));

    showToast(`🏭 Tyre dispatched to Bandag/Elgitread Cold Retreading Facility! Casing preserved.`);
  };

  const handleExecuteWheelRotation = () => {
    showToast(`🔄 6-Wheel Position Rotation logged for ${activeTruck.plateNo}! Front Steer tyres rotated to Rear Tag axle.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* TOAST */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 600,
          borderLeft: '4px solid #10b981'
        }}>
          {toastMessage}
        </div>
      )}

      {/* HEADER HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '22px 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>🛞</span> Tyre Telematics &amp; Cost-Per-KM Engine
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900 }}>
            Fleet Tyre Lifecycle, TPMS &amp; Retreading Radar
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#d4d4d8' }}>
            Interactive wheel layout visualizer, live IoT TPMS pressure &amp; temperature telemetry, tread wear tracking, and cold-process retreading cost-per-km optimizer.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExecuteWheelRotation}
            style={{
              background: '#ffffff',
              color: '#18181b',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🔄</span> Log 6-Wheel Rotation
          </button>
        </div>
      </div>

      {/* TRUCK SELECTOR BAR */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 18px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Select Truck:</span>
          {fleetList.map((trk, idx) => (
            <button
              key={trk.plateNo}
              type="button"
              onClick={() => setSelectedTruckIndex(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedTruckIndex === idx ? '#0f172a' : '#cbd5e1',
                background: selectedTruckIndex === idx ? '#0f172a' : '#f8fafc',
                color: selectedTruckIndex === idx ? '#ffffff' : '#334155',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🚛 {trk.plateNo}</span>
              {trk.criticalAlertCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                  {trk.criticalAlertCount} Alert
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Location: <strong style={{ color: '#0f172a' }}>{activeTruck.currentLocation}</strong> • Driver: <strong>{activeTruck.driverName}</strong> ({activeTruck.driverPhone})
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: WHEEL DIAGRAM VS TYRE INSPECTION CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* LEFT COLUMN: INTERACTIVE CHASSIS WHEEL LAYOUT */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                🚚 Live Chassis Wheel Schematic: {activeTruck.plateNo}
              </h3>
              <small style={{ color: '#64748b', fontSize: '12px' }}>{activeTruck.configuration}</small>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Normal (&gt;110 PSI)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Puncture / Low PSI
              </span>
            </div>
          </div>

          {/* CHASSIS VISUAL FRAME */}
          <div style={{
            position: 'relative',
            width: '320px',
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '24px',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '34px',
            alignItems: 'center'
          }}>
            {/* FRONT CAB DIRECTION */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 18px',
              borderRadius: '20px',
              letterSpacing: '0.05em'
            }}>
              ▲ FRONT STEER AXLE
            </div>

            {/* AXLE 1: STEER AXLE (2 TYRES) */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* FL */}
              {renderWheelNode(activeTruck.tyres.find(t => t.position === 'FL'), selectedTyre, setSelectedTyre)}
              <div style={{ height: '4px', background: '#94a3b8', flex: 1, margin: '0 8px' }}></div>
              {/* FR */}
              {renderWheelNode(activeTruck.tyres.find(t => t.position === 'FR'), selectedTyre, setSelectedTyre)}
            </div>

            {/* AXLE 2: DRIVE TANDEM AXLE 1 (4 TYRES) */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R1_LO'), selectedTyre, setSelectedTyre)}
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R1_LI'), selectedTyre, setSelectedTyre)}
              </div>
              <div style={{ height: '6px', background: '#475569', flex: 1, margin: '0 8px', borderRadius: '2px' }}></div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R1_RI'), selectedTyre, setSelectedTyre)}
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R1_RO'), selectedTyre, setSelectedTyre)}
              </div>
            </div>

            {/* AXLE 3: DRIVE TANDEM AXLE 2 (4 TYRES) */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R2_LO'), selectedTyre, setSelectedTyre)}
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R2_LI'), selectedTyre, setSelectedTyre)}
              </div>
              <div style={{ height: '6px', background: '#475569', flex: 1, margin: '0 8px', borderRadius: '2px' }}></div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R2_RI'), selectedTyre, setSelectedTyre)}
                {renderWheelNode(activeTruck.tyres.find(t => t.position === 'R2_RO'), selectedTyre, setSelectedTyre)}
              </div>
            </div>

            {/* REAR BUMPER */}
            <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>
              ▼ REAR TAILGATE
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTED TYRE DETAIL & RETREADING ENGINE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedTyre ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid',
              borderColor: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#fca5a5' : '#e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              boxShadow: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '0 4px 16px rgba(239, 68, 68, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              {/* TOP HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      fontWeight: 900,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      {selectedTyre.position}
                    </span>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedTyre.positionName}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Serial: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{selectedTyre.serialNumber}</strong> • {selectedTyre.brand}
                  </div>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#fee2e2' : '#ecfdf5',
                  color: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#dc2626' : '#059669',
                  border: '1px solid',
                  borderColor: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#fecaca' : '#a7f3d0'
                }}>
                  {selectedTyre.status === 'CRITICAL_PUNCTURE' ? '🚨 Puncture Alert' : '✓ Sensor Healthy'}
                </span>
              </div>

              {/* LIVE TPMS SENSOR READINGS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <div style={{
                  background: selectedTyre.pressurePsi < 90 ? '#fef2f2' : '#f8fafc',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: selectedTyre.pressurePsi < 90 ? '#fecaca' : '#e2e8f0',
                  textAlign: 'center'
                }}>
                  <small style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Air Pressure</small>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: selectedTyre.pressurePsi < 90 ? '#dc2626' : '#0f172a' }}>
                    {selectedTyre.pressurePsi} <span style={{ fontSize: '11px' }}>PSI</span>
                  </div>
                  <small style={{ fontSize: '10px', color: selectedTyre.pressurePsi < 90 ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    {selectedTyre.pressurePsi < 90 ? 'Deflated' : 'Norm (110-120)'}
                  </small>
                </div>

                <div style={{
                  background: selectedTyre.temperatureC > 65 ? '#fff1f2' : '#f8fafc',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: selectedTyre.temperatureC > 65 ? '#fecdd3' : '#e2e8f0',
                  textAlign: 'center'
                }}>
                  <small style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Temperature</small>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: selectedTyre.temperatureC > 65 ? '#e11d48' : '#0f172a' }}>
                    {selectedTyre.temperatureC}°<span style={{ fontSize: '11px' }}>C</span>
                  </div>
                  <small style={{ fontSize: '10px', color: selectedTyre.temperatureC > 65 ? '#e11d48' : '#16a34a', fontWeight: 700 }}>
                    {selectedTyre.temperatureC > 65 ? 'Overheated' : 'Normal (<60°C)'}
                  </small>
                </div>

                <div style={{
                  background: selectedTyre.treadDepthMm <= 4 ? '#fffbeb' : '#f8fafc',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: selectedTyre.treadDepthMm <= 4 ? '#fde68a' : '#e2e8f0',
                  textAlign: 'center'
                }}>
                  <small style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Tread Depth</small>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: selectedTyre.treadDepthMm <= 4 ? '#b45309' : '#0f172a' }}>
                    {selectedTyre.treadDepthMm} <span style={{ fontSize: '11px' }}>mm</span>
                  </div>
                  <small style={{ fontSize: '10px', color: selectedTyre.treadDepthMm <= 4 ? '#b45309' : '#16a34a', fontWeight: 700 }}>
                    {selectedTyre.treadDepthMm <= 4 ? 'Retread Due' : 'Good Tread'}
                  </small>
                </div>
              </div>

              {/* RECOMMENDED WARNING */}
              {selectedTyre.recommendedAction && (
                <div style={{
                  marginTop: '12px',
                  background: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#fef2f2' : '#fffbeb',
                  border: '1px solid',
                  borderColor: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#fecaca' : '#fde68a',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: selectedTyre.status === 'CRITICAL_PUNCTURE' ? '#b91c1c' : '#92400e',
                  fontWeight: 600
                }}>
                  {selectedTyre.recommendedAction}
                </div>
              )}

              {/* LIFECYCLE & COST PER KM (CPKM) */}
              <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Retreading Life Cycle &amp; CPKM Audit
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Current Stage:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedTyre.stage}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Total Odometer KM:</span>
                    <div style={{ fontWeight: 800, color: '#0284c7' }}>{selectedTyre.totalKmRun.toLocaleString('en-IN')} KM</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Purchase + Retread Invested:</span>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>
                      ₹{(selectedTyre.purchaseCostInr + selectedTyre.retreadingCostsInr).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Actual Cost Per KM (CPKM):</span>
                    <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '14px' }}>
                      ₹{selectedTyre.costPerKmInr.toFixed(2)} / KM
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS ON INSPECTED TYRE */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {selectedTyre.status === 'CRITICAL_PUNCTURE' && (
                  <button
                    type="button"
                    onClick={() => handleSimulateInflate(selectedTyre.id)}
                    style={{
                      flex: 1,
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Inflate &amp; Fix Pressure (118 PSI)
                  </button>
                )}

                {selectedTyre.treadDepthMm <= 4 && (
                  <button
                    type="button"
                    onClick={() => handleSendForRetreading(selectedTyre.id)}
                    style={{
                      flex: 1,
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    🏭 Send to Cold Retread (+₹4,800)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Click any tyre position on the chassis diagram to inspect live TPMS telemetry.
            </div>
          )}

          {/* RETREADING SAVINGS STATS CARD */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
            color: '#ffffff',
            padding: '18px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)'
          }}>
            <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 800, textTransform: 'uppercase' }}>
              💡 Cold Retreading Cost Optimizer
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '4px' }}>
              Saved ₹1,27,200 this Quarter across Fleet
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#a7f3d0' }}>
              New Virgin tyre = ₹26,000 vs Cold Retreading = ₹4,800 (Preserving 100% Apollo/MRF radial casings saves 81% direct cost).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// WHEEL SCHEMATIC NODE RENDERER HELPER
// ----------------------------------------------------------------------------
function renderWheelNode(
  tyre: TyreItem | undefined,
  selected: TyreItem | null,
  onSelect: (t: TyreItem) => void
) {
  if (!tyre) {
    return <div style={{ width: '42px', height: '64px', background: '#e2e8f0', borderRadius: '8px' }}></div>;
  }

  const isSelected = selected?.id === tyre.id;
  const isCritical = tyre.status === 'CRITICAL_PUNCTURE';
  const isRetreadDue = tyre.treadDepthMm <= 4;

  return (
    <div
      onClick={() => onSelect(tyre)}
      title={`${tyre.positionName} - ${tyre.pressurePsi} PSI`}
      style={{
        width: '46px',
        height: '70px',
        borderRadius: '10px',
        background: isCritical ? '#ef4444' : isRetreadDue ? '#f59e0b' : '#1e293b',
        color: '#ffffff',
        border: isSelected ? '3px solid #38bdf8' : '2px solid rgba(255,255,255,0.2)',
        boxShadow: isCritical ? '0 0 12px rgba(239, 68, 68, 0.8)' : isSelected ? '0 0 10px rgba(56, 189, 248, 0.8)' : '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: isSelected ? 'scale(1.08)' : 'scale(1)'
      }}
    >
      <span style={{ fontSize: '9px', fontWeight: 900 }}>{tyre.position}</span>
      <span style={{ fontSize: '11px', fontWeight: 900, marginTop: '2px' }}>{tyre.pressurePsi}</span>
      <span style={{ fontSize: '8px', opacity: 0.8 }}>PSI</span>
    </div>
  );
}
