import { X } from 'lucide-react';

interface ApiConnectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiConnectionDrawer({ isOpen, onClose }: ApiConnectionDrawerProps) {
  if (!isOpen) return null;

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
              API Integration Blueprint
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Frontend telemetry types align directly with Singapore data.gov.sg NEA v2 endpoints
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API setup guide"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5 text-sm text-slate-700">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              1. Target NEA Real-Time Endpoints
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              When you are ready to connect live telemetry, fetch both the 24-hour PSI feed and
              the 1-hour PM2.5 concentration feed from Singapore&apos;s Open Data portal:
            </p>
            <div className="mt-2.5 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800">
              <div>GET https://api-open.data.gov.sg/v2/real-time/api/psi</div>
              <div>GET https://api-open.data.gov.sg/v2/real-time/api/pm25</div>
              <div>GET https://api-open.data.gov.sg/v2/real-time/api/wind-speed</div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              2. Single Adapter Replacement
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              All components consume the normalized <code className="font-mono text-slate-900">PsiSnapshot</code>{' '}
              contract returned by <code className="font-mono text-slate-900">fetchPsiSnapshot()</code> inside{' '}
              <code className="font-mono text-slate-900">src/services/psiService.ts</code>. Replace the
              scenario generator in that function with your live API response mapper—no UI component
              changes are required.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              3. Mapped NEA Reading Fields
            </h3>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed text-slate-100">
{`// data.items[0].readings
{
  psi_twenty_four_hourly: { north, south, east, west, central },
  pm25_twenty_four_hourly: { north, south, east, west, central },
  pm10_twenty_four_hourly: { north, south, east, west, central },
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
