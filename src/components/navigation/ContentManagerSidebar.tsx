// OmniAgency OS - Content Manager Sidebar (Productivity & Content Workspace)

import React from 'react';
import {
  CalendarDays,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  Send,
  Link2,
  TrendingUp,
} from 'lucide-react';

export type ContentManagerTab =
  | 'calendar'
  | 'ai_agent'
  | 'approval_queue'
  | 'drafts_library'
  | 'scheduled'
  | 'published'
  | 'social_connections'
  | 'insights';

interface ContentManagerSidebarProps {
  activeTab: ContentManagerTab;
  onSelectTab: (tab: ContentManagerTab) => void;
  pendingCount?: number;
}

export const ContentManagerSidebar: React.FC<ContentManagerSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount = 1,
}) => {
  const navItems: { id: ContentManagerTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    { id: 'calendar', label: 'Content Calendar', icon: <CalendarDays className="w-4 h-4" /> },
    {
      id: 'ai_agent',
      label: 'AI Content Agent',
      icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
      badge: 'Gemini 3.8',
      badgeColor: 'bg-indigo-900/80 text-indigo-300 border border-indigo-700/50',
    },
    {
      id: 'approval_queue',
      label: 'Approval Queue',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined,
      badgeColor: 'bg-amber-500 text-neutral-950 font-bold',
    },
    { id: 'drafts_library', label: 'Drafts & Library', icon: <FileText className="w-4 h-4" /> },
    { id: 'scheduled', label: 'Scheduled Queue', icon: <Clock className="w-4 h-4" /> },
    { id: 'published', label: 'Published Archive', icon: <Send className="w-4 h-4" /> },
    { id: 'social_connections', label: 'Client Accounts', icon: <Link2 className="w-4 h-4" /> },
    { id: 'insights', label: 'Content Insights', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-53px)]">
      {/* Workspace Indicator */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Content Studio Workspace</span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">Creation, AI Generation & Approvals</div>
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
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md ${
                    item.badgeColor || (isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workflow Rule reminder */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 text-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Approval Discipline
        </div>
        <div className="text-[10px] text-slate-400 leading-normal flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>Human-in-the-loop: Zero unverified AI publishing allowed.</span>
        </div>
      </div>
    </aside>
  );
};
