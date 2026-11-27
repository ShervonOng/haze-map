import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import {
  RegionTelemetry,
  getPm25BandLabel,
  getPsiBandInfo,
} from '../types/psi';

interface RegionInspectorProps {
  region: RegionTelemetry;
  isLoading: boolean;
}

export function RegionInspector({ region, isLoading }: RegionInspectorProps) {
  const psi = region.readings.psi_twenty_four_hourly;
  const pm25_1h = region.readings.pm25_one_hourly;
  const bandMeta = getPsiBandInfo(psi);
  const pm25Meta = getPm25BandLabel(pm25_1h);

  const subIndices = [
    {
      label: 'PM2.5 Sub-Index',
      unit: '24h PSI eq.',
      value: region.readings.pm25_sub_index,
      max: 300,
    },
    {
      label: 'PM10 Sub-Index',
      unit: '24h µg/m³',
      value: region.readings.pm10_twenty_four_hourly,
      max: 300,
    },
    {
      label: 'Ozone (O₃)',
      unit: '8h sub-index',
      value: region.readings.o3_sub_index,
      max: 150,
    },
    {
      label: 'Nitrogen Dioxide (NO₂)',
      unit: '1h max µg/m³',
      value: region.readings.no2_one_hour_max,
      max: 150,
    },
    {
      label: 'Sulphur Dioxide (SO₂)',
      unit: '24h sub-index',
      value: region.readings.so2_sub_index,
      max: 100,
    },
    {
      label: 'Carbon Monoxide (CO)',
      unit: '8h sub-index',
      value: region.readings.co_sub_index,
      max: 100,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
      <div>
        {/* Sector Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{region.stationName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {region.coordinates.lat.toFixed(3)}°N, {region.coordinates.lng.toFixed(3)}°E
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-1 truncate">
              {region.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 truncate">
              {region.towns.join(' · ')}
            </p>
          </div>

          <div
            className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold ${bandMeta.surfaceBg} ${bandMeta.borderColor} ${bandMeta.textColor}`}
          >
            <span aria-hidden="true" className="mr-1.5">
              {bandMeta.shortGlyph}
            </span>
            {bandMeta.band}
          </div>
        </div>

        {/* Hero PSI & 1h PM2.5 Readout */}
        {isLoading ? (
          <div className="my-5 space-y-3 animate-pulse">
            <div className="h-12 w-36 rounded bg-slate-100" />
            <div className="h-4 w-56 rounded bg-slate-100" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 py-5">
            <div>
              <div className="text-xs font-medium text-slate-500">24-Hour PSI</div>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span className="font-mono text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {psi}
                </span>
                <span className="inline-flex items-center gap-0.5 font-mono text-xs font-medium text-slate-600 tabular-nums">
                  {region.delta24h > 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                  ) : region.delta24h < 0 ? (
                    <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  )}
                  {region.delta24h > 0 ? `+${region.delta24h}` : region.delta24h} / 24h
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Band {bandMeta.rangeLabel} · Lead: {region.dominantPollutant}
              </div>
            </div>

            <div className="border-l border-slate-100 pl-4">
              <div className="text-xs font-medium text-slate-500">1-Hour PM2.5</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {pm25_1h}
                </span>
                <span className="font-mono text-xs text-slate-500">µg/m³</span>
              </div>
              <div className={`mt-1 text-xs font-medium ${pm25Meta.textColor}`}>
                {pm25Meta.label} Concentration
              </div>
            </div>
          </div>
        )}

        {/* Local Meteorological Conditions */}
        <div className="grid grid-cols-3 gap-3 border-b border-slate-100 py-3.5 text-xs">
          <div>
            <div className="text-slate-500">Surface Wind</div>
            <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
              {region.windCardinal} {region.windSpeedKmh} km/h
            </div>
          </div>
          <div>
            <div className="text-slate-500">Visibility</div>
            <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
              {region.visibilityKm.toFixed(1)} km
            </div>
          </div>
          <div>
            <div className="text-slate-500">Rel. Humidity</div>
            <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
              {region.humidityPct}%
            </div>
          </div>
        </div>

        {/* Pollutant Sub-Index Breakdown */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-3">
            <span>Pollutant Sub-Indices</span>
            <span className="font-mono font-normal text-slate-400">NEA Standard</span>
          </div>

          <div className="space-y-2.5">
            {subIndices.map((item) => {
              const pct = Math.min(100, Math.max(4, Math.round((item.value / item.max) * 100)));
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-slate-400">{item.unit}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums w-8 text-right">
                        {item.value}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          item.label.startsWith('PM2.5') ? bandMeta.accentHex : '#64748B',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
        {bandMeta.summary}
      </p>
    </div>
  );
}
