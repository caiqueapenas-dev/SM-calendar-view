-- ============================================
-- FIX FINAL - POLICIES DA TABELA USERS
-- Execute no Supabase SQL Editor
-- ============================================

-- 1️⃣ Dropar policies antigas
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can insert users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert users" ON users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON users;

-- 2️⃣ Criar policies corretas

-- Permitir SELECT para todos autenticados
CREATE POLICY "Allow authenticated users to view users"
ON users FOR SELECT 
TO authenticated 
USING (true);

-- Permitir INSERT apenas se não existe OU é o próprio usuário
CREATE POLICY "Allow authenticated users to insert users"
ON users FOR INSERT 
TO authenticated 
WITH CHECK (
  id = auth.uid()::text OR
  NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text)
);

-- Permitir UPDATE apenas do próprio registro
CREATE POLICY "Allow users to update their own data"
ON users FOR UPDATE 
TO authenticated 
USING (id = auth.uid()::text);

-- 3️⃣ Verificar
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'users';

-- Deve mostrar 3 policies: SELECT, INSERT, UPDATE

