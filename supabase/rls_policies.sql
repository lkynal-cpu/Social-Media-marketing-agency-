-- ==============================================================================
-- OmniAgency OS - Row Level Security (RLS) Policies
-- Strict Multi-Tenant Data Isolation for Supabase / PostgreSQL
-- ==============================================================================

-- Enable Row Level Security on all core multi-tenant tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION current_user_agency_id()
RETURNS UUID AS $$
    SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_client_assigned_to_user(target_client_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM client_users 
        WHERE client_id = target_client_id 
          AND user_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. Agencies Policy
-- Users can only see their own agency.
-- ------------------------------------------------------------------------------
CREATE POLICY agency_isolation_policy ON agencies
    FOR ALL
    USING (id = current_user_agency_id());

-- ------------------------------------------------------------------------------
-- 2. Clients (Customers) Policy
-- SUPER_ADMIN: Can access all clients in their agency.
-- CONTENT_MANAGER & AGENCY_TEAM: Can access clients assigned to them in client_users.
-- CUSTOMER: Can only access their own client record.
-- ------------------------------------------------------------------------------
CREATE POLICY clients_access_policy ON clients
    FOR ALL
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(id)
        )
    );

-- ------------------------------------------------------------------------------
-- 3. Social Posts Policy
-- Customers can view posts for their client.
-- Content managers and team members can view/manage posts for assigned clients.
-- Super admins have full agency-wide post access.
-- ------------------------------------------------------------------------------
CREATE POLICY social_posts_isolation_policy ON social_posts
    FOR ALL
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    )
    WITH CHECK (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR (current_user_role() IN ('CONTENT_MANAGER', 'AGENCY_TEAM') AND is_client_assigned_to_user(client_id))
        )
    );

-- ------------------------------------------------------------------------------
-- 4. Content Drafts & AI Generations Policy
-- Strictly prohibited for CUSTOMER role!
-- ------------------------------------------------------------------------------
CREATE POLICY content_drafts_policy ON content_drafts
    FOR ALL
    USING (
        agency_id = current_user_agency_id() 
        AND current_user_role() != 'CUSTOMER'
        AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    );

CREATE POLICY ai_generations_policy ON ai_generations
    FOR ALL
    USING (
        agency_id = current_user_agency_id()
        AND current_user_role() = 'CONTENT_MANAGER'
        AND is_client_assigned_to_user(client_id)
    );

-- ------------------------------------------------------------------------------
-- 5. Analytics, Leads, Sales, SEO, Campaigns, Reports Policy
-- Accessible by:
-- - Super Admin: all clients in agency
-- - Content Manager & Agency Team: assigned clients
-- - Customer: strictly their own client records (READ-ONLY)
-- ------------------------------------------------------------------------------
CREATE POLICY analytics_isolation_policy ON analytics
    FOR SELECT
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    );

CREATE POLICY leads_isolation_policy ON leads
    FOR ALL
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    );

CREATE POLICY sales_isolation_policy ON sales
    FOR ALL
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    );

CREATE POLICY seo_projects_policy ON seo_projects
    FOR ALL
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    );

CREATE POLICY reports_isolation_policy ON reports
    FOR SELECT
    USING (
        agency_id = current_user_agency_id() AND (
            current_user_role() = 'SUPER_ADMIN'
            OR is_client_assigned_to_user(client_id)
        )
    );

-- ------------------------------------------------------------------------------
-- 6. Audit Logs Policy
-- Super admins only can view agency audit logs.
-- ------------------------------------------------------------------------------
CREATE POLICY audit_logs_isolation_policy ON audit_logs
    FOR SELECT
    USING (
        agency_id = current_user_agency_id() 
        AND current_user_role() = 'SUPER_ADMIN'
    );
