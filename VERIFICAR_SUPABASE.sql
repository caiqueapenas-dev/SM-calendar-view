-- ============================================
-- VERIFICAÇÃO COMPLETA DO SUPABASE
-- Execute para ver o status de tudo
-- ============================================

-- ==========================================
-- 1️⃣ VERIFICAR TABELAS EXISTENTES
-- ==========================================
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS Ativo' ELSE '❌ RLS Inativo' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'users',
  'clients', 
  'posts',
  'special_dates',
  'insights',
  'notifications',
  'caption_templates',
  'post_comments',
  'drafts',
  'hashtag_groups',
  'admin_profiles'
)
ORDER BY tablename;

-- ==========================================
-- 2️⃣ VERIFICAR CLIENTES E EMAILS
-- ==========================================
SELECT 
  client_id,
  name,
  email,
  is_active,
  brand_color,
  CASE 
    WHEN email IS NULL THEN '❌ Falta email'
    ELSE '✅ Email OK'
  END as email_status
FROM clients
ORDER BY is_active DESC, name;

-- ==========================================
-- 3️⃣ VERIFICAR USERS NA AUTH
-- ==========================================
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  u.role,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ Na tabela users'
    ELSE '⚠️ Falta em users (será criado no login)'
  END as users_table_status
FROM auth.users au
LEFT JOIN users u ON u.id = au.id
ORDER BY au.email;

-- ==========================================
-- 4️⃣ VERIFICAR MATCH CLIENTE <-> AUTH
-- ==========================================
SELECT 
  c.client_id,
  c.name,
  c.email as email_clients,
  c.is_active,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ User criado no Auth'
    ELSE '❌ PRECISA CRIAR NO AUTH'
  END as auth_status,
  CASE
    WHEN u.id IS NOT NULL THEN '✅ Na tabela users'
    ELSE '⚠️ Será criado no login'
  END as users_status
FROM clients c
LEFT JOIN auth.users au ON au.email = c.email
LEFT JOIN users u ON u.email = c.email
WHERE c.is_active = true
ORDER BY c.name;

-- ==========================================
-- 5️⃣ VERIFICAR POLICIES
-- ==========================================
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN permissive THEN '✅ Permissiva' 
    ELSE '❌ Restritiva' 
  END as type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'users',
  'clients',
  'special_dates',
  'insights',
  'notifications'
)
ORDER BY tablename, policyname;

-- ==========================================
-- 6️⃣ CONTAR REGISTROS
-- ==========================================
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM users) as total_users_table,
  (SELECT COUNT(*) FROM clients WHERE is_active = true) as clientes_ativos,
  (SELECT COUNT(*) FROM clients WHERE is_active = false) as clientes_inativos,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM special_dates) as total_special_dates,
  (SELECT COUNT(*) FROM insights) as total_insights;

-- ==========================================
-- ✅ RESULTADO ESPERADO
-- ==========================================
-- 1️⃣ Todas as tabelas com RLS ativo
-- 2️⃣ Clientes com email configurado
-- 3️⃣ Users na auth.users
-- 4️⃣ Match entre clients.email e auth.users.email
-- 5️⃣ Policies criadas para SELECT e INSERT
-- 6️⃣ Contadores mostrando dados

-- Se tudo estiver ✅, o login vai funcionar!

