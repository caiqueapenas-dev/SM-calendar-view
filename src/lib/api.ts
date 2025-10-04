import { Post, PostMediaType } from "./types";

const API_VERSION = "v23.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

async function fetchApi(endpoint: string) {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API Error on endpoint ${endpoint}:`, errorData);
      throw new Error(
        errorData.error.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return null; // Retorna nulo em caso de erro para não quebrar a aplicação
  }
}

export async function getClientProfilePicture(
  pageId: string,
  accessToken: string
): Promise<string | null> {
  const data = await fetchApi(
    `${pageId}?fields=picture.type(large)&access_token=${accessToken}`
  );
  return data?.picture?.data?.url || null;
}

export async function fetchAllClientData(client: {
  id: string;
  access_token: string;
}): Promise<Post[]> {
  const { id: pageId, access_token } = client;

  const igAccountData = await fetchApi(
    `${pageId}?fields=instagram_business_account&access_token=${access_token}`
  );
  const igAccountId = igAccountData?.instagram_business_account?.id;

  // Campos para buscar
  const fbPostFields =
    "id,message,created_time,scheduled_publish_time,full_picture,permalink_url,type,attachments{subattachments}";
  const fbStoryFields = "id,created_time,attachments{media,type}";
  const igMediaFields =
    "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,children{media_url}";
  const igStoryFields =
    "id,caption,media_type,media_url,timestamp,thumbnail_url";

  // Promises para todas as chamadas
  const promises = [
    fetchApi(
      `${pageId}/published_posts?limit=50&access_token=${access_token}&fields=${fbPostFields}`
    ),
    fetchApi(
      `${pageId}/scheduled_posts?limit=50&access_token=${access_token}&fields=${fbPostFields}`
    ),
    fetchApi(
      `${pageId}/stories?limit=50&access_token=${access_token}&fields=${fbStoryFields}`
    ),
    igAccountId
      ? fetchApi(
          `${igAccountId}/media?limit=50&access_token=${access_token}&fields=${igMediaFields}`
        )
      : Promise.resolve(null),
    igAccountId
      ? fetchApi(
          `${igAccountId}/stories?limit=50&access_token=${access_token}&fields=${igStoryFields}`
        )
      : Promise.resolve(null),
  ];

  const [
    fbPublishedResult,
    fbScheduledResult,
    fbStoriesResult,
    igMediaResult,
    igStoriesResult,
  ] = await Promise.all(promises);

  const normalizedPosts: Post[] = [];

  // Normalizar Posts do Facebook
  (fbPublishedResult?.data || []).forEach((p: any) => {
    let media_type: PostMediaType = "FOTO";
    if (p.type === "video") media_type = "REELS";
    if (p.attachments?.data?.[0]?.subattachments) media_type = "CARROSSEL";
    normalizedPosts.push({
      id: p.id,
      platform: "facebook",
      caption: p.message,
      timestamp: p.created_time,
      media_url: p.full_picture,
      status: "published",
      media_type,
      permalink_url: p.permalink_url,
      clientId: pageId,
    });
  });

  // Normalizar Posts Agendados do Facebook
  (fbScheduledResult?.data || []).forEach((p: any) => {
    let media_type: PostMediaType = "FOTO";
    if (p.type === "video") media_type = "REELS";
    if (p.attachments?.data?.[0]?.subattachments) media_type = "CARROSSEL";
    normalizedPosts.push({
      id: p.id,
      platform: "facebook",
      caption: p.message,
      timestamp: p.scheduled_publish_time,
      media_url: p.full_picture,
      status: "scheduled",
      media_type,
      clientId: pageId,
    });
  });

  // Normalizar Mídia do Instagram
  (igMediaResult?.data || []).forEach((m: any) => {
    let media_type: PostMediaType = "FOTO";
    if (m.media_type === "VIDEO") media_type = "REELS";
    if (m.media_type === "CAROUSEL_ALBUM") media_type = "CARROSSEL";
    normalizedPosts.push({
      id: m.id,
      platform: "instagram",
      caption: m.caption,
      timestamp: m.timestamp,
      media_url: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
      thumbnail_url: m.thumbnail_url,
      status: "published",
      media_type,
      permalink_url: m.permalink,
      children: m.children?.data,
      clientId: pageId,
    });
  });

  // Normalizar Stories do Instagram
  (igStoriesResult?.data || []).forEach((s: any) => {
    normalizedPosts.push({
      id: s.id,
      platform: "instagram",
      caption: s.caption,
      timestamp: s.timestamp,
      media_url: s.media_type === "VIDEO" ? s.thumbnail_url : s.media_url,
      thumbnail_url: s.thumbnail_url,
      status: "published",
      media_type: "STORY",
      clientId: pageId,
    });
  });

  return normalizedPosts;
}
