"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TeacherHeaderProps {
  userInitials?: string;
  userName?: string;
}

export function TeacherHeader({
  userInitials = "T",
  userName = "Teacher",
}: TeacherHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* fall through */
    }
    router.push("/login");
  };

  return (
    <header
      className="flex items-center justify-between border-b border-border bg-surface-0 px-6"
      style={{ height: "var(--teacher-header-h)" }}
    >
      <div className="text-sm text-ink-muted">{/* breadcrumbs slot — Phase 2+ */}</div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2"
            aria-label="Open user menu"
          >
            <span className="hidden text-sm text-ink-strong md:inline">{userName}</span>
            <Avatar className="h-9 w-9">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem onSelect={() => router.push("/teacher/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
