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
