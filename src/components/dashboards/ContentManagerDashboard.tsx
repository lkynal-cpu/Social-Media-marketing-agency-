// OmniAgency OS - Content Manager Dashboard (Productivity & Content Studio Workspace)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ContentManagerTab, ContentManagerSidebar } from '../navigation/ContentManagerSidebar';
import { AiContentAgentWorkspace } from '../ai/AiContentAgentWorkspace';
import { ApprovalQueue } from '../content/ApprovalQueue';
import { ContentCalendarView } from '../content/ContentCalendarView';
import { dbService } from '../../lib/database';
import { SocialPost, SocialAccount } from '../../types/database';
import {
  CalendarDays,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  Send,
  Link2,
  TrendingUp,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { LineChart, DonutChart } from '../common/Charts';

export const ContentManagerDashboard: React.FC = () => {
  const { currentUser, securityContext, activeClient, refreshDataVersion } = useAuth();
  const [activeTab, setActiveTab] = useState<ContentManagerTab>('calendar');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  useEffect(() => {
    async function loadData() {
      const allPosts = await dbService.getSocialPosts(
        securityContext,
        activeClient ? activeClient.id : undefined
      );
      const accs = await dbService.getSocialAccounts(
        securityContext,
        activeClient ? activeClient.id : undefined
      );
      setPosts(allPosts);
      setSocialAccounts(accs);
    }
    loadData();
  }, [currentUser.id, activeClient?.id, refreshDataVersion]);

  const pendingCount = posts.filter((p) => p.status === 'PENDING_REVIEW').length;
  const scheduledPosts = posts.filter((p) => p.status === 'SCHEDULED');
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED');
  const draftsList = posts.filter((p) => p.status === 'DRAFT');

  return (
    <div className="flex flex-1 min-h-[calc(100vh-53px)]">
      <ContentManagerSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={pendingCount}
      />

      <main className="flex-1 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Content Creation & Editorial Studio
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Lead Content Manager
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Active Workspace for <span className="font-semibold text-slate-900 dark:text-white">{activeClient?.name || 'All Assigned Clients'}</span>
              </p>
            </div>

            {/* Quick action: Open AI Content Agent */}
            {activeTab !== 'ai_agent' && (
              <button
                onClick={() => setActiveTab('ai_agent')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch AI Content Agent</span>
              </button>
            )}
          </div>

          {/* TAB: CONTENT CALENDAR */}
          {activeTab === 'calendar' && <ContentCalendarView />}

          {/* TAB: AI CONTENT AGENT */}
          {activeTab === 'ai_agent' && (
            <AiContentAgentWorkspace
              onNavigateToApprovalQueue={() => setActiveTab('approval_queue')}
            />
          )}

          {/* TAB: APPROVAL QUEUE */}
          {activeTab === 'approval_queue' && <ApprovalQueue />}

          {/* TAB: DRAFTS & LIBRARY */}
          {activeTab === 'drafts_library' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Content Drafts & Creative Repository
                  </h3>
                  <p className="text-xs text-slate-500">Unapproved drafts in progress</p>
                </div>
                <button
                  onClick={() => setActiveTab('ai_agent')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  + Generate Draft with AI
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftsList.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase text-indigo-600 dark:text-indigo-400">
                        {draft.platform_id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        DRAFT
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-3">
                      {draft.caption}
                    </p>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                      <button
                        onClick={() => setActiveTab('approval_queue')}
                        className="text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Submit to Review Pipeline →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SCHEDULED POSTS */}
          {activeTab === 'scheduled' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Scheduled Publication Queue
                </h3>
                <p className="text-xs text-slate-500">Approved posts slated for automatic dispatch</p>
              </div>

              <div className="p-5 space-y-3">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                          {post.platform_id}
                        </span>
                        <span className="text-xs text-slate-500">
                          Target: {post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : 'Pending slot'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 max-w-xl truncate">
                        {post.caption}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-600">SCHEDULED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PUBLISHED POSTS */}
          {activeTab === 'published' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Published Content Archive & Telemetry
                </h3>
                <p className="text-xs text-slate-500">Live social publications and metrics</p>
              </div>

              <div className="p-5 space-y-3">
                {publishedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          {post.platform_id}
                        </span>
                        <span className="text-xs text-slate-500">
                          Live since {post.published_at ? new Date(post.published_at).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 max-w-xl truncate">
                        {post.caption}
                      </p>
                    </div>

                    {post.performance_metrics && (
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Reach</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {post.performance_metrics.views.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Likes</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {post.performance_metrics.likes.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Engagement</span>
                          <span className="font-bold text-emerald-600">
                            {post.performance_metrics.engagement_rate}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SOCIAL CONNECTIONS */}
          {activeTab === 'social_connections' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Client Connected Social Profiles ({socialAccounts.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Target handles authenticated for automated publishing and telemetry
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {acc.platform_id}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block mt-0.5">
                        {acc.handle}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {acc.followers_count.toLocaleString()} followers
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      CONNECTED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONTENT INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LineChart
                  title="Engagement Trajectory by Post Type"
                  data={[
                    { label: 'Mon', current: 3.8, previous: 2.9 },
                    { label: 'Tue', current: 4.5, previous: 3.2 },
                    { label: 'Wed', current: 5.2, previous: 3.8 },
                    { label: 'Thu', current: 4.9, previous: 4.1 },
                    { label: 'Fri', current: 6.8, previous: 5.0 },
                    { label: 'Sat', current: 5.5, previous: 4.8 },
                    { label: 'Sun', current: 7.2, previous: 5.6 },
                  ]}
                  metricLabel="% Eng"
                />
                <DonutChart
                  title="Audience Reach by Format"
                  segments={[
                    { label: 'Carousels', value: 48, color: '#6366f1' },
                    { label: 'Reels / Shorts', value: 36, color: '#ec4899' },
                    { label: 'Static Photo', value: 16, color: '#10b981' },
                  ]}
                  centerLabel="Engaged"
                  centerValue="94.2k"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
