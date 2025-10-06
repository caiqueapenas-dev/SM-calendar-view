-- ============================================
-- SETUP COMPLETO DE AUTENTICAÇÃO
-- Execute este arquivo COMPLETO no Supabase SQL Editor
-- ============================================

-- ==========================================
-- 1️⃣ CRIAR TABELA USERS
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

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

-- ==========================================
-- 2️⃣ ADICIONAR COLUNA EMAIL AOS CLIENTES (se não existir)
-- ==========================================
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS email TEXT;

-- ==========================================
-- 3️⃣ ATUALIZAR EMAILS DOS CLIENTES
-- ==========================================
-- IMPORTANTE: Substitua pelos emails REAIS dos seus clientes!

-- Exemplo: UPDATE clients SET email = 'cliente@email.com' WHERE client_id = 'ID_DO_CLIENTE';

-- Para o cliente que você testou (Clínica Gama):
UPDATE clients 
SET email = 'clinicagama@cliente.com' 
WHERE client_id = '401347113060769';

-- Adicione mais clientes aqui:
-- UPDATE clients SET email = 'cliente2@email.com' WHERE client_id = 'ID2';
-- UPDATE clients SET email = 'cliente3@email.com' WHERE client_id = 'ID3';

-- ==========================================
-- 4️⃣ CRIAR INDEX PARA EMAIL
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ==========================================
-- 5️⃣ VERIFICAR SE OS USERS JÁ EXISTEM NO AUTH
-- ==========================================
-- Para cada cliente que você quer que faça login,
-- você precisa criar o usuário no Supabase Auth:

-- Vá em: Authentication > Users > Add User
-- Ou use o código abaixo se tiver acesso:

-- Exemplo de criação de usuário:
-- 1. Vá em https://supabase.com/dashboard/project/rjfjqpejqdtdfcmcfhzk/auth/users
-- 2. Clique "Add user"
-- 3. Email: clinicagama@cliente.com
-- 4. Password: senha_segura_aqui
-- 5. Email confirmed: TRUE

-- ==========================================
-- 6️⃣ POPULAR USERS TABLE (opcional)
-- ==========================================
-- Se você já tem users criados no auth.users,
-- pode popular a tabela users assim:

-- Para admin (SUBSTITUA pelo seu email admin):
INSERT INTO users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'seu-admin@email.com'
ON CONFLICT (id) DO NOTHING;

-- Para clientes (exemplo):
INSERT INTO users (id, email, role)
SELECT au.id, au.email, 'client'
FROM auth.users au
INNER JOIN clients c ON c.email = au.email
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7️⃣ VERIFICAR CONFIGURAÇÃO
-- ==========================================
-- Execute para ver se está tudo ok:

SELECT 
  c.client_id,
  c.name,
  c.email,
  c.is_active,
  CASE WHEN au.id IS NOT NULL THEN '✅ Usuário criado' ELSE '❌ Falta criar no Auth' END as auth_status
FROM clients c
LEFT JOIN auth.users au ON au.email = c.email
ORDER BY c.name;

-- ==========================================
-- ✅ PRONTO!
-- ==========================================
-- Agora seus clientes podem fazer login!

