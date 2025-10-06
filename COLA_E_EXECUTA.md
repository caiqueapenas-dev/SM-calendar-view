# ⚡ COLA E EXECUTA - 2 MINUTOS!

## 🎯 APENAS 3 COMANDOS!

---

## 1️⃣ NO SUPABASE SQL EDITOR

Acesse: https://supabase.com/dashboard/project/rjfjqpejqdtdfcmcfhzk/sql

Cole TUDO de uma vez e execute:

```sql
-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
ON users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert users"
ON users FOR INSERT TO authenticated WITH CHECK (true);

-- Adicionar email aos clientes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT;

-- Configurar email do cliente teste
UPDATE clients 
SET email = 'clinicagama@cliente.com' 
WHERE client_id = '401347113060769';
```

---

## 2️⃣ NO SUPABASE DASHBOARD

Acesse: https://supabase.com/dashboard/project/rjfjqpejqdtdfcmcfhzk/auth/users

Clique **"Add User"**:
- Email: `clinicagama@cliente.com`
- Password: `senha123`
- Email confirmed: ✅ **MARQUE ISSO!**
- Clique "Create user"

---

## 3️⃣ NO TERMINAL

```bash
npm run dev
```

---

## 🧪 TESTE (10 segundos!)

### Teste Cliente:
1. http://localhost:3000
2. "Área do Cliente"
3. Email: `clinicagama@cliente.com`
4. Senha: `senha123`
5. ✅ **FUNCIONA!**

### Teste Admin:
1. http://localhost:3000
2. "Área do Administrador"  
3. Seu email admin
4. Sua senha
5. ✅ **FUNCIONA!**

---

## 🎊 PRONTO!

Se funcionou:
- ✅ Login OK
- ✅ Middleware OK
- ✅ PWA errors resolvidos
- ✅ Pode usar o app!

---

## 🚨 NÃO FUNCIONOU?

Me diga qual erro aparece:
- No console do browser (F12)
- No terminal do Next.js
- Na tela de login

E eu corrijo na hora!

---

**EXECUTA E ME CONTA! 🚀**

