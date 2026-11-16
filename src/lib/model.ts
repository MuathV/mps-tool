export type DimKey = 'SV' | 'TI' | 'TS' | 'A' | 'F' | 'FO';

export interface Item {
  id: number;
  text: string;
  dim: DimKey;
  reverse?: boolean;
}

/** البنود الاثنا عشر بترتيبها وأرقامها الأصلية */
export const ITEMS: Item[] = [
  { id: 1, dim: 'FO', text: 'تتيح الوظيفة لشاغلها الحصول على معلومات منتظمة من المشرفين حول جودة أدائه' },
  { id: 2, dim: 'SV', text: 'تتطلب الوظيفة استخدام مجموعة متنوعة من المهارات والقدرات المتقدمة' },
  { id: 3, dim: 'TI', text: 'تُصمم الوظيفة بحيث تتيح لشاغلها إنجاز عمل متكامل من البداية إلى النهاية' },
  { id: 4, dim: 'F', text: 'يتيح أداء مهام الوظيفة لشاغلها معرفة مدى جودة أدائه من خلال نتائج العمل نفسه' },
  { id: 5, dim: 'SV', text: 'تتطلب الوظيفة أداء مهام متنوعة وغير روتينية' },
  { id: 6, dim: 'TS', text: 'تؤثر نتائج الوظيفة تأثيراً ملموساً في حياة الآخرين أو أعمالهم' },
  { id: 7, dim: 'A', reverse: true, text: 'لا تتيح الوظيفة لشاغلها استخدام تقديره الشخصي في تحديد كيفية تنفيذ العمل' },
  { id: 8, dim: 'TI', text: 'تتيح الوظيفة لشاغلها إكمال المهام التي يبدأ بتنفيذها' },
  { id: 9, dim: 'F', text: 'توفر طبيعة الوظيفة ونتائجها مؤشرات واضحة على مدى جودة أداء شاغلها' },
  { id: 10, dim: 'A', text: 'تمنح الوظيفة شاغلها قدراً كبيراً من الحرية والاستقلالية في تحديد كيفية تنفيذ المهام' },
  { id: 11, dim: 'TS', text: 'تؤدي الوظيفة دوراً مهماً في تحقيق أهداف المنظمة أو التأثير في الآخرين' },
  { id: 12, dim: 'FO', text: 'تتيح الوظيفة لشاغلها الحصول على تغذية راجعة منتظمة من المشرفين وزملاء العمل حول جودة أدائه' },
];

export const SCALE: { value: number; label: string }[] = [
  { value: 1, label: 'غير دقيق للغاية' },
  { value: 2, label: 'غير دقيق في الغالب' },
  { value: 3, label: 'غير دقيق إلى حد ما' },
  { value: 4, label: 'غير مؤكد' },
  { value: 5, label: 'دقيق إلى حد ما' },
  { value: 6, label: 'دقيق في الغالب' },
  { value: 7, label: 'دقيق جداً' },
];

export const scaleLabel = (v: number) => SCALE.find((s) => s.value === v)?.label ?? '';

export interface DimInfo {
  key: DimKey;
  name: string;
  short: string;
  en: string;
  items: number[];
  formula: string;
  inMPS: boolean;
  definition: string;
}

export const DIM_ORDER: DimKey[] = ['SV', 'TI', 'TS', 'A', 'F', 'FO'];

export const DIMS: Record<DimKey, DimInfo> = {
  SV: {
    key: 'SV',
    name: 'تنوع المهارات',
    short: 'تنوع المهارات',
    en: 'Skill Variety',
    items: [2, 5],
    formula: 'SV = (Q2 + Q5) / 2',
    inMPS: true,
    definition: 'مدى تطلب الوظيفة أنشطة متنوعة تستدعي استخدام مهارات وقدرات مختلفة.',
  },
  TI: {
    key: 'TI',
    name: 'هوية المهمة',
    short: 'هوية المهمة',
    en: 'Task Identity',
    items: [3, 8],
    formula: 'TI = (Q3 + Q8) / 2',
    inMPS: true,
    definition: 'مدى إتاحة الوظيفة إنجاز عمل متكامل ومحدد يمكن تمييز نتيجته من البداية إلى النهاية.',
  },
  TS: {
    key: 'TS',
    name: 'أهمية المهمة',
    short: 'أهمية المهمة',
    en: 'Task Significance',
    items: [6, 11],
    formula: 'TS = (Q6 + Q11) / 2',
    inMPS: true,
    definition: 'مدى تأثير الوظيفة في حياة الآخرين أو أعمالهم أو في أهداف المنظمة.',
  },
  A: {
    key: 'A',
    name: 'الاستقلالية',
    short: 'الاستقلالية',
    en: 'Autonomy',
    items: [7, 10],
    formula: 'A = ((8 − Q7) + Q10) / 2',
    inMPS: true,
    definition: 'مدى ما تمنحه الوظيفة من حرية وتقدير شخصي في جدولة العمل وتحديد طرق تنفيذه.',
  },
  F: {
    key: 'F',
    name: 'التغذية الراجعة من الوظيفة نفسها',
    short: 'تغذية راجعة (الوظيفة)',
    en: 'Feedback from Job',
    items: [4, 9],
    formula: 'F = (Q4 + Q9) / 2',
    inMPS: true,
    definition: 'مدى إتاحة أداء العمل نفسه معلومات مباشرة وواضحة عن جودة الأداء.',
  },
  FO: {
    key: 'FO',
    name: 'التغذية الراجعة من الآخرين',
    short: 'تغذية راجعة (الآخرون)',
    en: 'Feedback from Others',
    items: [1, 12],
    formula: 'FO = (Q1 + Q12) / 2',
    inMPS: false,
    definition: 'مدى حصول شاغل الوظيفة على معلومات عن أدائه من المشرفين والزملاء. بُعد مكمّل لا يدخل في MPS.',
  },
};
