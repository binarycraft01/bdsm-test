"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      className="fixed right-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xl shadow-md backdrop-blur hover:brightness-95 dark:border-white/20 dark:bg-black/40"
      aria-label={`테마 변경: 현재 ${theme === "dark" ? "다크" : "라이트"} 모드`}
      title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
