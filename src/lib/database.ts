// OmniAgency OS - In-Memory Relational Database Service with RLS and Active Query Caching

import {
  Agency,
  User,
  Team,
  TeamMember,
  Client,
  ClientUser,
  SocialAccount,
  Campaign,
  SocialPost,
  ContentDraft,
  ContentCalendarSlot,
  SeoProject,
  SeoKeyword,
  SeoIssue,
  Lead,
  Sale,
  Task,
  Report,
  Notification,
  Subscription,
  AiGeneration,
  AuditLog,
  PostStatus,
  AuditAction,
} from '../types/database';
import {
  SEED_AGENCIES,
  SEED_USERS,
  SEED_TEAMS,
  SEED_TEAM_MEMBERS,
  SEED_CLIENTS,
  SEED_CLIENT_USERS,
  SEED_SOCIAL_ACCOUNTS,
  SEED_CAMPAIGNS,
  SEED_SOCIAL_POSTS,
  SEED_CONTENT_DRAFTS,
  SEED_CONTENT_CALENDAR,
  SEED_SEO_PROJECTS,
  SEED_SEO_KEYWORDS,
  SEED_SEO_ISSUES,
  SEED_LEADS,
  SEED_SALES,
  SEED_TASKS,
  SEED_REPORTS,
  SEED_NOTIFICATIONS,
  SEED_SUBSCRIPTIONS,
  SEED_AUDIT_LOGS,
} from './mockSeedData';
import { dbCache } from './cache';
import { RlsPolicyEnforcer, SecurityContext } from './rls';

class DatabaseService {
  private agencies: Agency[] = [...SEED_AGENCIES];
  private users: User[] = [...SEED_USERS];
  private teams: Team[] = [...SEED_TEAMS];
  private teamMembers: TeamMember[] = [...SEED_TEAM_MEMBERS];
  private clients: Client[] = [...SEED_CLIENTS];
  private clientUsers: ClientUser[] = [...SEED_CLIENT_USERS];
  private socialAccounts: SocialAccount[] = [...SEED_SOCIAL_ACCOUNTS];
  private campaigns: Campaign[] = [...SEED_CAMPAIGNS];
  private socialPosts: SocialPost[] = [...SEED_SOCIAL_POSTS];
  private contentDrafts: ContentDraft[] = [...SEED_CONTENT_DRAFTS];
  private contentCalendar: ContentCalendarSlot[] = [...SEED_CONTENT_CALENDAR];
  private seoProjects: SeoProject[] = [...SEED_SEO_PROJECTS];
  private seoKeywords: SeoKeyword[] = [...SEED_SEO_KEYWORDS];
  private seoIssues: SeoIssue[] = [...SEED_SEO_ISSUES];
  private leads: Lead[] = [...SEED_LEADS];
  private sales: Sale[] = [...SEED_SALES];
  private tasks: Task[] = [...SEED_TASKS];
  private reports: Report[] = [...SEED_REPORTS];
  private notifications: Notification[] = [...SEED_NOTIFICATIONS];
  private subscriptions: Subscription[] = [...SEED_SUBSCRIPTIONS];
  private aiGenerations: AiGeneration[] = [];
  private auditLogs: AuditLog[] = [...SEED_AUDIT_LOGS];

  // -------------------------------------------------------------
  // Context Helpers
  // -------------------------------------------------------------
  public getSecurityContext(userId: string): SecurityContext {
    const user = this.users.find((u) => u.id === userId) || this.users[0];
    const assignedClientIds = this.clientUsers
      .filter((cu) => cu.user_id === user.id)
      .map((cu) => cu.client_id);

    return {
      currentUser: user,
      assignedClientIds,
    };
  }

