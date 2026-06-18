"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList } from "lucide-react";
import { cn } from "@/src/app/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/teacher/dashboard", Icon: LayoutDashboard },
  { label: "Classrooms", href: "/teacher/classrooms", Icon: Users },
  { label: "Quizzes", href: "/teacher/quizzes", Icon: ClipboardList },
] as const;

export function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col gap-1 border-r border-border bg-surface-1 px-3 py-6"
      style={{ width: "var(--teacher-nav-w)" }}
      aria-label="Teacher navigation"
    >
      <Link href="/teacher/dashboard" className="mb-6 px-3">
        <span className="text-2xl font-display text-brand">Pebbo</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-tint text-brand"
                  : "text-ink hover:bg-surface-2 hover:text-ink-strong",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
