import { forwardRef, type ReactNode } from 'react';
import type { Analysis } from '../lib/analysis';
import { DIMS, ITEMS, scaleLabel } from '../lib/model';
import { fmtCore, fmtDim, fmtMps, fmtPct, LEVEL_LABEL, type Answers, type Scores } from '../lib/scoring';
import { DimRadar, LEVEL_COLOR } from './Charts';
import type { Meta } from './Questionnaire';

export const PAGE_W = 794; // A4 عند 96 نقطة/بوصة
export const PAGE_H = 1123;
const TOTAL = 4;

interface Props {
  meta: Meta;
  answers: Answers;
  scores: Scores;
  analysis: Analysis;
}

function Page({ n, title, meta, children }: { n: number; title: string; meta: Meta; children: ReactNode }) {
  return (
    <div
      className="report-page flex flex-col bg-white text-slate-800"
      dir="rtl"
      style={{ width: PAGE_W, height: PAGE_H, padding: '36px 46px 24px', fontSize: 12.5, lineHeight: 1.7 }}
    >
      <header className="flex items-center justify-between border-b-2 border-brand-600 pb-2 text-[11px] text-slate-500">
        <span className="font-semibold text-brand-700">تقرير تشخيص الإثراء الوظيفي</span>
        <span>
          {meta.job} · <bdi dir="ltr">{meta.date}</bdi>
        </span>
      </header>
      <h2 className="mt-4 mb-3 text-[19px] font-bold text-brand-800">{title}</h2>
      <div data-fit className="relative flex-1 overflow-hidden">
        <div data-fit-inner style={{ transformOrigin: 'top right' }}>
          {children}
        </div>
      </div>
      <footer className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-400">
        <span>نسخة مختصرة ومكيّفة لغوياً لأغراض التشخيص الأولي — ليست أداة مقننة أو معتمدة سيكومترياً</span>
        <span>
          صفحة {n} من {TOTAL}
        </span>
      </footer>
    </div>
  );
}

