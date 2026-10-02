// OmniAgency OS - Reusable KPI Card with Comparative Trend Indicators

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number; // e.g. 14.5 for +14.5%
  comparisonLabel?: string; // e.g. "vs previous month" | "Today vs yesterday"
  icon: React.ReactNode;
  subtitle?: string;
  badge?: string;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
}

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-100 dark:border-purple-900',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  comparisonLabel = 'vs last period',
  icon,
  subtitle,
  badge,
  colorScheme = 'indigo',
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isZero = change !== undefined && change === 0;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {title}
        </p>
        <div className={`p-2.5 rounded-lg border ${colorMap[colorScheme]}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            <span
              className={`flex items-center font-semibold ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isNegative
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-neutral-500'
              }`}
            >
              {isPositive && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {isZero && <Minus className="w-3.5 h-3.5 mr-0.5" />}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400">{comparisonLabel}</span>
          </div>
        ) : (
          <span className="text-neutral-500 dark:text-neutral-400">{subtitle || 'Active Metric'}</span>
        )}
      </div>
    </div>
  );
};
