-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('approval_reminder', 'client_edit', 'insight')),
  client_id TEXT NOT NULL,
  post_id TEXT, -- Optional: NULL for insight notifications
  message TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  user_id TEXT NOT NULL -- Admin user who should see this notification
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own notifications)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT TO authenticated 
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE TO authenticated 
USING (auth.uid()::text = user_id);
