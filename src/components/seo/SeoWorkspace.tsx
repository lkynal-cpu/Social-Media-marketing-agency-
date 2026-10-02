// OmniAgency OS - SEO Workspace & Technical Health Audit Module

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SeoProject, SeoKeyword, SeoIssue } from '../../types/database';
import { dbService } from '../../lib/database';
import {
  Search,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from 'lucide-react';

export const SeoWorkspace: React.FC = () => {
  const { currentUser, securityContext, activeClient, refreshDataVersion, triggerRefresh } = useAuth();
  const [project, setProject] = useState<SeoProject | null>(null);
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [issues, setIssues] = useState<SeoIssue[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSeo() {
      if (!activeClient) return;
      const data = await dbService.getSeoProject(securityContext, activeClient.id);
      setProject(data.project);
      setKeywords(data.keywords);
      setIssues(data.issues);
    }
    loadSeo();
  }, [currentUser.id, activeClient?.id, refreshDataVersion]);

  const handleResolveIssue = async (issueId: string) => {
    setResolvingId(issueId);
    await dbService.resolveSeoIssue(securityContext, issueId);
    setResolvingId(null);
    triggerRefresh();
  };

  if (!activeClient) {
    return <div className="p-8 text-neutral-500">Select an active client to view SEO data.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top SEO KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Domain Health Score
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {project?.health_score || 93}
              </span>
              <span className="text-xs text-neutral-400">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              +4 pts vs previous crawl
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Monthly Organic Traffic
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-neutral-900 dark:text-white">
                {project ? project.organic_traffic_monthly.toLocaleString() : '48,600'}
              </span>
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 block flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% month-over-month
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <Search className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
              Tracked Keywords in Top 5
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {keywords.filter((k) => k.current_position <= 5).length}
              </span>
              <span className="text-xs text-neutral-400">of {keywords.length} monitored</span>
            </div>
            <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
              3 keywords jumped to position #1-#3
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Strategic Keyword Rankings ({activeClient.name})
            </h3>
            <p className="text-xs text-neutral-500">Monitored search terms & positional velocity</p>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            Target Domain: <code className="text-neutral-700 dark:text-neutral-300 font-mono">{project?.domain || 'client.com'}</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Search Term / Keyword</th>
                <th className="py-3 px-4">Current Rank</th>
                <th className="py-3 px-4">Positional Change</th>
                <th className="py-3 px-4">Monthly Volume</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Target Landing Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {keywords.map((kw) => {
                const diff = kw.previous_position - kw.current_position; // positive means improved
                const improved = diff > 0;
                return (
                  <tr key={kw.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                      {kw.keyword}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white">
                        #{kw.current_position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {diff !== 0 ? (
                        <span
                          className={`font-semibold flex items-center gap-0.5 ${
                            improved ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {improved ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {improved ? `+${diff}` : `${diff}`}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                      {kw.search_volume.toLocaleString()}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={`h-full ${kw.difficulty > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${kw.difficulty}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 font-medium">{kw.difficulty}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 truncate max-w-xs">
                      {kw.target_url}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical SEO Issues & AI Recommendations */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Crawl Diagnostics & AI SEO Recommendations
            </h3>
            <p className="text-xs text-neutral-500">
              Actionable patches formulated to prevent search index regressions
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Audited
          </span>
        </div>

        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-xl border transition-all ${
                issue.status === 'resolved'
                  ? 'bg-neutral-50/50 dark:bg-neutral-800/20 border-neutral-200 dark:border-neutral-800 opacity-60'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      issue.severity === 'error'
                        ? 'bg-rose-50 text-rose-600'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                        {issue.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {issue.category}
                      </span>
                    </div>
                    <div className="mt-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-0.5">
                        AI Recommended Patch:
                      </span>
                      {issue.ai_recommendation}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {issue.status === 'resolved' ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveIssue(issue.id)}
                      disabled={resolvingId === issue.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 text-white transition-colors cursor-pointer"
                    >
                      {resolvingId === issue.id ? 'Marking...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
