// OmniAgency OS - Sales & Lead Conversion Attribution Module

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lead, Sale } from '../../types/database';
import { dbService } from '../../lib/database';
import {
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { DonutChart } from '../common/Charts';

export const SalesWorkspace: React.FC = () => {
  const { currentUser, securityContext, activeClient, refreshDataVersion, triggerRefresh } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalRev, setTotalRev] = useState<number>(0);
  const [convRate, setConvRate] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      const data = await dbService.getLeadsAndSales(
        securityContext,
        activeClient ? activeClient.id : undefined
      );
      setLeads(data.leads);
      setSales(data.sales);
      setTotalRev(data.totalRevenue);
      setConvRate(data.conversionRate);
    }
    loadData();
  }, [currentUser.id, activeClient?.id, refreshDataVersion]);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate channel distribution for attribution chart
  const channelTotals = sales.reduce((acc, curr) => {
    acc[curr.channel] = (acc[curr.channel] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const attributionSegments = [
    { label: 'Instagram Ads', value: channelTotals['Instagram Direct Checkout'] || 185, color: '#E1306C' },
    { label: 'Organic Search', value: channelTotals['Shopify Store (Organic Search)'] || 850, color: '#10B981' },
    { label: 'TikTok Referral', value: channelTotals['TikTok Shop Referral'] || 320, color: '#000000' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Sales KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Tracked Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">
            ${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last month
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Total Leads</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">
            {leads.length}
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">Inbound attribution pipeline</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Conversion Rate</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-purple-600 dark:text-purple-400">
            {convRate}%
          </div>
          <span className="text-xs text-purple-600 font-semibold mt-1 block">
            +3.2% optimization gain
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase">Average Order Value</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-neutral-900 dark:text-white">
            ${sales.length > 0 ? (totalRev / sales.length).toFixed(2) : '0.00'}
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">Across paid & organic channels</span>
        </div>
      </div>

      {/* Attribution & Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DonutChart
            title="Revenue by Acquisition Channel"
            segments={attributionSegments}
            centerLabel="Sales"
            centerValue={`$${totalRev.toLocaleString()}`}
          />
        </div>

        {/* Sales Pipeline Funnel Card */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
              Cross-Channel Lead Funnel Velocity
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Progression from social touchpoints to verified transaction
            </p>

            <div className="space-y-3">
              {[
                { stage: '1. New Inbound Leads', count: leads.length, pct: 100, color: 'bg-indigo-600' },
                { stage: '2. Contacted / Retargeted', count: Math.round(leads.length * 0.8), pct: 80, color: 'bg-purple-600' },
                { stage: '3. Marketing Qualified (MQL)', count: Math.round(leads.length * 0.6), pct: 60, color: 'bg-blue-600' },
                { stage: '4. Converted to Customer', count: sales.length, pct: convRate || 45, color: 'bg-emerald-600' },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    <span>{step.stage}</span>
                    <span>{step.count} ({step.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div className={`h-full rounded-full ${step.color}`} style={{ width: `${step.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Attribution Window: 30-Day Click-Through</span>
            <span className="font-semibold text-emerald-600">ROAS 4.2x Average</span>
          </div>
        </div>
      </div>

      {/* Leads CRM Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Leads & Opportunity Management
            </h3>
            <p className="text-xs text-neutral-500">Verified prospects linked to marketing campaigns</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="new">New</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Acquisition Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Estimated Value</th>
                <th className="py-3 px-4">Captured At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 px-4">
                    <div className="font-bold text-neutral-900 dark:text-white">{lead.name}</div>
                    <div className="text-[11px] text-neutral-500">{lead.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300 text-[11px]">
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        lead.status === 'converted'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lead.status === 'qualified'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                    ${lead.lead_value.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-neutral-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
