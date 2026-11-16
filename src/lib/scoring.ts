import type { DimKey } from './model';

export const ITEM_COUNT = 12;
export const MPS_MIN = 1;
export const MPS_MAX = 343;

export type Answers = (number | null)[];

export interface Scores {
  SV: number;
  TI: number;
  TS: number;
  A: number;
  F: number;
  FO: number;
  /** متوسط الأبعاد الجوهرية (SV + TI + TS) / 3 */
  core: number;
  mps: number;
  /** نسبة MPS من الحد الأعلى النظري (معلومة وصفية فقط) */
  pct: number;
  /** درجة البند السابع بعد العكس */
  q7Reversed: number;
}

export const emptyAnswers = (): Answers => Array.from({ length: ITEM_COUNT }, () => null);

export const isValidAnswer = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 7;

/** أرقام البنود (1–12) التي لم يُجَب عنها أو إجابتها غير صالحة */
export function missingItems(a: Answers): number[] {
  const out: number[] = [];
  for (let i = 0; i < ITEM_COUNT; i++) if (!isValidAnswer(a[i])) out.push(i + 1);
  return out;
}

export const reverseScore = (v: number) => 8 - v;

export function computeScores(a: Answers): Scores {
  if (a.length !== ITEM_COUNT) throw new Error(`يجب أن يكون عدد الإجابات ${ITEM_COUNT}`);
  const miss = missingItems(a);
  if (miss.length) throw new Error(`بنود دون إجابة صالحة: ${miss.join('، ')}`);
  const q = (n: number) => a[n - 1] as number;

  const SV = (q(2) + q(5)) / 2;
  const TI = (q(3) + q(8)) / 2;
  const TS = (q(6) + q(11)) / 2;
  const q7Reversed = reverseScore(q(7));
  const A = (q7Reversed + q(10)) / 2;
  const F = (q(4) + q(9)) / 2;
  const FO = (q(1) + q(12)) / 2; // لا يدخل في MPS

  const core = (SV + TI + TS) / 3;
  const mps = core * A * F;
  const pct = (mps / MPS_MAX) * 100;
  return { SV, TI, TS, A, F, FO, core, mps, pct, q7Reversed };
}

/** إعادة حساب MPS مع تغيير بعض الأبعاد (للأمثلة التوضيحية) */
export function mpsWith(s: Scores, override: Partial<Record<'SV' | 'TI' | 'TS' | 'A' | 'F', number>>): number {
  const v = { SV: s.SV, TI: s.TI, TS: s.TS, A: s.A, F: s.F, ...override };
  return ((v.SV + v.TI + v.TS) / 3) * v.A * v.F;
}

export type Level = 'low' | 'mid' | 'high';

/** معيار وصفي للتفسير داخل التطبيق، وليس حداً سيكومترياً معتمداً */
export const levelOf = (score: number): Level => (score < 4 ? 'low' : score < 5 ? 'mid' : 'high');

export const LEVEL_LABEL: Record<Level, string> = { low: 'منخفض', mid: 'متوسط', high: 'مرتفع' };

export const dimScore = (s: Scores, k: DimKey) => s[k];

/* دوال التنسيق: تُستخدم نفسها في الواجهة والتقرير لضمان تطابق القيم */
export const fmtDim = (n: number) => n.toFixed(1);
export const fmtCore = (n: number) => n.toFixed(2);
export const fmtMps = (n: number) => n.toFixed(1);
export const fmtPct = (n: number) => `${n.toFixed(1)}%`;
