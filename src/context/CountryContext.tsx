import { createContext, useContext, useState, type ReactNode } from 'react';

// Dedicated single-country deployment. The 'ALL' scope and the other West
// Africa markets have been retired; scope is permanently locked to Guinea, but
// the union and setter are retained so existing `=== 'ALL'` guards stay valid.
type CountryId = 'ALL' | 'GIN';

interface CountryContextValue {
  selectedCountry: CountryId;
  setSelectedCountry: (id: CountryId) => void;
}

const CountryContext = createContext<CountryContextValue>({
  selectedCountry: 'GIN',
  setSelectedCountry: () => {},
});

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>('GIN');
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
