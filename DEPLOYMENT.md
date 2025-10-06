# 🚀 Guia de Deploy - Social Media Planner PWA

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL (via Supabase)
- Conta Vercel (recomendado)
- Domínio (para PWA funcionar corretamente)

---

## 1️⃣ Configurar Database (Supabase)

### Execute as Migrations

```sql
-- Em ordem:
\i insights_table.sql
\i notifications_table.sql
\i caption_templates_table.sql
\i post_comments_table.sql
\i drafts_table.sql
\i hashtag_groups_table.sql
```

### Habilitar Realtime

```sql
-- Para post_comments (comentários em tempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
```

### Configurar Storage (se ainda não)

```sql
-- Bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts-media', 'posts-media', true);

-- Policy para upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts-media');
```

---

## 2️⃣ Variáveis de Ambiente

Crie `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PWA (para production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
```

---

## 3️⃣ Build e Teste Local

```bash
# Install dependencies
npm install

# Build
npm run build

# Test production build
npm run start

# Teste em: http://localhost:3000
```

### Checklist de Teste
- [ ] Login funciona
- [ ] Criar post
- [ ] Auto-save funciona
- [ ] Templates funcionam
- [ ] Hashtags funcionam
- [ ] Preview funciona
- [ ] Comentários em tempo real
- [ ] Bulk actions funcionam
- [ ] Filtros funcionam
- [ ] PWA manifest carrega
- [ ] Service Worker registra
- [ ] Toast notifications aparecem
- [ ] Temas funcionam

---

## 4️⃣ Deploy na Vercel

### Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Via Dashboard

1. Conecte seu repositório GitHub
2. Configure as env variables
3. Deploy automático

**Framework Preset:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next`

---

## 5️⃣ Configurar PWA

### Headers (vercel.json)

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

### Gerar Ícones PWA

Use: https://realfavicongenerator.net/

Ou crie manualmente:
- `public/icon-192.png` (192x192)
- `public/icon-512.png` (512x512)
- `public/apple-touch-icon.png` (180x180)
- `public/favicon.ico`

---

## 6️⃣ SSL e Domínio

### Vercel (Automático)
- SSL gratuito via Let's Encrypt
- Certificado renova automaticamente

### Custom Domain
1. Adicione domínio no Vercel dashboard
2. Configure DNS (A ou CNAME record)
3. Aguarde propagação (~24h)

**Importante:** PWA requer HTTPS!

---

## 7️⃣ Configurar Push Notifications

### Gerar VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### Adicionar ao Supabase

```sql
-- Criar tabela de subscriptions
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Environment Variables

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

---

## 8️⃣ Performance Optimization

### Next.js Config

```js
// next.config.mjs
const nextConfig = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### Compressão

Vercel já inclui:
- Gzip/Brotli compression
- Edge caching
- Image optimization

---

## 9️⃣ Monitoring e Analytics

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

<body>
  {children}
  <Analytics />
</body>
```

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```js
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

---

## 🔟 Backup e Recovery

### Database Backup (Supabase)

```bash
# Automated backups (included in Supabase Pro)
# Manual backup:
pg_dump -h db.xxx.supabase.co -U postgres your_db > backup.sql
```

### Code Backup

- GitHub repository (main backup)
- Vercel deployments (automatic)
- Local backups

---

## 📱 Teste PWA

### Chrome DevTools

1. Open DevTools
2. Application tab
3. Manifest: verificar configuração
4. Service Workers: verificar registro
5. Cache Storage: verificar assets

### Lighthouse Audit

```bash
npm install -g lighthouse

lighthouse https://yourdomain.com --view
```

**Targets:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- PWA: 100

---

## 🚨 Troubleshooting

### Service Worker não registra
```js
// Check console for errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('SW Registrations:', registrations);
  });
}
```

### PWA não instala
- Verificar HTTPS
- Verificar manifest.json
- Verificar ícones (192px e 512px)
- Verificar start_url

### Realtime não funciona
```sql
-- Verificar política do Supabase
SELECT * FROM pg_policies WHERE tablename = 'post_comments';
```

### Cache issues
```js
// Clear service worker cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});
```

---

## 🎉 Deploy Checklist Final

- [ ] Database migrations executadas
- [ ] Realtime habilitado
- [ ] Environment variables configuradas
- [ ] Build local funciona
- [ ] Deploy na Vercel realizado
- [ ] Domínio customizado configurado
- [ ] SSL ativo (HTTPS)
- [ ] PWA manifest carrega
- [ ] Service worker registra
- [ ] Push notifications configuradas (opcional)
- [ ] Analytics configurado
- [ ] Error tracking ativo
- [ ] Lighthouse score 90+
- [ ] Teste em mobile
- [ ] Teste instalação PWA
- [ ] Teste offline mode

---

## 🚀 Go Live!

```bash
# Final deploy
vercel --prod

# Verificar
curl -I https://yourdomain.com

# Teste PWA
# Chrome: chrome://flags/#enable-pwa
# Mobile: "Adicionar à tela inicial"
```

**🎊 SUCESSO! Seu app está no ar!**

---

## 📞 Suporte

### Recursos
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [PWA Docs](https://web.dev/progressive-web-apps/)

### Comunidade
- [Next.js Discord](https://nextjs.org/discord)
- [Supabase Discord](https://discord.supabase.com)

---

**Deploy com confiança! 🚀**

