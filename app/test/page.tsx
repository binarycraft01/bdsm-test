// app/test/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Likert5, Question } from "@/lib/questions";
import { STAGE1_QUESTIONS, STAGE2_QUESTIONS } from "@/lib/questions";
import {
  computeStage1Signal,
  computeTraitScores,
  pickTop3,
  saveResult,
  type TraitScore,
} from "@/lib/score";
import { TRAITS, type TraitId } from "@/lib/traits";
import {
  DEV_THEME_TOGGLE_COUNT_KEY,
  DEV_THEME_TOGGLE_UNLOCK_THRESHOLD,
} from "@/app/components/theme-toggle";

const LIKERT: { label: string; value: Likert5 }[] = [
  { label: "전혀 아니다", value: 0 },
  { label: "아니다", value: 1 },
  { label: "보통", value: 2 },
  { label: "그렇다", value: 3 },
  { label: "매우 그렇다", value: 4 },
];

type ViewMode = "quiz" | "stage1Result";

function traitMeta(id: TraitId) {
  const t = TRAITS.find((x) => x.id === id);
  return { title: t?.nameKo ?? id, summary: t?.oneLiner ?? "" };
}

function formatTraitPercent(percent: number) {
  const n = Math.round(percent * 10) / 10;
  return `${n > 0 ? "+" : ""}${n}%`;
}

function Bar({ percent }: { percent: number }) {
  const normalized = Math.max(-150, Math.min(150, percent));
  const width = Math.abs(normalized / 150) * 50;

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/10">
      <div className="absolute inset-y-0 left-1/2 w-px bg-black/30" />
      <div
        className="absolute inset-y-0 bg-black/70"
        style={
          normalized >= 0
            ? { left: "50%", width: `${width}%` }
            : { right: "50%", width: `${width}%` }
        }
      />
    </div>
  );
}

