// lib/score.ts
import type { TraitId } from "./traits";
import { TRAITS } from "./traits";
import type { Likert5, Question } from "./questions";

export type TraitScore = {
  trait: TraitId;
  sum: number;      // 가중치 반영 점수 합(답변 0~4 * weight 누적)
  denom: number;    // 정규화 분모(해당 trait의 최대 점수 합 = 4 * weight 누적)
  avg: number;      // 0~4 스케일 평균(정규화 기반 환산)
  percent: number;  // 0~100
};

export type ResultPayload = {
  version: 1;
  createdAt: string; // ISO
  answersStage2: Record<string, Likert5>; // 2차 문항 답변(0~4)
  stage1Signal: "high" | "low"; // 1차 결과 요약(문구용)
  scores: TraitScore[]; // 26개 전체 포함(항상)
  top3: TraitScore[];   // 상위 3개
};

const STORAGE_KEY = "bdsm_result_v1";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * 1차는 "신호"만 만들기용.
 * 평균 2.4 이상이면 high (보통~그렇다 쪽으로 기운 경우)
 */
export function computeStage1Signal(
  answersStage1: Record<string, Likert5>
): "high" | "low" {
  const values = Object.values(answersStage1);
  if (values.length === 0) return "low";

  const sum = values.reduce<number>((acc, v) => acc + v, 0);
  const avg = sum / values.length;

  return avg >= 2.4 ? "high" : "low";
}

/**
 * 2차 점수 계산:
 * - Question.map이 있는 문항만 반영
 * - trait마다 등장 횟수가 다르므로 "최대점수(4*weight)" 기반 정규화로 percent 산출
 * - 26개 trait를 항상 포함(등장 안 하면 0%)
 */
export function computeTraitScores(
  stage2Questions: Question[],
  answersStage2: Record<string, Likert5>
): TraitScore[] {
  const acc = new Map<TraitId, { sum: number; denom: number }>();

  for (const q of stage2Questions) {
    const v = answersStage2[q.id];
    if (v === undefined) continue;
    if (!q.map || q.map.length === 0) continue;

    for (const m of q.map) {
      const prev = acc.get(m.trait) ?? { sum: 0, denom: 0 };
      prev.sum += v * m.weight;
      prev.denom += 4 * m.weight; // 0~4 스케일 최대치 기반
      acc.set(m.trait, prev);
    }
  }

  // 26개 trait 전체를 항상 포함시키기 (질문에 안 걸린 trait는 0%)
  const allTraitIds = TRAITS.map((t) => t.id as TraitId);

  const scores: TraitScore[] = allTraitIds.map((trait) => {
    const v = acc.get(trait) ?? { sum: 0, denom: 0 };
    const max = v.denom; // 4*weight 누적
    const rawPercent = max > 0 ? (v.sum / max) * 100 : 0;
    const percent = Math.round(clamp(rawPercent, 0, 100));
    const avg = (percent / 100) * 4;

    return {
      trait,
      sum: v.sum,
      denom: v.denom,
      avg,
      percent,
    };
  });

  // 기본 정렬: 퍼센트 내림차순, 동점이면 trait id 사전순
  scores.sort((a, b) => b.percent - a.percent || a.trait.localeCompare(b.trait));
  return scores;
}

export function pickTop3(scores: TraitScore[]): TraitScore[] {
  // 동점 처리: percent 동일하면 denom(근거량: max점수 합) 큰 쪽 우선, 그래도 같으면 trait id 사전순
  const sorted = [...scores].sort((a, b) => {
    if (b.percent !== a.percent) return b.percent - a.percent;
    if (b.denom !== a.denom) return b.denom - a.denom;
    return a.trait.localeCompare(b.trait);
  });
  return sorted.slice(0, 3);
}

export function saveResult(payload: ResultPayload) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadResult(): ResultPayload | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ResultPayload;
    // 최소 방어
    if (!parsed || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearResult() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}