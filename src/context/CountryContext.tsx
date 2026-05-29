import { createContext, useContext, useState, type ReactNode } from 'react';

type CountryId = 'ALL' | 'GIN' | 'GHA' | 'CIV';

interface CountryContextValue {
  selectedCountry: CountryId;
  setSelectedCountry: (id: CountryId) => void;
}

const CountryContext = createContext<CountryContextValue>({
  selectedCountry: 'ALL',
  setSelectedCountry: () => {},
});

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>('ALL');
  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by design
export function useCountry() {
  return useContext(CountryContext);
}
