-- Enable Row Level Security for special_dates
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can insert special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can update special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can delete special dates" ON special_dates;

-- Allow authenticated users to view all special dates
CREATE POLICY "Users can view special dates"
ON special_dates FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert special dates
CREATE POLICY "Authenticated users can insert special dates"
ON special_dates FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update special dates
CREATE POLICY "Authenticated users can update special dates"
ON special_dates FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete special dates
CREATE POLICY "Authenticated users can delete special dates"
ON special_dates FOR DELETE
TO authenticated
USING (true);

