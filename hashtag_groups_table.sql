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

