// OmniAgency OS - Reusable Analytics Chart Components (Line, Bar, Donut)

import React, { useState } from 'react';

export type ComparisonPeriod = 'today_yesterday' | 'week_prev_week' | 'month_prev_month';

export interface DataPoint {
  label: string;
  current: number;
  previous?: number;
}

export interface ChartProps {
  title: string;
  data: DataPoint[];
  metricLabel?: string;
  height?: number;
  showComparison?: boolean;
}

// -------------------------------------------------------------
// Comparison Filter Selector
// -------------------------------------------------------------
export const ComparisonPeriodSelector: React.FC<{
  period: ComparisonPeriod;
  onChange: (p: ComparisonPeriod) => void;
}> = ({ period, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 text-xs font-medium">
      <button
        onClick={() => onChange('today_yesterday')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          period === 'today_yesterday'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        Today vs Yesterday
      </button>
      <button
        onClick={() => onChange('week_prev_week')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          period === 'week_prev_week'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        This Week vs Last
      </button>
      <button
        onClick={() => onChange('month_prev_month')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          period === 'month_prev_month'
            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        This Month vs Last
      </button>
    </div>
  );
};

// -------------------------------------------------------------
// Smooth SVG Line Chart
// -------------------------------------------------------------
export const LineChart: React.FC<ChartProps> = ({
  title,
  data,
  metricLabel = 'Value',
  height = 200,
  showComparison = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-xs text-neutral-400">No chart data</div>;
  }

  const allValues = data.flatMap((d) => [d.current, d.previous ?? d.current]);
  const maxVal = Math.max(...allValues, 10);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;

  const width = 600;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => height - paddingY - ((val - minVal) / range) * innerHeight;

  const currentPoints = data.map((d, i) => `${getX(i)},${getY(d.current)}`).join(' ');
  const previousPoints = data
    .filter((d) => d.previous !== undefined)
    .map((d, i) => `${getX(i)},${getY(d.previous!)}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-indigo-600 rounded-full inline-block"></span>
            <span className="text-neutral-600 dark:text-neutral-400">Current Period</span>
          </div>
          {showComparison && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full inline-block"></span>
              <span className="text-neutral-500">Previous Period</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Subtle horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * innerHeight;
            const val = Math.round(minVal + pct * range);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-neutral-100 dark:text-neutral-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-neutral-400"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Previous period line */}
          {showComparison && previousPoints && (
            <polyline
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={previousPoints}
            />
          )}

          {/* Current period line with gradient area */}
          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={currentPoints}
          />

          {/* Interactive hover points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.current);
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  className={`${isHovered ? 'fill-indigo-600 stroke-white' : 'fill-white stroke-indigo-600'} cursor-pointer transition-all`}
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-neutral-500 font-medium"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs shadow-lg pointer-events-none"
          >
            <span className="font-bold">{data[hoveredIdx].label}:</span> {data[hoveredIdx].current.toLocaleString()} {metricLabel}
            {data[hoveredIdx].previous !== undefined && (
              <span className="text-neutral-400 ml-2">
                (Prev: {data[hoveredIdx].previous!.toLocaleString()})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Interactive Bar Chart
// -------------------------------------------------------------
export const BarChart: React.FC<ChartProps> = ({
  title,
  data,
  metricLabel = 'Units',
  height = 180,
}) => {
  const maxVal = Math.max(...data.map((d) => d.current), 1);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">{title}</h4>
      <div className="flex items-end justify-between gap-3" style={{ height: `${height}px` }}>
        {data.map((item, i) => {
          const heightPct = Math.max(8, Math.round((item.current / maxVal) * 100));
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                {item.current.toLocaleString()}
              </div>
              <div
                style={{ height: `${heightPct}%` }}
                className="w-full max-w-[40px] bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all cursor-pointer relative"
              />
              <span className="text-[11px] font-medium text-neutral-500 mt-2 truncate max-w-[50px] text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Donut Chart
// -------------------------------------------------------------
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export const DonutChart: React.FC<{
  title: string;
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
}> = ({ title, segments, centerLabel = 'Total', centerValue }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let accumulatedAngle = 0;

  const radius = 40;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800">
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">{title}</h4>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {segments.map((seg, i) => {
              const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedAngle;
              accumulatedAngle += (seg.value / total) * circumference;

              return (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 hover:opacity-90"
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <span className="text-lg font-bold text-neutral-900 dark:text-white block">
              {centerValue || total.toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-medium">
              {centerLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          {segments.map((seg, i) => {
            const pct = Math.round((seg.value / total) * 100);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-neutral-600 dark:text-neutral-400 min-w-[70px]">{seg.label}</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
