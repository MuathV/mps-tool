import { DIMS, DIM_ORDER, type DimKey } from './model';
import { fmtCore, fmtDim, fmtMps, levelOf, mpsWith, type Level, type Scores } from './scoring';

export type Priority = 'very-high' | 'high' | 'medium';

export const PRIORITY_LABEL: Record<Priority, string> = {
  'very-high': 'عالية جداً',
  high: 'عالية',
  medium: 'متوسطة',
};

const HORIZON: Record<Priority, string> = {
  'very-high': 'قصير (0–3 أشهر)',
  high: 'قصير–متوسط (3–6 أشهر)',
  medium: 'متوسط (6–12 شهراً)',
};

const INTERPRETATION: Record<DimKey, Record<Level, string>> = {
  SV: {
    low: 'تشير الإجابات إلى أن الوظيفة قد تعتمد على نطاق محدود من المهارات وأنشطة يغلب عليها التكرار؛ وهو مؤشر يستحق التحقق بمقارنة المهام الفعلية بالوصف الوظيفي.',
    mid: 'تتطلب الوظيفة قدراً معتدلاً من تنوع المهارات، مع وجود مجال لإضافة مهام تستدعي قدرات مختلفة.',
    high: 'تتطلب الوظيفة وفق الإجابات استخدام مجموعة متنوعة من المهارات والقدرات، وهو جانب داعم للإمكانات التحفيزية.',
  },
  TI: {
    low: 'قد تكون مهام الوظيفة مجزأة بصورة لا تتيح لشاغلها رؤية مخرج متكامل؛ ويُستحسن التحقق من تسلسل العمل وطريقة توزيع المسؤوليات.',
    mid: 'تتيح الوظيفة إنجاز أجزاء معتبرة من العمل، لكن إكمال المخرج النهائي أو رؤيته قد لا يكون متاحاً دائماً.',
    high: 'تتيح الوظيفة إنجاز وحدات عمل متكاملة يمكن تمييز نتائجها، مما يعزز وضوح الإسهام.',
  },
  TS: {
    low: 'لا تُظهر الإجابات أثراً واضحاً لمخرجات الوظيفة في الآخرين أو في أهداف المنظمة؛ وقد يعكس ذلك ضعف وضوح الأثر لا انعدامه، مما يستدعي التحقق.',
    mid: 'لمخرجات الوظيفة أثر ملموس بدرجة معتدلة، ويمكن إبراز صلتها بالمستفيدين وأهداف المنظمة بصورة أوضح.',
    high: 'ترتبط مخرجات الوظيفة بأثر واضح في الآخرين أو في أهداف المنظمة.',
  },
  A: {
    low: 'تشير الإجابات إلى محدودية الحرية في تحديد طرق التنفيذ. ولأن الاستقلالية عامل مضاعِف في معادلة MPS، فإن انخفاضها يحدّ من الدرجة الكلية بصورة ملحوظة.',
    mid: 'تمنح الوظيفة قدراً معتدلاً من الاستقلالية، وتوسيعه ينعكس مباشرة على الدرجة الكلية لكونه عاملاً مضاعِفاً.',
    high: 'تمنح الوظيفة شاغلها مساحة واضحة من الحرية والتقدير الشخصي في تنفيذ العمل، وهو عامل مضاعِف داعم للدرجة الكلية.',
  },
  F: {
    low: 'لا يبدو أن نتائج العمل نفسها توفر مؤشرات كافية عن جودة الأداء. ولأن هذا البعد عامل مضاعِف في المعادلة، فإن انخفاضه يخفّض الدرجة الكلية بصورة ملحوظة.',
    mid: 'يوفر العمل نفسه قدراً معتدلاً من المؤشرات عن جودة الأداء، ويمكن جعلها أكثر مباشرة ووضوحاً.',
    high: 'يوفر العمل نفسه مؤشرات واضحة ومباشرة عن جودة الأداء، وهو عامل مضاعِف داعم للدرجة الكلية.',
  },
  FO: {
    low: 'تشير الإجابات إلى محدودية التغذية الراجعة المنتظمة من المشرفين والزملاء. لا يدخل هذا البعد في MPS، لكنه مؤشر مكمّل يستحق التحقق.',
    mid: 'تتوفر تغذية راجعة من الآخرين بدرجة معتدلة، ويمكن تنظيمها لتكون أكثر انتظاماً.',
    high: 'تتوفر تغذية راجعة منتظمة من المشرفين والزملاء، وهو جانب مكمّل داعم (خارج حساب MPS).',
  },
};

