# 🚀 Quick Start - Ativando Todas as Features

## 1️⃣ Executar Migrations SQL

```bash
# Execute na ordem:
psql -d your_database < caption_templates_table.sql
psql -d your_database < post_comments_table.sql
psql -d your_database < drafts_table.sql
psql -d your_database < hashtag_groups_table.sql

# Já existentes (se ainda não executados):
psql -d your_database < insights_table.sql
psql -d your_database < notifications_table.sql
```

## 2️⃣ Criar Ícones PWA

Crie estes arquivos na pasta `public/`:

- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px
- `screenshot1.png` - 1280x720px (desktop)
- `screenshot2.png` - 750x1334px (mobile)

**Dica:** Use uma ferramenta como https://realfavicongenerator.net/

## 3️⃣ Atualizar Layout Principal

```tsx
// src/app/layout.tsx
import { ToastProvider } from "@/components/common/Toast";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ToastProvider>
          <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
```

## 4️⃣ Adicionar Theme Switcher

```tsx
// Em AdminLayout.tsx ou ClientLayout.tsx
import ThemeSwitcher from "@/components/common/ThemeSwitcher";

// No header:
<header>
  {/* ... */}
  <ThemeSwitcher />
  {/* ... */}
</header>
```

## 5️⃣ Integrar em CreatePostModal

```tsx
import CaptionTemplates from "@/components/templates/CaptionTemplates";
import PostPreview from "@/components/preview/PostPreview";
import HashtagManager from "@/components/hashtags/HashtagManager";
import { useAutoSave, loadDraft } from "@/hooks/useAutoSave";
import { useToast } from "@/components/common/Toast";

export default function CreatePostModal() {
  const { showToast } = useToast();
  
  // Auto-save
  useAutoSave({
    key: `create-post-${clientId}`,
    data: { caption, mediaUrl, mediaType },
    userId: user?.id
  });

  // Carregar rascunho ao abrir
  useEffect(() => {
    const loadSavedDraft = async () => {
      const draft = await loadDraft(`create-post-${clientId}`, user?.id);
      if (draft) {
        setCaption(draft.caption);
        // ... outros campos
        showToast("info", "Rascunho carregado");
      }
    };
    loadSavedDraft();
  }, []);

  return (
    <Modal>
      {/* Aba de Templates */}
      <CaptionTemplates
        clientId={clientId}
        onSelectTemplate={(content) => setCaption(content)}
      />

      {/* Aba de Hashtags */}
      <HashtagManager
        clientId={clientId}
        onInsertHashtags={(tags) => setCaption(prev => prev + " " + tags)}
      />

      {/* Preview */}
      <PostPreview
        caption={caption}
        mediaUrl={mediaUrl}
        mediaType={mediaType}
        platforms={platforms}
        clientName={clientName}
        scheduledAt={scheduledAt}
      />
    </Modal>
  );
}
```

## 6️⃣ Adicionar Comentários em PostModal

```tsx
import PostComments from "@/components/comments/PostComments";

// No final do PostModal:
<div className="border-t border-gray-700 pt-4">
  <PostComments postId={post.id} />
</div>
```

## 7️⃣ Filtros e Bulk Actions no Admin

```tsx
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import BulkActions from "@/components/bulk/BulkActions";
import { useState } from "react";

export default function AdminDashboard() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    platforms: [],
    mediaTypes: [],
    statuses: [],
    dateRange: null,
  });

  // Aplicar filtros
  const filteredPosts = posts.filter(post => {
    if (filters.search && !post.caption?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.platforms.length && !filters.platforms.some(p => post.platforms?.includes(p))) {
      return false;
    }
    // ... outros filtros
    return true;
  });

  return (
    <>
      <div className="flex justify-between mb-4">
        <h1>Dashboard</h1>
        <AdvancedFilters onFilterChange={setFilters} />
      </div>

      <BulkActions
        posts={filteredPosts}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onActionComplete={() => fetchPosts()}
      />

      <CalendarView posts={filteredPosts} />
    </>
  );
}
```

## 8️⃣ Usar Skeletons

Substitua todos os spinners de loading:

```tsx
// Antes:
{isLoading && <Loader className="animate-spin" />}

// Depois:
import { CalendarGridSkeleton, PostCardSkeleton } from "@/components/common/Skeleton";

{isLoading ? (
  <CalendarGridSkeleton />
) : (
  <CalendarView />
)}
```

## 9️⃣ Bottom Sheet para Mobile

Em modais que devem ser bottom sheet no mobile:

```tsx
import { useState } from "react";
import BottomSheet from "@/components/common/BottomSheet";
import Modal from "@/components/common/Modal";

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Detalhes"
      >
        {/* Conteúdo */}
      </BottomSheet>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {/* Conteúdo */}
    </Modal>
  );
}
```

## 🔟 Usar Toast Notifications

Em qualquer ação importante:

```tsx
import { useToast } from "@/components/common/Toast";

const { showToast } = useToast();

// Success
showToast("success", "Post criado com sucesso!");

// Error
showToast("error", "Erro ao salvar post");

// Warning
showToast("warning", "Verifique os campos obrigatórios");

// Info
showToast("info", "Rascunho salvo automaticamente");
```

## ✅ Checklist de Ativação

- [ ] SQL migrations executadas
- [ ] Ícones PWA criados
- [ ] ToastProvider adicionado no layout
- [ ] ThemeSwitcher no header
- [ ] Templates integrados em CreatePost
- [ ] Hashtags integrados em CreatePost
- [ ] Preview integrado em CreatePost
- [ ] Auto-save ativo em CreatePost
- [ ] Comentários em PostModal
- [ ] Filtros no Admin
- [ ] Bulk Actions no Admin
- [ ] Skeletons substituindo loaders
- [ ] Toast em ações importantes
- [ ] Bottom Sheet em modais mobile
- [ ] Teste PWA (instalar app)
- [ ] Teste tema claro/escuro

## 🎉 Pronto!

Agora você tem um app COMPLETO com todas as features modernas! 🚀

### Teste PWA:
1. Abra o app no Chrome mobile
2. Menu > "Instalar app" ou "Adicionar à tela inicial"
3. Use como app nativo!

### Teste Features:
- Crie um template de legenda
- Teste o preview de posts
- Use o auto-save (feche e abra o modal)
- Adicione comentários
- Teste filtros avançados
- Selecione múltiplos posts
- Mude o tema
- Veja as notificações toast

**Tudo funcionando? SUCESSO! 🎊**

