import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Client, Post, SimulatedPost, EditHistoryItem } from "@/lib/types";
import { initialClients } from "./clients"; // A importação agora vai funcionar
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
    post: Omit<SimulatedPost, "id" | "status" | "isApproved" | "editHistory">
  ) => void;
  updateSimulatedPostsStatus: () => void;
  updateSimulatedPostCaption: (postId: string, newCaption: string) => void;
  approveSimulatedPost: (postId: string) => void;
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
              now.isAfter(dayjs(post.scheduledAt))
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
            post.isApproved = false;
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
      approveSimulatedPost: (postId) => {
        set((state) => {
          const post = state.simulatedPosts.find((p) => p.id === postId);
          if (post) {
            post.isApproved = true;
          }
        });
      },
    })),
    {
      name: "app-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