  // -------------------------------------------------------------
  // Agencies & Users
  // -------------------------------------------------------------
  public async getAgency(context: SecurityContext, agencyId: string): Promise<Agency | null> {
    const cacheKey = `agency:${agencyId}:${context.currentUser.id}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        if (!RlsPolicyEnforcer.canAccessAgency(context, agencyId)) return null;
        return this.agencies.find((a) => a.id === agencyId) || null;
      },
      { ttlSeconds: 120, tags: [`agency:${agencyId}`] }
    );
    return result.data;
  }

  public async getAllUsers(context: SecurityContext): Promise<User[]> {
    const cacheKey = `users:${context.currentUser.agency_id}:${context.currentUser.id}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        if (context.currentUser.role === 'CUSTOMER') return [];
        return this.users.filter((u) => u.agency_id === context.currentUser.agency_id);
      },
      { ttlSeconds: 60, tags: [`agency:${context.currentUser.agency_id}`, 'users'] }
    );
    return result.data;
  }

  // -------------------------------------------------------------
  // Clients (Customers)
  // -------------------------------------------------------------
  public async getClients(context: SecurityContext): Promise<Client[]> {
    const cacheKey = `clients:${context.currentUser.id}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        return this.clients.filter((c) =>
          RlsPolicyEnforcer.canAccessClient(context, c.id, c.agency_id)
        );
      },
      { ttlSeconds: 60, tags: [`agency:${context.currentUser.agency_id}`, 'clients'] }
    );
    return result.data;
  }

  public async getClientById(context: SecurityContext, clientId: string): Promise<Client | null> {
    const clients = await this.getClients(context);
    return clients.find((c) => c.id === clientId) || null;
  }

  public async createClient(
    context: SecurityContext,
    clientData: Omit<Client, 'id' | 'agency_id' | 'created_at' | 'updated_at'>
  ): Promise<Client> {
    if (context.currentUser.role !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN can create clients');
    }

    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      agency_id: context.currentUser.agency_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.clients.unshift(newClient);

    // Assign creating admin and designated manager
    if (clientData.assigned_manager_id) {
      this.clientUsers.push({
        id: `cu-${Date.now()}`,
        agency_id: context.currentUser.agency_id,
        client_id: newClient.id,
        user_id: clientData.assigned_manager_id,
        access_type: 'staff_assignee',
        created_at: new Date().toISOString(),
      });
    }

    await this.logAudit(context, {
      action: 'CUSTOMER_CREATE',
      entity_type: 'CLIENT',
      entity_id: newClient.id,
      details: { name: newClient.name, retainer: newClient.monthly_retainer },
    });

    dbCache.invalidateTags(['clients', `agency:${context.currentUser.agency_id}`]);
    return newClient;
  }

  // -------------------------------------------------------------
  // Social Accounts
  // -------------------------------------------------------------
  public async getSocialAccounts(context: SecurityContext, clientId?: string): Promise<SocialAccount[]> {
    const cacheKey = `social_accounts:${context.currentUser.id}:${clientId || 'all'}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        let accounts = RlsPolicyEnforcer.filterRecords(context, this.socialAccounts);
        if (clientId) {
          accounts = accounts.filter((a) => a.client_id === clientId);
        }
        return accounts;
      },
      { ttlSeconds: 45, tags: ['social_accounts', clientId ? `client:${clientId}` : 'clients'] }
    );
    return result.data;
  }

  // -------------------------------------------------------------
  // Social Posts & Approval Pipeline
  // -------------------------------------------------------------
  public async getSocialPosts(context: SecurityContext, clientId?: string): Promise<SocialPost[]> {
    const cacheKey = `social_posts:${context.currentUser.id}:${clientId || 'all'}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        let posts = RlsPolicyEnforcer.filterRecords(context, this.socialPosts);
        if (clientId) {
          posts = posts.filter((p) => p.client_id === clientId);
        }
        return posts.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      },
      { ttlSeconds: 30, tags: ['posts', clientId ? `client:${clientId}` : 'clients'] }
    );
    return result.data;
  }

  public async createSocialPost(
    context: SecurityContext,
    postData: Omit<SocialPost, 'id' | 'agency_id' | 'created_at' | 'updated_at'>
  ): Promise<SocialPost> {
    if (context.currentUser.role === 'CUSTOMER') {
      throw new Error('Customers are not permitted to create or modify posts');
    }

    const newPost: SocialPost = {
      ...postData,
      id: `post-${Date.now()}`,
      agency_id: context.currentUser.agency_id,
      creator_id: context.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.socialPosts.unshift(newPost);

    // If scheduled, add to content calendar
    if (newPost.scheduled_for && (newPost.status === 'SCHEDULED' || newPost.status === 'APPROVED')) {
      const datePart = newPost.scheduled_for.split('T')[0];
      const timePart = newPost.scheduled_for.split('T')[1]?.substring(0, 5) || '12:00';
      this.contentCalendar.push({
        id: `cal-${Date.now()}`,
        agency_id: context.currentUser.agency_id,
        client_id: newPost.client_id,
        post_id: newPost.id,
        scheduled_date: datePart,
        time_slot: timePart,
        created_at: new Date().toISOString(),
      });
    }

    await this.logAudit(context, {
      action: 'CONTENT_GENERATION',
      entity_type: 'SOCIAL_POST',
      entity_id: newPost.id,
      details: { platform: newPost.platform_id, status: newPost.status },
    });

    dbCache.invalidateTags(['posts', `client:${newPost.client_id}`, 'calendar']);
    return newPost;
  }

  public async updatePostStatus(
    context: SecurityContext,
    postId: string,
    status: PostStatus,
    options?: { rejection_reason?: string; scheduled_for?: string }
  ): Promise<SocialPost> {
    const post = this.socialPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (context.currentUser.role === 'CUSTOMER') {
      throw new Error('Customers cannot modify post review statuses');
    }

    const previousStatus = post.status;
    post.status = status;
    post.reviewer_id = context.currentUser.id;
    post.updated_at = new Date().toISOString();

    if (options?.rejection_reason) {
      post.rejection_reason = options.rejection_reason;
    }
    if (options?.scheduled_for) {
      post.scheduled_for = options.scheduled_for;
    }
    if (status === 'PUBLISHED') {
      post.published_at = new Date().toISOString();
      post.performance_metrics = {
        views: 120,
        likes: 14,
        shares: 2,
        comments: 1,
        clicks: 8,
        engagement_rate: 3.5,
      };
    }

    let auditAction: AuditAction = 'CONTENT_EDIT';
    if (status === 'APPROVED') auditAction = 'APPROVAL';
    if (status === 'REJECTED') auditAction = 'REJECTION';
    if (status === 'SCHEDULED') auditAction = 'SCHEDULING';
    if (status === 'PUBLISHED') auditAction = 'PUBLISHING';

    await this.logAudit(context, {
      action: auditAction,
      entity_type: 'SOCIAL_POST',
      entity_id: post.id,
      details: { from: previousStatus, to: status, reason: options?.rejection_reason },
    });

    dbCache.invalidateTags(['posts', `client:${post.client_id}`, 'calendar']);
    return { ...post };
  }

  public async updatePostCaption(
    context: SecurityContext,
    postId: string,
    caption: string,
    hashtags: string[]
  ): Promise<SocialPost> {
    const post = this.socialPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    if (context.currentUser.role === 'CUSTOMER') {
      throw new Error('Customers cannot edit posts');
    }

    post.caption = caption;
    post.hashtags = hashtags;
    post.updated_at = new Date().toISOString();

    await this.logAudit(context, {
      action: 'CONTENT_EDIT',
      entity_type: 'SOCIAL_POST',
      entity_id: post.id,
      details: { captionSnippet: caption.substring(0, 40) },
    });

    dbCache.invalidateTags(['posts', `client:${post.client_id}`]);
    return { ...post };
  }

  // -------------------------------------------------------------
  // Content Calendar Slots
  // -------------------------------------------------------------
  public async getContentCalendar(context: SecurityContext, clientId?: string): Promise<ContentCalendarSlot[]> {
    const cacheKey = `calendar:${context.currentUser.id}:${clientId || 'all'}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        let slots = RlsPolicyEnforcer.filterRecords(context, this.contentCalendar);
        if (clientId) {
          slots = slots.filter((s) => s.client_id === clientId);
        }
        return slots;
      },
      { ttlSeconds: 45, tags: ['calendar', clientId ? `client:${clientId}` : 'clients'] }
    );
    return result.data;
  }

  // -------------------------------------------------------------
  // Campaigns
  // -------------------------------------------------------------
  public async getCampaigns(context: SecurityContext, clientId?: string): Promise<Campaign[]> {
    const cacheKey = `campaigns:${context.currentUser.id}:${clientId || 'all'}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        let camps = RlsPolicyEnforcer.filterRecords(context, this.campaigns);
        if (clientId) {
          camps = camps.filter((c) => c.client_id === clientId);
        }
        return camps;
      },
      { ttlSeconds: 60, tags: ['campaigns', clientId ? `client:${clientId}` : 'clients'] }
    );
    return result.data;
  }

  // -------------------------------------------------------------
  // SEO Module
  // -------------------------------------------------------------
  public async getSeoProject(context: SecurityContext, clientId: string): Promise<{
    project: SeoProject | null;
    keywords: SeoKeyword[];
    issues: SeoIssue[];
  }> {
    const cacheKey = `seo:${context.currentUser.id}:${clientId}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        const project = this.seoProjects.find((p) => p.client_id === clientId) || null;
        const keywords = this.seoKeywords.filter((k) => k.client_id === clientId);
        const issues = this.seoIssues.filter((i) => i.client_id === clientId);
        return { project, keywords, issues };
      },
      { ttlSeconds: 60, tags: ['seo', `client:${clientId}`] }
    );
    return result.data;
  }

  public async resolveSeoIssue(context: SecurityContext, issueId: string): Promise<void> {
    const issue = this.seoIssues.find((i) => i.id === issueId);
    if (issue) {
      issue.status = 'resolved';
      issue.resolved_at = new Date().toISOString();
      dbCache.invalidateTags(['seo', `client:${issue.client_id}`]);
    }
  }

  // -------------------------------------------------------------
  // Sales & Leads Module
  // -------------------------------------------------------------
  public async getLeadsAndSales(context: SecurityContext, clientId?: string): Promise<{
    leads: Lead[];
    sales: Sale[];
    totalRevenue: number;
    conversionRate: number;
  }> {
    const cacheKey = `sales_leads:${context.currentUser.id}:${clientId || 'all'}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        let leads = RlsPolicyEnforcer.filterRecords(context, this.leads);
        let sales = RlsPolicyEnforcer.filterRecords(context, this.sales);

        if (clientId) {
          leads = leads.filter((l) => l.client_id === clientId);
          sales = sales.filter((s) => s.client_id === clientId);
        }

        const totalRevenue = sales.reduce((acc, curr) => acc + curr.amount, 0);
        const convertedLeads = leads.filter((l) => l.status === 'converted').length;
        const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;

        return { leads, sales, totalRevenue, conversionRate };
      },
      { ttlSeconds: 45, tags: ['leads', 'sales', clientId ? `client:${clientId}` : 'clients'] }
    );
    return result.data;
  }

  public async createLead(
    context: SecurityContext,
    leadData: Omit<Lead, 'id' | 'agency_id' | 'created_at'>
  ): Promise<Lead> {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      agency_id: context.currentUser.agency_id,
      created_at: new Date().toISOString(),
    };
    this.leads.unshift(newLead);
    dbCache.invalidateTags(['leads', `client:${newLead.client_id}`]);
    return newLead;
  }

  // -------------------------------------------------------------
  // Reports & Tasks
  // -------------------------------------------------------------
  public async getReports(context: SecurityContext, clientId?: string): Promise<Report[]> {
    const cacheKey = `reports:${context.currentUser.id}:${clientId || 'all'}`;
    const result = await dbCache.getOrSet(
      cacheKey,
      () => {
        let reps = RlsPolicyEnforcer.filterRecords(context, this.reports);
        if (clientId) reps = reps.filter((r) => r.client_id === clientId);
        return reps;
      },
      { ttlSeconds: 120, tags: ['reports', clientId ? `client:${clientId}` : 'clients'] }
    );
    return result.data;
  }

  public async getTasks(context: SecurityContext, clientId?: string): Promise<Task[]> {
    let tasks = RlsPolicyEnforcer.filterRecords(context, this.tasks);
    if (clientId) tasks = tasks.filter((t) => t.client_id === clientId);
    return tasks;
  }

  // -------------------------------------------------------------
  // Subscriptions & Billing
  // -------------------------------------------------------------
  public async getSubscriptions(context: SecurityContext): Promise<Subscription[]> {
    if (context.currentUser.role !== 'SUPER_ADMIN') {
      return [];
    }
    return this.subscriptions.filter((s) => s.agency_id === context.currentUser.agency_id);
  }

  // -------------------------------------------------------------
  // Audit Logs
  // -------------------------------------------------------------
  public async getAuditLogs(context: SecurityContext, limit = 50): Promise<AuditLog[]> {
    if (context.currentUser.role !== 'SUPER_ADMIN') {
      return [];
    }
    return this.auditLogs
      .filter((l) => l.agency_id === context.currentUser.agency_id)
      .slice(0, limit);
  }

  public async logAudit(
    context: SecurityContext,
    params: {
      action: AuditAction;
      entity_type: string;
      entity_id?: string;
      details?: Record<string, any>;
    }
  ): Promise<AuditLog> {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agency_id: context.currentUser.agency_id,
      client_id: context.assignedClientIds[0] || undefined,
      user_id: context.currentUser.id,
      user_email: context.currentUser.email,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      details: params.details || {},
      ip_address: '198.51.100.' + (Math.floor(Math.random() * 200) + 1),
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const dbService = new DatabaseService();
