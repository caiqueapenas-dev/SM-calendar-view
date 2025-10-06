"use client";

import { useState } from "react";
import { Instagram, Facebook, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import dayjs from "dayjs";

interface PostPreviewProps {
  caption: string;
  mediaUrl: string;
  mediaType: "FOTO" | "CARROSSEL" | "REELS" | "STORY";
  platforms: ("instagram" | "facebook")[];
  clientName: string;
  clientPhoto?: string;
  scheduledAt: string;
}

export default function PostPreview({
  caption,
  mediaUrl,
  mediaType,
  platforms,
  clientName,
  clientPhoto,
  scheduledAt,
}: PostPreviewProps) {
  const [activePreview, setActivePreview] = useState<"instagram" | "facebook">(
    platforms.includes("instagram") ? "instagram" : "facebook"
  );

  const mediaUrls = (() => {
    if (mediaType === "CARROSSEL") {
      try {
        const urls = JSON.parse(mediaUrl);
        return Array.isArray(urls) ? urls : [mediaUrl];
      } catch {
        return [mediaUrl];
      }
    }
    return [mediaUrl];
  })();

  const captionWithLimit = (platform: "instagram" | "facebook") => {
    const limit = platform === "instagram" ? 2200 : 63206;
    const remaining = limit - caption.length;
    return {
      text: caption.length > limit ? caption.substring(0, limit) + "..." : caption,
      remaining,
      isOver: caption.length > limit,
    };
  };

  const InstagramPreview = () => {
    const { text, remaining, isOver } = captionWithLimit("instagram");
    
    return (
      <div className="bg-black rounded-lg overflow-hidden max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 bg-gray-900">
          <img
            src={clientPhoto || `https://ui-avatars.com/api/?name=${clientName}&background=random`}
            alt={clientName}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{clientName}</p>
            <p className="text-xs text-gray-400">
              {dayjs(scheduledAt).format("DD [de] MMMM [às] HH:mm")}
            </p>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-black aspect-square">
          <img
            src={mediaUrls[0]}
            alt="Post"
            className="w-full h-full object-cover"
          />
          {mediaUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
              1/{mediaUrls.length}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-4">
              <Heart className="text-white" size={24} />
              <MessageCircle className="text-white" size={24} />
              <Send className="text-white" size={24} />
            </div>
            <Bookmark className="text-white" size={24} />
          </div>

          {/* Caption */}
          <div className="text-white text-sm">
            <span className="font-semibold">{clientName}</span>{" "}
            <span className="whitespace-pre-wrap">{text}</span>
          </div>

          {/* Character count */}
          <div className={`text-xs mt-2 ${isOver ? "text-red-500" : "text-gray-500"}`}>
            {caption.length} / 2200 caracteres {isOver && "(excedido!)"}
          </div>
        </div>
      </div>
    );
  };

  const FacebookPreview = () => {
    const { text, remaining, isOver } = captionWithLimit("facebook");
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
          <img
            src={clientPhoto || `https://ui-avatars.com/api/?name=${clientName}&background=random`}
            alt={clientName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold dark:text-white">{clientName}</p>
            <p className="text-xs text-gray-500">
              {dayjs(scheduledAt).format("DD [de] MMMM [às] HH:mm")} · 🌎
            </p>
          </div>
        </div>

        {/* Caption */}
        <div className="p-3">
          <p className="text-sm dark:text-gray-200 whitespace-pre-wrap">{text}</p>
        </div>

        {/* Image */}
        <div className="relative bg-black">
          <img
            src={mediaUrls[0]}
            alt="Post"
            className="w-full object-cover"
          />
          {mediaUrls.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
              +{mediaUrls.length - 1}
            </div>
          )}
        </div>

        {/* Character count */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className={`text-xs ${isOver ? "text-red-500" : "text-gray-500"}`}>
            {caption.length} / 63.206 caracteres
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Platform Switcher */}
      {platforms.length > 1 && (
        <div className="flex justify-center gap-2">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setActivePreview(platform)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activePreview === platform
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {platform === "instagram" ? (
                <Instagram size={20} />
              ) : (
                <Facebook size={20} />
              )}
              {platform === "instagram" ? "Instagram" : "Facebook"}
            </button>
          ))}
        </div>
      )}

      {/* Preview */}
      <div className="bg-gray-900 p-6 rounded-lg">
        {activePreview === "instagram" ? <InstagramPreview /> : <FacebookPreview />}
      </div>
    </div>
  );
}

