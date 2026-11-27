import {
  GeographicRegionId,
  HazeScenarioId,
  HourlyTrendPoint,
  PollutantReadings,
  PsiSnapshot,
  RegionId,
  RegionTelemetry,
} from '../types/psi';

interface RegionStaticConfig {
  id: RegionId;
  name: string;
  stationName: string;
  coordinates: { lat: number; lng: number };
  towns: string[];
}

export const SINGAPORE_REGIONS: Record<RegionId, RegionStaticConfig> = {
  national: {
    id: 'national',
    name: 'National (All Singapore)',
    stationName: 'NEA Islandwide Composite',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    towns: ['Islandwide Peak & Mean', 'All 5 Planning Regions'],
  },
  north: {
    id: 'north',
    name: 'North',
    stationName: 'Woodlands & Yishun Telemetry',
    coordinates: { lat: 1.41803, lng: 103.82 },
    towns: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai', 'Admiralty'],
  },
  south: {
    id: 'south',
    name: 'South',
    stationName: 'Marina South & Bukit Merah',
    coordinates: { lat: 1.29587, lng: 103.82 },
    towns: ['Marina South', 'Bukit Merah', 'Queenstown', 'Sentosa', 'Telok Blangah'],
  },
  east: {
    id: 'east',
    name: 'East',
    stationName: 'Tampines & Changi Coastal',
    coordinates: { lat: 1.35735, lng: 103.94 },
    towns: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Marine Parade'],
  },
  west: {
    id: 'west',
    name: 'West',
    stationName: 'Jurong West & Tuas Sector',
    coordinates: { lat: 1.35735, lng: 103.7 },
    towns: ['Jurong West', 'Choa Chu Kang', 'Clementi', 'Bukit Batok', 'Tuas'],
  },
  central: {
    id: 'central',
    name: 'Central',
    stationName: 'Toa Payoh & Bishan Core',
    coordinates: { lat: 1.35735, lng: 103.82 },
    towns: ['Bishan', 'Toa Payoh', 'Orchard', 'Novena', 'Ang Mo Kio'],
  },
};

export const ORDERED_GEO_REGIONS: GeographicRegionId[] = [
  'west',
  'north',
  'central',
  'south',
  'east',
];

type SimulationScenarioId = Exclude<HazeScenarioId, 'live'>;

interface ScenarioTemplate {
  label: string;
  monsoonSeason: string;
  windSummary: string;
  windDirectionDeg: number;
  windCardinal: string;
  windSpeedKmh: number;
  basePsi: Record<GeographicRegionId, number>;
  basePm25_1h: Record<GeographicRegionId, number>;
  delta24h: Record<GeographicRegionId, number>;
  visibilityKm: Record<GeographicRegionId, number>;
  humidityPct: number;
}

const SCENARIO_TEMPLATES: Record<SimulationScenarioId, ScenarioTemplate> = {
  clear: {
    label: 'Baseline Clear',
    monsoonSeason: 'Northeast Monsoon (Early Phase)',
    windSummary: 'Light NNE coastal breeze dispersing urban particulates cleanly',
    windDirectionDeg: 25,
    windCardinal: 'NNE',
    windSpeedKmh: 16,
    basePsi: { north: 42, south: 44, east: 38, west: 46, central: 41 },
    basePm25_1h: { north: 14, south: 15, east: 12, west: 17, central: 14 },
    delta24h: { north: -3, south: -2, east: -4, west: -1, central: -3 },
    visibilityKm: { north: 11.2, south: 10.8, east: 12.0, west: 10.4, central: 11.5 },
    humidityPct: 76,
  },
  moderate: {
    label: 'Moderate Drift',
    monsoonSeason: 'Inter-Monsoon Transition',
    windSummary: 'Light SSW drift bringing mild regional particulate accumulation',
    windDirectionDeg: 208,
    windCardinal: 'SSW',
    windSpeedKmh: 9,
    basePsi: { north: 68, south: 79, east: 64, west: 84, central: 74 },
    basePm25_1h: { north: 27, south: 34, east: 24, west: 38, central: 31 },
    delta24h: { north: +11, south: +16, east: +9, west: +19, central: +14 },
    visibilityKm: { north: 7.8, south: 6.9, east: 8.4, west: 6.2, central: 7.3 },
    humidityPct: 71,
  },
  transboundary: {
    label: 'Transboundary Haze',
    monsoonSeason: 'Southwest Monsoon Haze Plume',
    windSummary: 'Sustained SW winds advecting peatland smoke plumes across Strait of Malacca',
    windDirectionDeg: 225,
    windCardinal: 'SW',
    windSpeedKmh: 14,
    basePsi: { north: 126, south: 144, east: 118, west: 156, central: 138 },
    basePm25_1h: { north: 64, south: 78, east: 58, west: 89, central: 73 },
    delta24h: { north: +38, south: +46, east: +31, west: +54, central: +42 },
    visibilityKm: { north: 3.8, south: 3.1, east: 4.4, west: 2.6, central: 3.4 },
    humidityPct: 64,
  },
  severe: {
    label: 'Severe Episode',
    monsoonSeason: 'Dry Southwest Monsoon Peak',
    windSummary: 'Stagnant boundary layer trapping dense regional smoke across western & southern sectors',
    windDirectionDeg: 215,
    windCardinal: 'SW',
    windSpeedKmh: 7,
    basePsi: { north: 204, south: 228, east: 192, west: 242, central: 216 },
    basePm25_1h: { north: 134, south: 162, east: 121, west: 178, central: 149 },
    delta24h: { north: +68, south: +81, east: +62, west: +92, central: +74 },
    visibilityKm: { north: 1.6, south: 1.2, east: 1.9, west: 0.9, central: 1.4 },
    humidityPct: 58,
  },
};

