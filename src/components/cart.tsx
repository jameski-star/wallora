"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  wallpaperId: string;
  slug: string;
  title: string;
  priceCents: number;
  previewUrl: string;
  device: string;
}

interface CartContextValue {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (wallpaperId: string) => void;
  clear: () => void;
  has: (wallpaperId: string) => boolean;
  count: number;
  totalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "aurava_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate cart from localStorage once on mount (external-system sync).
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    return {
      lines,
      add: (line) =>
        setLines((prev) =>
          prev.some((l) => l.wallpaperId === line.wallpaperId)
            ? prev
            : [...prev, line],
        ),
      remove: (id) => setLines((prev) => prev.filter((l) => l.wallpaperId !== id)),
      clear: () => setLines([]),
      has: (id) => lines.some((l) => l.wallpaperId === id),
      count: lines.length,
      totalCents: lines.reduce((sum, l) => sum + l.priceCents, 0),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
