import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UserRole, PostStatus } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";
import { Session, User } from "@supabase/supabase-js";
import dayjs from "dayjs";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

export interface Notification {
  id: string;
  type: "approval_reminder" | "client_edit";
  clientId: string;
  postId: string;
  message: string;
  urgency: "low" | "medium" | "high";
  createdAt: string;
  read: boolean;
}

interface AppState {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  clients: ClientRow[];
  posts: PostRow[];
  notifications: Notification[];
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
  fetchClients: () => Promise<void>;
  updateClient: (clientId: string, updates: ClientUpdate) => Promise<void>;
  fetchPosts: () => Promise<void>;
  generateNotifications: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  addPost: (
    postData: Omit<PostInsert, "status" | "created_by" | "edit_history">
  ) => Promise<boolean>;
  updatePost: (postId: string, updates: PostUpdate) => Promise<void>;
  updatePostStatus: (postId: string, status: PostStatus) => Promise<void>;
  listenToChanges: () => () => void;
}

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    session: null,
    user: null,
    userRole: null,
    clients: [],
    posts: [],
    notifications: [],
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
        notifications: [],
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

    fetchPosts: async () => {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("scheduled_at", { ascending: false });
      if (error) {
        console.error("Error fetching posts:", error);
        set({ isLoading: false });
        return;
      }
      set({ posts: data || [], isLoading: false });
    },

    generateNotifications: () => {
      const { posts, clients } = get();
      const newNotifications: Notification[] = [];
      const now = dayjs();

      posts.forEach((post) => {
        if (post.status === "aguardando_aprovacao") {
          const scheduledDate = dayjs(post.scheduled_at);
          const daysUntilDue = scheduledDate.diff(now, "day");
          const client = clients.find((c) => c.client_id === post.client_id);

          let urgency: "low" | "medium" | "high" | null = null;
          if (daysUntilDue <= 1 && daysUntilDue >= 0) urgency = "high";
          else if (daysUntilDue <= 3 && daysUntilDue > 1) urgency = "medium";
          else if (daysUntilDue <= 5 && daysUntilDue > 3) urgency = "low";

          if (urgency) {
            newNotifications.push({
              id: `approval-${post.id}-${daysUntilDue}`,
              type: "approval_reminder",
              clientId: post.client_id,
              postId: post.id,
              message: `Aprovação pendente para post de ${
                client?.name || "Cliente"
              } agendado para ${scheduledDate.format("DD/MM")}.`,
              urgency,
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }

        const lastEdit = Array.isArray(post.edit_history)
          ? (post.edit_history[post.edit_history.length - 1] as any)
          : null;
        if (lastEdit && lastEdit.author === "client") {
          const editDate = dayjs(lastEdit.timestamp);
          if (now.diff(editDate, "hour") <= 24) {
            const client = clients.find((c) => c.client_id === post.client_id);
            newNotifications.push({
              id: `edit-${post.id}-${lastEdit.timestamp}`,
              type: "client_edit",
              clientId: post.client_id,
              postId: post.id,
              message: `${
                client?.name || "Cliente"
              } alterou a legenda de um post.`,
              urgency: "low",
              createdAt: lastEdit.timestamp,
              read: false,
            });
          }
        }
      });

      const readNotifications = get().notifications.filter((n) => n.read);
      const unreadIds = new Set(readNotifications.map((n) => n.id));
      const finalNotifications = [
        ...newNotifications.filter((n) => !unreadIds.has(n.id)),
        ...readNotifications,
      ];

      set({ notifications: finalNotifications });
    },

    markNotificationAsRead: (notificationId) => {
      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        if (notification) {
          notification.read = true;
        }
      });
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
          ...(Array.isArray(post.edit_history)
            ? (post.edit_history as any[])
            : []),
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

    listenToChanges: () => {
      const clientChannel = supabase
        .channel("realtime-clients")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "clients" },
          () => get().fetchClients()
        )
        .subscribe();

      const postChannel = supabase
        .channel("realtime-posts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "posts" },
          () => {
            get()
              .fetchPosts()
              .then(() => get().generateNotifications());
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(clientChannel);
        supabase.removeChannel(postChannel);
      };
    },
  }))
);
