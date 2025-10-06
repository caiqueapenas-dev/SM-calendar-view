-- Create hashtag groups table
CREATE TABLE IF NOT EXISTS hashtag_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hashtag_groups_client_id ON hashtag_groups(client_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_groups_created_at ON hashtag_groups(created_at DESC);

-- Enable Row Level Security
ALTER TABLE hashtag_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
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

