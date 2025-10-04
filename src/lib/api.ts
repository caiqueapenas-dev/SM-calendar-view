import { Client, Post } from "@/lib/types";
import {
  shouldSync,
  getCachedPosts,
  savePosts,
  updateSyncStatus,
  getLastSyncTime,
  clearClientCache as clearSupabaseCache,
} from "@/lib/cacheService";

const API_VERSION = "v23.0";

const pendingRequests = new Map<string, Promise<Post[]>>();

export const initialClients: Omit<Client, "isVisible" | "customName">[] = [
  {
    access_token:
      "EAASCiZBZBPmPgBPhfV3vl4s99t0ryGTJeYQZApTaWWaKaMSt2z6R9mVVDUKnYwlWKpwX5H7ARrPBZCw9BwWI6iD5naIy3MrlMbH2Ov7OwDSiSncQpZAhT44D5ZCQy2mqI6QKXNLdEYrZB0rwh0gDIi183ey3lZAMLuKSdDr1ybpgCNJxeNSnDvmJvFzNmKjh4F9rW90ANcShx8UYjzKivmvd",
    name: "Panther Blazz",
    id: "839433682576086",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPr4crMGP4T6Cv6GlSUXjiKlhOXZC8tmajQH5tL7eM1i6wcpZAkcZAGcLCHGoEvvNRz7k27BZBaJat7GpZAlmLfcId6Qe7AZCQeZBDETi37daTeJzw7wVOmRXjIhlR6KKeQcV8qPlIrYBUFEhU6vTIvAWzoXFz6OlUqgzh5mto4j6h4pFf3icDVXPPBzceJC5nFUgj7msI7m",
    name: "Clínica Otto+",
    id: "768337943019641",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPqfUfATjiiIax1lS0mf3pufEp52YhhuUIFA0leTGdHH0SZCj3NQKvsSk42KOW09pZB4yuNBQGZAAIc6ZCJDZAIDZCm7cSgCEwiG0pHUaDVypT62KZBwFFbC7ZAfmUVU1LPKTEdPruzwDptQhVzDVqR2c0vvA3GYgJooRZBg2DOTSQPijSQMwK5Xwv0SmY8LqoQAKETodRLHMb",
    name: "Clean Saúde Rio Real",
    id: "511600935380953",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPrtIsWEJU9ZBUNyjC13X6jgoGa6O7CJoU8Mu26dV1cciZA0rHpKWlaj5vCls6hCb1tuVhUNtZAHlHnWeQ7a2rw5uPHf7uQpOFT1fey12qGwndBrTsEW9DeJI61xs0Qxvz4LgaS4yBdY9TcrzuZBB6AIuJdJIe0MZCsUoWiumNYX7KJ9JDnS5ZAJVZAlbZBxHy7YDBnlZAX0ot",
    name: "Clínica Gama - Ribeira do Pombal",
    id: "401347113060769",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPqARKH2d5ZCYjHlHCX1Tw7Rnp37OzNpgMJtNN6fgIcKsKGXlWMUOnnfHgVeAa3HFHZBWPjUBXO3ZAcoXRcXuOqZCiD4dCNdaQVGriCDkYAhDymZCshi5kpGj20HlNrFoBFwEd780ZBFxa4I1AWps4geHkf7sxEM8G4qN5J7TXIWADutbxiaaIRnWYZCXfnvEn69VO66GN59",
    name: "Centro Médico Bressan Bonfim",
    id: "301561133034232",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPlQIrLd3sSPsN1ZBRJBIYNQJMBkpV1n9iJKVlEmK8iETxvI1iTcdVKAKAxZAw9jnytpsRn5F0j7xwEZBZBkZAi0K5ixZB3W9SRjqZCZC1pgW473QLruCy8sxOLbri81Q71QukMEgirpf2KGH2vnOCMS94uGCz8TjY5skqFjZCAvas4JRjQuqGWE8QR2RJKmW7xUa4JQEUhJUZD",
    name: "Dr. Bressan Bonfim",
    id: "140860502443681",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPkWlRZCH9ln9U8edLFHeNxOJxH7LQF7xIZCapJVrceo3ZA9onKs532jouwNmWumF0dUYuMpajtBjX9E9e2Nu9Ho9ZApJMvNMmAvAcCFIiuk1yELA4XFLSmqcalKRqHAqNUAjQJ2Y5IeUyrOH7qqOgvezid6v3K5ho8S2ZClDwBz4WaL2yl98ZBJcZBZAPetQPDF7uOpXuxoZD",
    name: "Carlos Henrique Silva",
    id: "102986028799656",
  },
  {
    access_token:
      "EAASCiZBZBPmPgBPo5D3ifrXaIrwROLszG1y9mi06988zwyQn5EVZAVxIjHqR7Dicj1dCnMYOj99ZCrin5DCvZCbwqkeBFcIVZAjMImbK6c7kXfPrCyJeZBkwYidjMNnZAGhhonUIjHt1wO3rlNHrbfDmBLm9cIMJx5i3eFrQZCBEZBiwOCfTIgTpYw6qREgip4KKr7ZB1OVkVtUJHiCznrhe4Lf",
    name: "Clean Saúde Esplanada",
    id: "338921743423931",
  },
];

