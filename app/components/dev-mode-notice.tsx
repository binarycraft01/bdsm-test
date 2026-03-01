"use client";

import { useEffect, useState } from "react";
import {
  DEV_THEME_TOGGLE_COUNT_KEY,
  DEV_THEME_TOGGLE_UNLOCK_THRESHOLD,
} from "@/app/components/theme-toggle";

export default function DevModeNotice() {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  useEffect(() => {
    const syncDeveloperMode = () => {
      const count = Number(sessionStorage.getItem(DEV_THEME_TOGGLE_COUNT_KEY) ?? "0");
      setIsDeveloperMode(Number.isFinite(count) && count >= DEV_THEME_TOGGLE_UNLOCK_THRESHOLD);
    };

    syncDeveloperMode();

    window.addEventListener("dev-theme-unlocked", syncDeveloperMode);
    window.addEventListener("storage", syncDeveloperMode);
    window.addEventListener("focus", syncDeveloperMode);
    window.addEventListener("pageshow", syncDeveloperMode);

    return () => {
      window.removeEventListener("dev-theme-unlocked", syncDeveloperMode);
      window.removeEventListener("storage", syncDeveloperMode);
      window.removeEventListener("focus", syncDeveloperMode);
      window.removeEventListener("pageshow", syncDeveloperMode);
    };
  }, []);

  if (!isDeveloperMode) return null;

  return (
    <div className="px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur-sm dev-mode-banner">
        <div className="font-semibold">개발자 모드 테스트중</div>
        <div className="mt-1">
          개발자 모드에 접속하셨네요. 해당 모드는 개발자 전용이므로, 일반 접속 대상자는 새로고침을
          통해 일반 모드로 접속해 주세요.
        </div>
      </div>
    </div>
  );
}
