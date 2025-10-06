-- Create post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_role TEXT NOT NULL CHECK (author_role IN ('admin', 'client')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at DESC);

-- Enable realtime
ALTER TABLE post_comments REPLICA IDENTITY FULL;

-- Enable Row Level Security
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view post comments" ON post_comments;
DROP POLICY IF EXISTS "Authenticated users can insert post comments" ON post_comments;
DROP POLICY IF EXISTS "Authenticated users can delete post comments" ON post_comments;

CREATE POLICY "Users can view post comments"
ON post_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert post comments"
ON post_comments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete post comments"
ON post_comments FOR DELETE TO authenticated USING (true);

