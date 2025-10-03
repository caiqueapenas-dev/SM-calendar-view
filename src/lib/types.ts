export interface Client {
  access_token: string;
  category: string;
  name: string;
  id: string;
  profile_picture_url?: string;
  customName?: string;
  isVisible?: boolean;
}

export type PostMediaType = "FOTO" | "REELS" | "CARROSSEL" | "STORY" | "VIDEO";

export interface Post {
  id: string;
  platform: "facebook" | "instagram";
  caption: string | null;
  timestamp: string;
  media_url: string;
  thumbnail_url?: string;
  status: "published" | "scheduled";
  media_type: PostMediaType;
  permalink_url?: string;
  children?: { id: string; media_url: string }[];
  clientId?: string;
}

export interface SimulatedPost {
  id: string;
  clientId: string;
  mediaUrl: string;
  caption: string;
  scheduledAt: string; // ISO string
  status: "scheduled" | "published";
  media_type: PostMediaType;
}
