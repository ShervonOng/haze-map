export type RegionId = 'national' | 'north' | 'south' | 'east' | 'west' | 'central';

export type GeographicRegionId = Exclude<RegionId, 'national'>;

export type PsiBand =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export type HazeScenarioId = 'live' | 'clear' | 'moderate' | 'transboundary' | 'severe';

export type ChartMetricKey = 'psi24h' | 'pm25_1h' | 'pm10_24h';

export interface PollutantReadings {
  psi_twenty_four_hourly: number;
  pm25_twenty_four_hourly: number;
  pm25_one_hourly: number;
  pm10_twenty_four_hourly: number;
  pm25_sub_index: number;
  pm10_sub_index: number;
  o3_sub_index: number;
  co_sub_index: number;
  so2_sub_index: number;
  no2_one_hour_max: number;
}

export interface HourlyTrendPoint {
  timestamp: string;
  label: string;
  psi24h: number;
  pm25_1h: number;
  pm10_24h: number;
}

export interface RegionTelemetry {
  id: RegionId;
  name: string;
  stationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  towns: string[];
  readings: PollutantReadings;
  delta24h: number;
  dominantPollutant: 'PM2.5' | 'PM10' | 'O₃' | 'NO₂';
  windDirectionDeg: number;
  windCardinal: string;
  windSpeedKmh: number;
  visibilityKm: number;
  humidityPct: number;
  trend24h: HourlyTrendPoint[];
}

export interface PsiSnapshot {
  scenarioId: HazeScenarioId;
  scenarioLabel: string;
  isLive: boolean;
  sourceLabel: string;
  updatedAtIso: string;
  updatedAtSgt: string;
  monsoonSeason: string;
  windSummary: string;
  regions: Record<RegionId, RegionTelemetry>;
}

export interface PsiBandMeta {
  band: PsiBand;
  rangeLabel: string;
  shortGlyph: string;
  textColor: string;
  surfaceBg: string;
  borderColor: string;
  accentHex: string;
  haloHex: string;
  summary: string;
  generalPublicAdvice: string;
  vulnerableAdvice: string;
  outdoorExercise: string;
  maskGuidance: string;
  indoorAction: string;
}

export function getPsiBandInfo(psi: number): PsiBandMeta {
  if (psi <= 50) {
    return {
      band: 'Good',
      rangeLabel: '0–50',
      shortGlyph: '●',
      textColor: 'text-emerald-700',
      surfaceBg: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200',
      accentHex: '#15803D',
      haloHex: '#22C55E',
      summary: 'Air quality is clean with low particulate concentration across monitoring stations.',
      generalPublicAdvice: 'Normal activities across all outdoor settings.',
      vulnerableAdvice: 'Normal activities; no precautionary restrictions required.',
      outdoorExercise: 'Unrestricted for outdoor sports, running, and school PE.',
      maskGuidance: 'Not required.',
      indoorAction: 'Natural cross-ventilation recommended.',
    };
  }
  if (psi <= 100) {
    return {
      band: 'Moderate',
      rangeLabel: '51–100',
      shortGlyph: '◆',
      textColor: 'text-sky-700',
      surfaceBg: 'bg-sky-50/70',
      borderColor: 'border-sky-200',
      accentHex: '#0369A1',
      haloHex: '#0EA5E9',
      summary: 'Acceptable air quality; slight haze visibility reduction during afternoon peaks.',
      generalPublicAdvice: 'Normal activities may continue without disruption.',
      vulnerableAdvice: 'Normal activities; monitor symptoms if unusually sensitive to fine dust.',
      outdoorExercise: 'Unrestricted for general population; pace endurance exertion if coughing occurs.',
      maskGuidance: 'Not required for short commutes.',
      indoorAction: 'Standard ventilation; keep air purifiers on auto if indoors for long durations.',
    };
  }
  if (psi <= 200) {
    return {
      band: 'Unhealthy',
      rangeLabel: '101–200',
      shortGlyph: '▲',
      textColor: 'text-amber-700',
      surfaceBg: 'bg-amber-50/80',
      borderColor: 'border-amber-200',
      accentHex: '#B45309',
      haloHex: '#F59E0B',
      summary: 'Transboundary smoke plume raising fine particulate matter above healthy baselines.',
      generalPublicAdvice: 'Reduce prolonged or strenuous outdoor physical exertion.',
      vulnerableAdvice: 'Minimise prolonged or strenuous outdoor exertion; seek medical attention if breathless.',
      outdoorExercise: 'Shift high-intensity workouts indoors; shorten outdoor exposure windows.',
      maskGuidance: 'Consider N95 respirator for unavoidable prolonged outdoor exposure if 1h PM2.5 > 55 µg/m³.',
      indoorAction: 'Close exterior windows and run HEPA air purifiers on medium-high.',
    };
  }
  if (psi <= 300) {
    return {
      band: 'Very Unhealthy',
      rangeLabel: '201–300',
      shortGlyph: '■',
      textColor: 'text-orange-700',
      surfaceBg: 'bg-orange-50/85',
      borderColor: 'border-orange-200',
      accentHex: '#C2410C',
      haloHex: '#EA580C',
      summary: 'Dense regional haze event significantly elevating 24-hour PSI and 1-hour PM2.5 loads.',
      generalPublicAdvice: 'Avoid prolonged or strenuous outdoor physical exertion.',
      vulnerableAdvice: 'Minimise outdoor activity; remain indoors with filtered air.',
      outdoorExercise: 'Cancel outdoor sports and move all physical training indoors.',
      maskGuidance: 'Wear a properly fitted N95 mask when outdoors for extended periods.',
      indoorAction: 'Seal windows and balcony doors; operate HEPA filtration continuously.',
    };
  }
  return {
    band: 'Hazardous',
    rangeLabel: '>300',
    shortGlyph: '✖',
    textColor: 'text-rose-700',
    surfaceBg: 'bg-rose-50/90',
    borderColor: 'border-rose-200',
    accentHex: '#BE123C',
    haloHex: '#E11D48',
    summary: 'Severe particulate concentration posing immediate respiratory risk across all groups.',
    generalPublicAdvice: 'Minimise outdoor activity across all age groups.',
    vulnerableAdvice: 'Avoid all outdoor activity; remain strictly indoors with air purification.',
    outdoorExercise: 'Suspend all outdoor physical activity.',
    maskGuidance: 'Wear fitted N95 respirator whenever stepping outside.',
    indoorAction: 'Keep all openings sealed, run HEPA purifiers on maximum, and monitor household air.',
  };
}

export function getPm25BandLabel(pm25: number): { label: string; textColor: string } {
  if (pm25 <= 55) return { label: 'Normal', textColor: 'text-emerald-700' };
  if (pm25 <= 150) return { label: 'Elevated', textColor: 'text-amber-700' };
  if (pm25 <= 250) return { label: 'High', textColor: 'text-orange-700' };
  return { label: 'Very High', textColor: 'text-rose-700' };
}