interface ApiPsiItem {
  date: string;
  updatedTimestamp: string;
  timestamp: string;
  readings: Record<string, Record<string, number>>;
}

interface ApiPsiPayload {
  ok: boolean;
  source?: string;
  fetchedAt?: string;
  regionMetadata?: Array<{
    name: string;
    labelLocation: { latitude: number; longitude: number };
  }>;
  latest?: ApiPsiItem | null;
  items?: ApiPsiItem[];
  error?: string;
}

function formatSgtTime(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatHourLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getSgtMonsoonLabel(date: Date): string {
  const month = Number(
    new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      month: 'numeric',
    }).format(date)
  );
  if (month >= 12 || month <= 3) return 'Northeast Monsoon Season';
  if (month >= 6 && month <= 9) return 'Southwest Monsoon Season';
  return 'Inter-Monsoon Period';
}

function estimateVisibilityKm(psi: number): number {
  if (psi <= 50) return 11.5;
  if (psi <= 100) return Number(Math.max(6.0, 11.5 - (psi - 50) * 0.1).toFixed(1));
  if (psi <= 200) return Number(Math.max(2.4, 6.0 - (psi - 100) * 0.036).toFixed(1));
  return Number(Math.max(0.8, 2.4 - (psi - 200) * 0.014).toFixed(1));
}

function buildTrendSeries(
  currentPsi: number,
  currentPm25: number,
  delta24h: number,
  seedOffset: number,
  now: Date
): HourlyTrendPoint[] {
  const points: HourlyTrendPoint[] = [];
  const startPsi = Math.max(18, currentPsi - delta24h);

  for (let i = 23; i >= 0; i--) {
    const pointDate = new Date(now.getTime() - i * 3600 * 1000);
    const progress = (23 - i) / 23;
    const diurnalWave =
      Math.sin(progress * Math.PI * 2 + seedOffset) * Math.max(2, currentPsi * 0.045);
    const interpolatedPsi =
      i === 0
        ? currentPsi
        : Math.round(startPsi + (currentPsi - startPsi) * Math.pow(progress, 0.88) + diurnalWave);
    const clampedPsi = Math.max(12, interpolatedPsi);

    const ratio = currentPsi > 0 ? clampedPsi / currentPsi : 1;
    const pm25_1h =
      i === 0
        ? currentPm25
        : Math.max(6, Math.round(currentPm25 * ratio + Math.cos(i * 0.7 + seedOffset) * 2.5));
    const pm10_24h = Math.max(12, Math.round(pm25_1h * 1.45 + clampedPsi * 0.18));

    points.push({
      timestamp: pointDate.toISOString(),
      label: formatHourLabel(pointDate),
      psi24h: clampedPsi,
      pm25_1h,
      pm10_24h,
    });
  }

  return points;
}

