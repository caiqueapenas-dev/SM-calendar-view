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

-- Enable Row Level Security
ALTER TABLE caption_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
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

