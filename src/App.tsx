// OmniAgency OS - Root Application Component

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/navigation/Navbar';
import { CacheMonitorModal } from './components/common/CacheMonitorModal';
import { AgencyAdminDashboard } from './components/dashboards/AgencyAdminDashboard';
import { ContentManagerDashboard } from './components/dashboards/ContentManagerDashboard';
import { CustomerDashboard } from './components/dashboards/CustomerDashboard';
import { LandingPage } from './components/landing/LandingPage';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState<'app' | 'landing'>('app');
  const [isCacheModalOpen, setIsCacheModalOpen] = useState(false);

  if (view === 'landing') {
    return <LandingPage onEnterApp={() => setView('app')} />;
  }

  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        return <AgencyAdminDashboard />;
      case 'CONTENT_MANAGER':
      case 'AGENCY_TEAM':
        return <ContentManagerDashboard />;
      case 'CUSTOMER':
        return <CustomerDashboard />;
      default:
        return <AgencyAdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar
        onToggleCacheMonitor={() => setIsCacheModalOpen(true)}
        onOpenLandingPage={() => setView('landing')}
      />

      <div className="flex-1 flex flex-col">
        {renderRoleDashboard()}
      </div>

      <CacheMonitorModal
        isOpen={isCacheModalOpen}
        onClose={() => setIsCacheModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
