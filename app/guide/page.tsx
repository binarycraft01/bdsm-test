"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TRAITS } from "@/lib/traits";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function GuideIndexPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return TRAITS;

    return TRAITS.filter((t) => {
      const hay = [
        t.nameKo,
        t.oneLiner,
        t.tags?.join(" "),
        t.description,
        t.relationshipTraits,
        t.cautions,
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [q]);

  return (
    <main className="min-h-dvh bg-[#070A10] text-white">
      {/* bg glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[380px] w-[780px] -translate-x-1/2 rounded-full bg-blue-600/18 blur-3xl" />
        <div className="absolute -bottom-24 right-[-80px] h-[420px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              참고용 · 합의/안전 전제 · 저장 없음
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              성향 해설
            </h1>
            <p className="mt-2 text-sm text-white/70">
              각 성향을 한눈에 보고, 클릭하면 상세 설명을 볼 수 있어요.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              ← 홈으로
            </Link>
          </div>
        </header>

        <section className="mt-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="검색: 성향 이름, 키워드, 문장..."
                className={cn(
                  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm",
                  "text-white placeholder:text-white/40 outline-none",
                  "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
            </div>

            <div className="text-sm text-white/60">
              총 <span className="text-white/85">{TRAITS.length}</span>개 ·
              검색 결과{" "}
              <span className="text-white/85">{filtered.length}</span>개
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <Link
                key={t.id}
                href={`/guide/${t.id}`}
                className={cn(
                  "group rounded-3xl border border-white/10 bg-white/5 p-5",
                  "hover:bg-white/10 transition",
                  "shadow-[0_25px_80px_-55px_rgba(0,0,0,0.85)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {t.nameKo}
                  </h2>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/70">
                    보기 →
                  </span>
                </div>

                <p className="mt-2 text-sm text-white/70">{t.oneLiner}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(t.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/65"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <div className="font-semibold text-white/85">주의</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>이 내용은 참고용이며 전문 진단이 아닙니다.</li>
              <li>모든 상호작용은 명확한 동의와 안전이 전제입니다.</li>
              <li>응답/결과는 서버에 저장하지 않습니다.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}