import type { ReactNode } from 'react';
import type { Priority } from '../lib/analysis';
import { LEVEL_LABEL, type Level } from '../lib/scoring';

const LEVEL_CLS: Record<Level, string> = {
  low: 'bg-orange-50 text-orange-800 ring-orange-200',
  mid: 'bg-amber-50 text-amber-800 ring-amber-200',
  high: 'bg-teal-50 text-teal-800 ring-teal-200',
};

export function LevelBadge({ level, className = '' }: { level: Level; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${LEVEL_CLS[level]} ${className}`}>
      {LEVEL_LABEL[level]}
    </span>
  );
}

const PRIORITY_CLS: Record<Priority, string> = {
  'very-high': 'bg-rose-50 text-rose-800 ring-rose-200',
  high: 'bg-orange-50 text-orange-800 ring-orange-200',
  medium: 'bg-slate-100 text-slate-700 ring-slate-300',
};

export function PriorityBadge({ priority, label }: { priority: Priority; label: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${PRIORITY_CLS[priority]}`}>
      أولوية {label}
    </span>
  );
}

export function Card({ title, children, className = '', aside }: { title?: ReactNode; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-brand-800">{title}</h2>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}
