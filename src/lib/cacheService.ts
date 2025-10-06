import { supabase } from "../lib/supabaseClient";
import { Database } from "./database.types";

const CACHE_TTL_MINUTES = 15;

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface CachedPost {
  id: string;
  client_id: string;
  post_id: string;
  media_type: string;
  media_url: string | null;
  caption: string | null;
  timestamp: string;
  permalink: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

// Define a Post interface that matches the expected structure
interface Post {
  id: string;
  platform: string;
  caption: string | null;
  timestamp: string;
  media_url: string;
  thumbnail_url?: string;
  status: "published";
  media_type: "FOTO" | "VIDEO" | "CARROSSEL" | "STORY" | "REELS";
  clientId: string;
}

export async function getLastSyncTime(clientId: string): Promise<Date | null> {
  // Since client_sync_status table doesn't exist in the current schema,
  // we'll use a simple approach with localStorage or return null
  try {
    const lastSync = localStorage.getItem(`last_sync_${clientId}`);
    return lastSync ? new Date(lastSync) : null;
  } catch (error) {
    console.error("Error getting last sync time:", error);
    return null;
  }
}

export async function shouldSync(clientId: string): Promise<boolean> {
  const lastSync = await getLastSyncTime(clientId);

  if (!lastSync) {
    return true;
  }

  const now = new Date();
  const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);

  return diffMinutes >= CACHE_TTL_MINUTES;
}

export async function getCachedPosts(clientId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("client_id", clientId)
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("Error getting cached posts:", error);
    return [];
  }

  return (data || []).map((post: PostRow) => ({
    id: post.id,
    platform: "instagram", // Default platform
    caption: post.caption,
    timestamp: post.scheduled_at,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url || undefined,
    status: "published" as const,
    media_type: post.media_type as Post["media_type"],
    clientId: post.client_id,
  }));
}

export async function savePosts(
  clientId: string,
  posts: Post[]
): Promise<void> {
  const postsToInsert = posts.map((post) => ({
    client_id: clientId,
    media_type: post.media_type,
    media_url: post.media_url,
    caption: post.caption,
    scheduled_at: post.timestamp,
    thumbnail_url: post.thumbnail_url || null,
    status: "agendado",
    created_by: "system", // Default creator
    edit_history: [],
    platforms: ["instagram"], // Default platform
  }));

  const { error } = await supabase.from("posts").upsert(postsToInsert, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error saving posts:", error);
    throw error;
  }
}

export async function updateSyncStatus(clientId: string): Promise<void> {
  // Since client_sync_status table doesn't exist, use localStorage
  try {
    localStorage.setItem(`last_sync_${clientId}`, new Date().toISOString());
  } catch (error) {
    console.error("Error updating sync status:", error);
    throw error;
  }
}

export async function getPostsSince(
  clientId: string,
  since: Date
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("client_id", clientId)
    .gte("scheduled_at", since.toISOString())
    .order("scheduled_at", { ascending: false });

  if (error) {
    console.error("Error getting posts since:", error);
    return [];
  }

  return (data || []).map((post: PostRow) => ({
    id: post.id,
    platform: "instagram", // Default platform
    caption: post.caption,
    timestamp: post.scheduled_at,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url || undefined,
    status: "published" as const,
    media_type: post.media_type as Post["media_type"],
    clientId: post.client_id,
  }));
}

export async function clearClientCache(clientId: string): Promise<void> {
  const { error: postsError } = await supabase
    .from("posts")
    .delete()
    .eq("client_id", clientId);

  // Clear localStorage sync status
  try {
    localStorage.removeItem(`last_sync_${clientId}`);
  } catch (error) {
    console.error("Error clearing sync status from localStorage:", error);
  }

  if (postsError) {
    console.error("Error clearing posts cache:", postsError);
  }
}
