import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  Client,
  Post,
  EditHistoryItem,
  UserRole,
  PostStatus,
} from "@/lib/types";
import { initialClients } from "./clients";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

interface AppState {
  user: { id: string; name: string } | null;
  userType: UserRole | null;
  clients: Client[];
  posts: Post[];
  login: (user: { id: string; name: string }, userType: UserRole) => void;
  logout: () => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  addPost: (
    postData: Omit<
      Post,
      "id" | "status" | "createdBy" | "editHistory" | "createdAt" | "updatedAt"
    >
  ) => void;
  updatePost: (
    postId: string,
    updates: Partial<Omit<Post, "id" | "clientId" | "editHistory">>
  ) => void;
  updatePostStatus: (postId: string, status: PostStatus) => void;
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
      posts: [],
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
      addPost: (postData) => {
        set((state) => {
          const now = new Date().toISOString();
          const newPost: Post = {
            ...postData,
            id: uuidv4(),
            status: "aguardando_aprovacao",
            createdBy: get().userType!,
            editHistory: [],
            createdAt: now,
            updatedAt: now,
          };
          state.posts.push(newPost);
        });
      },
      updatePostStatus: (postId, status) => {
        set((state) => {
          const post = state.posts.find((p) => p.id === postId);
          if (post) {
            post.status = status;
            post.updatedAt = new Date().toISOString();
          }
        });
      },
      updatePost: (postId, updates) => {
        set((state) => {
          const post = state.posts.find((p) => p.id === postId);
          if (!post) return;
          const userType = get().userType;
          if (!userType) return;

          // Log caption changes
          if (
            typeof updates.caption === "string" &&
            updates.caption !== post.caption
          ) {
            const edit: EditHistoryItem = {
              author: userType,
              oldCaption: post.caption,
              newCaption: updates.caption,
              timestamp: new Date().toISOString(),
            };
            post.editHistory.push(edit);
            // Re-set status to pending on client edit
            if (userType === "client") {
              post.status = "aguardando_aprovacao";
            }
          }

          Object.assign(post, updates);
          post.updatedAt = new Date().toISOString();
        });
      },
    })),
    {
      name: "app-storage-v2", // Changed name to avoid conflicts with old structure
      storage: createJSONStorage(() => localStorage),
    }
  )
);
