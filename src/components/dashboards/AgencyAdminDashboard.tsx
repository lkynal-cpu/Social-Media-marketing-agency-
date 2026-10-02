// OmniAgency OS - Agency Admin Dashboard (Operational Control Center)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AgencyAdminTab, AgencyAdminSidebar } from '../navigation/AgencyAdminSidebar';
import { KpiCard } from '../common/KpiCard';
import { LineChart, BarChart, DonutChart, ComparisonPeriodSelector, ComparisonPeriod } from '../common/Charts';
import { dbService } from '../../lib/database';
import { Client, User, Campaign, SocialPost, AuditLog, Subscription } from '../../types/database';
import { PLATFORMS_METADATA } from '../../lib/socialAdapters';
import {
  Building2,
  Users,
  Compass,
  Clock,
  Send,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Share2,
  KeyRound,
  History,
  Lock,
} from 'lucide-react';

export const AgencyAdminDashboard: React.FC = () => {
  const { currentAgency, currentUser, securityContext, refreshDataVersion, triggerRefresh } = useAuth();
  const [activeTab, setActiveTab] = useState<AgencyAdminTab>('overview');
  const [period, setPeriod] = useState<ComparisonPeriod>('month_prev_month');

  const [clients, setClients] = useState<Client[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Create Client Modal State
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('E-Commerce & Retail');
  const [newClientRetainer, setNewClientRetainer] = useState('5000');
  const [newClientVoice, setNewClientVoice] = useState('Elevated, modern, community-oriented');

  useEffect(() => {
    async function loadAdminData() {
      const c = await dbService.getClients(securityContext);
      const u = await dbService.getAllUsers(securityContext);
      const camp = await dbService.getCampaigns(securityContext);
      const p = await dbService.getSocialPosts(securityContext);
      const logs = await dbService.getAuditLogs(securityContext);
      const subs = await dbService.getSubscriptions(securityContext);

      setClients(c);
      setTeamMembers(u);
      setCampaigns(camp);
      setPosts(p);
      setAuditLogs(logs);
      setSubscriptions(subs);
    }
    loadAdminData();
  }, [currentUser.id, refreshDataVersion]);

  const scheduledCount = posts.filter((p) => p.status === 'SCHEDULED').length;
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const totalRetainersMRR = clients.reduce((acc, c) => acc + (c.monthly_retainer || 0), 0);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    await dbService.createClient(securityContext, {
      name: newClientName,
      slug: newClientName.toLowerCase().replace(/\s+/g, '-'),
      industry: newClientIndustry,
      website: `https://${newClientName.toLowerCase().replace(/\s+/g, '')}.example.com`,
      brand_voice: newClientVoice,
      target_audience: 'Broad modern audience',
      products_services: 'Core catalog & services',
      monthly_retainer: parseFloat(newClientRetainer) || 5000,
      status: 'active',
      assigned_manager_id: 'user-cm',
    });

    setIsCreateClientOpen(false);
    setNewClientName('');
    triggerRefresh();
  };

  const agencyGrowthData = [
    { label: 'May', current: 12500, previous: 9800 },
    { label: 'Jun', current: 14800, previous: 11200 },
    { label: 'Jul', current: 16200, previous: 12800 },
    { label: 'Aug', current: 18000, previous: 14000 },
    { label: 'Sep', current: 19500, previous: 15500 },
    { label: 'Oct', current: 22400, previous: 18200 },
  ];

  return (
    <div className="flex flex-1 min-h-[calc(100vh-53px)]">
      <AgencyAdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-8 bg-neutral-50/50 dark:bg-neutral-950 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Agency Control Center
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Centralized multi-tenant operating system for {currentAgency.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ComparisonPeriodSelector period={period} onChange={setPeriod} />
              <button
                onClick={() => setIsCreateClientOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Client</span>
              </button>
            </div>
          </div>

          {/* 8 Primary Agency KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Active Customers"
              value={clients.length}
              change={12.5}
              comparisonLabel="vs last quarter"
              colorScheme="purple"
              icon={<Building2 className="w-4 h-4" />}
            />
            <KpiCard
              title="Monthly Agency MRR"
              value={`$${totalRetainersMRR.toLocaleString()}`}
              change={18.2}
              comparisonLabel="vs last month"
              colorScheme="emerald"
              icon={<DollarSign className="w-4 h-4" />}
            />
            <KpiCard
              title="Active Campaigns"
              value={campaigns.filter((c) => c.status === 'active').length}
              colorScheme="indigo"
              icon={<Compass className="w-4 h-4" />}
            />
            <KpiCard
              title="Scheduled Posts"
              value={scheduledCount}
              colorScheme="blue"
              icon={<Clock className="w-4 h-4" />}
            />
            <KpiCard
              title="Published Content"
              value={publishedCount}
              colorScheme="purple"
              icon={<Send className="w-4 h-4" />}
            />
            <KpiCard
              title="Leads Generated"
              value="348"
              change={22.4}
              comparisonLabel="vs last month"
              colorScheme="emerald"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <KpiCard
              title="Tracked Client Sales"
              value="$148,200"
              change={26.0}
              colorScheme="emerald"
              icon={<DollarSign className="w-4 h-4" />}
            />
            <KpiCard
              title="Team Members"
              value={teamMembers.length}
              colorScheme="indigo"
              icon={<Users className="w-4 h-4" />}
            />
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LineChart
                    title="Cross-Client Revenue Trajectory ($)"
                    data={agencyGrowthData}
                    metricLabel="MRR"
                    height={220}
                  />
                </div>
                <div className="lg:col-span-1">
                  <DonutChart
                    title="Client Retainer Breakdown"
                    segments={clients.map((c, i) => ({
                      label: c.name.split(' ')[0],
                      value: c.monthly_retainer || 5000,
                      color: ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'][i % 4],
                    }))}
                    centerLabel="Total MRR"
                    centerValue={`$${totalRetainersMRR.toLocaleString()}`}
                  />
                </div>
              </div>

              {/* Customer Performance Overview Cards */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Client Health & Governance Overview
                  </h3>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View All Clients →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                          {client.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {client.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Industry: <span className="font-medium text-neutral-700 dark:text-neutral-300">{client.industry}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="text-neutral-500">Retainer</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                          ${client.monthly_retainer.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT ACCOUNTS */}
          {activeTab === 'clients' && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Managed Client Accounts ({clients.length})
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Row Level Security partitions all data by client and agency tenant ID
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateClientOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
                >
                  + Add Client
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Industry</th>
                      <th className="py-3 px-4">Monthly Retainer</th>
                      <th className="py-3 px-4">Brand Voice Guidelines</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Isolation Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {clients.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                          {c.industry}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                          ${c.monthly_retainer.toLocaleString()}/mo
                        </td>
                        <td className="py-3.5 px-4 text-neutral-500 max-w-xs truncate">
                          {c.brand_voice}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] font-mono text-neutral-500">
                          RLS: client_id = {c.id.substring(0, 10)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM & RBAC */}
          {activeTab === 'team' && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Agency Team Members & Role-Based Access Control (RBAC)
                </h3>
                <p className="text-xs text-neutral-500">
                  Granular roles restrict AI tool execution and customer boundary visibility
                </p>
              </div>

              <div className="p-5 space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar_url}
                        alt={member.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-neutral-900 dark:text-white">
                          {member.full_name}
                        </div>
                        <div className="text-[11px] text-neutral-500">{member.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          member.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : member.role === 'CONTENT_MANAGER'
                            ? 'bg-indigo-100 text-indigo-700'
                            : member.role === 'AGENCY_TEAM'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {member.role.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-neutral-400">
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL INTEGRATION HUB */}
          {activeTab === 'integrations' && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Social Platform Integrations Architecture
                </h3>
                <p className="text-xs text-neutral-500">
                  Modular adapter pipeline supporting Instagram, Facebook, TikTok, LinkedIn, X, and YouTube
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(PLATFORMS_METADATA).map((platform) => (
                  <div
                    key={platform.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">
                          {platform.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          ACTIVE ADAPTER
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Max char limit: {platform.max_char_limit.toLocaleString()} | Carousels:{' '}
                        {platform.supports_carousels ? 'Supported' : 'No'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 text-[10px]">Adapter Mode:</span>
                      <span className="font-semibold text-indigo-600">Deterministic Sandbox Mode</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Agency Security & Audit Trail
                </h3>
                <p className="text-xs text-neutral-500">
                  Chronological recording of logins, content generations, approvals, and mutations
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                          {log.user_email || 'Staff Member'}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {log.entity_type} {log.entity_id && `(${log.entity_id.substring(0, 10)})`}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 font-mono">
                          {log.ip_address}
                        </td>
                        <td className="py-3 px-4 text-neutral-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Subscriptions & Retainers Pipeline
                </h3>
                <p className="text-xs text-neutral-500">Total active recurring client contracts</p>
              </div>

              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-neutral-900 dark:text-white">
                        {sub.plan_name}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Interval: {sub.billing_interval} | Renews: {new Date(sub.current_period_end).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-neutral-900 dark:text-white">
                        ${sub.price.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase">{sub.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Onboard Client Modal */}
      {isCreateClientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateClient}
            className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-xs"
          >
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              Onboard New Agency Client
            </h4>
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Company / Brand Name:</label>
              <input
                type="text"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g. Zenith Beverage Co."
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Industry Sector:</label>
              <input
                type="text"
                value={newClientIndustry}
                onChange={(e) => setNewClientIndustry(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Monthly Retainer ($ USD):</label>
              <input
                type="number"
                value={newClientRetainer}
                onChange={(e) => setNewClientRetainer(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Brand Voice Definition:</label>
              <textarea
                value={newClientVoice}
                onChange={(e) => setNewClientVoice(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateClientOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
