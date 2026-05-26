import { useCountry } from '@/context/CountryContext';

const OPTIONS = [
  { id: 'ALL', label: 'All Countries' },
  { id: 'GIN', label: 'Guinea' },
  { id: 'GHA', label: 'Ghana' },
  { id: 'CIV', label: "Côte d'Ivoire" },
] as const;

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden bg-surface border border-line-strong divide-x divide-line-strong"
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
            className={
              'px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ' +
              (isActive ? 'bg-brand-600 text-white' : 'text-ink-3 hover:bg-surface-2 hover:text-ink')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
