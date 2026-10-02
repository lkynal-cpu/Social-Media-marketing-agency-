// OmniAgency OS - Top Navigation Bar with Multi-Tenant Role Switcher and Cache Indicator

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  Bell,
  Database,
  ExternalLink,
  ChevronDown,
  Layers,
  UserCheck,
  Check,
  ArrowRightLeft,
} from 'lucide-react';

interface NavbarProps {
  onToggleCacheMonitor: () => void;
  onOpenLandingPage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleCacheMonitor, onOpenLandingPage }) => {
  const {
    currentUser,
    currentAgency,
    assignedClients,
    activeClient,
    setActiveClient,
    switchDemoRole,
    cacheStats,
    unreadNotifsCount,
  } = useAuth();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'Agency Admin',
          bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />,
        };
      case 'CONTENT_MANAGER':
        return {
          label: 'Content Manager',
          bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
        };
      case 'AGENCY_TEAM':
        return {
          label: 'Agency Team',
          bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: <Users className="w-3.5 h-3.5 mr-1" />,
        };
      case 'CUSTOMER':
        return {
          label: 'Customer Portal',
          bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: <Building2 className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Agency Identity & Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 font-bold text-base tracking-wider">
              {currentAgency.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-900 dark:text-white tracking-tight">
                  {currentAgency.name}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {currentAgency.tier}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Multi-Tenant Agency Operating System
              </p>
            </div>
          </div>

          <div className="hidden lg:block h-5 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          {/* Client Selector (when applicable) */}
          {currentUser.role !== 'CUSTOMER' && assignedClients.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>Client:</span>
                <span className="font-semibold text-neutral-900 dark:text-white max-w-[130px] truncate">
                  {activeClient ? activeClient.name : 'All Clients'}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {clientDropdownOpen && (
                <div
                  className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1.5 z-50 text-xs"
                  onMouseLeave={() => setClientDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Assigned Clients ({assignedClients.length})
                  </div>
                  {assignedClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setActiveClient(client);
                        setClientDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">{client.name}</div>
                        <div className="text-[10px] text-neutral-500">{client.industry}</div>
                      </div>
                      {activeClient?.id === client.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customer Organization Badge */}
          {currentUser.role === 'CUSTOMER' && activeClient && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{activeClient.name} Portal</span>
            </div>
          )}
        </div>

        {/* Right: Actions, Cache Indicator & Demo Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Landing Page Trigger */}
          <button
            onClick={onOpenLandingPage}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Page</span>
          </button>

          {/* Database Cache Telemetry Button */}
          <button
            onClick={onToggleCacheMonitor}
            title="Database Query Cache Telemetry"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 transition-colors text-neutral-700 dark:text-neutral-300"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Cache:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {cacheStats.hitRatio}% Hit
            </span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              title="Notifications"
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border shadow-2xs transition-all ${badge.bg}`}
            >
              {badge.icon}
              <span>{badge.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 py-2 z-50 text-xs"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Switch Interactive Role (Live Demo)</span>
                </div>

                <button
                  onClick={() => {
                    switchDemoRole('SUPER_ADMIN');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors ${
                    currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-50/80 dark:bg-purple-950/40 font-semibold' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-900 dark:text-white font-medium">Elena Vance (Agency Admin)</div>
                    <div className="text-[10px] text-neutral-500">Full operational control center & team mgmt</div>
                  </div>
                  {currentUser.role === 'SUPER_ADMIN' && <Check className="w-4 h-4 text-purple-600" />}
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('CONTENT_MANAGER');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors ${
                    currentUser.role === 'CONTENT_MANAGER' ? 'bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-900 dark:text-white font-medium">Marcus Ray (Content Manager)</div>
                    <div className="text-[10px] text-neutral-500">AI content agent, calendar & approvals</div>
                  </div>
                  {currentUser.role === 'CONTENT_MANAGER' && <Check className="w-4 h-4 text-indigo-600" />}
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('AGENCY_TEAM');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${
                    currentUser.role === 'AGENCY_TEAM' ? 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-900 dark:text-white font-medium">Chloe Zhao (Agency Team)</div>
                    <div className="text-[10px] text-neutral-500">Assigned customer SEO & performance</div>
                  </div>
                  {currentUser.role === 'AGENCY_TEAM' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />

                <button
                  onClick={() => {
                    switchDemoRole('CUSTOMER', 'client-1');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors ${
                    currentUser.role === 'CUSTOMER' && activeClient?.id === 'client-1'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold'
                      : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-900 dark:text-white font-medium">David Chen (Customer)</div>
                    <div className="text-[10px] text-neutral-500">Lumina Skin read-only insights portal</div>
                  </div>
                  {currentUser.role === 'CUSTOMER' && activeClient?.id === 'client-1' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('CUSTOMER', 'client-2');
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors ${
                    currentUser.role === 'CUSTOMER' && activeClient?.id === 'client-2'
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-semibold'
                      : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-900 dark:text-white font-medium">Sarah Blake (Customer)</div>
                    <div className="text-[10px] text-neutral-500">Apex Fitness Gear portal</div>
                  </div>
                  {currentUser.role === 'CUSTOMER' && activeClient?.id === 'client-2' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
