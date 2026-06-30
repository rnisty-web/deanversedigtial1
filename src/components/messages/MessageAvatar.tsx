import { initials } from "@/lib/messages/utils";
import { cn } from "@/lib/utils";

type MessageAvatarProps = {
  name: string;
  size?: "md" | "lg";
  className?: string;
};

export function MessageAvatar({ name, size = "md", className }: MessageAvatarProps) {
  return (
    <div
      className={cn(
        "dm-avatar",
        size === "lg" && "dm-avatar-lg",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