export default function TestPage() {
  const router = useRouter();

  // stage: 1 or 2
  const [stage, setStage] = useState<1 | 2>(1);
  const [view, setView] = useState<ViewMode>("quiz");
  const questions: Question[] = useMemo(
    () => (stage === 1 ? STAGE1_QUESTIONS : STAGE2_QUESTIONS),
    [stage]
  );

  const [index, setIndex] = useState(0);

  // answers
  const [answersStage1, setAnswersStage1] = useState<Record<string, Likert5>>(
    {}
  );
  const [answersStage2, setAnswersStage2] = useState<Record<string, Likert5>>(
    {}
  );

  // stage1 preview (optional)
  const [stage1Preview, setStage1Preview] = useState<{
    signal: "high" | "low";
    top3?: TraitScore[];
  } | null>(null);

  const q = questions[index];

  const currentAnswer: Likert5 | undefined =
    stage === 1 ? answersStage1[q.id] : answersStage2[q.id];

  const progress = Math.round(((index + 1) / questions.length) * 100);
  const [isDevControlVisible, setIsDevControlVisible] = useState(false);

  useEffect(() => {
    const syncDevControlVisibility = () => {
      const count = Number(localStorage.getItem(DEV_THEME_TOGGLE_COUNT_KEY) ?? "0");
      setIsDevControlVisible(Number.isFinite(count) && count >= DEV_THEME_TOGGLE_UNLOCK_THRESHOLD);
    };

    syncDevControlVisibility();
    window.addEventListener("storage", syncDevControlVisibility);
    window.addEventListener("dev-theme-unlocked", syncDevControlVisibility);

    return () => {
      window.removeEventListener("storage", syncDevControlVisibility);
      window.removeEventListener("dev-theme-unlocked", syncDevControlVisibility);
    };
  }, []);

  function setAnswer(v: Likert5) {
    if (stage === 1) setAnswersStage1((prev) => ({ ...prev, [q.id]: v }));
    else setAnswersStage2((prev) => ({ ...prev, [q.id]: v }));
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function restartAll() {
    setStage(1);
    setView("quiz");
    setIndex(0);
    setAnswersStage1({});
    setAnswersStage2({});
    setStage1Preview(null);
  }

  function finishStage1AndShowResult() {
    const signal = computeStage1Signal(answersStage1);

    // ✅ Stage1 questions에 map이 있으면 “맛보기 top3” 계산
    // ✅ map이 없다면 computeTraitScores 결과가 빈 배열일 수 있음 (그 경우 top3 미표시)
    const s1Scores = computeTraitScores(STAGE1_QUESTIONS, answersStage1);
    const top3 = s1Scores.length ? pickTop3(s1Scores) : undefined;

    setStage1Preview({ signal, top3 });
    setView("stage1Result");
  }

  function startStage2() {
    setStage(2);
    setView("quiz");
    setIndex(0);
  }

  function autoCompleteStageAndContinue(fillValue: Likert5 = 2) {
    if (stage === 1) {
      const filledStage1: Record<string, Likert5> = {};
      STAGE1_QUESTIONS.forEach((question) => {
        filledStage1[question.id] = answersStage1[question.id] ?? fillValue;
      });

      setAnswersStage1(filledStage1);

      const signal = computeStage1Signal(filledStage1);
      const s1Scores = computeTraitScores(STAGE1_QUESTIONS, filledStage1);
      const top3 = s1Scores.length ? pickTop3(s1Scores) : undefined;

      setStage1Preview({ signal, top3 });
      setView("stage1Result");
      return;
    }

    const filledStage2: Record<string, Likert5> = {};
    STAGE2_QUESTIONS.forEach((question) => {
      filledStage2[question.id] = answersStage2[question.id] ?? fillValue;
    });

    setAnswersStage2(filledStage2);

    const stage1Signal = computeStage1Signal(answersStage1);
    const scores = computeTraitScores(STAGE2_QUESTIONS, filledStage2);
    const top3 = pickTop3(scores);

    saveResult({
      version: 1,
      createdAt: new Date().toISOString(),
      answersStage2: filledStage2,
      stage1Signal,
      scores,
      top3,
    });

    router.push("/result");
  }

  function finishStage2AndGoResult() {
    const stage1Signal = computeStage1Signal(answersStage1);
    const scores = computeTraitScores(STAGE2_QUESTIONS, answersStage2);
    const top3 = pickTop3(scores);

    saveResult({
      version: 1,
      createdAt: new Date().toISOString(),
      answersStage2,
      stage1Signal,
      scores,
      top3,
    });

    router.push("/result");
  }

  function goNext() {
    // 마지막 문항이면 stage별 처리
    const isLast = index === questions.length - 1;

    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    if (stage === 1) {
      finishStage1AndShowResult(); // ✅ 바로 2차로 안 감
      return;
    }

    finishStage2AndGoResult();
  }

  // ==========================
  // Stage1 Result View
  // ==========================
  if (stage === 1 && view === "stage1Result" && stage1Preview) {
    const { signal, top3 } = stage1Preview;

    return (
      <main className="theme-adaptive mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <div className="text-sm text-black/60">1차(가벼운 테스트) 결과</div>
          <h1 className="mt-2 text-2xl font-semibold">가벼운 결과지</h1>
          <p className="mt-2 text-sm text-black/60">
            1차는 빠른 “탐색용”이며, 정확한 성향 분포(-150% ~ +150%)는 2차 본 테스트에서 계산됩니다.
          </p>
          <p className="mt-1 text-xs text-black/50">
            해석 기준: 양수(+)가 높을수록 강한 성향, 음수(-)가 낮을수록 약한 성향입니다.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-lg font-semibold">
            성향 가능성:{" "}
            {signal === "high" ? (
              <span className="text-black">있을 가능성 높음</span>
            ) : (
              <span className="text-black">낮거나 애매함</span>
            )}
          </div>

          <div className="mt-2 text-sm text-black/60">
            {signal === "high"
              ? "몇 가지 성향 신호가 잡혔어요. 본 테스트로 더 정확히 확인해보자."
              : "1차만으로는 단정하기 어려워요. 본 테스트로 정말 성향이 없는지/숨은 성향이 있는지 확인해보자."}
          </div>

          {top3 && top3.length ? (
            <div className="mt-6">
              <div className="text-sm font-semibold text-black/70">
                (맛보기) 1차에서 살짝 잡히는 Top 성향
              </div>
              <div className="mt-3 space-y-3">
                {top3.map((s) => {
                  const meta = traitMeta(s.trait);
                  return (
                    <div
                      key={s.trait}
                      className="rounded-xl border border-black/10 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{meta.title}</div>
                        <div className="font-semibold">{formatTraitPercent(s.percent)}</div>
                      </div>
                      <div className="mt-2">
                        <Bar percent={s.percent} />
                      </div>
                      {meta.summary ? (
                        <div className="mt-2 text-sm text-black/60">
                          {meta.summary}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-black/50">
                * 1차는 문항 수가 적어서 오차가 큽니다. 2차가 “진짜 결과”예요.
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startStage2}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            본 테스트 시작하기
          </button>

          {isDevControlVisible ? (
            <button
              type="button"
              onClick={() => {
                startStage2();
                setTimeout(() => autoCompleteStageAndContinue(), 0);
              }}
              className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
            >
              2차 자동완료 후 결과 보기
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              // 1차 다시 보기: 질문으로 돌아가기
              setView("quiz");
              setIndex(0);
            }}
            className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
          >
            1차 다시하기
          </button>

          <button
            type="button"
            onClick={restartAll}
            className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5"
          >
            처음부터 다시하기
          </button>
        </div>
      </main>
    );
  }

  // ==========================
  // Quiz View (stage1 or stage2)
  // ==========================
  return (
    <main className="theme-adaptive mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3 text-sm text-black/60">
          <span>
            {stage === 1 ? "1차(가벼운 테스트)" : "2차(상세 테스트)"} · 진행률{" "}
            {progress}%
          </span>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border border-black/15 px-3 py-1.5 text-xs text-black/70 transition hover:bg-black/5"
          >
            홈으로
          </button>
        </div>
        <h1 className="mt-2 text-2xl font-semibold">BDSM 성향 테스트</h1>
        {isDevControlVisible ? (
          <p className="mt-2 text-xs text-black/50">
            개발자 모드: 자동완료 버튼으로 남은 문항을 한 번에 채울 수 있어요.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6">
        <div className="text-lg font-medium">{q.text}</div>

        <div className="mt-5 grid grid-cols-1 gap-2">
          {LIKERT.map((opt) => {
            const active = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAnswer(opt.value)}
                className={[
                  "rounded-xl px-4 py-3 text-left text-sm border transition",
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/10 hover:bg-black/5",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className={[
            "rounded-xl px-4 py-2 text-sm border",
            index === 0
              ? "border-black/10 text-black/30"
              : "border-black/15 hover:bg-black/5",
          ].join(" ")}
        >
          이전
        </button>

        <div className="text-sm text-black/60">
          {index + 1} / {questions.length}
        </div>

        <div className="flex items-center gap-2">
          {isDevControlVisible ? (
            <button
              type="button"
              onClick={() => autoCompleteStageAndContinue()}
              className="rounded-xl border border-black/15 px-3 py-2 text-xs hover:bg-black/5"
            >
              남은 문항 자동완료
            </button>
          ) : null}

          <button
            type="button"
            onClick={goNext}
            disabled={currentAnswer === undefined}
            className={[
              "rounded-xl px-4 py-2 text-sm",
              currentAnswer === undefined
                ? "bg-black/10 text-black/30"
                : "bg-black text-white hover:opacity-90",
            ].join(" ")}
          >
            {index === questions.length - 1
              ? stage === 1
                ? "1차 결과 보기"
                : "결과 보기"
              : "다음"}
          </button>
        </div>
      </div>
    </main>
  );
}
