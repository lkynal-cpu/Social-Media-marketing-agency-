// OmniAgency OS - Public Marketing Landing Page & Platform Tour

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/database';
import {
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  Database,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Share2,
  Search,
  DollarSign,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { switchDemoRole } = useAuth();

  const handleLaunchRole = (role: UserRole, clientId?: string) => {
    switchDemoRole(role, clientId);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              OS
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">
              OmniAgency <span className="text-indigo-400">OS</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Core Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Multi-Tenant RLS</a>
            <a href="#dashboards" className="hover:text-white transition-colors">3 Dashboards</a>
            <a href="#caching" className="hover:text-white transition-colors">Query Caching</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Applet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>The Modern Social Media Marketing Agency Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            One Operating System for Your Agency, Team, and Clients.
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Multi-tenant PostgreSQL architecture with strict Row Level Security. Separate, tailored
            dashboards for Agency Principals, Content Strategists, and Brand Clients with active
            query caching.
          </p>

          {/* Interactive Role Switcher CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleLaunchRole('SUPER_ADMIN')}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Agency Admin Dashboard</span>
            </button>

            <button
              onClick={() => handleLaunchRole('CONTENT_MANAGER')}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Content Manager Studio</span>
            </button>

            <button
              onClick={() => handleLaunchRole('CUSTOMER', 'client-1')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Customer Insights Portal</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 font-medium">
            Click any button above to instantly enter the application under that authenticated role.
          </div>
        </div>
      </section>

      {/* The 3 Completely Different Dashboard Experiences */}
      <section id="dashboards" className="py-20 border-b border-neutral-900 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Role-Specific Interfaces
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Three Intentionally Different Dashboard Experiences
            </h3>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              Never mix permissions or confusing clutter. Each persona gets an optimized experience designed for their daily objectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Agency Admin */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-purple-500/20 space-y-4 hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Agency Admin Dashboard</h4>
                <p className="text-xs text-purple-300 font-medium mt-0.5">Operational Control Center</p>
              </div>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Cross-client health, revenue & retention MRR</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Team assignments & RBAC permission controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Social API tokens, audit trail & compliance</span>
                </li>
              </ul>
              <button
                onClick={() => handleLaunchRole('SUPER_ADMIN')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-purple-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Admin View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 2: Content Manager */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-indigo-500/20 space-y-4 hover:border-indigo-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Content Manager Dashboard</h4>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">Productivity & Content Studio</p>
              </div>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>AI Content Agent using Gemini 3.8 Flash tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Full approval queue & human-in-the-loop safety</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Interactive 30-day cross-platform calendar</span>
                </li>
              </ul>
              <button
                onClick={() => handleLaunchRole('CONTENT_MANAGER')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Studio View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Card 3: Customer Portal */}
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-emerald-500/20 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Customer Dashboard</h4>
                <p className="text-xs text-emerald-300 font-medium mt-0.5">Simple Performance & Insights</p>
              </div>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Strictly read-focused (No AI or admin controls)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Audience reach, SEO rankings & sales attribution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Executive monthly PDF reports download</span>
                </li>
              </ul>
              <button
                onClick={() => handleLaunchRole('CUSTOMER', 'client-1')}
                className="w-full py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-emerald-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Client Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Database Caching & Multi-Tenant Architecture Section */}
      <section id="caching" className="py-20 border-b border-neutral-900 bg-neutral-900/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              High Performance & Multi-Tenancy
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Database Caching Layer with Selective Tag Invalidation
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Every database query runs through an active TTL cache. When a post is scheduled, approved,
              or edited, only the relevant client tags (<code className="text-emerald-400 font-mono">client:id</code>)
              are evicted, preserving millisecond response times without cross-tenant cache contamination.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-emerald-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">PostgreSQL Row Level Security (RLS)</h4>
                  <p className="text-[11px] text-neutral-400">
                    Database-level isolation policies in <code className="text-neutral-300 font-mono">/supabase/rls_policies.sql</code> guarantee customers can never view another organization's records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-indigo-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time Cache Hit Telemetry</h4>
                  <p className="text-[11px] text-neutral-400">
                    Live hit ratio tracking, memory key inspection, and manual eviction capabilities built right into the header.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] text-neutral-500">
              <span>CACHE STATUS & TELEMETRY</span>
              <span className="text-emerald-400 font-bold">ONLINE (0ms latency)</span>
            </div>
            <pre className="text-neutral-300 overflow-x-auto text-[11px] leading-relaxed">
{`// Example Tag Invalidation on Post Approval
await dbService.updatePostStatus(ctx, postId, 'APPROVED');

// Invalidation Engine Triggers:
dbCache.invalidateTags([
  'posts',
  'client:client-1',
  'calendar'
]);
// -> Evicted: 3 keys
// -> Memory store refreshed in < 2ms`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-950 text-center text-xs text-neutral-500">
        <p>© 2026 OmniAgency OS. Multi-Tenant Social Media Agency Operating System.</p>
        <p className="text-[11px] text-neutral-600 mt-1">
          Engineered with PostgreSQL schemas, RLS isolation policies, Gemini 3.8 Flash, and client telemetry.
        </p>
      </footer>
    </div>
  );
};
