import { useEffect, useState } from 'react';
import { PsiBand, RegionTelemetry, getPsiBandInfo } from '../types/psi';

interface HealthAdvisoryProps {
  region: RegionTelemetry;
}

const BAND_PREVIEW_PSI: Record<PsiBand, number> = {
  Good: 35,
  Moderate: 75,
  Unhealthy: 145,
  'Very Unhealthy': 235,
  Hazardous: 330,
};

const BAND_ORDER: PsiBand[] = [
  'Good',
  'Moderate',
  'Unhealthy',
  'Very Unhealthy',
  'Hazardous',
];

export function HealthAdvisory({ region }: HealthAdvisoryProps) {
  const livePsi = region.readings.psi_twenty_four_hourly;
  const liveBandMeta = getPsiBandInfo(livePsi);
  const [inspectedBand, setInspectedBand] = useState<PsiBand>(liveBandMeta.band);

  useEffect(() => {
    setInspectedBand(liveBandMeta.band);
  }, [liveBandMeta.band]);

  const activeMeta = getPsiBandInfo(BAND_PREVIEW_PSI[inspectedBand]);
  const isLiveBand = inspectedBand === liveBandMeta.band;

  return (
    <section
      id="health-advisory"
      aria-labelledby="health-advisory-heading"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2
            id="health-advisory-heading"
            className="font-display text-base font-semibold text-slate-900"
          >
            NEA Health & Activity Advisory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLiveBand
              ? `Active guidance for ${region.name} (${livePsi} PSI · ${liveBandMeta.band})`
              : `Reference protocol for ${activeMeta.band} band (${activeMeta.rangeLabel} PSI)`}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="PSI band reference tabs"
          className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          {BAND_ORDER.map((band) => {
            const selected = inspectedBand === band;
            const isCurrent = band === liveBandMeta.band;
            return (
              <button
                key={band}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setInspectedBand(band)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {band}
                {isCurrent ? ' (Current)' : ''}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">
        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">General Population</div>
          <div className={`mt-1.5 text-sm font-semibold ${activeMeta.textColor}`}>
            {activeMeta.band} ({activeMeta.rangeLabel} PSI)
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {activeMeta.generalPublicAdvice}
          </p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">
            Elderly, Pregnant & Children
          </div>
          <div className="mt-1.5 text-sm font-semibold text-slate-900">
            Sensitive Groups
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {activeMeta.vulnerableAdvice}
          </p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">Outdoor Exercise & Schools</div>
          <div className="mt-1.5 text-sm font-semibold text-slate-900">
            Physical Exertion
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {activeMeta.outdoorExercise}
          </p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-slate-500">Respirators & Indoor Air</div>
          <div className="mt-1.5 text-sm font-semibold text-slate-900">
            N95 & HEPA Filtration
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {activeMeta.maskGuidance} {activeMeta.indoorAction}
          </p>
        </div>
      </div>
    </section>
  );
}
