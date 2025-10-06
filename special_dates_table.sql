-- Create special dates table for client important dates
CREATE TABLE IF NOT EXISTS special_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT CHECK (recurrence_type IN ('monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_special_dates_client_id ON special_dates(client_id);
CREATE INDEX IF NOT EXISTS idx_special_dates_date ON special_dates(date);

-- Enable Row Level Security
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
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