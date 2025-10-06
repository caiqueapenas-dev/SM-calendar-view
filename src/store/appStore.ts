import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UserRole, PostStatus } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";
import { Session, User } from "@supabase/supabase-js";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

interface AppState {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  clients: ClientRow[];
  posts: PostRow[];
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
  fetchClients: () => Promise<void>;
  updateClient: (clientId: string, updates: ClientUpdate) => Promise<void>;
  listenToClientChanges: () => () => void;
  fetchPosts: () => Promise<void>;
  addPost: (
    postData: Omit<PostInsert, "status" | "created_by" | "edit_history">
  ) => Promise<boolean>;
  updatePost: (postId: string, updates: PostUpdate) => Promise<void>;
  updatePostStatus: (postId: string, status: PostStatus) => Promise<void>;
  listenToPostChanges: () => () => void;
}

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    session: null,
    user: null,
    userRole: null,
    clients: [],
    posts: [],
    isLoading: true,

    setSession: (session) => {
      set((state) => {
        state.session = session;
        state.user = session?.user ?? null;
        if (session?.user?.email?.includes("admin")) {
          state.userRole = "admin";
        } else if (session) {
          state.userRole = "client";
        } else {
          state.userRole = null;
        }
      });
    },

    logout: async () => {
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        userRole: null,
        posts: [],
        clients: [],
      });
    },

    fetchClients: async () => {
      const { data, error } = await supabase.from("clients").select("*");
      if (error) {
        console.error("Error fetching clients:", error);
      } else {
        set({ clients: data || [] });
      }
    },

    updateClient: async (clientId, updates) => {
      const { error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", clientId);
      if (error) {
        console.error("Error updating client:", error);
      }
    },

    listenToClientChanges: () => {
      const channel = supabase
        .channel("realtime-clients")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "clients" },
          (payload) => {
            const currentClients = get().clients;
            if (payload.eventType === "UPDATE") {
              const newRecord = payload.new as ClientRow;
              set({
                clients: currentClients.map((c) =>
                  c.id === newRecord.id ? newRecord : c
                ),
              });
            }
          }
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },

    fetchPosts: async () => {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("scheduled_at", { ascending: false });
      if (error) console.error("Error fetching posts:", error);
      set({ posts: data || [], isLoading: false });
    },

    addPost: async (postData) => {
      const user = get().user;
      if (!user) {
        console.error("User not authenticated to create post.");
        return false;
      }
      const newPost: PostInsert = {
        ...postData,
        status: "aguardando_aprovacao",
        created_by: user.id,
        edit_history: [],
      };
      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select()
        .single();
      if (error) {
        console.error("Error creating post:", error);
        return false;
      }
      if (data) {
        const currentPosts = get().posts;
        set({ posts: [data, ...currentPosts] });
      }
      return true;
    },

    updatePost: async (postId, updates) => {
      const post = get().posts.find((p) => p.id === postId);
      if (!post) return;

      const userRole = get().userRole;
      if (!userRole) return;

      const finalUpdates: PostUpdate = { ...updates };

      if (
        typeof updates.caption === "string" &&
        updates.caption !== post.caption
      ) {
        const newHistoryItem = {
          author: userRole,
          oldCaption: post.caption || "",
          newCaption: updates.caption,
          timestamp: new Date().toISOString(),
        };
        const newEditHistory = [
          ...(Array.isArray(post.edit_history) ? post.edit_history : []),
          newHistoryItem,
        ];
        finalUpdates.edit_history = newEditHistory;
        if (userRole === "client") {
          finalUpdates.status = "aguardando_aprovacao";
        }
      }

      const { data: updatedPost, error } = await supabase
        .from("posts")
        .update(finalUpdates)
        .eq("id", postId)
        .select()
        .single();

      if (error) {
        console.error("Error updating post:", error);
        return;
      }

      if (updatedPost) {
        const currentPosts = get().posts;
        set({
          posts: currentPosts.map((p) => (p.id === postId ? updatedPost : p)),
        });
      }
    },

    updatePostStatus: async (postId, status) => {
      const { data: updatedPost, error } = await supabase
        .from("posts")
        .update({ status })
        .eq("id", postId)
        .select()
        .single();

      if (error) {
        console.error("Error updating post status:", error);
        return;
      }

      if (updatedPost) {
        const currentPosts = get().posts;
        set({
          posts: currentPosts.map((p) => (p.id === postId ? updatedPost : p)),
        });
      }
    },

    listenToPostChanges: () => {
      const channel = supabase
        .channel("realtime-posts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "posts" },
          (payload) => {
            const currentPosts = get().posts;
            if (payload.eventType === "INSERT") {
              const newRecord = payload.new as PostRow;
              set({ posts: [newRecord, ...currentPosts] });
            } else if (payload.eventType === "UPDATE") {
              const newRecord = payload.new as PostRow;
              set({
                posts: currentPosts.map((p) =>
                  p.id === newRecord.id ? newRecord : p
                ),
              });
            } else if (payload.eventType === "DELETE") {
              const oldRecord = payload.old as Partial<PostRow>;
              set({ posts: currentPosts.filter((p) => p.id !== oldRecord.id) });
            }
          }
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  }))
);
