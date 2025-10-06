export type PostMediaType = "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";

export interface EditHistoryItem {
  oldCaption: string;
  newCaption: string;
  timestamp: string;
}

export interface SimulatedPost {
  id: string;
  clientId: string;
  caption: string;
  mediaUrl: string;
  scheduledAt: string; // ISO string
  media_type: PostMediaType;
  platforms: ("instagram" | "facebook")[];
  status: "scheduled" | "published";
  approvalStatus: "pending" | "approved" | "rejected";
  editHistory: EditHistoryItem[];
  // Legacy flag used during creation; kept for compatibility
  isApproved?: boolean;
}

export interface Post {
  id: string;
  caption: string | null;
  timestamp: string;
  media_url: string;
  thumbnail_url?: string;
  status: "published" | "scheduled";
  media_type: PostMediaType;
  platforms: ("instagram" | "facebook")[];
  clientId: string;
  client?: Client;
  approvalStatus: "pending" | "approved" | "rejected";
  editHistory: EditHistoryItem[];
  children?: { id: string; media_url: string }[];
  permalink?: string;
}

export interface Client {
  id: string;
  name: string;
  customName?: string;
  access_token: string;
  profile_picture_url?: string;
  isVisible: boolean;
}