async function fetchApi(endpoint: string): Promise<any> {
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
  } catch (error: any) {
    console.error(`API Fetch Error for ${endpoint}:`, error);
    return null;
  }
}

export async function getClientProfilePicture(
  pageId: string,
  accessToken: string
): Promise<string | null> {
  const data = await fetchApi(
    `${pageId}/picture?type=large&redirect=false&access_token=${accessToken}`
  );
  return data?.data?.url || null;
}

export async function getIgUsername(
  pageId: string,
  accessToken: string
): Promise<string | null> {
  const igAccountData = await fetchApi(
    `${pageId}?fields=instagram_business_account{username}&access_token=${accessToken}`
  );
  return igAccountData?.instagram_business_account?.username || null;
}

export async function fetchAllClientData(client: Client): Promise<Post[]> {
  const { id: pageId, access_token } = client;
  const cacheKey = `client_${pageId}`;

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const needsSync = await shouldSync(pageId);

      if (!needsSync) {
        return await getCachedPosts(pageId);
      }

      const lastSync = await getLastSyncTime(pageId);

      const igAccountData = await fetchApi(
        `${pageId}?fields=instagram_business_account&access_token=${access_token}`
      );
      const igAccountId = igAccountData?.instagram_business_account?.id;

      let sinceParam = "";
      if (lastSync) {
        const sinceTimestamp = Math.floor(lastSync.getTime() / 1000);
        sinceParam = `&since=${sinceTimestamp}`;
      }

      const fbFields =
        "id,message,created_time,full_picture,permalink_url,attachments{media}";
      const fbPublishedPromise = fetchApi(
        `${pageId}/published_posts?access_token=${access_token}&fields=${fbFields}${sinceParam}`
      );

      const fbStoriesPromise = fetchApi(
        `${pageId}/stories?access_token=${access_token}&fields=id,created_time,attachments{media,type}`
      );

      let igPromise: Promise<any> = Promise.resolve(null);
      let igStoriesPromise: Promise<any> = Promise.resolve(null);

      if (igAccountId) {
        const igFields =
          "id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,children{media_url,thumbnail_url}";
        igPromise = fetchApi(
          `${igAccountId}/media?access_token=${access_token}&fields=${igFields}${sinceParam}`
        );
        igStoriesPromise = fetchApi(
          `${igAccountId}/stories?access_token=${access_token}&fields=id,caption,media_type,media_url,timestamp,thumbnail_url`
        );
      }

      const [fbPublishedResult, igResult, fbStoriesResult, igStoriesResult] =
        await Promise.all([
          fbPublishedPromise,
          igPromise,
          fbStoriesPromise,
          igStoriesPromise,
        ]);

      const newPosts: Post[] = [];

      (fbPublishedResult?.data || []).forEach((p: any) => {
        let media_type: Post["media_type"] = "FOTO";
        if (p.attachments?.data?.[0]?.media?.source?.includes(".mp4"))
          media_type = "REELS";
        if (p.attachments?.data?.length > 1) media_type = "CARROSSEL";
        newPosts.push({
          id: p.id,
          platform: "facebook",
          caption: p.message,
          timestamp: p.created_time,
          media_url: p.full_picture,
          status: "published",
          media_type,
          clientId: client.id,
        });
      });

      (igResult?.data || []).forEach((m: any) => {
        let media_type: Post["media_type"] = "FOTO";
        if (m.media_type === "VIDEO") media_type = "REELS";
        if (m.media_type === "CAROUSEL_ALBUM") media_type = "CARROSSEL";
        newPosts.push({
          id: m.id,
          platform: "instagram",
          caption: m.caption,
          timestamp: m.timestamp,
          media_url:
            m.media_url || m.thumbnail_url || m.children?.data[0]?.media_url,
          thumbnail_url: m.thumbnail_url,
          status: "published",
          media_type,
          clientId: client.id,
        });
      });

      (fbStoriesResult?.data || []).forEach((s: any) => {
        if (s.attachments?.data?.[0]?.media) {
          newPosts.push({
            id: s.id,
            platform: "facebook",
            caption: null,
            timestamp: s.created_time,
            media_url: s.attachments.data[0].media.image.src,
            status: "published",
            media_type: "STORY",
            clientId: client.id,
          });
        }
      });

      (igStoriesResult?.data || []).forEach((s: any) => {
        newPosts.push({
          id: s.id,
          platform: "instagram",
          caption: s.caption,
          timestamp: s.timestamp,
          media_url: s.media_url || s.thumbnail_url,
          thumbnail_url: s.thumbnail_url,
          status: "published",
          media_type: "STORY",
          clientId: client.id,
        });
      });

      if (newPosts.length > 0) {
        await savePosts(pageId, newPosts);
      }

      await updateSyncStatus(pageId);

      return await getCachedPosts(pageId);
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function clearClientCache(clientId: string) {
  await clearSupabaseCache(clientId);
}

export async function clearAllCache() {
  console.log("Clear all cache não implementado para Supabase");
}
