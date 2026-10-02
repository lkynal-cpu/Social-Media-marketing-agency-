// OmniAgency OS - Relational Schema & Domain Models

export type UserRole = 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'AGENCY_TEAM' | 'CUSTOMER';

export type PostStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'FAILED';

export type SocialPlatformId = 
  | 'instagram' 
  | 'facebook' 
  | 'tiktok' 
  | 'linkedin' 
  | 'twitter_x' 
  | 'youtube';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website: string;
  tier: 'starter' | 'pro' | 'enterprise';
  max_clients: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  agency_id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  status: 'active' | 'invited' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  agency_id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  agency_id: string;
  team_id: string;
  user_id: string;
  role_in_team: 'lead' | 'member';
  created_at: string;
}

export interface Client {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  industry: string;
  website: string;
  brand_voice: string;
  target_audience: string;
  products_services: string;
  monthly_retainer: number;
  status: 'active' | 'onboarding' | 'paused' | 'churned';
  assigned_manager_id?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientUser {
  id: string;
  agency_id: string;
  client_id: string;
  user_id: string;
  access_type: 'owner' | 'staff_assignee' | 'viewer';
  created_at: string;
}

export interface SocialPlatform {
  id: SocialPlatformId;
  name: string;
  icon: string;
  supports_video: boolean;
  supports_carousels: boolean;
  max_char_limit: number;
  color: string;
}

export interface SocialAccount {
  id: string;
  agency_id: string;
  client_id: string;
  platform_id: SocialPlatformId;
  handle: string;
  profile_name: string;
  followers_count: number;
  account_status: 'connected' | 'disconnected' | 'token_expired';
  is_mock: boolean;
  connected_at: string;
  last_synced_at: string;
}

export interface Campaign {
  id: string;
  agency_id: string;
  client_id: string;
  name: string;
  goal: string;
  budget: number;
  spent: number;
  status: 'draft' | 'active' | 'completed' | 'paused';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface PostPerformanceMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  ctr?: number;
  engagement_rate?: number;
}

export interface SocialPost {
  id: string;
  agency_id: string;
  client_id: string;
  campaign_id?: string;
  platform_id: SocialPlatformId;
  caption: string;
  hashtags: string[];
  media_url?: string;
  media_type: 'image' | 'video' | 'carousel' | 'text';
  status: PostStatus;
  scheduled_for?: string;
  published_at?: string;
  creator_id?: string;
  reviewer_id?: string;
  rejection_reason?: string;
  performance_metrics?: PostPerformanceMetrics;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentDraft {
  id: string;
  agency_id: string;
  client_id: string;
  title: string;
  content_theme: string;
  raw_text: string;
  suggested_hashtags: string[];
  platforms: SocialPlatformId[];
  created_by?: string;
  status: 'draft' | 'promoted_to_post';
  created_at: string;
  updated_at: string;
}

export interface ContentCalendarSlot {
  id: string;
  agency_id: string;
  client_id: string;
  post_id: string;
  scheduled_date: string; // YYYY-MM-DD
  time_slot: string; // HH:mm
  notes?: string;
  created_at: string;
}

export interface SeoProject {
  id: string;
  agency_id: string;
  client_id: string;
  domain: string;
  health_score: number; // 0 - 100
  organic_traffic_monthly: number;
  created_at: string;
  updated_at: string;
}

export interface SeoKeyword {
  id: string;
  agency_id: string;
  client_id: string;
  project_id: string;
  keyword: string;
  current_position: number;
  previous_position: number;
  search_volume: number;
  difficulty: number; // 0 - 100
  target_url: string;
  updated_at: string;
}

export interface SeoIssue {
  id: string;
  agency_id: string;
  client_id: string;
  project_id: string;
  title: string;
  severity: 'error' | 'warning' | 'notice';
  category: 'crawlability' | 'meta_tags' | 'performance' | 'backlinks';
  status: 'open' | 'resolved' | 'ignored';
  ai_recommendation: string;
  created_at: string;
  resolved_at?: string;
}

export interface AnalyticsRecord {
  id: string;
  agency_id: string;
  client_id: string;
  date: string;
  metric_type: 'followers' | 'impressions' | 'reach' | 'engagement_rate' | 'web_traffic';
  platform_id?: SocialPlatformId;
  value: number;
  created_at: string;
}

export interface Lead {
  id: string;
  agency_id: string;
  client_id: string;
  campaign_id?: string;
  name: string;
  email: string;
  phone?: string;
  source: string; // 'Instagram Ad', 'TikTok Organic', 'LinkedIn InMail', 'Google Search', 'Website Form'
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lead_value: number;
  created_at: string;
}

export interface Sale {
  id: string;
  agency_id: string;
  client_id: string;
  campaign_id?: string;
  lead_id?: string;
  amount: number;
  currency: string;
  channel: string;
  converted_at: string;
}

export interface Task {
  id: string;
  agency_id: string;
  client_id: string;
  assigned_to?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string;
  created_at: string;
}

export interface Report {
  id: string;
  agency_id: string;
  client_id: string;
  title: string;
  report_type: 'monthly' | 'social' | 'seo' | 'campaign';
  period_start: string;
  period_end: string;
  summary: string;
  metrics_snapshot: Record<string, any>;
  pdf_url?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  agency_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  agency_id: string;
  client_id?: string;
  plan_name: string;
  billing_interval: 'monthly' | 'yearly';
  price: number;
  status: 'active' | 'past_due' | 'canceled';
  current_period_end: string;
  created_at: string;
}

export interface AiGeneration {
  id: string;
  agency_id: string;
  client_id: string;
  user_id: string;
  tool_invoked: string;
  prompt: string;
  response_output: string;
  tokens_used: number;
  created_at: string;
}

export type AuditAction = 
  | 'LOGIN'
  | 'CONTENT_GENERATION'
  | 'CONTENT_EDIT'
  | 'APPROVAL'
  | 'REJECTION'
  | 'SCHEDULING'
  | 'PUBLISHING'
  | 'SOCIAL_CONNECT'
  | 'CUSTOMER_CREATE'
  | 'TEAM_CHANGE'
  | 'SETTINGS_UPDATE';

export interface AuditLog {
  id: string;
  agency_id: string;
  client_id?: string;
  user_id?: string;
  user_email?: string;
  action: AuditAction;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}
