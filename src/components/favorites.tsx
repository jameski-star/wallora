"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface SavedItem {
  id: string;
  slug: string;
  title: string;
  savedAt: number;
}

interface FavoritesContextValue {
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (item: { id: string; slug: string; title: string }) => boolean;
  save: (item: { id: string; slug: string; title: string }) => void;
  remove: (id: string) => void;
  count: number;
  hydrated: boolean;
  toastMessage: string | null;
}

const STORAGE_KEY = "aurava_favorites";
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Supports both string[] (legacy/simple) and SavedItem[]
          const normalized: SavedItem[] = parsed.map((entry) => {
            if (typeof entry === "string") {
              return { id: entry, slug: entry, title: "Wallpaper", savedAt: Date.now() };
            }
            return entry;
          });
          setItems(normalized);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Sync to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  // Sync across browser tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setItems(parsed);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => setToastMessage(null), 2400);
    return () => clearTimeout(timer);
  }, []);

  const isSaved = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const save = useCallback(
    (item: { id: string; slug: string; title: string }) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev;
        return [{ ...item, savedAt: Date.now() }, ...prev];
      });
      showToast(`Saved “${item.title}”`);
    },
    [showToast]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === id);
        if (found) showToast(`Removed from saved`);
        return prev.filter((i) => i.id !== id);
      });
    },
    [showToast]
  );

  const toggleSave = useCallback(
    (item: { id: string; slug: string; title: string }) => {
      let nowSaved = false;
      setItems((prev) => {
        if (prev.some((i) => i.id === item.id)) {
          nowSaved = false;
          showToast(`Removed from saved`);
          return prev.filter((i) => i.id !== item.id);
        } else {
          nowSaved = true;
          showToast(`Saved “${item.title}”`);
          return [{ ...item, savedAt: Date.now() }, ...prev];
        }
      });
      return nowSaved;
    },
    [showToast]
  );

  const savedIds = useMemo(() => items.map((i) => i.id), [items]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      savedIds,
      isSaved,
      toggleSave,
      save,
      remove,
      count: items.length,
      hydrated,
      toastMessage,
    }),
    [savedIds, isSaved, toggleSave, save, remove, items.length, hydrated, toastMessage]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-accent/40 bg-[#112b4a]/95 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="size-1.5 rounded-full bg-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    // Graceful fallback for components rendered outside provider
    return {
      savedIds: [],
      isSaved: () => false,
      toggleSave: () => false,
      save: () => {},
      remove: () => {},
      count: 0,
      hydrated: false,
      toastMessage: null,
    };
  }
  return ctx;
}
