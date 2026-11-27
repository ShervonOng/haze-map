import { useMemo, useState } from 'react';
import { ArrowUpDown, Search, X } from 'lucide-react';
import {
  GeographicRegionId,
  PsiBand,
  PsiSnapshot,
  RegionId,
  RegionTelemetry,
  getPsiBandInfo,
} from '../types/psi';
import { ORDERED_GEO_REGIONS } from '../services/psiService';

interface RegionalMatrixProps {
  snapshot: PsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (region: RegionId) => void;
  isLoading: boolean;
}

type SortKey = 'name' | 'psi' | 'pm25' | 'visibility';

function MiniSparkline({
  points,
  color,
}: {
  points: number[];
  color: string;
}) {
  const width = 88;
  const height = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(4, max - min);

  const path = points
    .map((val, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RegionalMatrix({
  snapshot,
  selectedRegion,
  onSelectRegion,
  isLoading,
}: RegionalMatrixProps) {
  const [query, setQuery] = useState('');
  const [bandFilter, setBandFilter] = useState<'all' | PsiBand>('all');
  const [sortBy, setSortBy] = useState<SortKey>('psi');
  const [sortAsc, setSortAsc] = useState(false);

  const rows = useMemo(() => {
    const allGeo: RegionTelemetry[] = ORDERED_GEO_REGIONS.map(
      (id: GeographicRegionId) => snapshot.regions[id]
    );

    const trimmed = query.trim().toLowerCase();
    const filtered = allGeo.filter((region) => {
      const band = getPsiBandInfo(region.readings.psi_twenty_four_hourly).band;
      if (bandFilter !== 'all' && band !== bandFilter) {
        return false;
      }
      if (!trimmed) return true;
      return (
        region.name.toLowerCase().includes(trimmed) ||
        region.stationName.toLowerCase().includes(trimmed) ||
        region.towns.some((t) => t.toLowerCase().includes(trimmed))
      );
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'psi') {
        cmp = a.readings.psi_twenty_four_hourly - b.readings.psi_twenty_four_hourly;
      } else if (sortBy === 'pm25') {
        cmp = a.readings.pm25_one_hourly - b.readings.pm25_one_hourly;
      } else {
        cmp = a.visibilityKm - b.visibilityKm;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [snapshot, query, bandFilter, sortBy, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortBy(key);
      setSortAsc(key === 'name');
    }
  };

  return (
    <section
      aria-labelledby="regional-comparison-heading"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2
            id="regional-comparison-heading"
            className="font-display text-base font-semibold text-slate-900"
          >
            Singapore Regional Stations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search any town or planning area (e.g. Tampines, Jurong, Woodlands, Orchard) to locate its sector
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find town or region..."
              aria-label="Filter Singapore regions by town or station"
              className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none min-h-[36px]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear town search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter by PSI band"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            {(['all', 'Good', 'Moderate', 'Unhealthy', 'Very Unhealthy'] as const).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBandFilter(item)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    bandFilter === item
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item === 'all' ? 'All Bands' : item}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
              <th className="py-2.5 pl-5 pr-3">
                <button
                  type="button"
                  onClick={() => toggleSort('name')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Region & Towns</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </button>
              </th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('psi')}
                  className="inline-flex items-center justify-end gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>24h PSI</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('pm25')}
                  className="inline-flex items-center justify-end gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>1h PM2.5</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-right">24h PM10</th>
              <th className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => toggleSort('visibility')}
                  className="inline-flex items-center justify-end gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Visibility</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </button>
              </th>
              <th className="px-3 py-2.5">Wind</th>
              <th className="py-2.5 pl-3 pr-5 text-right">24h Curve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="h-[52px] animate-pulse">
                  <td colSpan={8} className="px-5 py-3">
                    <div className="h-4 w-full rounded bg-slate-100" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-900">
                    No monitoring regions match your filter
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Reset the band filter or search for another Singapore planning area.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setBandFilter('all');
                    }}
                    className="mt-3 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((region) => {
                const psi = region.readings.psi_twenty_four_hourly;
                const bandMeta = getPsiBandInfo(psi);
                const isSelected = selectedRegion === region.id;

                return (
                  <tr
                    key={region.id}
                    onClick={() => onSelectRegion(region.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-slate-900">
                          {region.name}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-medium text-sky-700">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[280px]">
                        {region.towns.join(' · ')}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`text-xs font-semibold ${bandMeta.textColor}`}>
                        <span aria-hidden="true" className="mr-1.5">
                          {bandMeta.shortGlyph}
                        </span>
                        {bandMeta.band}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {psi}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {region.readings.pm25_one_hourly}{' '}
                      <span className="text-[11px] text-slate-400">µg/m³</span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {region.readings.pm10_twenty_four_hourly}{' '}
                      <span className="text-[11px] text-slate-400">µg/m³</span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {region.visibilityKm.toFixed(1)} km
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {region.windCardinal} {region.windSpeedKmh} km/h
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <div className="inline-flex justify-end">
                        <MiniSparkline
                          points={region.trend24h.map((p) => p.psi24h)}
                          color={bandMeta.accentHex}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
