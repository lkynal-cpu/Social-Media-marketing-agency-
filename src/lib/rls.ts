// OmniAgency OS - Row Level Security (RLS) Policy Evaluator
// Strictly enforces multi-tenant boundary checks in memory & API middleware

import { User, Client, ClientUser, UserRole } from '../types/database';

export interface SecurityContext {
  currentUser: User;
  assignedClientIds: string[]; // From client_users
}

export class RlsPolicyEnforcer {
  /**
   * Verify if the user can access records belonging to a particular agency.
   * Cross-agency access is NEVER permitted.
   */
  public static canAccessAgency(context: SecurityContext, targetAgencyId: string): boolean {
    return context.currentUser.agency_id === targetAgencyId;
  }

  /**
   * Verify if the user has access to a specific client/customer.
   */
  public static canAccessClient(context: SecurityContext, targetClientId: string, clientAgencyId?: string): boolean {
    if (clientAgencyId && clientAgencyId !== context.currentUser.agency_id) {
      return false; // Cross-agency breach blocked
    }

    const { role } = context.currentUser;

    // Super Admin: access all clients in their agency
    if (role === 'SUPER_ADMIN') {
      return true;
    }

    // Content Manager & Agency Team: access ONLY assigned clients
    if (role === 'CONTENT_MANAGER' || role === 'AGENCY_TEAM') {
      return context.assignedClientIds.includes(targetClientId);
    }

    // Customer: access ONLY their exact client organization
    if (role === 'CUSTOMER') {
      return context.assignedClientIds.includes(targetClientId);
    }

    return false;
  }

  /**
   * Filter an array of records that have agency_id and optional client_id
   */
  public static filterRecords<T extends { agency_id: string; client_id?: string }>(
    context: SecurityContext,
    records: T[]
  ): T[] {
    const userAgencyId = context.currentUser.agency_id;
    const { role } = context.currentUser;

    return records.filter((rec) => {
      // Must match agency
      if (rec.agency_id !== userAgencyId) return false;

      // If record is not client-specific (e.g. agency-level config)
      if (!rec.client_id) {
        if (role === 'CUSTOMER') return false; // Customers cannot see agency-level records
        return true;
      }

      // If record belongs to a client
      if (role === 'SUPER_ADMIN') {
        return true;
      }

      return context.assignedClientIds.includes(rec.client_id);
    });
  }

  /**
   * Check permissions for specific operational capabilities
   */
  public static canUseAiAgent(role: UserRole): boolean {
    // Only CONTENT_MANAGER role per prompt specification
    return role === 'CONTENT_MANAGER';
  }

  public static canPublishContent(role: UserRole): boolean {
    return role === 'SUPER_ADMIN' || role === 'CONTENT_MANAGER';
  }

  public static canManageTeam(role: UserRole): boolean {
    return role === 'SUPER_ADMIN';
  }

  public static canManageBilling(role: UserRole): boolean {
    return role === 'SUPER_ADMIN';
  }

  public static canViewAuditLogs(role: UserRole): boolean {
    return role === 'SUPER_ADMIN';
  }
}