function H({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 mb-2 border-r-4 border-brand-500 pr-2 text-[14px] font-bold text-slate-800 first:mt-0">{children}</h3>;
}

const th = 'border border-slate-300 bg-brand-50 px-2 py-1.5 text-right font-semibold text-brand-800';
const td = 'border border-slate-300 px-2 py-1.5 align-top';

export const Report = forwardRef<HTMLDivElement, Props>(function Report({ meta, answers, scores: s, analysis: an }, ref) {
  return (
    <div ref={ref} className="flex flex-col gap-6">
      {/* الصفحة 1: الملخص التنفيذي */}
      <Page n={1} title="الملخص التنفيذي" meta={meta}>
        <div className="rounded-xl bg-gradient-to-l from-brand-800 to-brand-600 p-6 text-white">
          <div className="text-[13px] text-brand-100">تقرير تشخيصي</div>
          <div className="text-[24px] font-bold leading-snug">تشخيص الإثراء الوظيفي والإمكانات التحفيزية للوظيفة</div>
          <div className="mt-1 text-[12px] text-brand-100">وفق نموذج خصائص الوظيفة (هاكمان وأولدهام) ومعادلة Motivating Potential Score</div>
        </div>

        <table className="mt-5 text-[12.5px]">
          <tbody>
            {[
              ['اسم الوظيفة', meta.job],
              ['المنظمة', meta.org || '—'],
              ['المقيِّم', meta.rater || '—'],
              ['تاريخ التقييم', meta.date],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className={`${td} w-40 bg-slate-50 font-semibold`}>{k}</td>
                <td className={td}>
                  <bdi>{v}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex items-center gap-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <div className="text-center">
            <div className="text-[12px] text-brand-700">درجة MPS</div>
            <div className="text-[46px] font-bold leading-none text-brand-800">{fmtMps(s.mps)}</div>
            <div className="mt-1 text-[13px] text-slate-500">من 343</div>
          </div>
          <div className="flex-1 border-r border-brand-200 pr-5 text-[12px] leading-relaxed text-slate-600">
            <div>
              النطاق النظري: <bdi dir="ltr">1 – 343</bdi>.
            </div>
            <div>النسبة من الحد الأعلى النظري: {fmtPct(s.pct)} (معلومة وصفية، وليست نسبة تحفيز فعلية).</div>
            <div>لا تُصنَّف الدرجة الكلية إلى منخفضة أو متوسطة أو مرتفعة لعدم توفر معيار مرجعي معتمد.</div>
          </div>
        </div>

        <H>الملخص التشخيصي</H>
        <p className="text-justify leading-loose text-slate-700">{an.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
            <div className="mb-2 font-bold text-teal-900">أبرز نقاط القوة</div>
            {an.topStrengths.length ? (
              <ol className="space-y-2">
                {an.topStrengths.map((h, i) => (
                  <li key={h.dimName}>
                    <div className="font-semibold">
                      {i + 1}. {h.dimName} ({fmtDim(h.score)})
                    </div>
                    <div className="text-[11.5px] text-slate-600">{h.text}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-[11.5px] text-slate-600">{an.strengthsNote}</div>
            )}
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
            <div className="mb-2 font-bold text-orange-900">أبرز فرص التحسين</div>
            <ol className="space-y-2">
              {an.topImprovements.map((h, i) => (
                <li key={h.dimName}>
                  <div className="font-semibold">
                    {i + 1}. {h.dimName} ({fmtDim(h.score)})
                  </div>
                  <div className="text-[11.5px] text-slate-600">{h.text}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Page>

      {/* الصفحة 2: النتائج التفصيلية */}
      <Page n={2} title="النتائج التفصيلية" meta={meta}>
        <H>درجات الأبعاد الستة</H>
        <table className="text-[12px]">
          <thead>
            <tr>
              <th className={th}>البُعد</th>
              <th className={th}>البنود</th>
              <th className={th}>المعادلة</th>
              <th className={`${th} text-center`}>الدرجة / 7</th>
              <th className={`${th} text-center`}>المستوى</th>
              <th className={`${th} text-center`}>في MPS</th>
            </tr>
          </thead>
          <tbody>
            {an.dims.map((d) => (
              <tr key={d.key}>
                <td className={`${td} font-semibold`}>
                  {d.name} <span className="text-[10px] font-normal text-slate-400">({d.key})</span>
                </td>
                <td className={td}>{DIMS[d.key].items.join('، ')}</td>
                <td className={`${td} text-[11px]`}>
                  <span className="ltr" dir="ltr">
                    {DIMS[d.key].formula}
                  </span>
                </td>
                <td className={`${td} text-center font-bold`} style={{ color: LEVEL_COLOR[d.level] }}>
                  {fmtDim(d.score)}
                </td>
                <td className={`${td} text-center`}>{LEVEL_LABEL[d.level]}</td>
                <td className={`${td} text-center`}>{DIMS[d.key].inMPS ? 'نعم' : 'لا'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex items-center gap-4">
          <div className="shrink-0 rounded-xl border border-slate-200 p-2">
            <DimRadar scores={s} fixed={{ width: 400, height: 300 }} fontSize={11} />
          </div>
          <div className="flex-1 text-[12px]">
            <div className="mb-2 font-bold text-slate-800">الأبعاد التي تقل درجاتها عن 4</div>
            {an.lows.length ? (
              <ul className="space-y-1.5">
                {an.lows.map((d) => (
                  <li key={d.key} className="rounded-lg bg-orange-50 px-3 py-1.5">
                    <span className="font-semibold text-orange-900">{d.name}</span> — {fmtDim(d.score)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-lg bg-teal-50 px-3 py-2 text-teal-900">لا توجد أبعاد تقل درجاتها عن 4.</div>
            )}
            <div className="mt-3 text-[10.5px] leading-relaxed text-slate-500">
              معيار وصفي: أقل من 4 منخفض · 4 إلى أقل من 5 متوسط · 5 إلى 7 مرتفع. حدود للتفسير داخل الأداة فقط.
            </div>
          </div>
        </div>

        <H>طريقة احتساب MPS</H>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div dir="ltr" className="space-y-1.5 text-left font-mono text-[12.5px] text-slate-800">
            <div>MPS = ((SV + TI + TS) / 3) × A × F</div>
            <div>
              = (({fmtDim(s.SV)} + {fmtDim(s.TI)} + {fmtDim(s.TS)}) / 3) × {fmtDim(s.A)} × {fmtDim(s.F)}
            </div>
            <div>
              = {fmtCore(s.core)} × {fmtDim(s.A)} × {fmtDim(s.F)} = <b>{fmtMps(s.mps)}</b>
            </div>
          </div>
          <div className="mt-3 text-[11.5px] leading-relaxed text-slate-600">
            تدخل الاستقلالية (A) والتغذية الراجعة من الوظيفة (F) في المعادلة عاملين مضاعِفين، بينما يدخل متوسط الأبعاد الجوهرية الثلاثة عاملاً
            واحداً. لا يدخل بُعد التغذية الراجعة من الآخرين (FO = {fmtDim(s.FO)}) في الحساب. عُكست درجة البند 7 قبل الحساب:{' '}
            <bdi dir="ltr">
              8 − {answers[6]} = {s.q7Reversed}
            </bdi>
            .
          </div>
        </div>

        {an.sensitivity.length > 0 && (
          <>
            <H>أمثلة حسابية توضيحية</H>
            <ul className="list-disc space-y-1 pr-5 text-[11.5px] text-slate-600">
              {an.sensitivity.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
      </Page>

      {/* الصفحة 3: التحليل والتوصيات */}
      <Page n={3} title="التحليل والتوصيات" meta={meta}>
        <H>تفسير النتائج لكل بُعد</H>
        <table className="text-[11.5px]">
          <thead>
            <tr>
              <th className={`${th} w-36`}>البُعد</th>
              <th className={`${th} w-16 text-center`}>الدرجة</th>
              <th className={th}>التفسير</th>
            </tr>
          </thead>
          <tbody>
            {an.dims.map((d) => (
              <tr key={d.key}>
                <td className={`${td} font-semibold`}>
                  {d.name}
                  <div className="text-[10px] font-normal" style={{ color: LEVEL_COLOR[d.level] }}>
                    {LEVEL_LABEL[d.level]}
                  </div>
                </td>
                <td className={`${td} text-center font-bold`} style={{ color: LEVEL_COLOR[d.level] }}>
                  {fmtDim(d.score)}
                </td>
                <td className={`${td} leading-relaxed text-slate-700`}>{d.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <H>فرص إثراء الوظيفة</H>
        {an.enrichment.length ? (
          <ul className="space-y-1 text-[11.5px]">
            {an.enrichment.map((e) => (
              <li key={e.title}>
                <b className="text-brand-800">{e.title}:</b> {e.text} <span className="text-slate-400">(يستهدف: {e.targets})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11.5px] text-slate-600">جميع الأبعاد مرتفعة؛ يُقترح الحفاظ على عناصر التصميم الحالية ومتابعتها دورياً.</p>
        )}

        <H>التوصيات مرتبة بحسب الأولوية</H>
        {an.recommendations.length ? (
          <ol className="space-y-1.5 text-[11.5px]">
            {an.recommendations.map((r, i) => (
              <li key={r.dim}>
                <b>
                  {i + 1}. {r.dimName} ({fmtDim(r.score)}) — أولوية {r.priorityLabel}:
                </b>{' '}
                <span className="text-slate-600">{r.reason}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[11.5px] text-slate-600">لا توجد أبعاد منخفضة أو متوسطة تستدعي توصيات.</p>
        )}

        {an.plan.length > 0 && (
          <>
            <H>خطة التحسين المقترحة</H>
            <table className="text-[11px]">
              <thead>
                <tr>
                  <th className={`${th} w-7 text-center`}>#</th>
                  <th className={th}>الإجراء</th>
                  <th className={th}>البُعد</th>
                  <th className={`${th} text-center`}>الأولوية</th>
                  <th className={th}>المدى الزمني</th>
                  <th className={th}>خطوة التحقق</th>
                </tr>
              </thead>
              <tbody>
                {an.plan.map((p) => (
                  <tr key={p.n}>
                    <td className={`${td} text-center`}>{p.n}</td>
                    <td className={td}>{p.action}</td>
                    <td className={td}>{p.dimName}</td>
                    <td className={`${td} whitespace-nowrap text-center font-semibold`}>{p.priorityLabel}</td>
                    <td className={`${td} whitespace-nowrap`}>{p.horizon}</td>
                    <td className={`${td} text-slate-600`}>{p.verify}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="mt-3 text-[10.5px] text-slate-500">
          النتائج مؤشرات تشخيصية تستحق التحقق، ولا تفترض وجود مشكلة تنظيمية لمجرد انخفاض الدرجة، ولا يُستنتج منها رضا الموظف أو أداؤه.
        </p>
      </Page>

      {/* الصفحة 4: البيانات والمنهجية */}
      <Page n={4} title="البيانات والمنهجية" meta={meta}>
        <H>العبارات الاثنتا عشرة والإجابات</H>
        <table className="text-[11px]">
          <thead>
            <tr>
              <th className={`${th} w-7 text-center`}>#</th>
              <th className={th}>العبارة</th>
              <th className={`${th} w-24`}>البُعد</th>
              <th className={`${th} w-28 text-center`}>الإجابة</th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((it) => {
              const v = answers[it.id - 1] as number;
              return (
                <tr key={it.id}>
                  <td className={`${td} text-center`}>{it.id}</td>
                  <td className={td}>{it.text}</td>
                  <td className={td}>
                    {DIMS[it.dim].short}
                    {it.reverse && <div className="text-[10px] text-orange-700">بند عكسي</div>}
                  </td>
                  <td className={`${td} text-center`}>
                    <b>{v}</b> <span className="text-[10px] text-slate-500">{scaleLabel(v)}</span>
                    {it.reverse && <div className="text-[10px] text-orange-700">بعد العكس: {8 - v}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <H>نموذج خصائص الوظيفة</H>
        <p className="text-justify text-[11.5px] leading-relaxed text-slate-700">
          يفترض نموذج هاكمان وأولدهام (Job Characteristics Model) أن خمس خصائص جوهرية في تصميم الوظيفة — تنوع المهارات وهوية المهمة وأهمية
          المهمة والاستقلالية والتغذية الراجعة من الوظيفة — تؤثر في حالات نفسية حرجة (الإحساس بمعنى العمل، والشعور بالمسؤولية عن النتائج،
          ومعرفة النتائج الفعلية)، ومنها في نواتج العمل. وتلخّص درجة MPS الإمكانات التحفيزية الكامنة في تصميم الوظيفة، لا مستوى دافعية شاغلها
          الفعلي.
        </p>

        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <H>المعادلات المستخدمة</H>
            <div dir="ltr" className="space-y-0.5 rounded-lg bg-slate-50 p-3 text-left font-mono text-[10.5px] text-slate-800">
              {Object.values(DIMS).map((d) => (
                <div key={d.key}>{d.formula}</div>
              ))}
              <div className="pt-1 font-bold">MPS = ((SV + TI + TS) / 3) × A × F</div>
              <div className="text-slate-500">Range: 1 – 343 · FO excluded from MPS</div>
            </div>
          </div>
          <div>
            <H>معالجة البند العكسي</H>
            <p className="text-[11.5px] leading-relaxed text-slate-700">
              صيغ البند 7 بصورة سلبية («لا تتيح الوظيفة...»)، لذا تُعكس درجته قبل حساب الاستقلالية بطرحها من 8؛ فتتحول الدرجة 1 إلى 7، والدرجة 7 إلى 1. في هذا
              التقييم: الإجابة {answers[6]} أصبحت {s.q7Reversed}.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
          <b>تنبيه منهجي:</b> هذه الأداة نسخة مختصرة (12 بنداً) ومكيّفة لغوياً لأغراض التشخيص الأولي، وليست أداة مقننة أو معتمدة سيكومترياً.
          تقيس خصائص الوظيفة لا خصائص الموظف، ولا يُستنتج منها رضاه أو أداؤه، ولا تتضمن معايير مقارنة مع وظائف أخرى لعدم توفر بيانات
          مرجعية. حدود المستويات (4 و5) وصفية لأغراض التفسير فقط.
        </div>
      </Page>
    </div>
  );
});
