"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

/**
 * Approximate USD → KES rate. Update periodically or swap for a live fetch.
 * Last checked: June 2026 (~129 KES per 1 USD).
 */
const USD_TO_KES = 129;

export interface CurrencyInfo {
  /** ISO 4217 code — "KES" for Kenya, "USD" everywhere else. */
  code: "KES" | "USD";
  /** BCP 47 locale used by Intl.NumberFormat. */
  locale: string;
  /**
   * Multiply a USD-cent amount by this to get the display-currency cents.
   * 1 for USD, ~129 for KES.
   */
  rate: number;
  /** ISO 3166-1 alpha-2 country code detected by Vercel edge (or "XX" locally). */
  country: string;
}

const CurrencyContext = createContext<CurrencyInfo>({
  code: "USD",
  locale: "en-US",
  rate: 1,
  country: "US",
});

/**
 * Resolves the display currency from a Vercel edge-detected country code.
 * Only Kenya ("KE") maps to KES; every other country (including Uganda "UG",
 * Tanzania "TZ", Rwanda "RW", etc.) displays in USD.
 *
 * The country code comes from the `x-vercel-ip-country` HTTP header, which
 * Vercel sets at the CDN edge based on the visitor's IP address — far more
 * reliable than browser timezone or locale, which the user can change freely.
 */
export function CurrencyProvider({
  children,
  country,
}: {
  children: ReactNode;
  /** ISO 3166-1 alpha-2 from Vercel's `x-vercel-ip-country` header. */
  country: string;
}) {
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

/** Read the active currency context (KES in Kenya, USD elsewhere). */
export function useCurrency(): CurrencyInfo {
  return useContext(CurrencyContext);
}

/**
 * Format a USD-cent amount in the visitor's local currency.
 * Drop-in replacement for `formatPrice(cents)` that handles conversion
 * + locale-aware formatting in one call.
 */
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
