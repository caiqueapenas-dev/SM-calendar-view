"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/appStore";
import { Send, Trash2 } from "lucide-react";
import dayjs from "dayjs";

type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  author_role: "admin" | "client";
  content: string;
  created_at: string;
};

interface PostCommentsProps {
  postId: string;
}

export default function PostComments({ postId }: PostCommentsProps) {
  const { user, userRole, clients } = useAppStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    
    // Subscribe to new comments
    const subscription = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) setComments(data);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !userRole) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        author_id: user.id,
        author_role: userRole,
        content: newComment.trim(),
      });

      if (!error) {
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Excluir este comentário?")) return;

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId);

    if (!error) {
      fetchComments();
    }
  };

  const getAuthorInfo = (authorId: string, authorRole: string) => {
    if (authorRole === "client") {
      const client = clients.find((c) => c.client_id === authorId);
      return {
        name: client?.name || "Cliente",
        photo: client?.profile_picture_url || `https://ui-avatars.com/api/?name=${client?.name}`,
      };
    }
    return {
      name: "Admin",
      photo: `https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff`,
    };
  };

  const canDelete = (comment: Comment) => {
    return userRole === "admin" || comment.author_id === user?.id;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comentários</h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhum comentário ainda</p>
        ) : (
          comments.map((comment) => {
            const author = getAuthorInfo(comment.author_id, comment.author_role);
            return (
              <div
                key={comment.id}
                className={`p-3 rounded-lg ${
                  comment.author_role === "admin"
                    ? "bg-indigo-900/30 border-l-2 border-indigo-500"
                    : "bg-gray-800 border-l-2 border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={author.photo}
                    alt={author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{author.name}</span>
                      <span className="text-xs text-gray-500">
                        {dayjs(comment.created_at).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                  {canDelete(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicionar um comentário..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors self-end"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

