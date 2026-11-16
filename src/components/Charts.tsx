import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  XAxis,
  YAxis,
} from 'recharts';
import { DIMS, DIM_ORDER } from '../lib/model';
import { fmtDim, levelOf, type Level, type Scores } from '../lib/scoring';

export const LEVEL_COLOR: Record<Level, string> = { low: '#c2410c', mid: '#ca8a04', high: '#0f766e' };

const FONT = '"IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif';

const data = (s: Scores) => DIM_ORDER.map((k) => ({ key: k, name: DIMS[k].short, score: s[k] }));

interface Props {
  scores: Scores;
  /** حجم ثابت (للتقرير)؛ دون ذلك يتجاوب المخطط مع عرض الحاوية */
  fixed?: { width: number; height: number };
  fontSize?: number;
}

export function DimRadar({ scores, fixed, fontSize = 12 }: Props) {
  const chart = (
    <RadarChart data={data(scores)} outerRadius="70%" {...(fixed ?? {})}>
      <PolarGrid stroke="#cbd5e1" />
      <PolarAngleAxis dataKey="name" tick={{ fill: '#334155', fontSize, fontFamily: FONT }} />
      <PolarRadiusAxis domain={[0, 7]} tickCount={8} angle={90} tick={{ fill: '#94a3b8', fontSize: fontSize - 2 }} axisLine={false} />
      <Radar dataKey="score" stroke="#22647c" strokeWidth={2} fill="#2f7a94" fillOpacity={0.28} isAnimationActive={!fixed} dot={{ r: 3, fill: '#22647c' }} />
    </RadarChart>
  );
  return (
    <div dir="ltr" style={fixed ? { width: fixed.width, height: fixed.height } : { width: '100%', height: 320 }}>
      {fixed ? chart : <ResponsiveContainer>{chart}</ResponsiveContainer>}
    </div>
  );
}

export function DimBars({ scores, fixed, fontSize = 12 }: Props) {
  const d = data(scores);
  const chart = (
    <BarChart data={d} margin={{ top: 20, right: 4, left: 4, bottom: 4 }} {...(fixed ?? {})}>
      <CartesianGrid vertical={false} stroke="#e2e8f0" />
      {/* المحور معكوس ليبدأ البعد الأول من اليمين بما يناسب اتجاه RTL */}
      <XAxis
        type="category"
        dataKey="name"
        reversed
        interval={0}
        height={48}
        tick={(p: { x: number; y: number; payload: { value: string } }) => (
          <Text x={p.x} y={p.y + 4} width={64} textAnchor="middle" verticalAnchor="start" style={{ fontSize: fontSize - 1, fill: '#334155', fontFamily: FONT }}>
            {p.payload.value}
          </Text>
        )}
        tickLine={false}
      />
      <YAxis type="number" domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} orientation="right" width={28} tick={{ fontSize: fontSize - 1, fill: '#64748b' }} />
      <ReferenceLine y={4} stroke="#c2410c" strokeDasharray="4 3" />
      <ReferenceLine y={5} stroke="#0f766e" strokeDasharray="4 3" />
      <Bar dataKey="score" radius={[4, 4, 0, 0]} isAnimationActive={!fixed} maxBarSize={44}>
        {d.map((x) => (
          <Cell key={x.key} fill={LEVEL_COLOR[levelOf(x.score)]} />
        ))}
        <LabelList dataKey="score" position="top" formatter={(v: number) => fmtDim(v)} style={{ fontSize, fill: '#1e293b', fontWeight: 600 }} />
      </Bar>
    </BarChart>
  );
  return (
    <div dir="ltr" style={fixed ? { width: fixed.width, height: fixed.height } : { width: '100%', height: 300 }}>
      {fixed ? chart : <ResponsiveContainer>{chart}</ResponsiveContainer>}
    </div>
  );
}
