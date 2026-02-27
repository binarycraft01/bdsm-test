import Link from "next/link";
import { notFound } from "next/navigation";
import { TRAITS, TraitId } from "@/lib/traits";

// ✅ (정적화 1) 모든 [id] 경로를 빌드 타임에 미리 생성
export function generateStaticParams() {
  return TRAITS.map((t) => ({ id: t.id }));
}

// ✅ (정적화 2) 이 페이지를 무조건 정적으로 강제
export const dynamic = "force-static";

function block(text: string) {
  return (text || "").split("\n").map((line, i) => (
    <p key={i} className="mb-3 last:mb-0">
      {line}
    </p>
  ));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Turbopack dev에서 params가 Promise로 들어오는 케이스 대응
  const { id } = await params;

  const traitId = id as TraitId;
  const t = TRAITS.find((x) => x.id === traitId);
  if (!t) return notFound();

  return (
    <main className="min-h-dvh bg-[#070A10] text-white">
      {/* bg glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[380px] w-[780px] -translate-x-1/2 rounded-full bg-blue-600/18 blur-3xl" />
        <div className="absolute -bottom-24 right-[-80px] h-[420px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              성향 해설 · 상세
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {t.nameKo}
            </h1>
            <p className="mt-2 text-sm text-white/70">{t.oneLiner}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(t.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/65"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/guide"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              ← 목록
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              홈
            </Link>
          </div>
        </header>

        <section className="mt-8 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white/85">한 줄 요약</div>
            <div className="mt-2 text-sm text-white/75">{t.oneLiner}</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white/85">설명</div>
            <div className="mt-3 text-sm leading-6 text-white/75">
              {block(t.description)}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white/85">관계 특징</div>
            <div className="mt-3 text-sm leading-6 text-white/75">
              {block(t.relationshipTraits)}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white/85">주의점</div>
            <div className="mt-3 text-sm leading-6 text-white/75">
              {block(t.cautions)}
            </div>
          </div>
        </section>

        <footer className="mt-10 text-xs text-white/45">
          참고용 콘텐츠 · 동의와 안전이 전제 · 저장 없음
        </footer>
      </div>
    </main>
  );
}