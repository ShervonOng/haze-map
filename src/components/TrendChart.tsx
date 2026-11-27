import { useMemo, useState } from 'react';
import {
  ChartMetricKey,
  GeographicRegionId,
  PsiSnapshot,
  RegionId,
  getPsiBandInfo,
} from '../types/psi';
import { ORDERED_GEO_REGIONS } from '../services/psiService';

interface TrendChartProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
}

const REGION_SERIES_COLORS: Record<GeographicRegionId, string> = {
  west: '#B45309',
  north: '#0369A1',
  central: '#0F172A',
  south: '#BE123C',
  east: '#15803D',
};

export function TrendChart({ snapshot, selectedRegion }: TrendChartProps) {
  const [metric, setMetric] = useState<ChartMetricKey>('psi24h');
  const [compareAll, setCompareAll] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const primaryRegion = snapshot.regions[selectedRegion];
  const hours = primaryRegion.trend24h;

  const metricMeta = {
    psi24h: { label: '24h PSI Index', unit: 'PSI', thresholds: [50, 100, 200] },
    pm25_1h: { label: '1h PM2.5 Concentration', unit: 'µg/m³', thresholds: [55, 150, 250] },
    pm10_24h: { label: '24h PM10 Concentration', unit: 'µg/m³', thresholds: [50, 150, 350] },
  }[metric];

  const { yMax, yTicks } = useMemo(() => {
    const allValues: number[] = [];
    const targetRegions = compareAll ? ORDERED_GEO_REGIONS : [selectedRegion];
    targetRegions.forEach((rId) => {
      snapshot.regions[rId].trend24h.forEach((pt) => {
        allValues.push(pt[metric]);
      });
    });
    const peak = Math.max(...allValues, metric === 'psi24h' ? 60 : 40);
    const roundedMax = Math.ceil((peak * 1.18) / 25) * 25;
    const step = roundedMax / 4;
    return {
      yMax: roundedMax,
      yTicks: [0, step, step * 2, step * 3, roundedMax].map((v) => Math.round(v)),
    };
  }, [snapshot, selectedRegion, compareAll, metric]);

  const svgW = 920;
  const svgH = 280;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const getX = (idx: number) =>
    padL + (idx / Math.max(1, hours.length - 1)) * plotW;
  const getY = (val: number) =>
    padT + plotH - Math.min(1, Math.max(0, val / yMax)) * plotH;

  const buildPath = (regionId: RegionId) =>
    snapshot.regions[regionId].trend24h
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(pt[metric]).toFixed(1)}`)
      .join(' ');

  const buildAreaPath = (regionId: RegionId) => {
    const line = buildPath(regionId);
    const lastX = getX(hours.length - 1).toFixed(1);
    const firstX = getX(0).toFixed(1);
    const baseY = (padT + plotH).toFixed(1);
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const activeIdx = hoverIdx !== null ? hoverIdx : hours.length - 1;
  const activePoint = hours[activeIdx];
  const primaryBand = getPsiBandInfo(primaryRegion.readings.psi_twenty_four_hourly);

  return (
    <section
      id="trends"
      aria-labelledby="trends-heading"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 id="trends-heading" className="font-display text-base font-semibold text-slate-900">
            24-Hour Atmospheric Trajectory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {compareAll
              ? 'Comparing all 5 Singapore regions over the past 24 hours'
              : `Hourly progression for ${primaryRegion.name}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Chart metric selector"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            {(
              [
                { id: 'psi24h', label: '24h PSI' },
                { id: 'pm25_1h', label: '1h PM2.5' },
                { id: 'pm10_24h', label: '24h PM10' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMetric(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  metric === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCompareAll((prev) => !prev)}
            aria-pressed={compareAll}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[34px] ${
              compareAll
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {compareAll ? 'Comparing All 5 Regions' : 'Compare All Regions'}
          </button>
        </div>
      </div>

      {/* Live Crosshair Readout Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {activePoint.label} SGT
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-600">{metricMeta.label}</span>
        </div>

        {compareAll ? (
          <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
            {ORDERED_GEO_REGIONS.map((rId) => {
              const r = snapshot.regions[rId];
              return (
                <span key={rId} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: REGION_SERIES_COLORS[rId] }}
                  />
                  <span className="font-sans text-slate-600">{r.name}:</span>
                  <span className="font-semibold text-slate-900">
                    {r.trend24h[activeIdx][metric]}
                  </span>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="font-mono font-semibold text-slate-900 tabular-nums">
            {primaryRegion.name}: {activePoint[metric]}{' '}
            <span className="font-sans font-normal text-slate-500">{metricMeta.unit}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          role="img"
          aria-label={`24-hour ${metricMeta.label} chart`}
          className="w-full h-auto overflow-visible select-none cursor-crosshair"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryBand.accentHex} stopOpacity="0.16" />
              <stop offset="100%" stopColor={primaryBand.accentHex} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Y-Axis Hairlines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={svgW - padR}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padL - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[11px] fill-slate-400 tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* NEA Threshold Reference Lines */}
          {metricMeta.thresholds.map((thresh) => {
            if (thresh > yMax) return null;
            const y = getY(thresh);
            return (
              <g key={`th-${thresh}`}>
                <line
                  x1={padL}
                  y1={y}
                  x2={svgW - padR}
                  y2={y}
                  stroke="#94A3B8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgW - padR}
                  y={y - 5}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-slate-500"
                >
                  {metric === 'psi24h'
                    ? thresh === 50
                      ? '50 Good limit'
                      : thresh === 100
                      ? '100 Moderate limit'
                      : '200 Unhealthy limit'
                    : `${thresh} ${metricMeta.unit}`}
                </text>
              </g>
            );
          })}

          {/* Series Area & Lines */}
          {!compareAll ? (
            <>
              <path d={buildAreaPath(selectedRegion)} fill="url(#primaryAreaGrad)" />
              <path
                d={buildPath(selectedRegion)}
                fill="none"
                stroke={primaryBand.accentHex}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            ORDERED_GEO_REGIONS.map((rId) => (
              <path
                key={rId}
                d={buildPath(rId)}
                fill="none"
                stroke={REGION_SERIES_COLORS[rId]}
                strokeWidth={selectedRegion === rId ? '2.75' : '1.75'}
                strokeOpacity={
                  selectedRegion === 'national' || selectedRegion === rId ? 1 : 0.45
                }
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))
          )}

          {/* X-Axis Hour Labels (every 4 hours + latest) */}
          {hours.map((pt, idx) => {
            if (idx % 4 !== 0 && idx !== hours.length - 1) return null;
            return (
              <text
                key={pt.timestamp}
                x={getX(idx)}
                y={svgH - 8}
                textAnchor="middle"
                className="font-mono text-[11px] fill-slate-400 tabular-nums"
              >
                {pt.label}
              </text>
            );
          })}

          {/* Crosshair Guide & Active Point Dot */}
          <line
            x1={getX(activeIdx)}
            y1={padT}
            x2={getX(activeIdx)}
            y2={padT + plotH}
            stroke="#0F172A"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.45"
          />

          {!compareAll ? (
            <circle
              cx={getX(activeIdx)}
              cy={getY(activePoint[metric])}
              r="4.5"
              fill="#FFFFFF"
              stroke={primaryBand.accentHex}
              strokeWidth="2.5"
            />
          ) : (
            ORDERED_GEO_REGIONS.map((rId) => (
              <circle
                key={rId}
                cx={getX(activeIdx)}
                cy={getY(snapshot.regions[rId].trend24h[activeIdx][metric])}
                r="3.5"
                fill="#FFFFFF"
                stroke={REGION_SERIES_COLORS[rId]}
                strokeWidth="2"
              />
            ))
          )}

          {/* Invisible Hover Capture Columns */}
          {hours.map((pt, idx) => {
            const colW = plotW / Math.max(1, hours.length - 1);
            return (
              <rect
                key={`hit-${pt.timestamp}`}
                x={getX(idx) - colW / 2}
                y={padT}
                width={colW}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(idx)}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