function buildSimulatedPollutants(
  psi24h: number,
  pm25_1h: number,
  regionSeed: number
): PollutantReadings {
  const pm25_24h = Math.max(8, Math.round(pm25_1h * 0.86));
  const pm10_24h = Math.max(14, Math.round(pm25_24h * 1.48 + 4));
  const pm25_sub = psi24h;
  const pm10_sub = Math.max(14, Math.round(psi24h * 0.72 + regionSeed));
  const o3_sub = Math.max(16, Math.round(24 + psi24h * 0.21 + (regionSeed % 5)));
  const so2_sub = Math.max(4, Math.round(5 + psi24h * 0.06 + (regionSeed % 3)));
  const co_sub = Math.max(3, Math.round(4 + psi24h * 0.05));
  const no2_1h = Math.max(10, Math.round(18 + psi24h * 0.24 + (regionSeed % 7)));

  return {
    psi_twenty_four_hourly: psi24h,
    pm25_twenty_four_hourly: pm25_24h,
    pm25_one_hourly: pm25_1h,
    pm10_twenty_four_hourly: pm10_24h,
    pm25_sub_index: pm25_sub,
    pm10_sub_index: pm10_sub,
    o3_sub_index: o3_sub,
    co_sub_index: co_sub,
    so2_sub_index: so2_sub,
    no2_one_hour_max: no2_1h,
  };
}

function getDominantPollutant(r: PollutantReadings): 'PM2.5' | 'PM10' | 'O₃' | 'NO₂' {
  const candidates: Array<{ name: 'PM2.5' | 'PM10' | 'O₃' | 'NO₂'; val: number }> = [
    { name: 'PM2.5', val: r.pm25_sub_index },
    { name: 'PM10', val: r.pm10_sub_index },
    { name: 'O₃', val: r.o3_sub_index },
    { name: 'NO₂', val: r.no2_one_hour_max },
  ];
  return candidates.sort((a, b) => b.val - a.val)[0].name;
}

