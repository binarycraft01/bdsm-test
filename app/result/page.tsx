// app/result/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TRAITS, type TraitId } from "@/lib/traits";
import { clearResult, loadResult, type TraitScore } from "@/lib/score";

/**
 * ✅ traits.ts 실제 구조에 1:1로 맞춘 메타 getter
 * - title: nameKo
 * - summary: oneLiner
 * (name/title/summary/oneLine 같은 필드는 존재하지 않으므로 절대 참조하지 않음)
 */
function traitMeta(id: TraitId) {
  const t = TRAITS.find((x) => x.id === id);
  return {
    title: t?.nameKo ?? id,
    summary: t?.oneLiner ?? "",
  };
}

function Bar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
      <div className="h-full bg-black/70" style={{ width: `${p}%` }} />
    </div>
  );
}

function TopCard({ rank, s }: { rank: 1 | 2 | 3; s: TraitScore }) {
  const meta = traitMeta(s.trait);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-black/50">{rank}위</div>
          <div className="mt-1 text-2xl font-semibold">{meta.title}</div>
          {meta.summary ? <div className="mt-2 text-sm text-black/60">{meta.summary}</div> : null}
        </div>
        <div className="text-3xl font-semibold">{s.percent}%</div>
      </div>

      <div className="mt-4">
        <Bar percent={s.percent} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/guide/${s.trait}`}
          className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm text-white"
        >
          성향 해설 보기
        </Link>

        <Link
          href="/guide"
          className="inline-flex items-center justify-center rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
        >
          가이드 전체 보기
        </Link>
      </div>
    </div>
  );
}

function Row({ s }: { s: TraitScore }) {
  const meta = traitMeta(s.trait);

  return (
    <div className="rounded-xl border border-black/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="font-medium">{meta.title}</div>
        <div className="font-semibold">{s.percent}%</div>
      </div>

      <div className="mt-2">
        <Bar percent={s.percent} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="line-clamp-1 text-sm text-black/60">{meta.summary}</div>
        <Link href={`/guide/${s.trait}`} className="text-sm underline underline-offset-4">
          해설
        </Link>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const [payload, setPayload] = useState<ReturnType<typeof loadResult> | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setPayload(loadResult());
  }, []);

  const top3 = payload?.top3 ?? [];
  const scores = payload?.scores ?? [];

  /**
   * ✅ score.ts에서 이미 26개 trait를 0%까지 포함해 반환하도록 정리했으니
   * 여기서는 "정렬만" 수행하면 됨.
   */
  const scoresAll26 = useMemo(() => {
    return [...scores].sort((a, b) => b.percent - a.percent || a.trait.localeCompare(b.trait));
  }, [scores]);

  if (!payload) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold">결과</h1>
        <p className="mt-2 text-sm text-black/60">
          결과가 없습니다. 테스트를 먼저 진행해주세요. (결과는 브라우저 세션에만 임시 저장됩니다.)
        </p>
        <div className="mt-6 flex gap-2">
          <Link href="/test" className="rounded-xl bg-black px-4 py-2 text-sm text-white">
            테스트 시작
          </Link>
          <Link href="/guide" className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
            가이드 보기
          </Link>
        </div>
      </main>
    );
  }

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">테스트 결과</h1>
        <p className="mt-1 text-sm text-black/60">상위 3개 성향 + 전체 성향 분포(%)</p>
      </div>

      <div className="space-y-4">
        {first ? <TopCard rank={1} s={first} /> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {second ? <TopCard rank={2} s={second} /> : null}
          {third ? <TopCard rank={3} s={third} /> : null}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setExpanded((v) => !v)}
          >
            <div>
              <div className="text-lg font-semibold">전체 성향 보기 (26)</div>
              <div className="mt-1 text-sm text-black/60">퍼센트 내림차순으로 표시됩니다.</div>
            </div>
            <div className="text-sm underline underline-offset-4">{expanded ? "접기" : "펼치기"}</div>
          </button>

          {expanded && (
            <div className="mt-5 space-y-3">
              {scoresAll26.map((s) => (
                <Row key={s.trait} s={s} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5">
          <div className="text-sm text-black/70">
            이 결과는 참고용입니다. 현실 관계에서는 합의(consent)·안전·중단 신호·사후 케어가 핵심입니다.
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/test" className="rounded-xl bg-black px-4 py-2 text-sm text-white">
              다시 테스트하기
            </Link>

            <Link href="/guide" className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5">
              성향 가이드 보기
            </Link>

            <button
              type="button"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
              onClick={() => {
                clearResult();
                window.location.href = "/test";
              }}
            >
              결과 지우고 다시하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}