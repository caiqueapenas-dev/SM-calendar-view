// ==============================
// Tipos globais da aplicação
// ==============================

export type UserRole = "admin" | "client";

// ==============================
// Histórico de Edição
// ==============================
export interface EditHistoryItem {
  author: UserRole;
  oldCaption: string;
  newCaption: string;
  timestamp: string; // ISO string
}

// ==============================
// Tipos de Mídia e Status de Post
// ==============================
export type PostMediaType = "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";
export type PostStatus = "aguardando_aprovacao" | "agendado" | "negado";

// ==============================
// Estrutura principal do Post
// ==============================
export interface Post {
  id: string; // uuid
  clientId: string;
  platforms: ("instagram" | "facebook")[];
  mediaType: PostMediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  caption: string;
  scheduledAt: string; // ISO string com timezone
  status: PostStatus;
  createdBy: UserRole;
  updatedAt: string; // ISO string
  createdAt: string; // ISO string
  editHistory: EditHistoryItem[];
}

// ==============================
// Estrutura do Cliente
// ==============================
export interface Client {
  id: string;
  name: string;
  customName?: string;
  access_token: string;
  profile_picture_url?: string;
  isVisible: boolean;
}
