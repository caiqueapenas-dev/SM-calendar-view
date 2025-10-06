export type PostMediaType = "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";
export type PostStatus = "aguardando_aprovacao" | "agendado" | "negado";
export type UserRole = "admin" | "client";

export interface EditHistoryItem {
  author: UserRole;
  oldCaption: string;
  newCaption: string;
  timestamp: string; // ISO string
}

export interface Post {
  id: string; // uuid
  clientId: string;
  platforms: ("instagram" | "facebook")[];
  mediaType: PostMediaType;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  caption: string;
  scheduledAt: string; // ISO string with timezone
  status: PostStatus;
  createdBy: UserRole;
  updatedAt: string; // ISO string
  createdAt: string; // ISO string
  editHistory: EditHistoryItem[];
}

export interface Client {
  id: string;
  name: string;
  customName?: string;
  access_token: string;
  profile_picture_url?: string;
  isVisible: boolean;
}
