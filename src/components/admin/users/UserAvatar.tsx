"use client";

import Image from "next/image";
import type { UserRecord } from "@/lib/users/utils";
import { userInitials } from "@/lib/users/utils";
import { cn } from "@/lib/utils";

export function UserAvatar({ user, className }: { user: UserRecord; className?: string }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt=""
        width={44}
        height={44}
        className={cn("admin-users-avatar-image", className)}
        unoptimized
      />
    );
  }

  return (
    <div className={cn("admin-users-avatar", className)}>
      {userInitials(user)}
    </div>
  );
}
