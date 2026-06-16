"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

/**
 * Approximate USD → KES rate. Update periodically or swap for a live fetch.
 * Last checked: June 2026 (~129 KES per 1 USD).
 */
const USD_TO_KES = 129;

export interface CurrencyInfo {
  code: "KES" | "USD";
  locale: string;
  rate: number;
  country: string;
}

const CurrencyContext = createContext<CurrencyInfo>({
  code: "USD",
  locale: "en-US",
  rate: 1,
  country: "US",
});

export function CurrencyProvider({
  children,
  defaultCountry,
}: {
  children: ReactNode;
  defaultCountry: string;
}) {
  const [country, setCountry] = useState(defaultCountry);

  // Keep synced if hydration updates the country
  useEffect(() => {
    setCountry(defaultCountry);
  }, [defaultCountry]);

  const value = useMemo<CurrencyInfo>(() => {
    if (country === "KE") {
      return { code: "KES", locale: "en-KE", rate: USD_TO_KES, country };
    }
    return { code: "USD", locale: "en-US", rate: 1, country };
  }, [country]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyInfo {
  return useContext(CurrencyContext);
}

export function useFormatPrice(): (usdCents: number) => string {
  const { code, locale, rate } = useCurrency();
  return (usdCents: number) => {
    const converted = Math.round(usdCents * rate);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "KES" ? 0 : 2,
      maximumFractionDigits: code === "KES" ? 0 : 2,
    }).format(converted / 100);
  };
}