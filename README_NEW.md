# 🚀 Social Media Planner - Plataforma Profissional

> **v2.0** - Plataforma completa de gerenciamento de mídias sociais com 35+ features profissionais

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](/)
[![Mobile First](https://img.shields.io/badge/Mobile-First-orange)](/)

---

## ✨ Features Principais

### 🔐 Autenticação & Segurança
- ✅ Login separado Admin/Cliente
- ✅ Middleware de proteção de rotas
- ✅ Row Level Security em todas as tabelas
- ✅ Sessões seguras com Supabase Auth

### 📅 Calendário Inteligente
- ✅ Visualização mensal e semanal
- ✅ Drag & drop de posts (admin)
- ✅ Dots/badges no mobile (cliente)
- ✅ Special dates integradas
- ✅ Cores personalizadas por cliente
- ✅ Mobile-first responsive

### 📝 Gerenciamento de Posts
- ✅ Criar, editar, aprovar, reprovar
- ✅ 4 tipos de mídia (FOTO, REELS, CARROSSEL, STORY)
- ✅ Múltiplas plataformas (Instagram, Facebook)
- ✅ Preview realista IG/FB
- ✅ Templates de legenda reutilizáveis
- ✅ Hashtag manager com sugestões
- ✅ Auto-save de rascunhos
- ✅ Bulk actions (ações em massa)
- ✅ Comentários em tempo real
- ✅ Log de alterações com diff

### 💬 Insights & Ideias
- ✅ Sistema completo de insights
- ✅ Cliente pode criar/editar/deletar
- ✅ Admin pode comentar
- ✅ Notificações automáticas
- ✅ Aba dedicada

### 🎨 Personalização
- ✅ Temas Claro/Escuro/Auto
- ✅ Cores customizáveis por cliente
- ✅ Perfil admin editável
- ✅ Upload de fotos

### 📱 Mobile & PWA
- ✅ Instalável como app nativo
- ✅ Funciona offline
- ✅ Push notifications ready
- ✅ Bottom sheets mobile
- ✅ Swipe gestures
- ✅ Touch optimized

### 🔍 Filtros & Busca
- ✅ Filtros avançados
- ✅ Busca em legendas
- ✅ Filtro por plataforma
- ✅ Filtro por tipo de mídia
- ✅ Filtro por status
- ✅ Range de datas
- ✅ Filtros colapsáveis

### ⚡ Performance
- ✅ Skeleton loading profissional
- ✅ Lazy loading de imagens
- ✅ Realtime updates
- ✅ Optimistic UI
- ✅ Cache inteligente

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling system
- **Zustand** - State management
- **DayJS** - Date manipulation
- **Lucide Icons** - Icon system

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Realtime subscriptions
  - Row Level Security

### PWA
- **Service Worker** - Offline support
- **Web Manifest** - Install prompt
- **Push API** - Notifications

---

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
npm install @supabase/auth-helpers-nextjs
```

### 2. Configurar Environment Variables

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Executar Migrations SQL

No Supabase SQL Editor, execute na ordem:

```bash
1. clients_table_UPDATE.sql
2. admin_profiles_table.sql
3. special_dates_table.sql
4. insights_table.sql
5. notifications_table.sql
6. caption_templates_table.sql
7. post_comments_table.sql
8. drafts_table.sql
9. hashtag_groups_table.sql
```

### 4. Substituir Arquivos

```bash
mv src/app/admin/page.tsx src/app/admin/page_OLD.tsx
mv src/app/admin/page_NEW.tsx src/app/admin/page.tsx
```

### 5. Rodar

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 📖 Documentação

- **[ATIVAR_AGORA.md](./ATIVAR_AGORA.md)** - Guia rápido 5min
- **[TUDO_IMPLEMENTADO.md](./TUDO_IMPLEMENTADO.md)** - Lista completa
- **[FEATURES_IMPLEMENTED.md](./FEATURES_IMPLEMENTED.md)** - Detalhes técnicos
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy produção
- **[CHANGELOG_FINAL.md](./CHANGELOG_FINAL.md)** - Histórico de mudanças

---

## 🎯 Casos de Uso

### Para Agências
- Gerenciar múltiplos clientes
- Aprovar posts em massa
- Filtros por cliente
- Cores de identificação
- Relatórios e insights

### Para Criadores de Conteúdo
- Templates de legenda
- Hashtags otimizadas
- Preview antes de publicar
- Auto-save proteção
- Calendário visual

### Para Clientes
- Aprovar/reprovar posts
- Visualizar agendamentos
- Adicionar insights/ideias
- Ver datas especiais
- App mobile instalável

---

## 🏆 Diferenciais

| Feature | Este App | Concorrentes |
|---------|----------|--------------|
| PWA Instalável | ✅ | Raro |
| Cores Customizáveis | ✅ | ❌ |
| Bulk Actions | ✅ | Parcial |
| Special Dates | ✅ | ❌ |
| Templates | ✅ | Parcial |
| Preview IG/FB | ✅ | ❌ |
| Auto-save | ✅ | Raro |
| Video Player | ✅ | ❌ |
| Comentários Realtime | ✅ | ❌ |
| Filtros Avançados | ✅ | Parcial |

**= LÍDER DE MERCADO! 🥇**

---

## 🔒 Segurança

- ✅ Autenticação Supabase
- ✅ Row Level Security
- ✅ Protected routes (middleware)
- ✅ Session management
- ✅ SQL injection protection
- ✅ XSS protection
- ✅ CSRF protection

---

## 📊 Performance

- ⚡ Skeleton loading
- ⚡ Lazy loading
- ⚡ Optimistic UI
- ⚡ Realtime updates
- ⚡ Service worker cache
- ⚡ Image optimization

---

## 🎨 Design System

- **Colors:** Customizáveis por cliente
- **Typography:** Inter font
- **Icons:** Lucide (1000+ ícones)
- **Animations:** Custom keyframes
- **Spacing:** Tailwind scale
- **Breakpoints:** Mobile-first

---

## 🔄 Roadmap v3.0

### Em Desenvolvimento
- [ ] Instagram Graph API integration
- [ ] Facebook Graph API integration
- [ ] Publicação automática
- [ ] Analytics dashboard
- [ ] AI caption suggestions
- [ ] Multi-platform (TikTok, LinkedIn)

### Planejado
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Content calendar templates
- [ ] Team management
- [ ] API pública

---

## 🤝 Contribuindo

Este é um projeto privado, mas sugestões são bem-vindas!

---

## 📄 Licença

Proprietary - Todos os direitos reservados

---

## 🎉 Versão 2.0 Highlights

**35+ features implementadas!**

- 🔐 Autenticação completa
- 🎨 Design redesenhado
- 📱 PWA instalável
- 🎯 Filtros avançados
- 💬 Sistema de comentários
- 📝 Templates & hashtags
- 🎥 Video player
- 🌈 Cores customizáveis
- ⚡ Performance otimizada

**E MUITO MAIS!**

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
vercel --prod
```

### Configuração Supabase

1. Criar projeto no Supabase
2. Executar migrations SQL
3. Configurar Storage bucket
4. Habilitar Realtime
5. Configurar env variables

### SSL & Domínio

- SSL automático via Vercel
- Custom domain suportado
- PWA requer HTTPS!

---

## 📞 Suporte

- 📚 **Documentação:** Ver pasta de docs
- 💬 **Issues:** GitHub issues (se aplicável)
- 📧 **Email:** contato@seusite.com

---

## 🌟 Star o Projeto!

Se gostou do projeto, dê uma ⭐!

---

**Transformando a maneira de gerenciar mídias sociais! 🚀**

---

## 📸 Screenshots

(Adicione screenshots aqui)

---

## 🎓 Como Usar

### Admin
1. Login em `/login/admin`
2. Dashboard → Ver todos posts
3. Criar post → Agendar
4. Configurações → Gerenciar clientes
5. Filtros → Organizar por cliente

### Cliente  
1. Login em `/login/client`
2. Dashboard → Ver posts para aprovar
3. Calendário → Ver agendamentos
4. Insights → Compartilhar ideias
5. Aprovar/Reprovar posts

---

**Feito com ❤️ e muito código!**

