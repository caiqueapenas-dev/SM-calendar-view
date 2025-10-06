import { Client, Post } from "./types";
import dayjs from "dayjs";

const API_VERSION = "v23.0";

async function fetchApi(endpoint: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${endpoint}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    if (error instanceof Error) {
      alert(`Erro ao buscar dados da API: ${error.message}`);
    } else {
      alert("Ocorreu um erro desconhecido na API.");
    }
    return null;
  }
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const data = await fetchApi(
    `${clientId}?fields=id,name,access_token,picture.type(large),instagram_business_account{profile_picture_url}`
  );
  if (data) {
    return {
      id: data.id,
      name: data.name,
      access_token: data.access_token,
      profile_picture_url:
        data.instagram_business_account?.profile_picture_url ||
        data.picture?.data?.url,
      isVisible: true,
    };
  }
  return null;
}

export async function fetchClientPosts(client: Client): Promise<Post[]> {
  const { id: pageId, access_token } = client;

  const igAccountData = await fetchApi(
    `${pageId}?fields=instagram_business_account{id}&access_token=${access_token}`
  );
  const igAccountId = igAccountData?.instagram_business_account?.id;

  const fbFields =
    "id,message,created_time,scheduled_publish_time,permalink_url,type,full_picture";
  const fbPublishedPromise = fetchApi(
    `${pageId}/published_posts?access_token=${access_token}&fields=${fbFields}&limit=50`
  );
  const fbScheduledPromise = fetchApi(
    `${pageId}/scheduled_posts?access_token=${access_token}&fields=${fbFields}`
  );
  const fbStoriesPromise = fetchApi(
    `${pageId}/stories?access_token=${access_token}&fields=id,created_time,full_picture`
  );

  let igPromise: Promise<any> = Promise.resolve(null);
  let igStoriesPromise: Promise<any> = Promise.resolve(null);

  if (igAccountId) {
    const igFields =
      "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,children{media_url,media_type,thumbnail_url}";
    igPromise = fetchApi(
      `${igAccountId}/media?access_token=${access_token}&fields=${igFields}&limit=50`
    );
    igStoriesPromise = fetchApi(
      `${igAccountId}/stories?access_token=${access_token}&fields=id,caption,media_type,media_url,timestamp,thumbnail_url`
    );
  }

  const [
    fbPublishedResult,
    fbScheduledResult,
    igResult,
    fbStoriesResult,
    igStoriesResult,
  ] = await Promise.all([
    fbPublishedPromise,
    fbScheduledPromise,
    igPromise,
    fbStoriesPromise,
    igStoriesPromise,
  ]);

  const postMap = new Map<string, Post>();

  const getPostKey = (timestamp: string, caption?: string | null): string => {
    const date = dayjs(timestamp).format("YYYY-MM-DD HH:mm");
    const captionPart = (caption || "").substring(0, 50).trim();
    return `${date}:${captionPart}`;
  };

  (igResult?.data || []).forEach((m: any) => {
    let media_type: Post["media_type"] = "FOTO";
    if (m.media_type === "VIDEO") media_type = "REELS";
    if (m.media_type === "CAROUSEL_ALBUM") media_type = "CARROSSEL";

    const post: Post = {
      id: m.id,
      platform: "instagram",
      caption: m.caption,
      timestamp: m.timestamp,
      media_url: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
      thumbnail_url: m.thumbnail_url,
      status: "published",
      media_type: media_type,
      permalink: m.permalink,
      children: m.children?.data?.map((child: any) => ({
        ...child,
        media_url:
          child.media_type === "VIDEO" ? child.thumbnail_url : child.media_url,
      })),
      client,
    };
    const key = getPostKey(post.timestamp, post.caption);
    if (!postMap.has(key)) {
      postMap.set(key, post);
    }
  });

  (fbPublishedResult?.data || []).forEach((p: any) => {
    const key = getPostKey(p.created_time, p.message);
    if (postMap.has(key)) return;

    let media_type: Post["media_type"] = "FOTO";
    if (p.type === "album") {
      media_type = "CARROSSEL";
    } else if (p.type === "video") {
      media_type = "REELS";
    }

    const imageUrl = p.full_picture;

    const post: Post = {
      id: p.id,
      platform: "facebook",
      caption: p.message,
      timestamp: p.created_time,
      media_url: imageUrl,
      thumbnail_url: imageUrl,
      status: "published",
      media_type: media_type,
      permalink: p.permalink_url,
      children: undefined, // Simplified - no longer using subattachments
      client,
    };
    postMap.set(key, post);
  });

  (fbScheduledResult?.data || []).forEach((p: any) => {
    let media_type: Post["media_type"] = "FOTO";
    if (p.type === "album") {
      media_type = "CARROSSEL";
    } else if (p.type === "video") {
      media_type = "REELS";
    }

    const imageUrl = p.full_picture;

    const post: Post = {
      id: p.id,
      platform: "facebook",
      caption: p.message,
      timestamp: p.scheduled_publish_time,
      media_url: imageUrl,
      thumbnail_url: imageUrl,
      status: "scheduled",
      media_type: media_type,
      permalink: p.permalink_url,
      client,
    };
    postMap.set(`scheduled-${p.id}`, post);
  });

  const thirtyDaysAgo = dayjs().subtract(30, "day");

  (fbStoriesResult?.data || []).forEach((s: any) => {
    if (
      dayjs(s.created_time).isAfter(thirtyDaysAgo) &&
      s.full_picture
    ) {
      const post: Post = {
        id: s.id,
        platform: "facebook",
        caption: null,
        timestamp: s.created_time,
        media_url: s.full_picture,
        thumbnail_url: s.full_picture,
        status: "published",
        media_type: "STORY",
        permalink: `https://www.facebook.com/stories/${
          s.id.split("_")[1]
        }/?view_single=1&source=page_posts_tab`,
        client,
      };
      postMap.set(`story-${s.id}`, post);
    }
  });

  (igStoriesResult?.data || []).forEach((s: any) => {
    if (dayjs(s.timestamp).isAfter(thirtyDaysAgo)) {
      const post: Post = {
        id: s.id,
        platform: "instagram",
        caption: s.caption,
        timestamp: s.timestamp,
        media_url: s.media_type === "VIDEO" ? s.thumbnail_url : s.media_url,
        thumbnail_url: s.thumbnail_url,
        status: "published",
        media_type: "STORY",
        permalink: `https://www.instagram.com/stories/highlights/${s.id}/`,
        client,
      };
      postMap.set(`story-${s.id}`, post);
    }
  });

  const allPosts = Array.from(postMap.values());

  return allPosts.sort((a, b) => dayjs(b.timestamp).diff(dayjs(a.timestamp)));
}

// Alias for fetchClientPosts to match admin page expectations
export async function fetchAllClientData(client: Client): Promise<Post[]> {
  return fetchClientPosts(client);
}

// Function to get client profile picture
export async function getClientProfilePicture(
  clientId: string,
  accessToken: string
): Promise<string | null> {
  try {
    const data = await fetchApi(
      `${clientId}?fields=picture.type(large),instagram_business_account{profile_picture_url}&access_token=${accessToken}`
    );
    
    if (data) {
      return (
        data.instagram_business_account?.profile_picture_url ||
        data.picture?.data?.url ||
        null
      );
    }
    return null;
  } catch (error) {
    console.error("Error fetching client profile picture:", error);
    return null;
  }
}
