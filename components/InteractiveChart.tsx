'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PlayerHistoryPoint } from '@/lib/types';

interface InteractiveChartProps {
  data?: PlayerHistoryPoint[];
  serverName: string;
  currentPlayers?: number;
}

// Generates smooth cubic bezier path from discrete points
function getCurvedPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const tension = 0.22;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;

    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export default function InteractiveChart({ data, serverName, currentPlayers = 0 }: InteractiveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(850);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; text: string; time: string }>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
    time: ''
  });

  // Track container width accurately for 1:1 pixel rendering without distortion
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateSize();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const ro = new ResizeObserver(updateSize);
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }
  }, []);

  // Builds a continuous 24-hour telemetry timeline ending at the current hour
  const points = useMemo(() => {
    const now = new Date();
    const currentHourDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const currentHourTs = currentHourDate.getTime();
    const currentHourStr = `${String(currentHourDate.getHours()).padStart(2, '0')}:00`;

    // Extract all recorded history points with normalized timestamps
    const recordedMap = new Map<number, number>(); // timestamp -> player count

    if (data && data.length > 0) {
      for (const p of data) {
        if (p.recorded_at) {
          const d = new Date(p.recorded_at);
          const hDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);
          recordedMap.set(hDate.getTime(), Number(p.count));
        } else if (p.time && p.time.includes(':')) {
          // Fallback if recorded_at was not provided
          const hour = parseInt(p.time.split(':')[0], 10);
          if (!isNaN(hour)) {
            let targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
            if (targetDate.getTime() > currentHourTs) {
              targetDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
            }
            recordedMap.set(targetDate.getTime(), Number(p.count));
          }
        }
      }
    }

    // Always ensure the current hour reflects live players if known
    if (currentPlayers > 0) {
      recordedMap.set(currentHourTs, currentPlayers);
    }

    // If completely empty, return single live point
    if (recordedMap.size === 0) {
      if (currentPlayers > 0) {
        return [{
          time: currentHourStr,
          count: currentPlayers,
          recorded_at: currentHourDate.toISOString()
        }];
      }
      return [];
    }

    // If only 1 point exists across all history, show as single live snapshot point
    if (recordedMap.size === 1) {
      const [ts, count] = Array.from(recordedMap.entries())[0];
      const d = new Date(ts);
      return [{
        time: `${String(d.getHours()).padStart(2, '0')}:00`,
        count,
        recorded_at: d.toISOString()
      }];
    }

    // Build continuous 24-hour sequence: 24 hourly buckets from (currentHour - 23h) to currentHour
    const oneHourMs = 60 * 60 * 1000;
    const sortedRecorded = Array.from(recordedMap.entries()).sort((a, b) => a[0] - b[0]);

    const result24: PlayerHistoryPoint[] = [];

    for (let i = 23; i >= 0; i--) {
      const slotTs = currentHourTs - i * oneHourMs;
      const slotDate = new Date(slotTs);
      const slotTimeStr = `${String(slotDate.getHours()).padStart(2, '0')}:00`;

      if (recordedMap.has(slotTs)) {
        result24.push({
          time: slotTimeStr,
          count: recordedMap.get(slotTs)!,
          recorded_at: slotDate.toISOString()
        });
      } else {
        // Interpolate between closest preceding and closest succeeding points
        const prev = sortedRecorded.filter(([ts]) => ts <= slotTs).pop();
        const next = sortedRecorded.find(([ts]) => ts > slotTs);

        let count: number;
        if (prev && next) {
          const ratio = (slotTs - prev[0]) / (next[0] - prev[0]);
          count = Math.round(prev[1] + ratio * (next[1] - prev[1]));
        } else if (prev) {
          count = prev[1];
        } else if (next) {
          count = next[1];
        } else {
          count = currentPlayers;
        }

        result24.push({
          time: slotTimeStr,
          count: Math.max(0, count),
          recorded_at: slotDate.toISOString()
        });
      }
    }

    return result24;
  }, [data, currentPlayers]);

  const height = 220;
  const padLeft = 48;
  const padRight = 28;
  const padTop = 24;
  const padBottom = 28;

  const drawW = Math.max(containerWidth - padLeft - padRight, 100);
  const drawH = height - padTop - padBottom;

  // Calculate dynamic, natural Y-axis boundaries with healthy headroom
  const counts = points.map(p => p.count);
  const peakVal = Math.max(...counts, 10);
  const lowVal = Math.min(...counts, 0);

  const step = peakVal > 500 ? 100 : peakVal > 200 ? 50 : 25;
  const maxVal = Math.ceil((peakVal * 1.22) / step) * step;
  const minVal = Math.max(0, Math.floor((lowVal * 0.7) / step) * step);
  const range = maxVal - minVal || 1;

  const coords = useMemo(() => {
    if (points.length === 1) {
      // Center the single snapshot horizontally
      const x = padLeft + drawW / 2;
      const y = padTop + drawH - ((points[0].count - minVal) / range) * drawH;
      return [{ x, y, point: points[0] }];
    }

    return points.map((p, i) => {
      const x = padLeft + (i / Math.max(points.length - 1, 1)) * drawW;
      const y = padTop + drawH - ((p.count - minVal) / range) * drawH;
      return { x, y, point: p };
    });
  }, [points, minVal, range, drawW, drawH, padLeft, padTop]);

  const curvePath = points.length > 1 ? getCurvedPath(coords) : '';
  const areaPath = points.length > 1 && coords.length > 1
    ? `${curvePath} L ${coords[coords.length - 1].x.toFixed(1)} ${padTop + drawH} L ${coords[0].x.toFixed(1)} ${padTop + drawH} Z`
    : '';

  const handleMouseEnter = (idx: number, c: { x: number; y: number; point: PlayerHistoryPoint }, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    setHoverIndex(idx);
    setTooltip({
      visible: true,
      x: relX,
      y: Math.max(relY - 45, 10),
      text: `${c.point.count.toLocaleString()} Players`,
      time: `${c.point.time} CEST`
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const gridRatios = [0.25, 0.5, 0.75, 1];

  return (
    <div 
      ref={containerRef}
      className="chart-wrapper" 
      style={{ position: 'relative', width: '100%', minHeight: `${height}px`, userSelect: 'none' }}
      onMouseLeave={handleMouseLeave}
    >

      <svg
        viewBox={`0 0 ${containerWidth} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="chartGradientSmooth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e23868" stopOpacity="0.30" />
            <stop offset="60%" stopColor="#e23868" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#e23868" stopOpacity="0.0" />
          </linearGradient>
          <radialGradient id="pulseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Horizontal grid lines */}
        {gridRatios.map((ratio, idx) => {
          const y = padTop + drawH * (1 - ratio);
          const val = Math.round(minVal + range * ratio);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={containerWidth - padRight}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="Inter, sans-serif"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Baseline 0-line */}
        <line
          x1={padLeft}
          y1={padTop + drawH}
          x2={containerWidth - padRight}
          y2={padTop + drawH}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* --- CASE 1: Single Snapshot (Brand new server) --- */}
        {points.length === 1 && coords[0] && (
          <g>
            {/* Horizontal dashed indicator across chart at this player level */}
            <line
              x1={padLeft}
              y1={coords[0].y}
              x2={containerWidth - padRight}
              y2={coords[0].y}
              stroke="rgba(0, 240, 255, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />

            {/* Pulsing Beacon Halo */}
            <circle
              cx={coords[0].x}
              cy={coords[0].y}
              r="22"
              fill="url(#pulseGlow)"
              opacity="0.8"
            />
            <circle
              cx={coords[0].x}
              cy={coords[0].y}
              r="10"
              fill="rgba(0, 240, 255, 0.2)"
            />
            <circle
              cx={coords[0].x}
              cy={coords[0].y}
              r="5.5"
              fill="#00f0ff"
              stroke="#0e0f12"
              strokeWidth="2"
            />

            {/* Floating label pill */}
            <rect
              x={coords[0].x - 65}
              y={coords[0].y - 34}
              width="130"
              height="24"
              rx="12"
              fill="#131417"
              stroke="#00f0ff"
              strokeWidth="1"
            />
            <text
              x={coords[0].x}
              y={coords[0].y - 18}
              fill="#00f0ff"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              {coords[0].point.count.toLocaleString()} Players Live
            </text>

            {/* X-axis time label */}
            <text
              x={coords[0].x}
              y={height - 6}
              fill="#00f0ff"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              {coords[0].point.time} CEST
            </text>
          </g>
        )}

        {/* --- CASE 2: Multi-point Timeline (2+ snapshots) --- */}
        {points.length > 1 && (
          <>
            {/* Active hover crosshair guide line */}
            {hoverIndex !== null && coords[hoverIndex] && (
              <line
                x1={coords[hoverIndex].x}
                y1={padTop}
                x2={coords[hoverIndex].x}
                y2={padTop + drawH}
                stroke="rgba(226, 56, 104, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Soft gradient area under smooth curve */}
            {areaPath && <path d={areaPath} fill="url(#chartGradientSmooth)" />}

            {/* Smooth curve line */}
            {curvePath && (
              <path
                d={curvePath}
                fill="none"
                stroke="#e23868"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* Data points & hit areas */}
            {coords.map((c, i) => {
              const isHovered = hoverIndex === i;
              // Show label if reasonable number of points or at key intervals
              const showLabel = coords.length <= 12 || i === 0 || i === coords.length - 1 || i % Math.ceil(coords.length / 8) === 0;

              return (
                <g key={i}>
                  {/* Outer halo when active */}
                  {isHovered && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="9"
                      fill="rgba(226, 56, 104, 0.25)"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {/* Sharp circular point */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 5.5 : 4}
                    fill={isHovered ? '#ffffff' : '#e23868'}
                    stroke="#0e0f12"
                    strokeWidth="2"
                    style={{ transition: 'r 0.15s ease, fill 0.15s ease' }}
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Invisible large hover hit target */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r="18"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => handleMouseEnter(i, c, e)}
                    onMouseMove={(e) => handleMouseEnter(i, c, e)}
                  />
                  {/* X-axis time label */}
                  {showLabel && (
                    <text
                      x={c.x}
                      y={height - 6}
                      fill={isHovered ? '#ffffff' : '#8a94a6'}
                      fontSize="10"
                      fontWeight={isHovered ? '600' : '400'}
                      textAnchor="middle"
                      fontFamily="Inter, sans-serif"
                    >
                      {c.point.time}
                    </text>
                  )}
                </g>
              );
            })}
          </>
        )}
      </svg>

      {/* Floating tooltip with smooth transition */}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            backgroundColor: '#131417',
            border: '1px solid var(--accent-pink, #e23868)',
            borderRadius: '6px',
            padding: '6px 12px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
            zIndex: 10,
            whiteSpace: 'nowrap',
            fontSize: '12px'
          }}
        >
          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '12.5px' }}>
            {tooltip.text}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10.5px', marginTop: '2px' }}>
            {tooltip.time}
          </div>
        </div>
      )}
    </div>
  );
}
