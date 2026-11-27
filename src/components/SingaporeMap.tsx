import { Wind } from 'lucide-react';
import {
  GeographicRegionId,
  PsiSnapshot,
  RegionId,
  getPsiBandInfo,
  getPm25BandLabel,
} from '../types/psi';

interface SingaporeMapProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  mapMetric: 'psi' | 'pm25';
  onChangeMapMetric: (metric: 'psi' | 'pm25') => void;
}

interface StationAnchor {
  id: GeographicRegionId;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  subLabel: string;
}

const STATION_ANCHORS: StationAnchor[] = [
  {
    id: 'west',
    x: 205,
    y: 226,
    labelX: 205,
    labelY: 226,
    subLabel: 'Jurong West',
  },
  {
    id: 'north',
    x: 425,
    y: 112,
    labelX: 425,
    labelY: 112,
    subLabel: 'Woodlands',
  },
  {
    id: 'central',
    x: 448,
    y: 215,
    labelX: 448,
    labelY: 215,
    subLabel: 'Toa Payoh',
  },
  {
    id: 'south',
    x: 432,
    y: 316,
    labelX: 432,
    labelY: 316,
    subLabel: 'Marina South',
  },
  {
    id: 'east',
    x: 662,
    y: 204,
    labelX: 662,
    labelY: 204,
    subLabel: 'Tampines',
  },
];

const WIND_FIELD_POINTS = [
  { x: 115, y: 120 },
  { x: 135, y: 345 },
  { x: 295, y: 360 },
  { x: 560, y: 345 },
  { x: 755, y: 315 },
  { x: 745, y: 120 },
];