export async function fetchLivePsiFromApi(): Promise<PsiSnapshot> {
  const res = await fetch('/api/psi', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const payload = (await res.json()) as ApiPsiPayload;
  if (!res.ok || !payload.ok) {
    throw new Error(payload.error || `API request failed (${res.status})`);
  }

  const items = payload.items && payload.items.length > 0
    ? payload.items
    : payload.latest
    ? [payload.latest]
    : [];

  if (items.length === 0) {
    throw new Error('No reading items returned by data.gov.sg PSI endpoint');
  }

  const latestItem = payload.latest ?? items[items.length - 1];
  const updatedDate = new Date(latestItem.updatedTimestamp || latestItem.timestamp);
  const metaCoords = new Map<string, { lat: number; lng: number }>();
  for (const m of payload.regionMetadata ?? []) {
    metaCoords.set(m.name, {
      lat: m.labelLocation.latitude,
      lng: m.labelLocation.longitude,
    });
  }

  const regionEntries = {} as Record<RegionId, RegionTelemetry>;
  const monsoonSeason = getSgtMonsoonLabel(updatedDate);
  const isNeMonsoon = monsoonSeason.startsWith('Northeast');
  const windCardinal = isNeMonsoon ? 'NNE' : 'SW';
  const windDirectionDeg = isNeMonsoon ? 25 : 225;
  const windSpeedKmh = isNeMonsoon ? 15 : 13;

  ORDERED_GEO_REGIONS.forEach((geoId, idx) => {
    const cfg = SINGAPORE_REGIONS[geoId];
    const r = latestItem.readings;
    const psi24 = Math.round(r.psi_twenty_four_hourly?.[geoId] ?? 0);
    const pm25_24 = Math.round(r.pm25_twenty_four_hourly?.[geoId] ?? 0);
    const pm10_24 = Math.round(r.pm10_twenty_four_hourly?.[geoId] ?? 0);
    const pm25_sub = Math.round(r.pm25_sub_index?.[geoId] ?? psi24);
    const pm10_sub = Math.round(r.pm10_sub_index?.[geoId] ?? pm10_24);
    const o3_sub = Math.round(r.o3_sub_index?.[geoId] ?? 0);
    const co_sub = Math.round(r.co_sub_index?.[geoId] ?? 0);
    const so2_sub = Math.round(r.so2_sub_index?.[geoId] ?? 0);
    const no2_1h = Math.round(r.no2_one_hour_max?.[geoId] ?? 0);

    const readings: PollutantReadings = {
      psi_twenty_four_hourly: psi24,
      pm25_twenty_four_hourly: pm25_24,
      // data.gov.sg /psi exposes 24h PM2.5; approximate 1h equivalent when /pm25 isn't queried separately
      pm25_one_hourly: pm25_24,
      pm10_twenty_four_hourly: pm10_24,
      pm25_sub_index: pm25_sub,
      pm10_sub_index: pm10_sub,
      o3_sub_index: o3_sub,
      co_sub_index: co_sub,
      so2_sub_index: so2_sub,
      no2_one_hour_max: no2_1h,
    };

    const trend24h: HourlyTrendPoint[] = items.map((item) => {
      const ptDate = new Date(item.timestamp);
      const ptPsi = Math.round(item.readings.psi_twenty_four_hourly?.[geoId] ?? psi24);
      const ptPm25 = Math.round(item.readings.pm25_twenty_four_hourly?.[geoId] ?? pm25_24);
      const ptPm10 = Math.round(item.readings.pm10_twenty_four_hourly?.[geoId] ?? pm10_24);
      return {
        timestamp: item.timestamp,
        label: formatHourLabel(ptDate),
        psi24h: ptPsi,
        pm25_1h: ptPm25,
        pm10_24h: ptPm10,
      };
    });

    const earliestPsi = trend24h[0]?.psi24h ?? psi24;
    const delta24h = psi24 - earliestPsi;

    regionEntries[geoId] = {
      ...cfg,
      coordinates: metaCoords.get(geoId) ?? cfg.coordinates,
      readings,
      delta24h,
      dominantPollutant: getDominantPollutant(readings),
      windDirectionDeg: windDirectionDeg + (idx - 2) * 3,
      windCardinal,
      windSpeedKmh,
      visibilityKm: estimateVisibilityKm(psi24),
      humidityPct: 76,
      trend24h,
    };
  });

  const geoList = ORDERED_GEO_REGIONS.map((id) => regionEntries[id]);
  const avg = (fn: (r: RegionTelemetry) => number) =>
    Math.round(geoList.reduce((acc, r) => acc + fn(r), 0) / geoList.length);
  const maxPsi = Math.max(...geoList.map((r) => r.readings.psi_twenty_four_hourly));

  const nationalTrend: HourlyTrendPoint[] = geoList[0].trend24h.map((pt, hourIdx) => ({
    timestamp: pt.timestamp,
    label: pt.label,
    psi24h: Math.round(
      geoList.reduce((acc, r) => acc + r.trend24h[hourIdx].psi24h, 0) / geoList.length
    ),
    pm25_1h: Math.round(
      geoList.reduce((acc, r) => acc + r.trend24h[hourIdx].pm25_1h, 0) / geoList.length
    ),
    pm10_24h: Math.round(
      geoList.reduce((acc, r) => acc + r.trend24h[hourIdx].pm10_24h, 0) / geoList.length
    ),
  }));

  const nationalReadings: PollutantReadings = {
    psi_twenty_four_hourly: maxPsi,
    pm25_twenty_four_hourly: avg((r) => r.readings.pm25_twenty_four_hourly),
    pm25_one_hourly: avg((r) => r.readings.pm25_one_hourly),
    pm10_twenty_four_hourly: avg((r) => r.readings.pm10_twenty_four_hourly),
    pm25_sub_index: Math.max(...geoList.map((r) => r.readings.pm25_sub_index)),
    pm10_sub_index: avg((r) => r.readings.pm10_sub_index),
    o3_sub_index: avg((r) => r.readings.o3_sub_index),
    co_sub_index: avg((r) => r.readings.co_sub_index),
    so2_sub_index: avg((r) => r.readings.so2_sub_index),
    no2_one_hour_max: avg((r) => r.readings.no2_one_hour_max),
  };

  regionEntries.national = {
    ...SINGAPORE_REGIONS.national,
    readings: nationalReadings,
    delta24h: avg((r) => r.delta24h),
    dominantPollutant: getDominantPollutant(nationalReadings),
    windDirectionDeg,
    windCardinal,
    windSpeedKmh,
    visibilityKm: estimateVisibilityKm(maxPsi),
    humidityPct: 76,
    trend24h: nationalTrend,
  };

  return {
    scenarioId: 'live',
    scenarioLabel: 'Live NEA Feed',
    isLive: true,
    sourceLabel: 'data.gov.sg · NEA Real-Time PSI',
    updatedAtIso: updatedDate.toISOString(),
    updatedAtSgt: `${formatSgtTime(updatedDate)} SGT`,
    monsoonSeason,
    windSummary: `Live readings synced from Singapore NEA via /api/psi (${items.length} hourly points)`,
    regions: regionEntries,
  };
}

export async function fetchPsiSnapshot(
  scenarioId: HazeScenarioId,
  jitter = false
): Promise<PsiSnapshot> {
  if (scenarioId === 'live') {
    return fetchLivePsiFromApi();
  }

  const template = SCENARIO_TEMPLATES[scenarioId];
  const now = new Date();
  const regionEntries = {} as Record<RegionId, RegionTelemetry>;

  ORDERED_GEO_REGIONS.forEach((geoId, idx) => {
    const cfg = SINGAPORE_REGIONS[geoId];
    const psiJitter = jitter ? Math.round((Math.random() - 0.5) * 4) : 0;
    const pmJitter = jitter ? Math.round((Math.random() - 0.5) * 3) : 0;

    const psi24h = Math.max(14, template.basePsi[geoId] + psiJitter);
    const pm25_1h = Math.max(6, template.basePm25_1h[geoId] + pmJitter);
    const delta = template.delta24h[geoId];
    const readings = buildSimulatedPollutants(psi24h, pm25_1h, idx * 2);

    regionEntries[geoId] = {
      ...cfg,
      readings,
      delta24h: delta,
      dominantPollutant: getDominantPollutant(readings),
      windDirectionDeg: template.windDirectionDeg + (idx - 2) * 4,
      windCardinal: template.windCardinal,
      windSpeedKmh: Math.max(3, template.windSpeedKmh + (idx % 3) - 1),
      visibilityKm: template.visibilityKm[geoId],
      humidityPct: template.humidityPct + (geoId === 'east' ? 3 : 0),
      trend24h: buildTrendSeries(psi24h, pm25_1h, delta, idx * 0.85, now),
    };
  });

  const geoList = ORDERED_GEO_REGIONS.map((id) => regionEntries[id]);
  const avg = (fn: (r: RegionTelemetry) => number) =>
    Math.round(geoList.reduce((acc, r) => acc + fn(r), 0) / geoList.length);
  const maxPsi = Math.max(...geoList.map((r) => r.readings.psi_twenty_four_hourly));
  const avgPm25_1h = avg((r) => r.readings.pm25_one_hourly);
  const avgDelta = avg((r) => r.delta24h);

  const nationalTrend: HourlyTrendPoint[] = geoList[0].trend24h.map((pt, hourIdx) => ({
    timestamp: pt.timestamp,
    label: pt.label,
    psi24h: Math.round(
      geoList.reduce((acc, r) => acc + r.trend24h[hourIdx].psi24h, 0) / geoList.length
    ),
    pm25_1h: Math.round(
      geoList.reduce((acc, r) => acc + r.trend24h[hourIdx].pm25_1h, 0) / geoList.length
    ),
    pm10_24h: Math.round(
      geoList.reduce((acc, r) => acc + r.trend24h[hourIdx].pm10_24h, 0) / geoList.length
    ),
  }));

  const nationalReadings: PollutantReadings = {
    psi_twenty_four_hourly: maxPsi,
    pm25_twenty_four_hourly: avg((r) => r.readings.pm25_twenty_four_hourly),
    pm25_one_hourly: avgPm25_1h,
    pm10_twenty_four_hourly: avg((r) => r.readings.pm10_twenty_four_hourly),
    pm25_sub_index: maxPsi,
    pm10_sub_index: avg((r) => r.readings.pm10_sub_index),
    o3_sub_index: avg((r) => r.readings.o3_sub_index),
    co_sub_index: avg((r) => r.readings.co_sub_index),
    so2_sub_index: avg((r) => r.readings.so2_sub_index),
    no2_one_hour_max: avg((r) => r.readings.no2_one_hour_max),
  };

  regionEntries.national = {
    ...SINGAPORE_REGIONS.national,
    readings: nationalReadings,
    delta24h: avgDelta,
    dominantPollutant: getDominantPollutant(nationalReadings),
    windDirectionDeg: template.windDirectionDeg,
    windCardinal: template.windCardinal,
    windSpeedKmh: template.windSpeedKmh,
    visibilityKm: Number(
      (geoList.reduce((acc, r) => acc + r.visibilityKm, 0) / geoList.length).toFixed(1)
    ),
    humidityPct: template.humidityPct,
    trend24h: nationalTrend,
  };

  return {
    scenarioId,
    scenarioLabel: template.label,
    isLive: false,
    sourceLabel: `Scenario Simulation (${template.label})`,
    updatedAtIso: now.toISOString(),
    updatedAtSgt: `${formatSgtTime(now)} SGT`,
    monsoonSeason: template.monsoonSeason,
    windSummary: template.windSummary,
    regions: regionEntries,
  };
}
