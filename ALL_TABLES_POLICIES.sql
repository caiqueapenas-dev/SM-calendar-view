-- ============================================
-- POLICIES FOR ALL TABLES
-- Execute este arquivo no Supabase SQL Editor
-- ============================================

-- ==========================================
-- SPECIAL DATES
-- ==========================================
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can insert special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can update special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can delete special dates" ON special_dates;

CREATE POLICY "Users can view special dates"
ON special_dates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert special dates"
ON special_dates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update special dates"
ON special_dates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete special dates"
ON special_dates FOR DELETE TO authenticated USING (true);

-- ==========================================
-- INSIGHTS
-- ==========================================
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view insights" ON insights;
DROP POLICY IF EXISTS "Authenticated users can insert insights" ON insights;
DROP POLICY IF EXISTS "Authenticated users can update insights" ON insights;
DROP POLICY IF EXISTS "Authenticated users can delete insights" ON insights;

CREATE POLICY "Users can view insights"
ON insights FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert insights"
ON insights FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update insights"
ON insights FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete insights"
ON insights FOR DELETE TO authenticated USING (true);

-- ==========================================
-- CAPTION TEMPLATES
-- ==========================================
ALTER TABLE caption_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view caption templates" ON caption_templates;
DROP POLICY IF EXISTS "Authenticated users can insert caption templates" ON caption_templates;
DROP POLICY IF EXISTS "Authenticated users can update caption templates" ON caption_templates;
DROP POLICY IF EXISTS "Authenticated users can delete caption templates" ON caption_templates;

CREATE POLICY "Users can view caption templates"
ON caption_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert caption templates"
ON caption_templates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update caption templates"
ON caption_templates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete caption templates"
ON caption_templates FOR DELETE TO authenticated USING (true);

-- ==========================================
-- POST COMMENTS
-- ==========================================
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view post comments" ON post_comments;
DROP POLICY IF EXISTS "Authenticated users can insert post comments" ON post_comments;
DROP POLICY IF EXISTS "Authenticated users can delete post comments" ON post_comments;

CREATE POLICY "Users can view post comments"
ON post_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert post comments"
ON post_comments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete post comments"
ON post_comments FOR DELETE TO authenticated USING (true);

-- ==========================================
-- DRAFTS
-- ==========================================
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own drafts" ON drafts;
DROP POLICY IF EXISTS "Users can insert their own drafts" ON drafts;
DROP POLICY IF EXISTS "Users can update their own drafts" ON drafts;
DROP POLICY IF EXISTS "Users can delete their own drafts" ON drafts;

CREATE POLICY "Users can view their own drafts"
ON drafts FOR SELECT TO authenticated 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own drafts"
ON drafts FOR INSERT TO authenticated 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own drafts"
ON drafts FOR UPDATE TO authenticated 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own drafts"
ON drafts FOR DELETE TO authenticated 
USING (auth.uid()::text = user_id);

-- ==========================================
-- HASHTAG GROUPS
-- ==========================================
ALTER TABLE hashtag_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view hashtag groups" ON hashtag_groups;
DROP POLICY IF EXISTS "Authenticated users can insert hashtag groups" ON hashtag_groups;
DROP POLICY IF EXISTS "Authenticated users can update hashtag groups" ON hashtag_groups;
DROP POLICY IF EXISTS "Authenticated users can delete hashtag groups" ON hashtag_groups;

CREATE POLICY "Users can view hashtag groups"
ON hashtag_groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert hashtag groups"
ON hashtag_groups FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update hashtag groups"
ON hashtag_groups FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete hashtag groups"
ON hashtag_groups FOR DELETE TO authenticated USING (true);

-- ==========================================
-- NOTIFICATIONS (update if needed)
-- ==========================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT TO authenticated 
USING (auth.uid()::text = user_id);

-- Anyone authenticated can create notifications (for system/admin)
CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT TO authenticated 
WITH CHECK (true);

-- Users can only update their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE TO authenticated 
USING (auth.uid()::text = user_id);

-- ==========================================
-- DONE!
-- ==========================================
-- Todas as policies foram criadas com sucesso!

