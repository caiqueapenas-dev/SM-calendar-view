// A interface Client foi removida daqui.
// Usaremos os tipos gerados pelo Supabase diretamente.

export type PostMediaType = "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";
export type PostStatus = "aguardando_aprovacao" | "agendado" | "negado";
export type UserRole = "admin" | "client";

export interface EditHistoryItem {
  author: UserRole;
  oldCaption: string;
  newCaption: string;
  timestamp: string;
}
