import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Users, AlertTriangle } from 'lucide-react';
import { getAgreements, getOperators, getRiskFlags, getOperatorById } from '@/services/dataService';

type ResultType = 'agreement' | 'operator' | 'risk';

interface SearchResult {
  id: string;
  type: ResultType;
  label: string;
  sub: string;
  href: string;
}

function runSearch(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  getOperators()
    .filter(op => op.name.toLowerCase().includes(q) || op.parentCompany.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach(op => {
      results.push({
        id: `op-${op.id}`,
        type: 'operator',
        label: op.name,
        sub: `${op.parentCompany} · ${op.countryIds.join(', ')}`,
        href: `/performance/${op.id}`,
      });
    });

  getAgreements()
    .filter(
      a =>
        a.id.toLowerCase().includes(q) ||
        a.concesssionArea.toLowerCase().includes(q) ||
        a.commodity.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    )
    .slice(0, 3)
    .forEach(a => {
      const op = getOperatorById(a.operatorId);
      results.push({
        id: `ag-${a.id}`,
        type: 'agreement',
        label: a.id,
        sub: `${op?.name ?? '—'} · ${a.commodity} · ${a.concesssionArea}`,
        href: `/agreements/${a.id}`,
      });
    });

  getRiskFlags()
    .filter(
      f =>
        (f.description.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)) &&
        f.status !== 'resolved',
    )
    .slice(0, 2)
    .forEach(f => {
      const op = getOperatorById(f.operatorId);
      results.push({
        id: `rf-${f.id}`,
        type: 'risk',
        label: f.category,
        sub: `${op?.name ?? '—'} · ${f.severity} severity`,
        href: `/risk/${f.id}`,
      });
    });

  return results;
}

const TYPE_ICON = {
  agreement: FileText,
  operator: Users,
  risk: AlertTriangle,
};

const TYPE_COLOR: Record<ResultType, string> = {
  agreement: '#006b3f', // brand-600 — Ghana flag green
  operator: '#4A6B58',
  risk: '#ce1126',      // Pan-African red
};

const TYPE_BG: Record<ResultType, string> = {
  agreement: '#F0F8F4',
  operator: '#F5F8F2',
  risk: '#FEF2F2',
};

const TYPE_BORDER: Record<ResultType, string> = {
  agreement: '#B5E0D0',
  operator: '#D2DACC',
  risk: '#FECACA',
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => runSearch(query), [query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(v => !v); }
    };
    document.addEventListener('mousedown', clickHandler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative shrink-0 header-search" ref={containerRef}>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search records (Command or Control K)"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] whitespace-nowrap bg-surface-2 border border-line text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2"
      >
        <Search size={12} className="shrink-0" aria-hidden />
        <span className="header-ctrl-label">Search records…</span>
        <span className="header-ctrl-label shrink-0 ml-1 text-[10px] font-mono px-1 py-0.5 rounded bg-line text-ink-4" aria-hidden>⌘K</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Global record search"
          className="absolute left-0 top-full mt-2 w-[420px] bg-surface rounded-xl shadow-pop z-50 overflow-hidden border border-line"
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-line-soft">
            <Search size={14} className="text-ink-4 shrink-0" aria-hidden />
            <label htmlFor="global-search-input" className="sr-only">Search agreements, operators, risk flags</label>
            <input
              id="global-search-input"
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search agreements, operators, risk flags…"
              data-focus-ring="custom"
              className="flex-1 text-sm outline-none bg-transparent text-ink placeholder:text-ink-4"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X size={13} className="text-ink-4" />
              </button>
            )}
          </div>

          {query.length < 2 ? (
            <div className="px-4 py-6 text-center text-xs text-ink-4">
              Type at least 2 characters to search across all records
            </div>
          ) : results.length === 0 ? (
            <div role="status" className="px-4 py-6 text-center text-xs text-ink-4">
              No records found for "{query}"
            </div>
          ) : (
            <div className="divide-y divide-line-soft max-h-72 overflow-y-auto" role="listbox" aria-label="Search results">
              {results.map(r => {
                const Icon = TYPE_ICON[r.type];
                return (
                  <button
                    key={r.id}
                    role="option"
                    aria-selected={false}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 bg-surface hover:bg-surface-2 transition-colors"
                    onClick={() => handleSelect(r.href)}
                  >
                    <Icon size={13} style={{ color: TYPE_COLOR[r.type], flexShrink: 0, marginTop: 2 }} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink">{r.label}</div>
                      <div className="text-xs mt-0.5 text-ink-4">{r.sub}</div>
                    </div>
                    <div
                      className="ml-auto text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md shrink-0"
                      style={{ background: TYPE_BG[r.type], color: TYPE_COLOR[r.type], border: `1px solid ${TYPE_BORDER[r.type]}` }}
                    >
                      {r.type}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="px-4 py-2 border-t border-line-soft bg-surface-2">
            <span className="text-[10px] text-ink-4">Press ESC to dismiss · Click to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
}
