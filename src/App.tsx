import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Code2 } from 'lucide-react';
import { ApiConnectionDrawer } from './components/ApiConnectionDrawer';
import { HealthAdvisory } from './components/HealthAdvisory';
import { RegionInspector } from './components/RegionInspector';
import { RegionalMatrix } from './components/RegionalMatrix';
import { SingaporeMap } from './components/SingaporeMap';
import { TopBar } from './components/TopBar';
import { TrendChart } from './components/TrendChart';
import { ORDERED_GEO_REGIONS, fetchPsiSnapshot } from './services/psiService';
import {
  HazeScenarioId,
  PsiSnapshot,
  RegionId,
  getPm25BandLabel,
  getPsiBandInfo,
} from './types/psi';

const SCENARIO_OPTIONS: { id: HazeScenarioId; label: string }[] = [
  { id: 'live', label: 'Live NEA Feed' },
  { id: 'clear', label: 'Baseline Clear' },
  { id: 'moderate', label: 'Moderate Drift' },
  { id: 'transboundary', label: 'Transboundary Haze' },
  { id: 'severe', label: 'Severe Episode' },
];

export default function App() {
  const [scenario, setScenario] = useState<HazeScenarioId>('live');
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('national');
  const [mapMetric, setMapMetric] = useState<'psi' | 'pm25'>('psi');
  const [snapshot, setSnapshot] = useState<PsiSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const loadSnapshot = useCallback(
    async (targetScenario: HazeScenarioId, jitter = false) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const next = await fetchPsiSnapshot(targetScenario, jitter);
        setSnapshot(next);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to fetch live PSI readings from /api/psi.';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadSnapshot(scenario, false);
  }, [scenario, loadSnapshot]);

  const handleRefresh = () => {
    void loadSnapshot(scenario, scenario !== 'live');
  };

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TopBar onRefresh={handleRefresh} isLoading={isLoading} />
        <main className="mx-auto max-w-[1280px] px-6 py-8">
          {errorMessage ? (
            <div className="rounded-xl border border-rose-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    Unable to load live Singapore PSI readings
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{errorMessage}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Retry Live Feed
                    </button>
                    <button
                      type="button"
                      onClick={() => setScenario('moderate')}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Switch to Moderate Simulation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-pulse">
              <div className="h-24 rounded-xl border border-slate-200 bg-white" />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="h-[440px] rounded-xl border border-slate-200 bg-white lg:col-span-7" />
                <div className="h-[440px] rounded-xl border border-slate-200 bg-white lg:col-span-5" />
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  const activeRegion = snapshot.regions[selectedRegion];
  const national = snapshot.regions.national;
  const nationalBand = getPsiBandInfo(national.readings.psi_twenty_four_hourly);
  const nationalPmMeta = getPm25BandLabel(national.readings.pm25_one_hourly);

  const highestRegion = ORDERED_GEO_REGIONS.map((id) => snapshot.regions[id]).sort(
    (a, b) => b.readings.psi_twenty_four_hourly - a.readings.psi_twenty_four_hourly
  )[0];
  const highestBand = getPsiBandInfo(highestRegion.readings.psi_twenty_four_hourly);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar onRefresh={handleRefresh} isLoading={isLoading} />

      <main className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        {errorMessage && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>{errorMessage} Showing last loaded readings.</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-md border border-amber-300 bg-white px-3 py-1 font-medium text-amber-900 hover:bg-amber-100/50 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview Header & Workspace Toolbar */}
        <section id="overview" aria-labelledby="overview-heading" className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Singapore Air Quality Observatory</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{snapshot.updatedAtSgt}</span>
                <span aria-hidden="true">·</span>
                <span className={snapshot.isLive ? 'font-medium text-emerald-700' : ''}>
                  {snapshot.sourceLabel}
                </span>
              </div>
              <h1
                id="overview-heading"
                className="font-display mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance"
              >
                Live Singapore PSI & Transboundary Haze Monitor
              </h1>
            </div>

            {/* Workspace Toolbar: Live Feed + Scenario Simulator + API Status */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                role="group"
                aria-label="Data feed and haze condition presets"
                className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
              >
                {SCENARIO_OPTIONS.map((opt) => {
                  const active = scenario === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setScenario(opt.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
              >
                <Code2 className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>API Status</span>
              </button>
            </div>
          </div>

          {/* Full-Width 4-Column National Summary KPI Strip */}
          <div className="grid grid-cols-1 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            <div className="p-5 sm:border-b sm:border-r lg:border-b-0 lg:border-r-0 border-slate-200">
              <div className="text-xs font-medium text-slate-500">
                National 24-Hour PSI Peak
              </div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  {national.readings.psi_twenty_four_hourly}
                </span>
                <span className={`text-xs font-semibold ${nationalBand.textColor}`}>
                  <span aria-hidden="true" className="mr-1">
                    {nationalBand.shortGlyph}
                  </span>
                  {nationalBand.band}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                NEA scale {nationalBand.rangeLabel} · Primary: {national.dominantPollutant}
              </p>
            </div>

            <div className="p-5 sm:border-b lg:border-b-0 border-slate-200">
              <div className="text-xs font-medium text-slate-500">Highest Sector Reading</div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  {highestRegion.readings.psi_twenty_four_hourly}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedRegion(highestRegion.id)}
                  className={`text-xs font-semibold underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 cursor-pointer ${highestBand.textColor}`}
                >
                  {highestRegion.name} Sector
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500 truncate">
                {highestRegion.stationName}
              </p>
            </div>

            <div className="p-5 sm:border-r lg:border-r-0 border-slate-200">
              <div className="text-xs font-medium text-slate-500">
                Islandwide 24-Hour PM2.5 Mean
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  {national.readings.pm25_twenty_four_hourly}
                </span>
                <span className="font-mono text-xs text-slate-500">µg/m³</span>
                <span className={`text-xs font-semibold ${nationalPmMeta.textColor}`}>
                  {nationalPmMeta.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                PM10 mean {national.readings.pm10_twenty_four_hourly} µg/m³ · O₃ sub-index{' '}
                {national.readings.o3_sub_index}
              </p>
            </div>

            <div className="p-5">
              <div className="text-xs font-medium text-slate-500">
                Wind Drift &amp; Visibility
              </div>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  {national.windCardinal} {national.windSpeedKmh}
                </span>
                <span className="font-mono text-xs text-slate-500">km/h</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 truncate" title={snapshot.windSummary}>
                Visibility {national.visibilityKm.toFixed(1)} km · {snapshot.monsoonSeason}
              </p>
            </div>
          </div>
        </section>

        {/* Primary Map & Regional Inspector Split */}
        <section
          id="regional-map"
          aria-label="Interactive regional map and station details"
          className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <SingaporeMap
              snapshot={snapshot}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              mapMetric={mapMetric}
              onChangeMapMetric={setMapMetric}
            />
          </div>

          <div className="lg:col-span-5">
            <RegionInspector region={activeRegion} isLoading={isLoading} />
          </div>
        </section>

        {/* Regional Comparison Table */}
        <RegionalMatrix
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          isLoading={isLoading}
        />

        {/* 24-Hour Trend Chart */}
        <TrendChart snapshot={snapshot} selectedRegion={selectedRegion} />

        {/* Official NEA Health Advisory */}
        <HealthAdvisory region={activeRegion} />
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-slate-800">SG Haze Watch</span>
            <span aria-hidden="true">·</span>
            <span>Live data via data.gov.sg NEA Real-Time PSI API</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Thresholds aligned to NEA Singapore guidelines</span>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              API Health &amp; Endpoints
            </button>
          </div>
        </div>
      </footer>

      <ApiConnectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
