import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Client, Post, SimulatedPost, EditHistoryItem } from "@/lib/types";
import { initialClients } from "./clients";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

interface AppState {
  user: (Client & { id: string }) | { id: "admin"; name: "Admin" } | null;
  userType: "client" | "admin" | null;
  clients: Client[];
  postsByClientId: Record<string, Post[]>;
  fetchedClients: string[];
  simulatedPosts: SimulatedPost[];
  login: (
    user: (Client & { id: string }) | { id: "admin"; name: "Admin" },
    userType: "client" | "admin"
  ) => void;
  logout: () => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  addPostsForClient: (clientId: string, posts: Post[]) => void;
  markClientAsFetched: (clientId: string) => void;
  addSimulatedPost: (
    post: Omit<
      SimulatedPost,
      "id" | "status" | "isApproved" | "editHistory" | "approvalStatus"
    >
  ) => void;
  updateSimulatedPostsStatus: () => void;
  updateSimulatedPostCaption: (postId: string, newCaption: string) => void;
  updatePostApprovalStatus: (
    postId: string,
    status: "approved" | "rejected"
  ) => void;
  updateSimulatedPost: (
    postId: string,
    updates: Partial<Omit<SimulatedPost, "id" | "clientId" | "editHistory">>
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      user: null,
      userType: null,
      clients: (initialClients || []).map(
        (c: Omit<Client, "isVisible" | "customName">) => ({
          ...c,
          isVisible: true,
        })
      ),
      postsByClientId: {},
      fetchedClients: [],
      simulatedPosts: [],
      login: (user, userType) => {
        set((state) => {
          state.user = user;
          state.userType = userType;
        });
      },
      logout: () => {
        set((state) => {
          state.user = null;
          state.userType = null;
          state.postsByClientId = {};
          state.fetchedClients = [];
        });
      },
      updateClient: (clientId, updates) => {
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (client) {
            Object.assign(client, updates);
          }
        });
      },
      addPostsForClient: (clientId, posts) => {
        set((state) => {
          state.postsByClientId[clientId] = posts;
        });
      },
      markClientAsFetched: (clientId) => {
        set((state) => {
          if (!state.fetchedClients.includes(clientId)) {
            state.fetchedClients.push(clientId);
          }
        });
      },
      addSimulatedPost: (post) => {
        set((state) => {
          state.simulatedPosts.push({
            ...post,
            id: uuidv4(),
            status: "scheduled",
            isApproved: false,
            approvalStatus: "pending",
            editHistory: [],
          });
        });
      },
      updateSimulatedPostsStatus: () => {
        set((state) => {
          const now = dayjs();
          state.simulatedPosts.forEach((post) => {
            if (
              post.status === "scheduled" &&
              now.isAfter(dayjs(post.scheduledAt)) &&
              post.approvalStatus === "approved"
            ) {
              post.status = "published";
            }
          });
        });
      },
      updateSimulatedPostCaption: (postId, newCaption) => {
        set((state) => {
          const post = state.simulatedPosts.find((p) => p.id === postId);
          if (post) {
            const oldCaption = post.caption;
            post.caption = newCaption;
            post.approvalStatus = "pending";
            if (!post.editHistory) {
              post.editHistory = [];
            }
            post.editHistory.push({
              oldCaption: oldCaption,
              newCaption: newCaption,
              timestamp: new Date().toISOString(),
            });
          }
        });
      },
      updatePostApprovalStatus: (postId, status) => {
        set((state) => {
          const post = state.simulatedPosts.find((p) => p.id === postId);
          if (post) {
            post.approvalStatus = status;
          }
        });
      },
      updateSimulatedPost: (postId, updates) => {
        set((state) => {
          const post = state.simulatedPosts.find((p) => p.id === postId);
          if (!post) return;

          // Track caption change to log diff-like history
          if (typeof updates.caption === "string" && updates.caption !== post.caption) {
            const oldCaption = post.caption || "";
            const newCaption = updates.caption;
            if (!post.editHistory) post.editHistory = [];
            post.editHistory.push({
              oldCaption: oldCaption,
              newCaption: newCaption,
              timestamp: new Date().toISOString(),
            });
            // Return to pending when caption changes
            post.approvalStatus = "pending";
          }

          // Apply primitive field updates
          if (typeof updates.caption === "string") post.caption = updates.caption;
          if (typeof updates.mediaUrl === "string") post.mediaUrl = updates.mediaUrl;
          if (typeof updates.media_type === "string") post.media_type = updates.media_type as SimulatedPost["media_type"];
          if (typeof updates.scheduledAt === "string") post.scheduledAt = updates.scheduledAt;
          if (Array.isArray(updates.platforms)) post.platforms = updates.platforms;
          if (typeof updates.status === "string") post.status = updates.status as SimulatedPost["status"];
          if (typeof updates.approvalStatus === "string") post.approvalStatus = updates.approvalStatus as SimulatedPost["approvalStatus"];
        });
      },
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
