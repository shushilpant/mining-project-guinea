import { useCountry } from '@/context/CountryContext';

const OPTIONS = [
  { id: 'ALL', label: 'All Countries',  short: 'All' },
  { id: 'GIN', label: 'Guinea',         short: 'GIN' },
  { id: 'GHA', label: 'Ghana',          short: 'GHA' },
  { id: 'CIV', label: "Côte d'Ivoire",  short: 'CIV' },
] as const;

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();

  return (
    <div
      className="header-country flex items-center shrink-0 rounded-lg overflow-hidden bg-surface border border-line-strong divide-x divide-line-strong"
      role="group"
      aria-label="Filter by country"
    >
      {OPTIONS.map((opt) => {
        const isActive = selectedCountry === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setSelectedCountry(opt.id)}
            aria-pressed={isActive}
            title={opt.label}
            className={
              'header-country-btn px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ' +
              (isActive ? 'bg-brand-600 text-white' : 'text-ink-3 hover:bg-surface-2 hover:text-ink')
            }
          >
            <span className="country-label-full">{opt.label}</span>
            <span className="country-label-short">{opt.short}</span>
          </button>
        );
      })}
    </div>
  );
}
