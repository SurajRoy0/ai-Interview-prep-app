"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function getInitials(name?: string | null) {
  if (!name?.trim()) return "U"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export interface UserAvatarProps {
  name?: string | null
  email: string
  image?: string | null
  className?: string
  avatarClassName?: string
}

export function UserAvatar({
  name,
  email,
  image,
  className,
  avatarClassName,
}: UserAvatarProps) {
  const initials = getInitials(name)
  const displayName = name?.trim() || email

  return (
    <div className={cn("flex items-center gap-3 min-w-0", className)}>
      <Avatar size="lg" className={cn("shrink-0", avatarClassName)}>
        {image ? <AvatarImage src={image} alt={displayName} /> : null}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="max-md:hidden min-w-0 text-start">
        <p className="truncate text-sm font-medium leading-none">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground mt-1">{email}</p>
      </div>
    </div>
  )
}
