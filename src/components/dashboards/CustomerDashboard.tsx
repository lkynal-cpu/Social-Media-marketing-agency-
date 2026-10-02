// OmniAgency OS - Customer Insights Portal (Read-Focused Client View)
// Strictly NO AI Content Agent or Agency Administration functionality

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomerTab, CustomerSidebar } from '../navigation/CustomerSidebar';
import { KpiCard } from '../common/KpiCard';
import { LineChart, BarChart, DonutChart, ComparisonPeriodSelector, ComparisonPeriod } from '../common/Charts';
import { SeoWorkspace } from '../seo/SeoWorkspace';
import { SalesWorkspace } from '../sales/SalesWorkspace';
import { dbService } from '../../lib/database';
import { SocialPost, SocialAccount, Campaign, Report } from '../../types/database';
import {
  Users,
  Eye,
  TrendingUp,
  Globe,
  DollarSign,
  Compass,
  FileCheck2,
  Lock,
  Download,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { currentUser, activeClient, securityContext, refreshDataVersion } = useAuth();
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');
  const [period, setPeriod] = useState<ComparisonPeriod>('month_prev_month');

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedSocialTab, setSelectedSocialTab] = useState<string>('all');

  useEffect(() => {
    async function loadCustomerData() {
      if (!activeClient) return;
      const p = await dbService.getSocialPosts(securityContext, activeClient.id);
      const acc = await dbService.getSocialAccounts(securityContext, activeClient.id);
      const c = await dbService.getCampaigns(securityContext, activeClient.id);
      const r = await dbService.getReports(securityContext, activeClient.id);

      setPosts(p);
      setAccounts(acc);
      setCampaigns(c);
      setReports(r);
    }
    loadCustomerData();
  }, [currentUser.id, activeClient?.id, refreshDataVersion]);

  if (!activeClient) {
    return (
      <div className="p-12 text-center text-neutral-500">
        Authenticating client portal access...
      </div>
    );
  }

  const totalFollowers = accounts.reduce((acc, a) => acc + (a.followers_count || 0), 0);
  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED');

  const overviewTrajectory = [
    { label: 'Week 1', current: 18400, previous: 15200 },
    { label: 'Week 2', current: 24200, previous: 19800 },
    { label: 'Week 3', current: 28900, previous: 22100 },
    { label: 'Week 4', current: 36500, previous: 28400 },
  ];

  return (
    <div className="flex flex-1 min-h-[calc(100vh-53px)]">
      <CustomerSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        clientName={activeClient.name}
      />

      <main className="flex-1 p-6 md:p-8 bg-neutral-50/60 dark:bg-neutral-950 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {activeClient.name} Performance Portal
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Customer Portal
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time marketing results, organic traffic, leads, and social ROI
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ComparisonPeriodSelector period={period} onChange={setPeriod} />
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 8 Primary Customer Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  title="Total Audience"
                  value={totalFollowers.toLocaleString()}
                  change={14.8}
                  comparisonLabel="vs last month"
                  colorScheme="emerald"
                  icon={<Users className="w-4 h-4" />}
                />
                <KpiCard
                  title="Monthly Social Reach"
                  value="489,000"
                  change={32.1}
                  comparisonLabel="vs last month"
                  colorScheme="indigo"
                  icon={<Eye className="w-4 h-4" />}
                />
                <KpiCard
                  title="Engagement Rate"
                  value="5.4%"
                  change={1.2}
                  comparisonLabel="industry avg: 2.8%"
                  colorScheme="purple"
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <KpiCard
                  title="Organic Web Traffic"
                  value="48,600"
                  change={18.4}
                  comparisonLabel="monthly visits"
                  colorScheme="blue"
                  icon={<Globe className="w-4 h-4" />}
                />
                <KpiCard
                  title="Attributed Leads"
                  value="168"
                  change={22.0}
                  colorScheme="emerald"
                  icon={<Users className="w-4 h-4" />}
                />
                <KpiCard
                  title="Tracked Sales Revenue"
                  value="$42,800"
                  change={28.5}
                  colorScheme="emerald"
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <KpiCard
                  title="Active Campaigns"
                  value={campaigns.filter((c) => c.status === 'active').length}
                  colorScheme="amber"
                  icon={<Compass className="w-4 h-4" />}
                />
                <KpiCard
                  title="Published Posts"
                  value={publishedPosts.length}
                  colorScheme="purple"
                  icon={<Share2 className="w-4 h-4" />}
                />
              </div>

              {/* Trajectory & Platform Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LineChart
                    title="Weekly Audience Reach Velocity"
                    data={overviewTrajectory}
                    metricLabel="Impressions"
                    height={220}
                  />
                </div>
                <div className="lg:col-span-1">
                  <DonutChart
                    title="Audience by Platform"
                    segments={accounts.map((a) => ({
                      label: a.platform_id,
                      value: a.followers_count,
                      color:
                        a.platform_id === 'tiktok'
                          ? '#000000'
                          : a.platform_id === 'instagram'
                          ? '#E1306C'
                          : a.platform_id === 'facebook'
                          ? '#1877F2'
                          : a.platform_id === 'linkedin'
                          ? '#0A66C2'
                          : a.platform_id === 'twitter_x'
                          ? '#475569'
                          : '#FF0000',
                    }))}
                    centerLabel="Followers"
                    centerValue={totalFollowers.toLocaleString()}
                  />
                </div>
              </div>

              {/* Recent Top Published Content Preview */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Live Published Posts
                  </h3>
                  <button
                    onClick={() => setActiveTab('social_media')}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    View All Social Posts →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {publishedPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                          {post.platform_id}
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Live'}
                        </span>
                      </div>
                      {post.media_url && (
                        <div className="rounded-lg overflow-hidden aspect-video bg-neutral-100">
                          <img
                            src={post.media_url}
                            alt="Media"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>
                      {post.performance_metrics && (
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                          <span>{post.performance_metrics.views.toLocaleString()} views</span>
                          <span className="text-emerald-600">
                            {post.performance_metrics.engagement_rate}% eng
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL MEDIA BREAKDOWN */}
          {activeTab === 'social_media' && (
            <div className="space-y-6">
              {/* Platform selector */}
              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                {['all', 'instagram', 'tiktok', 'facebook', 'linkedin', 'twitter_x', 'youtube'].map(
                  (platform) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedSocialTab(platform)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                        selectedSocialTab === platform
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {platform.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>

              {/* Connected channels details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts
                  .filter((a) => selectedSocialTab === 'all' || a.platform_id === selectedSocialTab)
                  .map((acc) => (
                    <div
                      key={acc.id}
                      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-neutral-400">
                          {acc.platform_id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                          {acc.handle}
                        </h4>
                        <p className="text-xs text-neutral-500">{acc.profile_name}</p>
                      </div>
                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">Audience</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {acc.followers_count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Feed of Posts for Client */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
                  Content Archive for {activeClient.name}
                </h3>
                <div className="space-y-4">
                  {posts
                    .filter((p) => selectedSocialTab === 'all' || p.platform_id === selectedSocialTab)
                    .map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                              {post.platform_id}
                            </span>
                            <span className="text-xs text-neutral-500">Status: {post.status}</span>
                          </div>
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 max-w-2xl leading-relaxed">
                            {post.caption}
                          </p>
                        </div>
                        {post.performance_metrics && (
                          <div className="flex items-center gap-4 text-xs shrink-0">
                            <div>
                              <span className="text-neutral-400 block text-[10px]">Views</span>
                              <span className="font-bold text-neutral-900 dark:text-white">
                                {post.performance_metrics.views.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[10px]">Engagement</span>
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
            </div>
          )}

          {/* TAB 3: SEO PERFORMANCE */}
          {activeTab === 'seo' && <SeoWorkspace />}

          {/* TAB 4: SALES & REVENUE */}
          {activeTab === 'sales' && <SalesWorkspace />}

          {/* TAB 5: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                  Active Growth Campaigns ({campaigns.length})
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Performance against client revenue and acquisition targets
                </p>

                <div className="space-y-4">
                  {campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                            {camp.name}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                            {camp.goal}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          {camp.status}
                        </span>
                      </div>

                      {/* Budget vs spent progress bar */}
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium text-neutral-600 dark:text-neutral-400">
                          <span>Budget Utilized: ${camp.spent.toLocaleString()} / ${camp.budget.toLocaleString()}</span>
                          <span>{Math.round((camp.spent / camp.budget) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${Math.min(100, (camp.spent / camp.budget) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span>Flight: {camp.start_date} to {camp.end_date}</span>
                        <span className="font-bold text-neutral-900 dark:text-white">Attributed ROI: 4.8x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Executive Performance Reports
                </h3>
                <p className="text-xs text-neutral-500">
                  Published monthly summaries and quarterly audits
                </p>
              </div>

              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {rep.report_type}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {rep.period_start} to {rep.period_end}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                        {rep.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        {rep.summary}
                      </p>
                    </div>

                    <button
                      onClick={() => alert(`Downloading executive PDF report for ${rep.title}`)}
                      className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
