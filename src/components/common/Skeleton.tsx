"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gray-700";
  
  const variantClasses = {
    text: "rounded h-4",
    rectangular: "rounded-sm",
    circular: "rounded-full",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%]",
    none: "",
  };

  const style = {
    width: width || "100%",
    height: height || (variant === "text" ? "1rem" : "auto"),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <Skeleton variant="rectangular" height={200} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="40%" />
        </div>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </div>
      </div>
    </div>
  );
}

export function CalendarDaySkeleton() {
  return (
    <div className="min-h-[120px] border border-gray-700 p-2 rounded-md bg-gray-800">
      <Skeleton variant="circular" width={28} height={28} className="mb-2" />
      <div className="space-y-2">
        <Skeleton variant="rounded" height={32} />
        <Skeleton variant="rounded" height={32} />
      </div>
    </div>
  );
}

export function CalendarGridSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <CalendarDaySkeleton key={i} />
      ))}
    </div>
  );
}

export function InsightSkeleton() {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={80} />
          </div>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
        </div>
      </div>
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="rectangular" height={300} />
      <div className="space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={100} height={40} />
      </div>
    </div>
  );
}

