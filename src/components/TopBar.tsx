import { RefreshCw } from 'lucide-react';

interface TopBarProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function TopBar({ onRefresh, isLoading }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-3.5">
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 rounded-sm"
        >
          SG Haze Watch
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-slate-300"
          >
            Overview
          </a>
          <a
            href="#regional-map"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-slate-300"
          >
            Regional Map
          </a>
          <a
            href="#trends"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-slate-300"
          >
            24h Trends
          </a>
          <a
            href="#health-advisory"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-slate-300"
          >
            Health Advisory
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:bg-slate-950 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 min-h-[40px]"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isLoading ? 'Updating...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
