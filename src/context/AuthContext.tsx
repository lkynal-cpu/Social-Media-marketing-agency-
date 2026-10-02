// OmniAgency OS - Authentication, Multi-Tenant Session & Role Context

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Agency, Client, UserRole, Notification } from '../types/database';
import { dbService } from '../lib/database';
import { dbCache, CacheStats } from '../lib/cache';
import { SecurityContext } from '../lib/rls';
import { SEED_USERS, SEED_AGENCIES } from '../lib/mockSeedData';

interface AuthContextType {
  currentUser: User;
  currentAgency: Agency;
  securityContext: SecurityContext;
  assignedClients: Client[];
  activeClient: Client | null;
  setActiveClient: (client: Client | null) => void;
  switchDemoRole: (role: UserRole, clientId?: string) => void;
  cacheStats: CacheStats;
  notifications: Notification[];
  unreadNotifsCount: number;
  markNotifsAsRead: () => void;
  refreshDataVersion: number;
  triggerRefresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default user is SUPER_ADMIN (Elena Vance)
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [currentAgency, setCurrentAgency] = useState<Agency>(SEED_AGENCIES[0]);
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats>(dbCache.getStats());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshDataVersion, setRefreshDataVersion] = useState(0);

  // Subscribe to cache telemetry updates
  useEffect(() => {
    const unsubscribe = dbCache.subscribe((stats) => {
      setCacheStats(stats);
    });
    return unsubscribe;
  }, []);

  const securityContext = useMemo(() => {
    return dbService.getSecurityContext(currentUser.id);
  }, [currentUser.id]);

  // Load clients and notifications whenever currentUser or refreshDataVersion changes
  useEffect(() => {
    let isMounted = true;

    async function loadSessionData() {
      const secCtx = dbService.getSecurityContext(currentUser.id);
      const agency = await dbService.getAgency(secCtx, currentUser.agency_id);
      if (agency && isMounted) {
        setCurrentAgency((prev) => (prev.id === agency.id ? prev : agency));
      }

      const clients = await dbService.getClients(secCtx);
      if (isMounted) {
        setAssignedClients(clients);

        // Auto-select active client without triggering unnecessary re-renders
        if (currentUser.role === 'CUSTOMER') {
          const target = clients[0] || null;
          setActiveClient((prev) => (prev?.id === target?.id ? prev : target));
        } else if (clients.length > 0) {
          setActiveClient((prev) => {
            if (prev && clients.some((c) => c.id === prev.id)) {
              return prev;
            }
            return clients[0];
          });
        } else {
          setActiveClient(null);
        }
      }
    }

    loadSessionData();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id, currentUser.agency_id, currentUser.role, refreshDataVersion]);

  const switchDemoRole = (role: UserRole, customClientId?: string) => {
    let targetUser: User;

    if (role === 'SUPER_ADMIN') {
      targetUser = SEED_USERS.find((u) => u.id === 'user-admin') || SEED_USERS[0];
    } else if (role === 'CONTENT_MANAGER') {
      targetUser = SEED_USERS.find((u) => u.id === 'user-cm') || SEED_USERS[1];
    } else if (role === 'AGENCY_TEAM') {
      targetUser = SEED_USERS.find((u) => u.id === 'user-team') || SEED_USERS[2];
    } else {
      // CUSTOMER
      if (customClientId === 'client-2') {
        targetUser = SEED_USERS.find((u) => u.id === 'user-cust-2') || SEED_USERS[4];
      } else {
        targetUser = SEED_USERS.find((u) => u.id === 'user-cust-1') || SEED_USERS[3];
      }
    }

    setCurrentUser(targetUser);

    // Invalidate session cache to reflect new role boundary
    dbCache.invalidateKey(`clients:${targetUser.id}`);
    setRefreshDataVersion((v) => v + 1);
  };

  const markNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const triggerRefresh = () => {
    setRefreshDataVersion((v) => v + 1);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentAgency,
        securityContext,
        assignedClients,
        activeClient,
        setActiveClient,
        switchDemoRole,
        cacheStats,
        notifications,
        unreadNotifsCount,
        markNotifsAsRead,
        refreshDataVersion,
        triggerRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
