import { cn } from "@/lib/utils/cn";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES = {
  xs: { px: 24, cls: "h-6 w-6 text-xs" },
  sm: { px: 32, cls: "h-8 w-8 text-xs" },
  md: { px: 40, cls: "h-10 w-10 text-sm" },
  lg: { px: 56, cls: "h-14 w-14 text-base" },
  xl: { px: 80, cls: "h-20 w-20 text-xl" },
};

function initials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const config = SIZES[size];

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden shrink-0 bg-brand-light",
          config.cls,
          className
        )}
      >
        <Image
          src={src}
          alt={name ?? "Avatar"}
          fill
          className="object-cover"
          sizes={`${config.px}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full shrink-0 bg-brand-light text-brand flex items-center justify-center font-semibold",
        config.cls,
        className
      )}
    >
      {initials(name)}
    </div>
  );
}

export function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating?: number | null;
  count?: number;
  size?: "sm" | "md";
}) {
  if (!rating) return null;

  const filled = Math.round(rating);
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const starSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <span className={cn("inline-flex items-center gap-1", textSize)}>
      <span className={cn("text-brand", starSize)}>
        {"★".repeat(filled)}
        {"☆".repeat(5 - filled)}
      </span>
      <span className="text-muted">
        {rating.toFixed(1)}
        {count != null && ` · ${count}`}
      </span>
    </span>
  );
}
