export interface ServerlessRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

export interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

const UPSTREAM_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const checkUpstream = req.query?.check === 'upstream';

  if (!checkUpstream) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true,
      service: 'sg-haze-watch',
      endpoints: ['/api/health', '/api/psi'],
      upstream: UPSTREAM_PSI_URL,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const upstreamRes = await fetch(UPSTREAM_PSI_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(upstreamRes.ok ? 200 : 502).json({
      ok: upstreamRes.ok,
      service: 'sg-haze-watch',
      upstreamStatus: upstreamRes.status,
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({
      ok: false,
      service: 'sg-haze-watch',
      error: 'Upstream health check timed out or failed',
      timestamp: new Date().toISOString(),
    });
  }
}
