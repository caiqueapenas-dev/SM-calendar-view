import { PostMediaType } from "@/lib/types";

interface MediaTypeTagProps {
  mediaType: PostMediaType;
  className?: string;
}

const tagColors: Record<PostMediaType, string> = {
  FOTO: "bg-sky-500 text-sky-100",
  REELS: "bg-purple-500 text-purple-100",
  CARROSSEL: "bg-rose-500 text-rose-100",
  STORY: "bg-amber-500 text-amber-100",
  VIDEO: "bg-indigo-500 text-indigo-100",
};

export default function MediaTypeTag({
  mediaType,
  className,
}: MediaTypeTagProps) {
  const colorClasses = tagColors[mediaType] || "bg-gray-700 text-gray-300";

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClasses} ${
        className || ""
      }`}
    >
      {mediaType}
    </span>
  );
}
