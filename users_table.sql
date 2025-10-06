-- Create users table to store user roles
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Same as auth.users.id
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view all users"
ON users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert users"
ON users FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE TO authenticated 
USING (auth.uid()::text = id);

-- Insert admin user example (UPDATE WITH YOUR ADMIN EMAIL!)
-- INSERT INTO users (id, email, role) 
-- VALUES ('your-admin-user-id', 'admin@example.com', 'admin');

