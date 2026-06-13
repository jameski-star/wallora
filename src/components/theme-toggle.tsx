"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Dark-mode-first theme toggle. Dark = no class; light = `.light` on <html>.
 * The initial class is set by an inline script in the root layout to avoid a
 * flash of the wrong theme.
 */
export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    // Sync state to the theme the inline script already applied to <html>.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className="grid size-9 place-items-center rounded-lg border border-border bg-surface text-muted transition hover:text-foreground hover:border-accent/50"
    >
      {light ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

/** Inline, render-blocking script that applies the saved theme before paint. */
export const themeInitScript = `
(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light')}}catch(e){}})();
`;