const RECS: Record<DimKey, [string, string]> = {
  SV: ['توسيع نطاق المهام التي تتطلب مهارات مختلفة', 'إتاحة فرص المشاركة في مشروعات متعددة التخصصات'],
  TI: [
    'تمكين شاغل الوظيفة من تنفيذ مهام متكاملة من البداية إلى النهاية',
    'تقليل تجزئة المسؤوليات بصورة تمنع رؤية المخرجات النهائية',
  ],
  TS: ['توضيح أثر مخرجات الوظيفة في المستفيدين وأهداف المنظمة', 'ربط المهام اليومية بالنتائج التنظيمية'],
  A: [
    'توسيع الصلاحيات المرتبطة بطريقة تنفيذ العمل',
    'تقليل الموافقات غير الضرورية وتحديد حدود واضحة لاتخاذ القرار',
  ],
  F: ['تصميم مؤشرات أداء تُظهر نتائج العمل بصورة مباشرة', 'توفير لوحات متابعة تساعد على معرفة جودة المخرجات'],
  FO: ['تنظيم مراجعات أداء دورية', 'تعزيز التغذية الراجعة من المشرفين والزملاء'],
};

const VERIFY: Record<DimKey, string> = {
  SV: 'مقارنة المهام الفعلية بالوصف الوظيفي',
  TI: 'تتبّع مسار العمل من بدايته إلى مخرجه',
  TS: 'حصر المستفيدين من مخرجات الوظيفة',
  A: 'مراجعة مصفوفة الصلاحيات والموافقات',
  F: 'مراجعة المؤشرات المتاحة لشاغل الوظيفة',
  FO: 'مراجعة دورية التقييم واللقاءات الإشرافية',
};

/** مبادئ إثراء الوظيفة لدى هاكمان وأولدهام والأبعاد التي تستهدفها */
const ENRICHMENT: { title: string; text: string; targets: DimKey[] }[] = [
  { title: 'دمج المهام', text: 'جمع مهام مجزأة متقاربة في وحدة عمل أوسع يتولاها شاغل الوظيفة.', targets: ['SV', 'TI'] },
  { title: 'تشكيل وحدات عمل طبيعية', text: 'تنظيم العمل حول مخرج أو مستفيد محدد بدلاً من توزيعه عشوائياً.', targets: ['TI', 'TS'] },
  { title: 'بناء صلة مباشرة بالمستفيدين', text: 'إتاحة التواصل مع متلقي المخرجات لمعرفة احتياجاتهم وأثر العمل فيهم.', targets: ['SV', 'TS', 'A', 'F'] },
  { title: 'التحميل الرأسي', text: 'نقل جزء من صلاحيات التخطيط والرقابة واتخاذ القرار إلى شاغل الوظيفة.', targets: ['A'] },
  { title: 'فتح قنوات التغذية الراجعة', text: 'إزالة العوائق التي تحجب نتائج العمل عن شاغله وتوفير معلومات أداء مباشرة.', targets: ['F', 'FO'] },
];

export interface DimResult {
  key: DimKey;
  name: string;
  score: number;
  level: Level;
  interpretation: string;
}

export interface Recommendation {
  dim: DimKey;
  dimName: string;
  score: number;
  level: Level;
  priority: Priority;
  priorityLabel: string;
  reason: string;
  actions: string[];
}

export interface PlanRow {
  n: number;
  action: string;
  dimName: string;
  priority: Priority;
  priorityLabel: string;
  horizon: string;
  verify: string;
}

export interface Highlight {
  dimName: string;
  score: number;
  text: string;
}