export function SingaporeMap({
  snapshot,
  selectedRegion,
  onSelectRegion,
  mapMetric,
  onChangeMapMetric,
}: SingaporeMapProps) {
  const national = snapshot.regions.national;
  // Wind vector points toward the direction wind is blowing TO (meteorological fromDeg + 180)
  const windTravelDeg = (national.windDirectionDeg + 180) % 360;

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Regional Dispersion Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a monitoring sector to inspect local pollutants and 24-hour trajectory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Map overlay metric"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => onChangeMapMetric('psi')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mapMetric === 'psi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24h PSI
            </button>
            <button
              type="button"
              onClick={() => onChangeMapMetric('pm25')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mapMetric === 'pm25'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1h PM2.5
            </button>
          </div>

          {selectedRegion !== 'national' && (
            <button
              type="button"
              onClick={() => onSelectRegion('national')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              All Singapore
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 bg-[#F3F7FA] min-h-[360px]">
        <svg
          viewBox="0 0 880 460"
          role="img"
          aria-label="Interactive air quality map of Singapore monitoring regions"
          className="h-full w-full select-none"
        >
          <defs>
            <pattern id="sgGrid" width="88" height="76.6" patternUnits="userSpaceOnUse">
              <path
                d="M 88 0 L 0 0 0 76.6"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.75"
              />
            </pattern>
            {STATION_ANCHORS.map((station) => {
              const region = snapshot.regions[station.id];
              const bandMeta = getPsiBandInfo(region.readings.psi_twenty_four_hourly);
              return (
                <radialGradient
                  key={`grad-${station.id}`}
                  id={`halo-${station.id}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor={bandMeta.haloHex} stopOpacity="0.28" />
                  <stop offset="65%" stopColor={bandMeta.haloHex} stopOpacity="0.09" />
                  <stop offset="100%" stopColor={bandMeta.haloHex} stopOpacity="0" />
                </radialGradient>
              );
            })}
          </defs>

          {/* Background Coordinate Grid */}
          <rect width="880" height="460" fill="url(#sgGrid)" />

          {/* Latitude / Longitude Labels */}
          <g className="font-mono text-[10px] fill-slate-400">
            <text x="16" y="72">1.45° N</text>
            <text x="16" y="226">1.35° N</text>
            <text x="16" y="380">1.25° N</text>
            <text x="176" y="446">103.70° E</text>
            <text x="415" y="446">103.82° E</text>
            <text x="650" y="446">103.94° E</text>
          </g>

          {/* Straits Typography */}
          <text
            x="435"
            y="42"
            textAnchor="middle"
            className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase fill-slate-400"
          >
            Johor Strait
          </text>
          <text
            x="555"
            y="416"
            textAnchor="middle"
            className="font-sans text-[11px] font-medium tracking-[0.18em] uppercase fill-slate-400"
          >
            Singapore Strait
          </text>

          {/* Causeway & Second Link Infrastructure Hairlines */}
          <line x1="398" y1="68" x2="398" y2="34" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3 2" />
          <line x1="112" y1="226" x2="72" y2="210" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="3 2" />

          {/* Singapore Main Island Landmass */}
          <path
            d="M 96 246
               L 106 218 L 122 195 L 146 178 L 165 152 L 195 138
               L 234 128 L 268 112 L 306 105 L 348 82 L 385 68
               L 418 66 L 444 76 L 478 88 L 516 98 L 556 112
               L 598 118 L 635 128 L 672 138 L 714 146 L 758 148
               L 784 164 L 788 188 L 772 216 L 748 238 L 718 258
               L 675 275 L 628 286 L 580 296 L 535 304 L 495 316
               L 462 328 L 435 338 L 412 330 L 390 342 L 352 332
               L 318 320 L 285 308 L 245 296 L 204 288 L 166 286
               L 132 294 L 106 280 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Pulau Ubin */}
          <path
            d="M 624 102 L 664 96 L 696 104 L 698 118 L 668 124 L 632 118 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Pulau Tekong */}
          <path
            d="M 728 96 L 772 86 L 796 104 L 786 130 L 748 134 L 724 118 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Jurong Island */}
          <path
            d="M 164 316 L 228 308 L 266 322 L 258 346 L 210 356 L 168 342 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Sentosa */}
          <path
            d="M 384 352 L 424 350 L 444 362 L 428 372 L 390 368 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Subtle Regional Sector Dividers */}
          <g stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4">
            <line x1="295" y1="108" x2="310" y2="315" />
            <line x1="302" y1="176" x2="565" y2="162" />
            <line x1="560" y1="115" x2="555" y2="298" />
            <line x1="310" y1="274" x2="555" y2="266" />
          </g>

          {/* Dispersion Halos */}
          {STATION_ANCHORS.map((station) => (
            <circle
              key={`halo-${station.id}`}
              cx={station.x}
              cy={station.y}
              r={selectedRegion === station.id ? 105 : 88}
              fill={`url(#halo-${station.id})`}
              className="pointer-events-none transition-all duration-300"
            />
          ))}

          {/* Atmospheric Wind Vector Field */}
          <g className="pointer-events-none opacity-65">
            {WIND_FIELD_POINTS.map((pt, idx) => (
              <g
                key={idx}
                transform={`translate(${pt.x}, ${pt.y}) rotate(${windTravelDeg})`}
              >
                <line
                  x1="0"
                  y1="14"
                  x2="0"
                  y2="-14"
                  stroke="#64748B"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
                <polyline
                  points="-4,-8 0,-14 4,-8"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </g>

          {/* Interactive Regional Station Markers */}
          {STATION_ANCHORS.map((station) => {
            const region = snapshot.regions[station.id];
            const psi = region.readings.psi_twenty_four_hourly;
            const pm25 = region.readings.pm25_one_hourly;
            const bandMeta = getPsiBandInfo(psi);
            const pmMeta = getPm25BandLabel(pm25);
            const isSelected = selectedRegion === station.id;
            const isAllSelected = selectedRegion === 'national';
            const displayValue = mapMetric === 'psi' ? psi : pm25;
            const displaySub =
              mapMetric === 'psi' ? bandMeta.band : `${pmMeta.label} · µg/m³`;

            return (
              <g
                key={station.id}
                role="button"
                tabIndex={0}
                aria-label={`${region.name} region: ${psi} PSI (${bandMeta.band}), ${pm25} µg/m³ PM2.5`}
                aria-pressed={isSelected}
                onClick={() => onSelectRegion(station.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRegion(station.id);
                  }
                }}
                className="cursor-pointer focus:outline-none group"
                style={{
                  opacity: isAllSelected || isSelected ? 1 : 0.72,
                }}
              >
                {/* Selection Ring */}
                {isSelected && (
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r="38"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Marker Card */}
                <rect
                  x={station.labelX - 58}
                  y={station.labelY - 30}
                  width="116"
                  height="60"
                  rx="8"
                  fill={isSelected ? '#0F172A' : '#FFFFFF'}
                  stroke={isSelected ? '#0F172A' : bandMeta.accentHex}
                  strokeWidth={isSelected ? '2' : '1.25'}
                  className="transition-colors duration-150"
                />

                {/* Top Region Label */}
                <text
                  x={station.labelX - 46}
                  y={station.labelY - 11}
                  className={`font-display text-[11px] font-semibold ${
                    isSelected ? 'fill-slate-300' : 'fill-slate-600'
                  }`}
                >
                  {region.name}
                </text>

                {/* Primary Value */}
                <text
                  x={station.labelX - 46}
                  y={station.labelY + 15}
                  className={`font-mono text-[22px] font-bold tabular-nums ${
                    isSelected ? 'fill-white' : 'fill-slate-900'
                  }`}
                >
                  {displayValue}
                </text>

                {/* Status Text */}
                <text
                  x={station.labelX + 48}
                  y={station.labelY + 13}
                  textAnchor="end"
                  fill={isSelected ? '#E2E8F0' : bandMeta.accentHex}
                  className="font-sans text-[10px] font-semibold"
                >
                  {displaySub}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom-left Compact Wind & Scale Overlay */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs text-slate-700 backdrop-blur-xs">
            <Wind className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span className="font-medium text-slate-900">
              Wind {national.windCardinal} {national.windSpeedKmh} km/h
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500 truncate max-w-[260px] sm:max-w-none">
              {snapshot.monsoonSeason}
            </span>
          </div>

          <div className="pointer-events-auto hidden sm:flex items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] text-slate-600 backdrop-blur-xs">
            <span className="font-medium text-emerald-700">0–50 Good</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-sky-700">51–100 Moderate</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-amber-700">101–200 Unhealthy</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-orange-700">201+ Very Unhealthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
