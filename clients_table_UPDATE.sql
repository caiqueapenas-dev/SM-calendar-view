-- 1️⃣ Adiciona a coluna se ainda não existir
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#6366f1';

-- 2️⃣ Atualiza cores com base em um hash (funciona para UUID ou texto)
UPDATE clients
SET brand_color = (
  CASE mod(abs(hashtext(client_id)), 10)
    WHEN 0 THEN '#ef4444' -- red
    WHEN 1 THEN '#f59e0b' -- amber
    WHEN 2 THEN '#10b981' -- green
    WHEN 3 THEN '#3b82f6' -- blue
    WHEN 4 THEN '#8b5cf6' -- violet
    WHEN 5 THEN '#ec4899' -- pink
    WHEN 6 THEN '#14b8a6' -- teal
    WHEN 7 THEN '#f97316' -- orange
    WHEN 8 THEN '#06b6d4' -- cyan
    ELSE '#6366f1' -- indigo (default)
  END
)
WHERE brand_color IS NULL;
