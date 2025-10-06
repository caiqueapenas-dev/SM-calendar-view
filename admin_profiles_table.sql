-- Create admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id TEXT PRIMARY KEY, -- Same as auth.users.id
  name TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_admin_profiles_id ON admin_profiles(id);

-- Enable Row Level Security
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Admins can view profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can insert their own profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update their own profile" ON admin_profiles;

CREATE POLICY "Admins can view profiles"
ON admin_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert their own profile"
ON admin_profiles FOR INSERT TO authenticated 
WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Admins can update their own profile"
ON admin_profiles FOR UPDATE TO authenticated 
USING (auth.uid()::text = id);

