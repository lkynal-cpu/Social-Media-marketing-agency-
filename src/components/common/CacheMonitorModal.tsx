// OmniAgency OS - Cache Monitor & Telemetry Inspector Modal

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbCache } from '../../lib/cache';
import { Database, Zap, RefreshCw, Trash2, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export const CacheMonitorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { cacheStats, triggerRefresh } = useAuth();
  const [clearedNotice, setClearedNotice] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    dbCache.clear();
    triggerRefresh();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  const handleInvalidatePosts = () => {
    dbCache.invalidateTags(['posts']);
    triggerRefresh();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Database Query Cache Inspector
              </h3>
              <p className="text-xs text-neutral-500">
                In-memory multi-tenant query caching with TTL and tag-based invalidation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Hit Ratio
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {cacheStats.hitRatio}%
              </span>
              <span className="text-[10px] text-neutral-400">of total queries</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Cache Hits
              </span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {cacheStats.hits}
              </span>
              <span className="text-[10px] text-neutral-400">vs {cacheStats.misses} misses</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 text-center">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Latency Saved
              </span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {cacheStats.savedQueriesMs}ms
              </span>
              <span className="text-[10px] text-neutral-400">DB roundtrips skipped</span>
            </div>
          </div>

          {/* Details & Architecture Info */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-neutral-700 dark:text-neutral-300">
              <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zero-Latency Multi-Tenant Cache Strategy</span>
              </div>
              <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
                Queries are cached with cryptographic key prefixes incorporating tenant boundaries (
                <code className="px-1 py-0.5 rounded bg-white dark:bg-neutral-800 text-indigo-600">agency:id:client:id</code>
                ). Tag-based invalidation ensures that when posts are approved, scheduled, or published, the client’s post cache is selectively purged without disturbing other tenant stores.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-600 dark:text-neutral-400">Active Cached Keys in Memory:</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {cacheStats.keysCount} keys
              </span>
            </div>
          </div>

          {clearedNotice && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Target cache tags successfully evicted! Next queries will freshly hydrate from DB.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleInvalidatePosts}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Invalidate Posts Tag</span>
            </button>
            <button
              onClick={handleClearCache}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Flush Entire Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
