-- Create insights table for client comments/ideas
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL, -- User who wrote the insight
  author_role TEXT NOT NULL CHECK (author_role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_insights_client_id ON insights(client_id);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at DESC);

-- Enable Row Level Security
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies
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