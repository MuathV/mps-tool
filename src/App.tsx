import { useEffect, useMemo, useRef, useState } from 'react';
import { Questionnaire, type Meta } from './components/Questionnaire';
import { Report } from './components/Report';
import { Results } from './components/Results';
import { analyze } from './lib/analysis';
import { exportReportPdf, safeFileName } from './lib/pdf';
import { computeScores, emptyAnswers, ITEM_COUNT, isValidAnswer, missingItems, type Answers } from './lib/scoring';

const STORAGE_KEY = 'mps-job-enrichment-v1';

type View = 'form' | 'results';
interface Saved {
  meta: Meta;
  answers: Answers;
  view: View;
}

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const fresh = (): Saved => ({ meta: { job: '', org: '', rater: '', date: today() }, answers: emptyAnswers(), view: 'form' });

function load(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const p = JSON.parse(raw) as Partial<Saved>;
    const base = fresh();
    const answers =
      Array.isArray(p.answers) && p.answers.length === ITEM_COUNT ? p.answers.map((v) => (isValidAnswer(v) ? v : null)) : base.answers;
    const meta = { ...base.meta, ...(p.meta ?? {}) };
    const view: View = p.view === 'results' && missingItems(answers).length === 0 && meta.job.trim() ? 'results' : 'form';
    return { meta, answers, view };
  } catch {
    return fresh();
  }
}

export default function App() {
  const [state, setState] = useState<Saved>(load);
  const [highlight, setHighlight] = useState<Set<number>>(new Set());
  const [jobError, setJobError] = useState(false);
  const [notice, setNotice] = useState('');
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* التخزين غير متاح */
    }
  }, [state]);

  const { meta, answers, view } = state;
  const missing = missingItems(answers);
  const answered = ITEM_COUNT - missing.length;
  const pct = Math.round((answered / ITEM_COUNT) * 100);
  const complete = missing.length === 0;

  const scores = useMemo(() => (complete ? computeScores(answers) : null), [answers, complete]);
  const analysis = useMemo(() => (scores ? analyze(scores, meta.job) : null), [scores, meta.job]);

  const setAnswer = (id: number, v: number) => {
    setState((s) => {
      const a = [...s.answers];
      a[id - 1] = v;
      return { ...s, answers: a };
    });
    if (highlight.has(id)) {
      const h = new Set(highlight);
      h.delete(id);
      setHighlight(h);
    }
  };

  const showResults = () => {
    const noJob = !meta.job.trim();
    setJobError(noJob);
    setHighlight(new Set(missing));
    if (missing.length || noJob) {
      const parts = [];
      if (noJob) parts.push('أدخل اسم الوظيفة');
      if (missing.length) parts.push(`أجب عن البنود: ${missing.join('، ')}`);
      setNotice(`لا يمكن حساب النتيجة قبل إكمال البيانات — ${parts.join('، و')}.`);
      const target = noJob ? document.getElementById('job-title') : document.getElementById(`item-${missing[0]}`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setNotice('');
    setState((s) => ({ ...s, view: 'results' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const newEvaluation = () => {
    if (!window.confirm('سيتم مسح البيانات والإجابات الحالية وبدء تقييم جديد. هل تريد المتابعة؟')) return;
    setState(fresh());
    setHighlight(new Set());
    setJobError(false);
    setNotice('');
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!exporting) return;
    let cancelled = false;
    (async () => {
      try {
        if (reportRef.current) await exportReportPdf(reportRef.current, safeFileName(meta.job, meta.date));
      } catch (e) {
        console.error(e);
        if (!cancelled) window.alert('تعذر إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
      } finally {
        if (!cancelled) setExporting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exporting]);

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">M</div>
            <div>
              <h1 className="text-2xl font-bold text-brand-900 sm:text-3xl">أداة تشخيص الإثراء الوظيفي</h1>
              <p className="mt-2 max-w-3xl leading-relaxed text-slate-600">
                أداة لقياس الإمكانات التحفيزية لتصميم وظيفة محددة وفق نموذج خصائص الوظيفة لهاكمان وأولدهام ومعادلة
{' '}<bdi dir="ltr">Motivating Potential Score (MPS)</bdi>،وتحديد جوانب القوة والضعف في تصميمها. يتعلق التقييم بالوظيفة نفسها لا
                بشخصية شاغلها أو رضاه. تتم جميع الحسابات على جهازك دون إرسال أي بيانات.
              </p>
            </div>
          </div>
        </div>
      </header>

      {view === 'form' && (
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <span className="shrink-0 text-sm font-semibold text-slate-700">
              {answered} من {ITEM_COUNT}
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-11 shrink-0 text-left text-sm font-bold text-brand-700">{pct}%</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 pt-6">
        {view === 'form' ? (
          <>
            <Questionnaire
              meta={state.meta}
              answers={answers}
              highlight={highlight}
              jobError={jobError}
              onMeta={(m) => {
                setState((s) => ({ ...s, meta: m }));
                if (m.job.trim()) setJobError(false);
              }}
              onAnswer={setAnswer}
            />
            {notice && <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{notice}</div>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={showResults}
                className={`flex-1 rounded-xl px-6 py-3.5 text-lg font-bold shadow-sm transition ${
                  complete && meta.job.trim() ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-300 text-slate-600'
                }`}
              >
                {complete ? 'عرض النتائج والتحليل' : `عرض النتائج (متبقٍ ${missing.length} ${missing.length > 2 && missing.length < 11 ? 'بنود' : 'بنداً'})`}
              </button>
              <button onClick={newEvaluation} className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50">
                بدء تقييم جديد
              </button>
            </div>
          </>
        ) : (
          scores &&
          analysis && (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setExporting(true)}
                  disabled={exporting}
                  className="flex-1 rounded-xl bg-brand-600 px-6 py-3.5 text-lg font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {exporting ? 'جارٍ إنشاء التقرير…' : 'تصدير التقرير (PDF)'}
                </button>
                <button
                  onClick={() => setState((s) => ({ ...s, view: 'form' }))}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  تعديل الإجابات
                </button>
                <button onClick={newEvaluation} className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50">
                  بدء تقييم جديد
                </button>
              </div>
              <Results meta={meta} scores={scores} analysis={analysis} />
            </>
          )
        )}
      </main>

      {exporting && scores && analysis && (
        <div aria-hidden style={{ position: 'fixed', top: 0, left: -10000, pointerEvents: 'none' }}>
          <Report ref={reportRef} meta={meta} answers={answers} scores={scores} analysis={analysis} />
        </div>
      )}
    </div>
  );
}
