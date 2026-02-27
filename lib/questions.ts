// lib/questions.ts
import type { TraitId } from "./traits";

export type Likert5 = 0 | 1 | 2 | 3 | 4;

export type Question = {
  id: string; // "s1-01", "s2-01" ...
  text: string;
  stage: 1 | 2;

  /**
   * ✅ 성향 점수 매핑(옵션)
   * - stage 1: "맛보기"용으로 아주 가볍게만 사용 (1~2개 trait, weight 1 중심)
   * - stage 2: 본 매핑(정밀)
   * - 메타 질문은 map 없음(점수 미반영)
   */
  map?: Array<{ trait: TraitId; weight: number }>;
};

/**
 * 1차(10문항): 성향 존재 여부를 "부드럽게" 탐색
 * - 1차 결과에서 "성향 가능성(high/low)" + (선택) 맛보기 Top3 출력용
 * - 정밀도는 낮음: 문항 수가 적으므로 map은 최소로만 붙임
 */
export const STAGE1_QUESTIONS: Question[] = [
  {
    id: "s1-01",
    stage: 1,
    text: "관계에서 누가 주도권을 잡는지에 따라 분위기가 달라진다고 느낀다.",
    map: [
      { trait: "dominant", weight: 1 },
      { trait: "submissive", weight: 1 },
    ],
  },
  {
    id: "s1-02",
    stage: 1,
    text: "상대와의 관계에서 역할이나 위치가 자연스럽게 나뉘는 상황이 편하다.",
    map: [
      { trait: "dominant", weight: 1 },
      { trait: "submissive", weight: 1 },
    ],
  },
  {
    id: "s1-03",
    stage: 1,
    text: "일반적인 방식보다, 조금은 특별한 관계 구도가 더 흥미롭게 느껴진다.",
    map: [{ trait: "switch", weight: 1 }],
  },
  {
    id: "s1-04",
    stage: 1,
    text: "관계 속에서 통제, 위임, 혹은 맡김이라는 요소가 중요하게 느껴진다.",
    map: [
      { trait: "dominant", weight: 1 },
      { trait: "submissive", weight: 1 },
    ],
  },
  {
    id: "s1-05",
    stage: 1,
    text: "관계 속에서 감정적·심리적 긴장감이 있을 때 더 몰입된다.",
    map: [{ trait: "hunter", weight: 1 }],
  },
  {
    id: "s1-06",
    stage: 1,
    text: "상대의 반응(태도, 표정, 분위기)에 민감하게 반응하는 편이다.",
    map: [
      { trait: "sadist", weight: 1 },
      { trait: "masochist", weight: 1 },
    ],
  },
  {
    id: "s1-07",
    stage: 1,
    text: "관계에서 명확한 기준이나 규칙이 있을 때 오히려 안정감을 느낀다.",
    map: [{ trait: "master", weight: 1 }],
  },
  {
    id: "s1-08",
    stage: 1,
    text: "평등한 관계도 좋지만, 상황에 따라 다른 구조도 가능하다고 생각한다.",
    map: [{ trait: "switch", weight: 2 }], // 스위치는 이 문항에서만 살짝 강하게
  },
  {
    id: "s1-09",
    stage: 1,
    text: "나의 취향이나 관계 스타일이 평균적이라고만은 느껴지지 않는다.",
    map: [{ trait: "brat", weight: 1 }],
  },
  {
    id: "s1-10",
    stage: 1,
    text: "나 자신에 대해 더 깊이 알아보는 성향 테스트에 흥미가 있다.",
    map: [{ trait: "vanilla", weight: 1 }],
  },
];

/**
 * 2차(65문항): 본 테스트
 * - 1~60: 성향 점수 반영
 * - 61~65: 메타(점수 미반영)
 * - 가중치: 주성향 1.0 / 보조성향 0.5
 */
