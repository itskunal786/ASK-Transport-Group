import React, { useEffect, useRef, useState } from 'react';
import {
  optimize3dLoad,
  type BoxItem,
  type LoadOptimizationResult,
  type PackedBox
} from '../api/aiApi';

export default function AiTruckLoadVisualizer({ onSelectTruck }: { onSelectTruck?: (truckType: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [truckType, setTruckType] = useState<string>('19ft_container');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<LoadOptimizationResult | null>(null);

  // 3D View Angles & Controls
  const [rotX, setRotX] = useState<number>(0.45); // Pitch
  const [rotY, setRotY] = useState<number>(-0.65); // Yaw
  const [zoom, setZoom] = useState<number>(1.0);
  const [wireframeOpacity, setWireframeOpacity] = useState<number>(0.25);

  // Custom Box Form State
  const [boxes, setBoxes] = useState<BoxItem[]>([
    { id: 'b1', label: 'Industrial Motors', lengthFt: 3.5, widthFt: 3.0, heightFt: 2.5, weightKg: 180, quantity: 6, color: '#2563eb', isFragile: false },
    { id: 'b2', label: 'Electronic Control Panels', lengthFt: 2.5, widthFt: 2.0, heightFt: 2.0, weightKg: 45, quantity: 12, color: '#059669', isFragile: true },
    { id: 'b3', label: 'Heavy Steel Castings', lengthFt: 4.0, widthFt: 2.5, heightFt: 2.0, weightKg: 280, quantity: 4, color: '#d97706', isFragile: false },
    { id: 'b4', label: 'Corrugated Spare Cartons', lengthFt: 2.0, widthFt: 1.8, heightFt: 1.5, weightKg: 25, quantity: 16, color: '#7c3aed', isFragile: false }
  ]);

  const [newBoxLabel, setNewBoxLabel] = useState('');
  const [newBoxL, setNewBoxL] = useState(3.0);
  const [newBoxW, setNewBoxW] = useState(2.0);
  const [newBoxH, setNewBoxH] = useState(2.0);
  const [newBoxWeight, setNewBoxWeight] = useState(50);
  const [newBoxQty, setNewBoxQty] = useState(4);
  const [newBoxFragile, setNewBoxFragile] = useState(false);

  // Load calculations from backend
  async function fetchOptimization(tType = truckType, bList = boxes) {
    try {
      setLoading(true);
      const res = await optimize3dLoad({ truckType: tType, boxes: bList });
      setData(res);
      if (onSelectTruck) onSelectTruck(tType);
    } catch (err) {
      console.error('3D Load Optimization Error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOptimization(truckType, boxes);
  }, [truckType]);

  // Mouse drag 3D rotation handler
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => prev + dx * 0.008);
    setRotX(prev => Math.max(-1.2, Math.min(1.2, prev + dy * 0.008)));
  }

  function handleMouseUp() {
    isDragging.current = false;
  }

  // Draw 3D Scene onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx = context;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid Floor
    const cx = width / 2;
    const cy = height / 2 + 30;
    const scale = 14 * zoom;

    const truckL = data.truckSpecs.lengthFt;
    const truckW = data.truckSpecs.widthFt;
    const truckH = data.truckSpecs.heightFt;

    // 3D Projection math
    function project(x: number, y: number, z: number): [number, number, number] {
      // Center origin at truck container center
      const ox = x - truckL / 2;
      const oy = y - truckH / 2;
      const oz = z - truckW / 2;

      // Rotate Y (Yaw)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = ox * cosY - oz * sinY;
      const z1 = ox * sinY + oz * cosY;

      // Rotate X (Pitch)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = oy * cosX - z1 * sinX;
      const z2 = oy * sinX + z1 * cosX;

      // Perspective projection
      const distance = 600;
      const fov = distance / (distance + z2 * scale);

      const px = cx + x1 * scale * fov;
      const py = cy - y1 * scale * fov;
      return [px, py, z2];
    }

    // 1. Draw Truck Chassis & Wheels
    // Front Cab
    const cabStart = truckL;
    const cabEnd = truckL + 4.5;
    const cabH = truckH * 0.9;

    function drawQuad(pts: [number, number, number][], fill: string, stroke = 'rgba(255,255,255,0.2)') {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Wheels under truck
    const wheelR = 1.2;
    const wheelYs = -wheelR;
    const wheelPositions = [
      cabEnd - 1.2,
      2.5,
      truckL > 20 ? 5.5 : 2.5,
      truckL > 28 ? 8.5 : 2.5
    ];

    wheelPositions.forEach(wx => {
      [0.2, truckW - 0.2].forEach(wz => {
        const [wpx, wpy] = project(wx, wheelYs, wz);
        context.beginPath();
        context.arc(wpx, wpy, wheelR * scale * 0.75, 0, Math.PI * 2);
        context.fillStyle = '#334155';
        context.fill();
        context.strokeStyle = '#94a3b8';
        context.lineWidth = 2;
        context.stroke();

        context.beginPath();
        context.arc(wpx, wpy, wheelR * scale * 0.35, 0, Math.PI * 2);
        context.fillStyle = '#64748b';
        context.fill();
      });
    });

    // 2. Draw Truck Container Wireframe Outline
    const c000 = project(0, 0, 0);
    const c100 = project(truckL, 0, 0);
    const c101 = project(truckL, 0, truckW);
    const c001 = project(0, 0, truckW);

    const c010 = project(0, truckH, 0);
    const c110 = project(truckL, truckH, 0);
    const c111 = project(truckL, truckH, truckW);
    const c011 = project(0, truckH, truckW);

    // Container Floor
    drawQuad([c000, c100, c101, c001], 'rgba(30, 41, 59, 0.95)', '#38bdf8');

    // 3. Render 3D Cargo Boxes with Depth Sorting (Painter's Algorithm)
    type RenderBox = {
      box: PackedBox;
      depth: number;
      polys: { pts: [number, number, number][]; color: string; shade: string }[];
    };

    const renderBoxes: RenderBox[] = (data.packedBoxes || []).map(b => {
      // 8 corners of box
      const p000 = project(b.x, b.y, b.z);
      const p100 = project(b.x + b.l, b.y, b.z);
      const p101 = project(b.x + b.l, b.y, b.z + b.w);
      const p001 = project(b.x, b.y, b.z + b.w);

      const p010 = project(b.x, b.y + b.h, b.z);
      const p110 = project(b.x + b.l, b.y + b.h, b.z);
      const p111 = project(b.x + b.l, b.y + b.h, b.z + b.w);
      const p011 = project(b.x, b.y + b.h, b.z + b.w);

      const avgZ = (p000[2] + p100[2] + p101[2] + p001[2] + p010[2] + p110[2] + p111[2] + p011[2]) / 8;

      const topFace = { pts: [p010, p110, p111, p011], color: b.color, shade: '1.2' };
      const frontFace = { pts: [p000, p100, p110, p010], color: b.color, shade: '0.85' };
      const rightFace = { pts: [p100, p101, p111, p110], color: b.color, shade: '1.0' };
      const leftFace = { pts: [p000, p001, p011, p010], color: b.color, shade: '0.75' };
      const backFace = { pts: [p001, p101, p111, p011], color: b.color, shade: '0.9' };

      return {
        box: b,
        depth: avgZ,
        polys: [topFace, frontFace, rightFace, leftFace, backFace]
      };
    });

    // Sort boxes back-to-front
    renderBoxes.sort((a, b) => a.depth - b.depth);

    renderBoxes.forEach(rb => {
      rb.polys.forEach(face => {
        drawQuad(face.pts, face.color, 'rgba(255,255,255,0.4)');
      });
    });

    // 4. Draw Transparent Container Walls (Overlay Wireframe)
    const wallColor = `rgba(56, 189, 248, ${wireframeOpacity})`;
    drawQuad([c000, c010, c110, c100], wallColor, '#0284c7');
    drawQuad([c001, c011, c111, c101], wallColor, '#0284c7');
    drawQuad([c000, c010, c011, c001], wallColor, '#0284c7');
    drawQuad([c010, c110, c111, c011], wallColor, '#38bdf8'); // Roof

    // 5. Driver Cabin Mesh
    const cab000 = project(cabStart, 0, 0);
    const cab100 = project(cabEnd, 0, 0.4);
    const cab101 = project(cabEnd, 0, truckW - 0.4);
    const cab001 = project(cabStart, 0, truckW);

    const cab010 = project(cabStart, cabH, 0);
    const cab110 = project(cabEnd - 0.8, cabH * 0.8, 0.4);
    const cab111 = project(cabEnd - 0.8, cabH * 0.8, truckW - 0.4);
    const cab011 = project(cabStart, cabH, truckW);

    drawQuad([cab000, cab100, cab101, cab001], '#475569', '#94a3b8');
    drawQuad([cab010, cab110, cab111, cab011], '#0f172a', '#38bdf8');
    drawQuad([cab110, cab111, cab101, cab100], 'rgba(56, 189, 248, 0.4)', '#38bdf8'); // Windshield
  }, [data, rotX, rotY, zoom, wireframeOpacity]);

  // Add custom box
  function handleAddBox(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoxLabel.trim()) return;

    const newBox: BoxItem = {
      id: `box_${Date.now()}`,
      label: newBoxLabel,
      lengthFt: Number(newBoxL),
      widthFt: Number(newBoxW),
      heightFt: Number(newBoxH),
      weightKg: Number(newBoxWeight),
      quantity: Number(newBoxQty),
      color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#ec4899'][boxes.length % 7],
      isFragile: newBoxFragile
    };

    const updated = [...boxes, newBox];
    setBoxes(updated);
    fetchOptimization(truckType, updated);
    setNewBoxLabel('');
  }

  function handleRemoveBox(id: string) {
    const updated = boxes.filter(b => b.id !== id);
    setBoxes(updated);
    fetchOptimization(truckType, updated);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER & CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'var(--bg-surface, #ffffff)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🚛</span> 3D Truck Load &amp; Volumetric Space Optimizer
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary, #64748b)' }}>
            Real-time multi-box bin packing, volumetric utilization, and axle load balance analyzer
          </p>
        </div>

        {/* TRUCK SELECTOR */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>TRUCK MODEL:</span>
          {[
            { id: '14ft_eicher', label: '14ft Eicher (4.5T)' },
            { id: '19ft_container', label: '19ft Container (8.5T)' },
            { id: '24ft_multiaxle', label: '24ft Multi-Axle (14T)' },
            { id: '32ft_mxl_hq', label: '32ft MXL HQ (21T)' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTruckType(t.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: truckType === t.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: truckType === t.id ? '#eff6ff' : '#ffffff',
                color: truckType === t.id ? '#1d4ed8' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D CANVAS & METRICS SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* 3D CANVAS VIEWPORT */}
        <div style={{ background: '#0f172a', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <canvas
            ref={canvasRef}
            width={640}
            height={420}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ width: '100%', height: '420px', display: 'block', cursor: 'grab' }}
          />

          {/* VIEWPORT OVERLAY BADGES */}
          <div style={{ position: 'absolute', top: '14px', left: '16px', display: 'flex', gap: '8px' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', color: '#38bdf8', fontSize: '11px', fontWeight: 800, borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              3D PERSPECTIVE ORBIT
            </span>
            <span style={{ padding: '4px 10px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', color: '#a78bfa', fontSize: '11px', fontWeight: 700, borderRadius: '6px' }}>
              Drag to Rotate 360°
            </span>
          </div>

          {/* CANVAS CONTROLS FOOTER */}
          <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.85)', padding: '8px 14px', borderRadius: '8px', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>Zoom:</span>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                style={{ width: '80px', cursor: 'pointer' }}
              />
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, marginLeft: '8px' }}>Wall Transparency:</span>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={wireframeOpacity}
                onChange={e => setWireframeOpacity(Number(e.target.value))}
                style={{ width: '80px', cursor: 'pointer' }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setRotX(0.45);
                setRotY(-0.65);
                setZoom(1.0);
              }}
              style={{ padding: '3px 8px', fontSize: '11px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Reset View
            </button>
          </div>
        </div>

        {/* METRICS & EFFICIENCY GAUGES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* LOAD UTILIZATION CARD */}
          <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Container Efficiency Metrics</span>
              <span style={{ fontSize: '12px', color: '#2563eb' }}>{data?.truckSpecs.displayName}</span>
            </h3>

            {/* Volume Utilization Meter */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                <span>Volumetric Capacity Used:</span>
                <span style={{ color: '#0284c7' }}>{data?.utilization.volumeUtilizationPercent || 0}% ({data?.utilization.loadedVolumeFt3} / {data?.truckSpecs.totalVolumeFt3} cu.ft)</span>
              </div>
              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${data?.utilization.volumeUtilizationPercent || 0}%`,
                    background: (data?.utilization.volumeUtilizationPercent || 0) > 85 ? '#10b981' : '#0284c7',
                    borderRadius: '10px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Weight Utilization Meter */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                <span>Payload Weight Allocated:</span>
                <span style={{ color: data?.utilization.isAxleOverloaded ? '#ef4444' : '#059669' }}>
                  {data?.utilization.weightUtilizationPercent || 0}% ({data?.utilization.totalWeightKg} / {data?.truckSpecs.maxPayloadKg} kg)
                </span>
              </div>
              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, data?.utilization.weightUtilizationPercent || 0)}%`,
                    background: data?.utilization.isAxleOverloaded ? '#ef4444' : '#10b981',
                    borderRadius: '10px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Axle Distribution & Center of Gravity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Steer Axle (Front):</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{data?.utilization.centerOfGravity.frontAxlePercent}% Load</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Drive Axles (Rear):</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{data?.utilization.centerOfGravity.rearAxlePercent}% Load</strong>
              </div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: data?.utilization.isAxleOverloaded ? '#fee2e2' : '#dcfce7', color: data?.utilization.isAxleOverloaded ? '#b91c1c' : '#15803d' }}>
                {data?.utilization.isAxleOverloaded ? '⚠️ Overweight Warning' : '✓ RTO Axle Weight Compliant'}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Remaining: {data?.utilization.remainingCapacityKg} kg</span>
            </div>
          </div>

          {/* AI STACKING RECOMMENDATIONS */}
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 800, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              🤖 AI Stacking Insights &amp; Guidance
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(data?.stackingRecommendations || []).map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CARGO BOX INVENTORY & DYNAMIC BOX ADDER */}
      <div style={{ background: 'var(--bg-surface, #ffffff)', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
          Cargo Manifest &amp; Consignment Packaging Items
        </h3>

        {/* BOXES LIST TABLE */}
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                <th style={{ padding: '8px 12px' }}>Cargo Item Name</th>
                <th style={{ padding: '8px 12px' }}>Dimensions (L × W × H)</th>
                <th style={{ padding: '8px 12px' }}>Unit Weight</th>
                <th style={{ padding: '8px 12px' }}>Quantity</th>
                <th style={{ padding: '8px 12px' }}>Total Weight</th>
                <th style={{ padding: '8px 12px' }}>Fragile</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {boxes.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: b.color, display: 'inline-block' }} />
                    <strong>{b.label}</strong>
                  </td>
                  <td style={{ padding: '8px 12px' }}>{b.lengthFt} × {b.widthFt} × {b.heightFt} ft</td>
                  <td style={{ padding: '8px 12px' }}>{b.weightKg} kg</td>
                  <td style={{ padding: '8px 12px' }}>{b.quantity} pcs</td>
                  <td style={{ padding: '8px 12px' }}>{b.weightKg * b.quantity} kg</td>
                  <td style={{ padding: '8px 12px' }}>
                    {b.isFragile ? <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ Yes</span> : <span style={{ color: '#64748b' }}>No</span>}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveBox(b.id)}
                      style={{ padding: '2px 8px', fontSize: '11px', color: '#dc2626', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ADD BOX FORM */}
        <form onSubmit={handleAddBox} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Item Label</label>
            <input
              type="text"
              placeholder="e.g. Steel Pipe Bundles"
              value={newBoxLabel}
              onChange={e => setNewBoxLabel(e.target.value)}
              required
              style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ width: '70px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Length (ft)</label>
            <input
              type="number"
              step="0.1"
              value={newBoxL}
              onChange={e => setNewBoxL(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ width: '70px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Width (ft)</label>
            <input
              type="number"
              step="0.1"
              value={newBoxW}
              onChange={e => setNewBoxW(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ width: '70px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Height (ft)</label>
            <input
              type="number"
              step="0.1"
              value={newBoxH}
              onChange={e => setNewBoxH(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ width: '80px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Weight (kg)</label>
            <input
              type="number"
              value={newBoxWeight}
              onChange={e => setNewBoxWeight(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ width: '60px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Qty</label>
            <input
              type="number"
              min="1"
              max="50"
              value={newBoxQty}
              onChange={e => setNewBoxQty(Number(e.target.value))}
              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '8px' }}>
            <input
              type="checkbox"
              id="newBoxFragile"
              checked={newBoxFragile}
              onChange={e => setNewBoxFragile(e.target.checked)}
            />
            <label htmlFor="newBoxFragile" style={{ fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Fragile</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '7px 16px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
          >
            + Add to 3D Container
          </button>
        </form>
      </div>
    </div>
  );
}
