// OmniAgency OS - Customer Portal Sidebar (Read-Focused Client Insights)

import React from 'react';
import {
  LayoutDashboard,
  Share2,
  Search,
  DollarSign,
  Compass,
  FileCheck2,
  Lock,
} from 'lucide-react';

export type CustomerTab =
  | 'overview'
  | 'social_media'
  | 'seo'
  | 'sales'
  | 'campaigns'
  | 'reports';

interface CustomerSidebarProps {
  activeTab: CustomerTab;
  onSelectTab: (tab: CustomerTab) => void;
  clientName: string;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = ({
  activeTab,
  onSelectTab,
  clientName,
}) => {
  const navItems: { id: CustomerTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Executive Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'social_media', label: 'Social Channels', icon: <Share2 className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO Performance', icon: <Search className="w-4 h-4" />, badge: '93 Score' },
    { id: 'sales', label: 'Sales & Revenue', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Active Campaigns', icon: <Compass className="w-4 h-4" /> },
    { id: 'reports', label: 'Monthly Reports', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-emerald-950/20 dark:bg-neutral-900 border-r border-emerald-900/20 dark:border-neutral-800 flex flex-col shrink-0 min-h-[calc(100vh-53px)]">
      {/* Workspace Indicator */}
      <div className="px-5 py-4 border-b border-emerald-900/20 dark:border-neutral-800/80 bg-emerald-900/10 dark:bg-neutral-950/40">
        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Client Performance Portal</span>
        </div>
        <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 truncate">
          {clientName}
        </div>
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
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Strict Multi-Tenant Isolation & No-AI Safety Notice */}
      <div className="p-4 border-t border-emerald-900/20 dark:border-neutral-800 bg-emerald-50/50 dark:bg-neutral-950/40 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] mb-1">
          <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Read-Only Portal</span>
        </div>
        <p className="text-[10px] text-neutral-500 leading-normal">
          AI generation tools and agency controls are restricted to agency staff.
        </p>
      </div>
    </aside>
  );
};
