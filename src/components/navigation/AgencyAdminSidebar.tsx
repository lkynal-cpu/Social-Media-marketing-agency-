// OmniAgency OS - Agency Admin Sidebar (Operational Control Center)

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Compass,
  CreditCard,
  Share2,
  BarChart3,
  History,
  Settings,
  Sparkles,
} from 'lucide-react';

export type AgencyAdminTab =
  | 'overview'
  | 'clients'
  | 'team'
  | 'campaigns'
  | 'subscriptions'
  | 'integrations'
  | 'analytics'
  | 'audit_logs'
  | 'settings';

interface AgencyAdminSidebarProps {
  activeTab: AgencyAdminTab;
  onSelectTab: (tab: AgencyAdminTab) => void;
}

export const AgencyAdminSidebar: React.FC<AgencyAdminSidebarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: { id: AgencyAdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Agency Command', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'clients', label: 'Client Accounts', icon: <Building2 className="w-4 h-4" /> },
    { id: 'team', label: 'Agency Team & RBAC', icon: <Users className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Campaign Central', icon: <Compass className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions & MRR', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'integrations', label: 'Social API Hub', icon: <Share2 className="w-4 h-4" />, badge: '6 Live' },
    { id: 'analytics', label: 'Agency Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'audit_logs', label: 'Audit & Compliance', icon: <History className="w-4 h-4" /> },
    { id: 'settings', label: 'Agency Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-300 border-r border-neutral-800 flex flex-col shrink-0 min-h-[calc(100vh-53px)]">
      {/* Workspace Indicator */}
      <div className="px-5 py-4 border-b border-neutral-800/80 bg-neutral-950/40">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span>Operational Control Center</span>
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">Multi-Client Agency Governance</div>
      </div>

      {/* Nav list */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-neutral-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-purple-700 text-white' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Tenant Security Badge */}
      <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/30 text-xs">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
          <span>Row Level Security</span>
          <span className="font-semibold text-emerald-400">ENFORCED</span>
        </div>
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          Agency boundary: isolated PostgreSQL schema tenant namespace.
        </p>
      </div>
    </aside>
  );
};
