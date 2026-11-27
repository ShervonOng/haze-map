import { useState } from 'react';
import { CheckCircle2, RefreshCw, X } from 'lucide-react';

interface ApiConnectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthCheckResult {
  ok: boolean;
  status: number;
  upstreamStatus?: number;
  timestamp?: string;
  error?: string;
}

export function ApiConnectionDrawer({ isOpen, onClose }: ApiConnectionDrawerProps) {
  const [checking, setChecking] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);

  if (!isOpen) return null;

  const runHealthCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health?check=upstream');
      const data = (await res.json()) as {
        ok: boolean;
        upstreamStatus?: number;
        timestamp?: string;
        error?: string;
      };
      setHealthResult({
        ok: Boolean(data.ok),
        status: res.status,
        upstreamStatus: data.upstreamStatus,
        timestamp: data.timestamp,
        error: data.error,
      });
    } catch {
      setHealthResult({
        ok: false,
        status: 500,
        error: 'Unable to reach /api/health endpoint.',
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-guide-title"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="api-guide-title"
              className="font-display text-base font-semibold text-slate-900"
            >
              Serverless API Connection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connected to Singapore data.gov.sg via /api/psi and /api/health
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API status drawer"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm text-slate-700">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              1. Active Serverless Endpoints
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Root serverless handlers live under <code className="font-mono text-slate-900">/api/</code>{' '}
              and are mounted in <code className="font-mono text-slate-900">server.ts</code>:
            </p>
            <div className="mt-2.5 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800">
              <div>GET /api/psi → https://api-open.data.gov.sg/v2/real-time/api/psi</div>
              <div>GET /api/health → Service &amp; upstream health check</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                2. Upstream Connectivity Check
              </h3>
              <button
                type="button"
                onClick={runHealthCheck}
                disabled={checking}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Checking...' : 'Ping /api/health'}</span>
              </button>
            </div>

            {healthResult && (
              <div
                className={`mt-2.5 rounded-lg border p-3 text-xs ${
                  healthResult.ok
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                    : 'border-rose-200 bg-rose-50/70 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {healthResult.ok
                      ? `Healthy (HTTP ${healthResult.status} · Upstream ${healthResult.upstreamStatus ?? 200})`
                      : healthResult.error || `Error (HTTP ${healthResult.status})`}
                  </span>
                </div>
                {healthResult.timestamp && (
                  <div className="mt-1 font-mono text-[11px] opacity-80">
                    Checked at {healthResult.timestamp}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              3. Mapped NEA Reading Fields
            </h3>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed text-slate-100">
{`// https://api-open.data.gov.sg/v2/real-time/api/psi
{
  psi_twenty_four_hourly: { north, south, east, west, central },
  pm25_twenty_four_hourly: { north, south, east, west, central },
  pm10_twenty_four_hourly: { north, south, east, west, central },
  pm25_sub_index: { north, south, east, west, central },
  pm10_sub_index: { north, south, east, west, central },
  o3_sub_index: { north, south, east, west, central },
  so2_sub_index: { north, south, east, west, central },
  co_sub_index: { north, south, east, west, central },
  no2_one_hour_max: { north, south, east, west, central }
}`}
            </pre>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-3.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
