// app/result/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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

function clampPercent(percent: number) {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, percent));
}

function formatPercent(percent: number) {
  const normalized = Number.isFinite(percent) ? percent : 0;
  return Number.isInteger(normalized) ? `${normalized}%` : `${normalized.toFixed(1)}%`;
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

function buildJpegPdf(jpegData: Uint8Array, widthPx: number, heightPx: number) {
  const pxToPt = 0.75;
  const widthPt = Math.max(1, Math.round(widthPx * pxToPt));
  const heightPt = Math.max(1, Math.round(heightPx * pxToPt));

  const chunks: string[] = [];
  const offsets: number[] = [0];

  const push = (value: string) => {
    chunks.push(value);
  };

  const byteLength = (value: string) => value.length;

  const binaryFromBytes = (bytes: Uint8Array) => {
    let out = "";
    const step = 0x8000;
    for (let i = 0; i < bytes.length; i += step) {
      out += String.fromCharCode(...bytes.subarray(i, i + step));
    }
    return out;
  };

  let cursor = 0;
  push("%PDF-1.4\n");
  cursor += byteLength("%PDF-1.4\n");

  const addObject = (objNum: number, body: string) => {
    offsets[objNum] = cursor;
    const payload = `${objNum} 0 obj\n${body}\nendobj\n`;
    push(payload);
    cursor += byteLength(payload);
  };

  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources << /XObject <</Im0 4 0 R>> >> /Contents 5 0 R >>`
  );

  offsets[4] = cursor;
  const imageHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegData.length} >>\nstream\n`;
  push(imageHeader);
  cursor += byteLength(imageHeader);

  const jpegBinary = binaryFromBytes(jpegData);
  push(jpegBinary);
  cursor += jpegData.length;

  const imageFooter = "\nendstream\nendobj\n";
  push(imageFooter);
  cursor += byteLength(imageFooter);

  const streamCmd = `q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im0 Do\nQ\n`;
  addObject(5, `<< /Length ${streamCmd.length} >>\nstream\n${streamCmd}endstream`);

  const xrefStart = cursor;
  const xrefHeader = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  push(xrefHeader);
  cursor += byteLength(xrefHeader);

  for (let i = 1; i < offsets.length; i += 1) {
    const line = `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    push(line);
    cursor += byteLength(line);
  }

  const trailer = `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  push(trailer);

  const pdfBinary = chunks.join("");
  return `data:application/pdf;base64,${window.btoa(pdfBinary)}`;
}

export default function ResultPage() {
  const [payload] = useState<ReturnType<typeof loadResult> | null>(() => loadResult());
  const [expanded, setExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState<"png" | "pdf" | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const top3 = payload?.top3 ?? [];

  /**
   * ✅ score.ts에서 이미 26개 trait를 0%까지 포함해 반환하도록 정리했으니
   * 여기서는 "정렬만" 수행하면 됨.
   */
  const scoresAll26 = useMemo(() => {
    const scores = payload?.scores ?? [];
    return [...scores].sort((a, b) => b.percent - a.percent || a.trait.localeCompare(b.trait));
  }, [payload]);

  const createdAtLabel = useMemo(() => {
    if (!payload?.createdAt) return "";
    const date = new Date(payload.createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [payload?.createdAt]);

  async function createReportImage() {
    if (!payload) {
      throw new Error("결과 데이터가 없습니다.");
    }

    const canvas = document.createElement("canvas");
    const width = 1240;
    const rowHeight = 34;
    const scoreCount = Math.min(scoresAll26.length, 12);
    const height = 760 + scoreCount * rowHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("캔버스를 생성할 수 없습니다.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 48px sans-serif";
    ctx.fillText("BDSM 성향 테스트 결과지", 70, 96);

    ctx.font = "400 24px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`생성 시각: ${createdAtLabel || "-"}`, 70, 138);

    ctx.fillStyle = "#111827";
    ctx.font = "700 30px sans-serif";
    ctx.fillText("상위 3개 성향", 70, 205);

    top3.forEach((score, idx) => {
      const y = 260 + idx * 130;
      const meta = traitMeta(score.trait);

      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(70, y - 44, width - 140, 108);

      ctx.fillStyle = "#111827";
      ctx.font = "700 28px sans-serif";
      ctx.fillText(`${idx + 1}위 · ${meta.title}`, 95, y);
      ctx.font = "500 22px sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText(meta.summary || "-", 95, y + 38);

      ctx.fillStyle = "#0f172a";
      ctx.font = "700 34px sans-serif";
      ctx.fillText(formatPercent(score.percent), width - 220, y + 20);
    });

    const scoreStartY = 640;
    ctx.fillStyle = "#111827";
    ctx.font = "700 30px sans-serif";
    ctx.fillText("전체 성향 분포 (상위 12)", 70, scoreStartY);

    scoresAll26.slice(0, scoreCount).forEach((score, idx) => {
      const y = scoreStartY + 55 + idx * rowHeight;
      const meta = traitMeta(score.trait);

      ctx.fillStyle = "#475569";
      ctx.font = "500 22px sans-serif";
      ctx.fillText(`${idx + 1}. ${meta.title}`, 82, y);

      ctx.fillStyle = "#0f172a";
      ctx.font = "700 22px sans-serif";
      ctx.fillText(formatPercent(score.percent), width - 170, y);

      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(380, y - 16, 680, 12);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(380, y - 16, (680 * clampPercent(score.percent)) / 100, 12);
    });

    return canvas;
  }

  async function downloadPng() {
    try {
      setIsExporting("png");
      const canvas = await createReportImage();
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `bdsm-result-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (error) {
      console.error(error);
      window.alert("PNG 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsExporting(null);
    }
  }

  async function downloadPdf() {
    try {
      setIsExporting("pdf");
      const canvas = await createReportImage();
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const base64 = jpegDataUrl.split(",")[1];
      const binary = window.atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }

      const pdfDataUrl = buildJpegPdf(bytes, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = pdfDataUrl;
      a.download = `bdsm-result-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
    } catch (error) {
      console.error(error);
      window.alert("PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsExporting(null);
    }
  }

  if (!payload) {
    return (
      <main className="theme-adaptive mx-auto max-w-2xl px-4 py-10">
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
    <main className="theme-adaptive mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">테스트 결과</h1>
        <p className="mt-1 text-sm text-black/60">상위 3개 성향 + 전체 성향 분포(%)</p>
      </div>


      <div ref={reportRef} className="mb-5 rounded-2xl border border-black/10 bg-white p-5" aria-label="결과 요약 보고서">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">결과지 다운로드</div>
            <div className="mt-1 text-xs text-black/60">결과 요약을 PNG 또는 PDF 파일로 저장할 수 있습니다.</div>
            <div className="mt-2 text-xs text-black/50">BDSM 성향 테스트 결과 보고서</div>
            <div className="mt-1 text-xl font-semibold">상위 성향 요약</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {createdAtLabel ? <div className="text-xs text-black/50">생성 시각: {createdAtLabel}</div> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadPng}
                disabled={isExporting !== null}
                className="rounded-xl border border-black/15 px-4 py-2 text-sm hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting === "png" ? "PNG 생성 중..." : "PNG 다운로드"}
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                disabled={isExporting !== null}
                className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting === "pdf" ? "PDF 생성 중..." : "PDF 다운로드"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top3.map((score, idx) => {
            const meta = traitMeta(score.trait);
            return (
              <div key={score.trait} className="rounded-xl border border-black/10 p-3">
                <div className="text-xs text-black/50">{idx + 1}위</div>
                <div className="mt-1 font-semibold">{meta.title}</div>
                <div className="mt-1 text-sm text-black/60">{meta.summary}</div>
                <div className="mt-2 text-base font-semibold">{formatPercent(score.percent)}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-black/10 p-3">
          <div className="text-sm font-semibold">안전 안내</div>
          <div className="mt-1 text-xs text-black/70">
            결과는 참고용이며 현실에서는 합의(consent), 안전, 중단 신호, 사후 케어를 우선하세요.
          </div>
        </div>
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
