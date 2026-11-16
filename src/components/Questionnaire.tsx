import { ITEMS, SCALE, scaleLabel } from '../lib/model';
import type { Answers } from '../lib/scoring';
import { Card } from './ui';

export interface Meta {
  job: string;
  org: string;
  rater: string;
  date: string;
}

interface Props {
  meta: Meta;
  answers: Answers;
  highlight: Set<number>;
  jobError: boolean;
  onMeta: (m: Meta) => void;
  onAnswer: (id: number, v: number) => void;
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function Questionnaire({ meta, answers, highlight, jobError, onMeta, onAnswer }: Props) {
  return (
    <div className="space-y-6">
      <Card title="بيانات التقييم">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              اسم الوظيفة المراد تقييمها <span className="text-rose-600">*</span>
            </span>
            <input
              id="job-title"
              className={`${inputCls} ${jobError ? 'border-rose-400 ring-2 ring-rose-100' : ''}`}
              value={meta.job}
              placeholder="مثال: أخصائي موارد بشرية"
              onChange={(e) => onMeta({ ...meta, job: e.target.value })}
            />
            {jobError && <span className="mt-1 block text-sm text-rose-600">يرجى إدخال اسم الوظيفة.</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">اسم المنظمة (اختياري)</span>
            <input className={inputCls} value={meta.org} onChange={(e) => onMeta({ ...meta, org: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">اسم المقيِّم (اختياري)</span>
            <input className={inputCls} value={meta.rater} onChange={(e) => onMeta({ ...meta, rater: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">تاريخ التقييم</span>
            <input type="date" className={inputCls} value={meta.date} onChange={(e) => onMeta({ ...meta, date: e.target.value })} />
          </label>
        </div>
      </Card>

      <Card title="الاستبانة">
        <p className="mb-4 leading-relaxed text-slate-600">
          حدّد مدى دقة كل عبارة في <strong className="text-slate-800">وصف الوظيفة نفسها</strong> كما هي مصممة فعلياً، بصرف النظر عن
          شخصية شاغلها أو مستوى رضاه.
        </p>
        <div className="mb-2 grid grid-cols-7 gap-1 rounded-xl bg-slate-50 p-2 text-center text-[11px] leading-tight text-slate-600 sm:text-xs">
          {SCALE.map((s) => (
            <div key={s.value}>
              <div className="font-bold text-brand-700">{s.value}</div>
              <div>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <ol className="space-y-4">
        {ITEMS.map((item) => {
          const v = answers[item.id - 1];
          const missing = highlight.has(item.id);
          return (
            <li
              key={item.id}
              id={`item-${item.id}`}
              className={`scroll-mt-28 rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                missing ? 'border-rose-300 ring-2 ring-rose-100' : v ? 'border-brand-200' : 'border-slate-200'
              }`}
            >
              <div className="mb-3 flex gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.id}
                </span>
                <p className="pt-1 font-medium leading-relaxed text-slate-800">{item.text}</p>
              </div>
              <div role="radiogroup" aria-label={`البند ${item.id}`} className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {SCALE.map((s) => {
                  const on = v === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      title={s.label}
                      onClick={() => onAnswer(item.id, s.value)}
                      className={`h-11 rounded-lg border text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        on
                          ? 'border-brand-600 bg-brand-600 text-white shadow'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-50'
                      }`}
                    >
                      {s.value}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 min-h-5 text-sm">
                {v ? (
                  <span className="text-brand-700">
                    الإجابة: <strong>{v}</strong> — {scaleLabel(v)}
                  </span>
                ) : missing ? (
                  <span className="text-rose-600">لم تتم الإجابة عن هذا البند.</span>
                ) : (
                  <span className="text-slate-400">لم يتم الاختيار بعد</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
