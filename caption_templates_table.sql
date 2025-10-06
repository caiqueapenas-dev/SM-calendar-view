-- Create caption templates table
CREATE TABLE IF NOT EXISTS caption_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_caption_templates_client_id ON caption_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_caption_templates_created_at ON caption_templates(created_at DESC);

