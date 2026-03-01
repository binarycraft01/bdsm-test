"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DEV_TOGGLE_COUNT_KEY = "dev_theme_toggle_count";
const DEV_TOGGLE_UNLOCK_THRESHOLD = 15;

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const DEV_THEME_TOGGLE_COUNT_KEY = DEV_TOGGLE_COUNT_KEY;
export const DEV_THEME_TOGGLE_UNLOCK_THRESHOLD = DEV_TOGGLE_UNLOCK_THRESHOLD;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

    const current = Number(localStorage.getItem(DEV_TOGGLE_COUNT_KEY) ?? "0");
    const next = Number.isFinite(current) ? current + 1 : 1;
    localStorage.setItem(DEV_TOGGLE_COUNT_KEY, String(next));

    if (next >= DEV_TOGGLE_UNLOCK_THRESHOLD) {
      window.dispatchEvent(new Event("dev-theme-unlocked"));
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xl shadow-md backdrop-blur hover:brightness-95 dark:border-white/20 dark:bg-black/40"
      aria-label={`테마 변경: 현재 ${theme === "dark" ? "다크" : "라이트"} 모드`}
      title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
