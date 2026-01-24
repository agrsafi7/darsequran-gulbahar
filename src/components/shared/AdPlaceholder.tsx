import { cn } from "@/lib/utils";

type AdSize = "horizontal" | "vertical" | "square" | "leaderboard";

interface AdPlaceholderProps {
  size: AdSize;
  className?: string;
  label?: string;
}

const sizeStyles: Record<AdSize, string> = {
  horizontal: "w-full h-24 sm:h-28",
  vertical: "w-full h-[300px] lg:w-[300px]",
  square: "w-[250px] h-[250px]",
  leaderboard: "w-full h-[90px]",
};

export function AdPlaceholder({ size, className, label = "Advertisement" }: AdPlaceholderProps) {
  return (
    <div
      className={cn(
        "ad-placeholder",
        sizeStyles[size],
        className
      )}
      role="complementary"
      aria-label={label}
    >
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider mb-1 opacity-70">Ad Space</p>
        <p className="text-[10px] opacity-50">{label}</p>
      </div>
    </div>
  );
}
