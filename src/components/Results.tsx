import type { Analysis } from '../lib/analysis';
import { DIMS } from '../lib/model';
import { fmtCore, fmtDim, fmtMps, fmtPct, type Scores } from '../lib/scoring';
import { DimBars, DimRadar, LEVEL_COLOR } from './Charts';
import type { Meta } from './Questionnaire';
import { Card, LevelBadge, PriorityBadge } from './ui';

interface Props {
  meta: Meta;
  scores: Scores;
  analysis: Analysis;
}

export function Results({ meta, scores: s, analysis: an }: Props) {
  return (
    <div className="space-y-6">
      {/* 1. درجة MPS */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-l from-brand-800 to-brand-600 text-white shadow-md">
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="text-center md:text-right">
            <div className="text-sm font-medium text-brand-100">درجة الإمكانات التحفيزية (MPS)</div>
            <div className="mt-1 flex items-baseline justify-center gap-2 md:justify-start">
              <span className="text-6xl font-bold tracking-tight sm:text-7xl">{fmtMps(s.mps)}</span>
              <span className="text-xl text-brand-100">/ 343</span>
            </div>
            <div className="mt-2 text-sm text-brand-100">
              تمثل {fmtPct(s.pct)} من الحد الأعلى النظري — معلومة وصفية وليست نسبة تحفيز فعلية
            </div>
          </div>
          <div className="space-y-2 rounded-xl bg-white/10 p-4 text-sm leading-relaxed">
            <div className="font-semibold">{meta.job}</div>
            <div className="text-brand-100">
              {[meta.org, meta.rater && `المقيِّم: ${meta.rater}`].filter(Boolean).join(' · ')}
              {(meta.org || meta.rater) && ' · '}
              <bdi dir="ltr">{meta.date}</bdi>
            </div>
            <div className="ltr text-left font-mono text-xs text-brand-100" dir="ltr">
              MPS = ((SV + TI + TS) / 3) × A × F = {fmtCore(s.core)} × {fmtDim(s.A)} × {fmtDim(s.F)}
            </div>
            <div className="text-xs text-brand-100">النطاق النظري: 1 – 343. لا تُصنَّف الدرجة الكلية لعدم توفر معيار مرجعي معتمد.</div>
          </div>
        </div>
      </section>

      {/* الملخص */}
      <Card title="الملخص التشخيصي">
        <p className="leading-loose text-slate-700">{an.summary}</p>
      </Card>

      {/* 2. الأبعاد الستة */}
      <Card title="درجات الأبعاد الستة" aside={<span className="text-xs text-slate-500">كل بُعد من 7 درجات</span>}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {an.dims.map((d) => (
            <div key={d.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-800">{d.name}</div>
                  <div className="text-xs text-slate-500">
                    <span dir="ltr">{DIMS[d.key].en}</span>
                    {!DIMS[d.key].inMPS && ' · خارج حساب MPS'}
                  </div>
                </div>
                <LevelBadge level={d.level} />
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: LEVEL_COLOR[d.level] }}>
                  {fmtDim(d.score)}
                </span>
                <span className="text-slate-400">/ 7</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${(d.score / 7) * 100}%`, background: LEVEL_COLOR[d.level] }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          معيار التفسير الوصفي: أقل من 4 منخفض يحتاج إلى مراجعة · من 4 إلى أقل من 5 متوسط · من 5 إلى 7 مرتفع. هذه الحدود للتفسير داخل الأداة
          فقط وليست معايير سيكومترية معتمدة.
        </p>
      </Card>

      {/* 3–4. المخططات */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="المخطط الراداري للأبعاد">
          <DimRadar scores={s} />
        </Card>
        <Card title="مقارنة درجات الأبعاد">
          <DimBars scores={s} />
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
            <span>
              <span className="ml-1 inline-block h-0 w-5 border-t-2 border-dashed border-orange-700 align-middle" /> حد 4
            </span>
            <span>
              <span className="ml-1 inline-block h-0 w-5 border-t-2 border-dashed border-teal-700 align-middle" /> حد 5
            </span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 5. الترتيب */}
        <Card title="ترتيب الأبعاد من الأعلى إلى الأقل">
          <ol className="space-y-2">
            {an.ranking.map((d, i) => (
              <li key={d.key} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <span className="w-5 text-center font-bold text-slate-400">{i + 1}</span>
                <span className="flex-1 font-medium text-slate-800">{d.name}</span>
                <span className="font-bold" style={{ color: LEVEL_COLOR[d.level] }}>
                  {fmtDim(d.score)}
                </span>
                <LevelBadge level={d.level} />
              </li>
            ))}
          </ol>
        </Card>

        {/* 6. الأبعاد الأقل من 4 */}
        <Card title="الأبعاد التي تقل درجاتها عن 4">
          {an.lows.length ? (
            <ul className="space-y-3">
              {an.lows.map((d) => (
                <li key={d.key} className="rounded-lg border border-orange-200 bg-orange-50/60 p-3">
                  <div className="flex justify-between font-semibold text-orange-900">
                    <span>{d.name}</span>
                    <span>{fmtDim(d.score)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{d.interpretation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-teal-50 p-3 text-teal-900">لا توجد أبعاد تقل درجاتها عن 4 وفق الإجابات المقدمة.</p>
          )}
        </Card>
      </div>

      {/* 7. نقاط القوة */}
      <Card title="نقاط القوة في تصميم الوظيفة">
        {an.strengthsNote && <p className="mb-3 text-sm text-slate-500">{an.strengthsNote}</p>}
        {an.strengths.length > 0 && (
          <ul className="grid gap-3 md:grid-cols-2">
            {an.strengths.map((d) => (
              <li key={d.key} className="rounded-lg border border-teal-200 bg-teal-50/50 p-3">
                <div className="flex justify-between font-semibold text-teal-900">
                  <span>{d.name}</span>
                  <span>{fmtDim(d.score)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{d.interpretation}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 8. جوانب التحسين */}
      <Card title="جوانب التحسين ذات الأولوية">
        {an.recommendations.length ? (
          <ol className="space-y-4">
            {an.recommendations.map((r, i) => (
              <li key={r.dim} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                  <span className="font-bold text-slate-800">{r.dimName}</span>
                  <span className="text-sm text-slate-500">({fmtDim(r.score)})</span>
                  <LevelBadge level={r.level} />
                  <PriorityBadge priority={r.priority} label={r.priorityLabel} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{r.reason}</p>
                {r.level === 'low' && <p className="mt-2 text-sm leading-relaxed text-slate-700">{an.dims.find((d) => d.key === r.dim)?.interpretation}</p>}
                <ul className="mt-3 list-disc space-y-1 pr-5 text-slate-800 marker:text-brand-500">
                  {r.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-lg bg-teal-50 p-3 text-teal-900">
            جميع الأبعاد في المستوى المرتفع وفق الإجابات؛ يُقترح الحفاظ على عناصر التصميم الحالية ومراجعتها دورياً.
          </p>
        )}
        {an.sensitivity.length > 0 && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 text-sm font-semibold text-slate-700">أمثلة حسابية توضيحية</div>
            <ul className="list-disc space-y-1 pr-5 text-sm leading-relaxed text-slate-600">
              {an.sensitivity.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          تُعرض النتائج بوصفها مؤشرات تشخيصية تستحق التحقق، ولا تفترض وجود مشكلة تنظيمية لمجرد انخفاض الدرجة، ولا يُستنتج منها رضا الموظف أو
          أداؤه.
        </p>
      </Card>
    </div>
  );
}