export interface Analysis {
  dims: DimResult[];
  ranking: DimResult[];
  lows: DimResult[];
  strengths: DimResult[];
  strengthsNote: string;
  recommendations: Recommendation[];
  plan: PlanRow[];
  topStrengths: Highlight[];
  topImprovements: Highlight[];
  enrichment: { title: string; text: string; targets: string }[];
  sensitivity: string[];
  summary: string;
}

const isMultiplier = (k: DimKey) => k === 'A' || k === 'F';

function group(d: DimResult): number {
  if (d.level === 'low') return isMultiplier(d.key) ? 0 : d.key === 'FO' ? 2 : 1;
  if (d.level === 'mid') return isMultiplier(d.key) ? 3 : 4;
  return 9;
}

const orderIdx = (k: DimKey) => DIM_ORDER.indexOf(k);

export function countDims(n: number): string {
  if (n === 1) return 'بُعد واحد';
  if (n === 2) return 'بُعدان';
  return `${n} أبعاد`;
}

const joinAr = (xs: string[]) =>
  xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join('، ')} و${xs[xs.length - 1]}`;

export function analyze(s: Scores, jobTitle: string): Analysis {
  const dims: DimResult[] = DIM_ORDER.map((k) => ({
    key: k,
    name: DIMS[k].name,
    score: s[k],
    level: levelOf(s[k]),
    interpretation: INTERPRETATION[k][levelOf(s[k])],
  }));

  const ranking = [...dims].sort((a, b) => b.score - a.score || orderIdx(a.key) - orderIdx(b.key));
  const lows = dims.filter((d) => d.level === 'low').sort((a, b) => a.score - b.score || orderIdx(a.key) - orderIdx(b.key));
  const highs = ranking.filter((d) => d.level === 'high');

  // نقاط القوة
  let strengths: DimResult[];
  let strengthsNote = '';
  if (highs.length) {
    strengths = highs;
  } else {
    const mids = ranking.filter((d) => d.level === 'mid');
    strengths = mids.slice(0, 2);
    strengthsNote = mids.length
      ? 'لا توجد أبعاد بلغت المستوى المرتفع (5 فأكثر)؛ تُعرض الأبعاد المتوسطة الأعلى بوصفها نقاط قوة نسبية.'
      : 'لا توجد أبعاد بلغت المستوى المتوسط أو المرتفع؛ لا تظهر نقاط قوة واضحة في تصميم الوظيفة وفق هذه الإجابات.';
  }

  // التوصيات مرتبة بحسب الأولوية
  const recDims = dims
    .filter((d) => d.level !== 'high')
    .sort((a, b) => group(a) - group(b) || a.score - b.score || orderIdx(a.key) - orderIdx(b.key));

  const recommendations: Recommendation[] = recDims.map((d) => {
    let priority: Priority;
    let reason: string;
    if (d.level === 'low' && isMultiplier(d.key)) {
      priority = 'very-high';
      reason = 'بُعد منخفض يدخل عاملاً مضاعِفاً في معادلة MPS، فتحسينه أكثر أثراً في الدرجة الكلية.';
    } else if (d.level === 'low' && d.key !== 'FO') {
      priority = 'high';
      reason = 'بُعد منخفض ضمن متوسط الأبعاد الجوهرية الثلاثة في المعادلة.';
    } else if (d.level === 'low') {
      priority = 'high';
      reason = 'بُعد مكمّل منخفض؛ لا يغيّر درجة MPS لكنه يدعم وضوح الأداء.';
    } else {
      priority = 'medium';
      reason = isMultiplier(d.key)
        ? 'بُعد متوسط ذو أثر مضاعِف في المعادلة؛ فرصة تعزيز.'
        : 'بُعد متوسط يمكن تعزيزه ضمن فرص الإثراء.';
    }
    const actions = d.level === 'low' ? [...RECS[d.key]] : [RECS[d.key][0]];
    return { dim: d.key, dimName: d.name, score: d.score, level: d.level, priority, priorityLabel: PRIORITY_LABEL[priority], reason, actions };
  });

  const plan: PlanRow[] = [];
  recommendations.forEach((r) =>
    r.actions.forEach((action) =>
      plan.push({
        n: plan.length + 1,
        action,
        dimName: r.dimName,
        priority: r.priority,
        priorityLabel: r.priorityLabel,
        horizon: HORIZON[r.priority],
        verify: VERIFY[r.dim],
      }),
    ),
  );

  const topStrengths: Highlight[] = strengths.slice(0, 2).map((d) => ({ dimName: d.name, score: d.score, text: d.interpretation }));

  let topImprovements: Highlight[] = recommendations.slice(0, 2).map((r) => ({
    dimName: r.dimName,
    score: r.score,
    text: r.actions[0],
  }));
  if (!topImprovements.length) {
    topImprovements = [...ranking]
      .reverse()
      .slice(0, 2)
      .map((d) => ({ dimName: d.name, score: d.score, text: `الحفاظ على المستوى الحالي ومتابعته: ${RECS[d.key][0]}` }));
  }

  const weakSet = new Set(dims.filter((d) => d.level !== 'high').map((d) => d.key));
  const enrichment = ENRICHMENT.filter((e) => e.targets.some((t) => weakSet.has(t))).map((e) => ({
    title: e.title,
    text: e.text,
    targets: joinAr(e.targets.filter((t) => weakSet.has(t)).map((t) => DIMS[t].short)),
  }));

  // أمثلة حسابية توضيحية: أثر رفع بُعد واحد إلى 5 مع ثبات البقية
  const sensitivity: string[] = [];
  const candidates: ('A' | 'F' | 'SV' | 'TI' | 'TS')[] = ['A', 'F'];
  const weakestCore = (['SV', 'TI', 'TS'] as const).reduce((m, k) => (s[k] < s[m] ? k : m), 'SV' as 'SV' | 'TI' | 'TS');
  candidates.push(weakestCore);
  for (const k of candidates) {
    if (s[k] < 5) {
      const after = mpsWith(s, { [k]: 5 });
      sensitivity.push(
        `رفع «${DIMS[k].name}» من ${fmtDim(s[k])} إلى 5.0 مع ثبات بقية الأبعاد يغيّر درجة MPS من ${fmtMps(s.mps)} إلى ${fmtMps(after)}.`,
      );
    }
  }

  // الملخص التشخيصي
  const job = jobTitle.trim() || 'الوظيفة';
  const parts: string[] = [];
  parts.push(`بلغت درجة الإمكانات التحفيزية (MPS) لوظيفة «${job}» ${fmtMps(s.mps)} من 343 نقطة.`);
  parts.push(
    `ويبلغ متوسط الأبعاد الجوهرية الثلاثة (تنوع المهارات وهوية المهمة وأهمية المهمة) ${fmtCore(s.core)} من 7، مقابل ${fmtDim(s.A)} للاستقلالية و${fmtDim(s.F)} للتغذية الراجعة من الوظيفة.`,
  );
  if (lows.length) {
    parts.push(`وسُجِّل ${countDims(lows.length)} دون الدرجة 4: ${joinAr(lows.map((d) => `${d.name} (${fmtDim(d.score)})`))}.`);
    const lowMult = lows.filter((d) => isMultiplier(d.key));
    if (lowMult.length)
      parts.push(`ويُعد انخفاض ${joinAr(lowMult.map((d) => d.name))} ذا أثر مضاعِف في الدرجة الكلية لدخوله في المعادلة عاملاً مستقلاً، لذا يُقترح البدء به.`);
  } else {
    parts.push('ولم يُسجَّل أي بُعد دون الدرجة 4.');
  }
  if (highs.length) parts.push(`وتتمثل أعلى الجوانب في: ${joinAr(highs.slice(0, 2).map((d) => d.name))}.`);
  parts.push('وتُقرأ هذه النتائج مؤشراتٍ تشخيصية أولية لتصميم الوظيفة تستحق التحقق، لا حكماً على شاغلها أو رضاه أو أدائه.');

  return {
    dims,
    ranking,
    lows,
    strengths,
    strengthsNote,
    recommendations,
    plan,
    topStrengths,
    topImprovements,
    enrichment,
    sensitivity,
    summary: parts.join(' '),
  };
}
