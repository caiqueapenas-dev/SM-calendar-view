-- ============================================
-- FIX DEFINITIVO - Execute no Supabase SQL
-- ============================================

-- Dropar TODAS as policies antigas da tabela users
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Criar policies novas e simples
CREATE POLICY "users_select"
ON users FOR SELECT TO authenticated USING (true);

CREATE POLICY "users_insert"  
ON users FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "users_update"
ON users FOR UPDATE TO authenticated USING (true);

-- Verificar
SELECT policyname FROM pg_policies WHERE tablename = 'users';

