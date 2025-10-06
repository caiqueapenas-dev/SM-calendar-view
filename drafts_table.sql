-- Create drafts table for auto-save
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  draft_key TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own drafts)
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

