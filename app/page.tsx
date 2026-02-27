"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function HomePage() {
  const [isAdult, setIsAdult] = useState(false);
  const [agreesToContent, setAgreesToContent] = useState(false);

  const canStart = useMemo(() => isAdult && agreesToContent, [isAdult, agreesToContent]);

  return (
    <main className="min-h-dvh bg-[#070A10] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[380px] w-[780px] -translate-x-1/2 rounded-full bg-blue-600/18 blur-3xl" />
        <div className="absolute -bottom-24 right-[-80px] h-[420px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
        {/* Header */}
        <header className="pt-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/90" />
            로컬 계산 · 서버 저장 없음
          </div>

          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            성향 <span className="text-blue-400">탐색</span> 테스트
          </h1>

          <p className="mt-3 text-balance text-sm leading-6 text-white/75 sm:text-base">
            합의·안전을 전제로, 재미로 보는 참고용 테스트입니다.
            <br className="hidden sm:block" />
            응답은 저장하지 않고 이 기기에서만 계산돼요.
          </p>
        </header>

        {/* Card */}
        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">시작 전 확인</h2>
              <p className="mt-1 text-sm text-white/70">
                아래 항목에 동의해야 테스트를 시작할 수 있어요.
              </p>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 sm:block">
              약 3–8분
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-black/30">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-blue-500"
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium">본인은 만 19세 이상이며 성인임을 확인합니다.</div>
                <div className="mt-1 text-xs text-white/65">
                  성인(만 19세 이상)만 이용할 수 있습니다.
                </div>
              </div>
            </label>

            <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 hover:bg-black/30">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-blue-500"
                checked={agreesToContent}
                onChange={(e) => setAgreesToContent(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium">
                  성인 주제(성적 취향) 관련 문구를 포함할 수 있음에 동의합니다.
                </div>
                <div className="mt-1 text-xs text-white/65">
                  불편하다면 이용을 중단해 주세요.
                </div>
              </div>
            </label>

            <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/75">
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 flex-none rounded-full bg-white/50" />
                  <span>결과는 참고용이며 전문 진단이 아닙니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 flex-none rounded-full bg-white/50" />
                  <span>응답은 서버에 저장하지 않고, 이 기기에서만 계산됩니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 flex-none rounded-full bg-white/50" />
                  <span>언제든 중단할 수 있고, 모든 상호작용은 합의가 전제입니다.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 grid gap-3">
            <Link
              href={canStart ? "/test" : "#"}
              aria-disabled={!canStart}
              className={cn(
                "inline-flex items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold transition",
                "shadow-[0_12px_40px_-18px_rgba(59,130,246,0.9)]",
                canStart
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:brightness-110 active:brightness-95"
                  : "cursor-not-allowed bg-white/10 text-white/40 shadow-none"
              )}
              onClick={(e) => {
                if (!canStart) e.preventDefault();
              }}
            >
              테스트 시작하기
              <span className="ml-2 text-white/80">→</span>
            </Link>

            <Link
              href="/guide"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/85 hover:bg-white/10"
            >
              성향 해설 보기
            </Link>

            <div className="text-center text-xs text-white/55">
              * 결과는 저장되지 않지만, 완료 후 <span className="text-white/75">PNG/PDF 다운로드</span>는 제공할 예정입니다.
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto pt-10 text-center text-xs text-white/45">
          개인정보 수집/저장 없음 · 쿠키 최소 사용
          <div className="mt-2">© {new Date().getFullYear()} — Experimental</div>
        </footer>
      </div>
    </main>
  );
}