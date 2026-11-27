interface ServerlessRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const UPSTREAM_PSI_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DataGovPsiItem {
  date: string;
  updatedTimestamp: string;
  timestamp: string;
  readings: Record<string, Record<string, number>>;
}

export interface DataGovPsiResponse {
  code: number;
  data?: {
    regionMetadata?: Array<{
      name: string;
      labelLocation: { latitude: number; longitude: number };
    }>;
    items?: DataGovPsiItem[];
  };
  errorMsg?: string;
}

function getSgtDateString(offsetDays = 0): string {
  const now = new Date(Date.now() + offsetDays * 86400 * 1000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts;
}

async function fetchDataGovPsi(dateParam?: string): Promise<DataGovPsiResponse> {
  const url = dateParam
    ? `${UPSTREAM_PSI_ENDPOINT}?date=${encodeURIComponent(dateParam)}`
    : UPSTREAM_PSI_ENDPOINT;

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Upstream NEA API returned HTTP ${response.status}`);
  }

  const json = (await response.json()) as DataGovPsiResponse;
  if (json.code !== 0 || !json.data) {
    throw new Error(json.errorMsg || 'Unexpected payload from data.gov.sg');
  }
  return json;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const rawDate = req.query?.date;
  const requestedDate = typeof rawDate === 'string' ? rawDate.trim() : undefined;

  if (requestedDate && !DATE_PATTERN.test(requestedDate)) {
    res.status(400).json({
      ok: false,
      error: 'Invalid date format. Expected YYYY-MM-DD.',
    });
    return;
  }

  try {
    if (requestedDate) {
      const payload = await fetchDataGovPsi(requestedDate);
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
      res.status(200).json({
        ok: true,
        source: UPSTREAM_PSI_ENDPOINT,
        fetchedAt: new Date().toISOString(),
        regionMetadata: payload.data?.regionMetadata ?? [],
        items: payload.data?.items ?? [],
      });
      return;
    }

    // Fetch latest snapshot plus today & yesterday SGT hourly series for 24h trend chart
    const todaySgt = getSgtDateString(0);
    const yesterdaySgt = getSgtDateString(-1);

    const [latestRes, todayRes, yesterdayRes] = await Promise.allSettled([
      fetchDataGovPsi(),
      fetchDataGovPsi(todaySgt),
      fetchDataGovPsi(yesterdaySgt),
    ]);

    if (latestRes.status !== 'fulfilled') {
      throw latestRes.reason;
    }

    const latestData = latestRes.value.data!;
    const mergedByTimestamp = new Map<string, DataGovPsiItem>();

    const collectItems = (
      result: PromiseSettledResult<DataGovPsiResponse>
    ) => {
      if (result.status !== 'fulfilled') return;
      for (const item of result.value.data?.items ?? []) {
        mergedByTimestamp.set(item.timestamp, item);
      }
    };

    collectItems(yesterdayRes);
    collectItems(todayRes);
    collectItems(latestRes);

    const sortedItems = Array.from(mergedByTimestamp.values())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-24);

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    res.status(200).json({
      ok: true,
      source: UPSTREAM_PSI_ENDPOINT,
      fetchedAt: new Date().toISOString(),
      regionMetadata: latestData.regionMetadata ?? [],
      latest: latestData.items?.[0] ?? sortedItems[sortedItems.length - 1] ?? null,
      items: sortedItems,
    });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({
      ok: false,
      error: 'Unable to retrieve live PSI readings from data.gov.sg right now.',
    });
  }
}
