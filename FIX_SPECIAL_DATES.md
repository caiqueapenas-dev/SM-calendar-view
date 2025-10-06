# 🔧 Fix: Special Dates Not Working

## 🎯 Problema Identificado

A tabela `special_dates` (e outras novas tabelas) não tem **Row Level Security (RLS) policies** configuradas no Supabase. Por isso, os inserts/selects falham silenciosamente.

## ✅ Solução Rápida

### 1️⃣ Acesse o Supabase Dashboard

Vá em: https://supabase.com/dashboard/project/rjfjqpejqdtdfcmcfhzk

### 2️⃣ Abra o SQL Editor

Clique em **SQL Editor** no menu lateral

### 3️⃣ Execute o Script de Policies

Cole e execute o conteúdo do arquivo **`ALL_TABLES_POLICIES.sql`**

Ou execute este script direto:

```sql
-- SPECIAL DATES POLICIES
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can insert special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can update special dates" ON special_dates;
DROP POLICY IF EXISTS "Authenticated users can delete special dates" ON special_dates;

CREATE POLICY "Users can view special dates"
ON special_dates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert special dates"
ON special_dates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update special dates"
ON special_dates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete special dates"
ON special_dates FOR DELETE TO authenticated USING (true);
```

### 4️⃣ Teste Novamente

Tente criar uma special date no app. Deve funcionar agora!

---

## 🔍 Como Diagnosticar

### Ver Policies Existentes

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'special_dates';
```

### Ver se RLS está ativo

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'special_dates';
```

### Testar Insert Manual

```sql
-- Este deve funcionar se as policies estiverem corretas
INSERT INTO special_dates (client_id, title, date, is_recurring, recurrence_type)
VALUES ('401347113060769', 'Teste Manual', '2025-12-25', true, 'yearly');
```

---

## 🎯 Policies para TODAS as Novas Tabelas

Execute **`ALL_TABLES_POLICIES.sql`** para configurar policies em:

- ✅ `special_dates`
- ✅ `insights`
- ✅ `caption_templates`
- ✅ `post_comments`
- ✅ `drafts`
- ✅ `hashtag_groups`
- ✅ `notifications` (atualizado)

---

## 🚨 Problema Comum: RLS sem Policies

Quando você cria uma tabela no Supabase e habilita RLS mas **não cria policies**, NENHUMA operação funciona, nem para usuários autenticados.

### Como funciona RLS:

1. **RLS DISABLED** = Todos têm acesso total (PERIGOSO!)
2. **RLS ENABLED + SEM POLICIES** = Ninguém tem acesso (ERRO ATUAL!)
3. **RLS ENABLED + COM POLICIES** = Acesso controlado (CORRETO!)

---

## ✅ Verificação Final

Após executar as policies, teste:

```javascript
// No console do browser (F12)
const { data, error } = await supabase
  .from('special_dates')
  .insert({
    client_id: '401347113060769',
    title: 'Teste de Policy',
    date: '2025-12-25',
    is_recurring: true,
    recurrence_type: 'yearly'
  });

console.log('Data:', data);
console.log('Error:', error); // Deve ser null
```

---

## 📞 Se Ainda Não Funcionar

1. **Verifique se está autenticado**: `supabase.auth.getSession()`
2. **Verifique a conexão**: Supabase URL e API Key corretos
3. **Veja o console**: Pode ter erro de validação do CHECK constraint
4. **Verifique o tipo de data**: Deve ser string no formato `YYYY-MM-DD`

---

## 🎉 Pronto!

Depois de executar as policies, `special_dates` funcionará perfeitamente!

**Outros benefícios:**
- Insights funcionará
- Caption Templates funcionará
- Post Comments funcionará
- Drafts funcionará
- Hashtags funcionará

**Tudo resolvido de uma vez! 🚀**

