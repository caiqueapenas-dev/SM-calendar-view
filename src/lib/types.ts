export interface Post {
  id: string;
  platform: "instagram" | "facebook";
  caption: string | null;
  timestamp: string;
  media_url: string;
  thumbnail_url?: string;
  status: "published" | "scheduled";
  media_type: "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";
  client: Client;
  isApproved?: boolean;
  editHistory?: EditHistoryItem[];
  children?: { id: string; media_url: string }[];
  permalink?: string;
}

export interface EditHistoryItem {
  oldCaption: string;
  newCaption: string;
  timestamp: string;
}

export interface SimulatedPost {
  id: string;
  clientId: string;
  mediaUrl: string;
  caption: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  media_type: "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";
  isApproved: boolean;
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