export const STAGE2_QUESTIONS: Question[] = [
  // 소유/유대 1~5
  { id: "s2-01", stage: 2, text: "누군가에게 소속되어 있다는 감각에서 안정과 만족을 느낀다.", map: [{ trait: "owner", weight: 1 }] },
  { id: "s2-02", stage: 2, text: "상대를 책임지고 돌보는 ‘주인’의 역할에 강한 의미를 둔다.", map: [{ trait: "owner", weight: 1 }, { trait: "dominant", weight: 0.5 }] },
  { id: "s2-03", stage: 2, text: "관계에서 소유는 통제가 아니라 깊은 유대라고 생각한다.", map: [{ trait: "owner", weight: 1 }] },
  { id: "s2-04", stage: 2, text: "상대가 나에게 의지하고 속하려 할 때 가장 큰 만족을 느낀다.", map: [{ trait: "owner", weight: 1 }, { trait: "caregiver", weight: 0.5 }] },
  { id: "s2-05", stage: 2, text: "상대를 온전히 맡아 보호하고 이끄는 역할에 보람을 느낀다.", map: [{ trait: "owner", weight: 1 }, { trait: "caregiver", weight: 0.5 }] },

  // 지배/리드 6~10
  { id: "s2-06", stage: 2, text: "관계의 흐름을 내가 설계하고 주도하는 것이 자연스럽다.", map: [{ trait: "dominant", weight: 1 }, { trait: "top", weight: 0.5 }] },
  { id: "s2-07", stage: 2, text: "상대가 내 기준과 규칙 안에서 움직일 때 흥분된다.", map: [{ trait: "dominant", weight: 1 }, { trait: "master", weight: 0.5 }] },
  { id: "s2-08", stage: 2, text: "명령이나 지시를 내리는 행위 자체가 성적 긴장감을 만든다.", map: [{ trait: "dominant", weight: 1 }] },
  { id: "s2-09", stage: 2, text: "상대에게 존중받는 권위와 책임을 갖춘 리더가 되고 싶다.", map: [{ trait: "master", weight: 1 }, { trait: "dominant", weight: 0.5 }] },
  { id: "s2-10", stage: 2, text: "완전한 복종을 끌어내는 상황을 상상하면 흥분된다.", map: [{ trait: "dominant", weight: 1 }, { trait: "master", weight: 0.5 }] },

  // 복종/위임 11~15
  { id: "s2-11", stage: 2, text: "누군가의 지시에 따르는 입장이 편안하다.", map: [{ trait: "submissive", weight: 1 }, { trait: "bottom", weight: 0.5 }] },
  { id: "s2-12", stage: 2, text: "스스로 결정하기보다 맡겨질 때 만족감이 커진다.", map: [{ trait: "slave", weight: 1 }, { trait: "submissive", weight: 0.5 }] },
  { id: "s2-13", stage: 2, text: "상대의 기대에 맞추어 행동할 때 성적 쾌감을 느낀다.", map: [{ trait: "submissive", weight: 1 }, { trait: "servant", weight: 0.5 }] },
  { id: "s2-14", stage: 2, text: "소유당하거나 통제받는 설정이 흥분을 유발한다.", map: [{ trait: "slave", weight: 1 }] },
  { id: "s2-15", stage: 2, text: "‘복종’이나 ‘굴복’이라는 개념이 나의 취향과 잘 맞다.", map: [{ trait: "submissive", weight: 1 }] },

  // 헌터/프레이 16~20
  { id: "s2-16", stage: 2, text: "상대가 저항할수록 긴장과 흥분이 커진다.", map: [{ trait: "hunter", weight: 1 }] },
  { id: "s2-17", stage: 2, text: "추격하거나 대치하는 분위기에서 몰입이 깊어진다.", map: [{ trait: "hunter", weight: 1 }, { trait: "prey", weight: 0.5 }] },
  { id: "s2-18", stage: 2, text: "쉽게 순응하는 상대보다는 반항하는 상대가 더 끌린다.", map: [{ trait: "hunter", weight: 1 }, { trait: "brat", weight: 0.5 }] },
  { id: "s2-19", stage: 2, text: "강하게 맞서는 과정 자체가 흥분 요소가 된다.", map: [{ trait: "hunter", weight: 1 }] },
  { id: "s2-20", stage: 2, text: "제압당하는 설정에서 쾌감을 느낀다.", map: [{ trait: "prey", weight: 1 }] },

  // 사디/마조 21~25
  { id: "s2-21", stage: 2, text: "고통이나 강한 자극이 쾌감으로 전환되는 경험을 한다.", map: [{ trait: "masochist", weight: 1 }] },
  { id: "s2-22", stage: 2, text: "상대에게 강한 자극을 줄 때 짜릿함을 느낀다.", map: [{ trait: "sadist", weight: 1 }] },
  { id: "s2-23", stage: 2, text: "자극이 남긴 흔적(자국/멍 등)을 긍정적으로 받아들인다.", map: [{ trait: "masochist", weight: 1 }, { trait: "spankee", weight: 0.5 }] },
  { id: "s2-24", stage: 2, text: "아픔과 즐거움의 경계가 흐려지는 감각을 좋아한다.", map: [{ trait: "masochist", weight: 1 }] },
  { id: "s2-25", stage: 2, text: "상대의 반응을 보며 강도를 조절하는 과정이 중요하다.", map: [{ trait: "sadist", weight: 1 }] },

  // 스팽킹 26~30
  { id: "s2-26", stage: 2, text: "타격의 소리와 리듬이 흥분을 유도한다.", map: [{ trait: "spanker", weight: 1 }] },
  { id: "s2-27", stage: 2, text: "체벌이라는 맥락의 자극에 특히 끌린다.", map: [{ trait: "spanker", weight: 1 }, { trait: "spankee", weight: 0.5 }] },
  { id: "s2-28", stage: 2, text: "맞거나 때리는 행위가 성적으로 각성된다.", map: [{ trait: "spankee", weight: 1 }, { trait: "spanker", weight: 0.5 }] },
  { id: "s2-29", stage: 2, text: "맞은 뒤 남는 여운이나 감각이 만족 포인트가 된다.", map: [{ trait: "spankee", weight: 1 }] },
  { id: "s2-30", stage: 2, text: "상대의 반응을 보며 타격을 조율하는 것이 재미있다.", map: [{ trait: "spanker", weight: 1 }] },

  // 로프/구속 31~35
  { id: "s2-31", stage: 2, text: "신체가 제한되는 감각에서 몰입이 커진다.", map: [{ trait: "rope-bunny", weight: 1 }] },
  { id: "s2-32", stage: 2, text: "묶이거나 묶는 행위를 미적으로 느낀다.", map: [{ trait: "rigger", weight: 1 }, { trait: "rope-bunny", weight: 0.5 }] },
  { id: "s2-33", stage: 2, text: "움직일 수 없는 상태에서 흥분이 상승한다.", map: [{ trait: "rope-bunny", weight: 1 }] },
  { id: "s2-34", stage: 2, text: "구속은 단순한 제한이 아니라 교감의 수단이라고 느낀다.", map: [{ trait: "rigger", weight: 1 }, { trait: "owner", weight: 0.5 }] },
  { id: "s2-35", stage: 2, text: "속박의 방식과 형태를 고민하는 걸 즐긴다.", map: [{ trait: "rigger", weight: 1 }] },

  // 디그레이드 36~40
  { id: "s2-36", stage: 2, text: "부끄러움이나 수치심이 흥분 요소가 된다.", map: [{ trait: "degradee", weight: 1 }] },
  { id: "s2-37", stage: 2, text: "노골적인 말이나 분위기 연출이 긴장감을 높인다.", map: [{ trait: "degrader", weight: 1 }] },
  { id: "s2-38", stage: 2, text: "모욕적인 설정이 오히려 자극으로 작용한다.", map: [{ trait: "degradee", weight: 1 }, { trait: "degrader", weight: 0.5 }] },
  { id: "s2-39", stage: 2, text: "상대가 당황하는 반응을 볼 때 각성된다.", map: [{ trait: "degrader", weight: 1 }] },
  { id: "s2-40", stage: 2, text: "언어적 분위기가 플레이의 핵심이라고 느낀다.", map: [{ trait: "degrader", weight: 1 }] },

  // 펫/리틀/케어 41~45
  { id: "s2-41", stage: 2, text: "귀여움이나 애교가 관계의 흥분 포인트가 될 때가 있다.", map: [{ trait: "pet", weight: 1 }] },
  { id: "s2-42", stage: 2, text: "보호받거나 돌봄을 받을 때 안정감이 커진다.", map: [{ trait: "little", weight: 1 }, { trait: "caregiver", weight: 0.5 }] },
  { id: "s2-43", stage: 2, text: "애완동물처럼 대우받는 설정에 끌린다.", map: [{ trait: "pet", weight: 1 }] },
  { id: "s2-44", stage: 2, text: "관심과 애정 표현이 성적 만족과 연결되는 편이다.", map: [{ trait: "pet", weight: 1 }, { trait: "little", weight: 0.5 }] },
  { id: "s2-45", stage: 2, text: "상대에게 소속되고 싶은 감각이 중요하다.", map: [{ trait: "pet", weight: 1 }, { trait: "owner", weight: 0.5 }] },

  // 브랫 46~50
  { id: "s2-46", stage: 2, text: "일부러 반항하거나 장난을 치고 싶어진다.", map: [{ trait: "brat", weight: 1 }] },
  { id: "s2-47", stage: 2, text: "제지당하거나 혼나는 상황을 은근히 기대할 때가 있다.", map: [{ trait: "brat", weight: 1 }] },
  { id: "s2-48", stage: 2, text: "상대의 반응을 끌어내기 위해 도발하는 편이다.", map: [{ trait: "brat", weight: 1 }, { trait: "hunter", weight: 0.5 }] },
  { id: "s2-49", stage: 2, text: "장난은 관심을 받고 싶다는 신호로 작동할 때가 있다.", map: [{ trait: "brat", weight: 1 }] },
  { id: "s2-50", stage: 2, text: "상대가 단호하게 ‘길들이는’ 모습이 매력적이다.", map: [{ trait: "brat", weight: 1 }, { trait: "brat-tamer", weight: 0.5 }] },

  // 스위치 51~55
  { id: "s2-51", stage: 2, text: "상황에 따라 주도와 복종이 바뀐다.", map: [{ trait: "switch", weight: 1 }] },
  { id: "s2-52", stage: 2, text: "한 역할에 고정되는 것이 어렵다.", map: [{ trait: "switch", weight: 1 }] },
  { id: "s2-53", stage: 2, text: "상대나 기분에 따라 욕구가 달라진다.", map: [{ trait: "switch", weight: 1 }] },
  { id: "s2-54", stage: 2, text: "양쪽 역할 모두 경험하고 싶다.", map: [{ trait: "switch", weight: 1 }] },
  { id: "s2-55", stage: 2, text: "역할 전환이 자연스럽게 느껴진다.", map: [{ trait: "switch", weight: 1 }] },

  // 바닐라 56~60
  { id: "s2-56", stage: 2, text: "강한 설정 없이도 충분히 만족한다.", map: [{ trait: "vanilla", weight: 1 }] },
  { id: "s2-57", stage: 2, text: "부드럽고 감정적인 교감이 더 중요하다.", map: [{ trait: "vanilla", weight: 1 }] },
  { id: "s2-58", stage: 2, text: "로맨틱한 분위기에 더 끌린다.", map: [{ trait: "vanilla", weight: 1 }] },
  { id: "s2-59", stage: 2, text: "자극보다는 친밀함을 선호한다.", map: [{ trait: "vanilla", weight: 1 }] },
  { id: "s2-60", stage: 2, text: "일반적인 관계 방식이 편하다.", map: [{ trait: "vanilla", weight: 1 }] },

  // 메타 61~65 (성향 점수 미반영)
  { id: "s2-61", stage: 2, text: "나의 취향을 비교적 명확히 알고 있다." },
  { id: "s2-62", stage: 2, text: "성향에 대해 공부하거나 탐색해본 적이 있다." },
  { id: "s2-63", stage: 2, text: "나에게 맞는 파트너를 찾고 싶다는 욕구가 있다." },
  { id: "s2-64", stage: 2, text: "플레이 욕구와 성적 욕구는 구분할 수 있다고 생각한다." },
  { id: "s2-65", stage: 2, text: "BDSM을 역할 놀이의 한 형태로 보는 편이다." },
];

export const LIKERT_LABELS: Array<{ value: Likert5; label: string }> = [
  { value: 0, label: "전혀 아니다" },
  { value: 1, label: "아니다" },
  { value: 2, label: "보통이다" },
  { value: 3, label: "그렇다" },
  { value: 4, label: "매우 그렇다" },
];