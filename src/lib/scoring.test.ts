import { describe, expect, it } from 'vitest';
import { computeScores, emptyAnswers, levelOf, missingItems, mpsWith, reverseScore, type Answers } from './scoring';
import { analyze } from './analysis';

const all = (v: number): Answers => Array.from({ length: 12 }, () => v);
const withQ = (base: Answers, q: Record<number, number>): Answers => base.map((v, i) => q[i + 1] ?? v);

describe('البند السابع العكسي', () => {
  it('يعكس الدرجة 8 − x', () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(reverseScore)).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  it('A = ((8 − Q7) + Q10) / 2', () => {
    const s = computeScores(withQ(all(4), { 7: 2, 10: 6 }));
    expect(s.q7Reversed).toBe(6);
    expect(s.A).toBe(6);
  });

  it('رفع Q7 يخفض الاستقلالية', () => {
    const lo = computeScores(withQ(all(5), { 7: 1 }));
    const hi = computeScores(withQ(all(5), { 7: 7 }));
    expect(lo.A).toBe((7 + 5) / 2);
    expect(hi.A).toBe((1 + 5) / 2);
    expect(lo.mps).toBeGreaterThan(hi.mps);
  });
});

describe('حساب الأبعاد وMPS', () => {
  it('الحد الأعلى النظري 343', () => {
    const s = computeScores(withQ(all(7), { 7: 1 }));
    expect(s.mps).toBe(343);
    expect(s.pct).toBe(100);
  });

  it('الحد الأدنى النظري 1', () => {
    const s = computeScores(withQ(all(1), { 7: 7 }));
    expect(s.mps).toBe(1);
  });

  it('كل الإجابات 1 تعطي A = 4 بسبب العكس', () => {
    const s = computeScores(all(1));
    expect(s.A).toBe(4);
    expect(s.mps).toBe(4);
  });

  it('مثال مفصل', () => {
    // Q1..Q12
    const a: Answers = [2, 6, 3, 5, 4, 7, 5, 4, 6, 3, 6, 3];
    const s = computeScores(a);
    expect(s.SV).toBe(5); // (6+4)/2
    expect(s.TI).toBe(3.5); // (3+4)/2
    expect(s.TS).toBe(6.5); // (7+6)/2
    expect(s.A).toBe(3); // ((8-5)+3)/2
    expect(s.F).toBe(5.5); // (5+6)/2
    expect(s.FO).toBe(2.5); // (2+3)/2
    expect(s.core).toBeCloseTo(5, 10);
    expect(s.mps).toBeCloseTo(5 * 3 * 5.5, 10);
    expect(s.pct).toBeCloseTo((82.5 / 343) * 100, 10);
  });

  it('التغذية الراجعة من الآخرين لا تؤثر في MPS', () => {
    const base = computeScores(withQ(all(4), { 1: 1, 12: 1 }));
    const changed = computeScores(withQ(all(4), { 1: 7, 12: 7 }));
    expect(base.FO).toBe(1);
    expect(changed.FO).toBe(7);
    expect(changed.mps).toBe(base.mps);
  });

  it('mpsWith يطابق الحساب الأصلي دون تعديل', () => {
    const s = computeScores([2, 6, 3, 5, 4, 7, 5, 4, 6, 3, 6, 3]);
    expect(mpsWith(s, {})).toBeCloseTo(s.mps, 10);
    expect(mpsWith(s, { A: 5 })).toBeCloseTo(5 * 5 * 5.5, 10);
  });
});

describe('التحقق من الاكتمال', () => {
  it('يرفض الإجابات الناقصة', () => {
    const a = emptyAnswers();
    expect(missingItems(a)).toHaveLength(12);
    expect(() => computeScores(a)).toThrow();
    const b = withQ(all(4), {});
    b[6] = null;
    expect(missingItems(b)).toEqual([7]);
    expect(() => computeScores(b)).toThrow();
  });

  it('يرفض القيم خارج 1–7', () => {
    expect(missingItems(withQ(all(4), { 3: 8 }))).toEqual([3]);
    expect(missingItems(withQ(all(4), { 5: 0 }))).toEqual([5]);
    expect(missingItems(withQ(all(4), { 9: 2.5 }))).toEqual([9]);
  });
});

describe('المستويات الوصفية', () => {
  it('حدود 4 و5', () => {
    expect(levelOf(3.5)).toBe('low');
    expect(levelOf(4)).toBe('mid');
    expect(levelOf(4.5)).toBe('mid');
    expect(levelOf(5)).toBe('high');
    expect(levelOf(7)).toBe('high');
  });
});

describe('التحليل', () => {
  it('يقدّم الاستقلالية والتغذية الراجعة المنخفضتين أولاً', () => {
    // SV منخفض جداً، A منخفض بدرجة أعلى قليلاً → A يسبق رغم ذلك
    const s = computeScores([4, 1, 5, 3, 1, 5, 5, 5, 3, 3, 5, 4]);
    const an = analyze(s, 'محلل');
    expect(an.recommendations[0].priority).toBe('very-high');
    expect(['A', 'F']).toContain(an.recommendations[0].dim);
    expect(an.recommendations.find((r) => r.dim === 'SV')?.priority).toBe('high');
    // كل بُعد منخفض له توصيتان
    for (const r of an.recommendations) if (r.level === 'low') expect(r.actions).toHaveLength(2);
  });

  it('لا توجد توصيات حين تكون جميع الأبعاد مرتفعة', () => {
    const an = analyze(computeScores(withQ(all(6), { 7: 2 })), 'x');
    expect(an.recommendations).toHaveLength(0);
    expect(an.lows).toHaveLength(0);
    expect(an.topImprovements.length).toBe(2);
  });
});
