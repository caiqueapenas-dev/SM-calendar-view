import { supabase } from "../lib/supabaseClient";
import { Post } from "@/lib/types";

const CACHE_TTL_MINUTES = 15;

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

export async function getLastSyncTime(clientId: string): Promise<Date | null> {
  const { data, error } = await supabase
    .from("client_sync_status")
    .select("last_sync_at")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) {
    console.error("Error getting last sync time:", error);
    return null;
  }

  return data ? new Date(data.last_sync_at) : null;
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
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error getting cached posts:", error);
    return [];
  }

  return (data || []).map((post: CachedPost) => ({
    id: post.post_id,
    platform: post.raw_data?.platform || "instagram",
    caption: post.caption,
    timestamp: post.timestamp,
    media_url: post.media_url || "",
    thumbnail_url: post.raw_data?.thumbnail_url,
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
    post_id: post.id,
    media_type: post.media_type,
    media_url: post.media_url || null,
    caption: post.caption || null,
    timestamp: post.timestamp,
    permalink: post.media_url || null,
    raw_data: post,
  }));

  const { error } = await supabase.from("posts").upsert(postsToInsert, {
    onConflict: "client_id,post_id",
    ignoreDuplicates: false,
  });

  if (error) {
    console.error("Error saving posts:", error);
    throw error;
  }
}

export async function updateSyncStatus(clientId: string): Promise<void> {
  const { error } = await supabase.from("client_sync_status").upsert(
    {
      client_id: clientId,
      last_sync_at: new Date().toISOString(),
    },
    {
      onConflict: "client_id",
    }
  );

  if (error) {
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
    .gte("timestamp", since.toISOString())
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error getting posts since:", error);
    return [];
  }

  return (data || []).map((post: CachedPost) => ({
    id: post.post_id,
    platform: post.raw_data?.platform || "instagram",
    caption: post.caption,
    timestamp: post.timestamp,
    media_url: post.media_url || "",
    thumbnail_url: post.raw_data?.thumbnail_url,
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

  const { error: syncError } = await supabase
    .from("client_sync_status")
    .delete()
    .eq("client_id", clientId);

  if (postsError) {
    console.error("Error clearing posts cache:", postsError);
  }
  if (syncError) {
    console.error("Error clearing sync status:", syncError);
  }
}
