"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  children?: React.ReactNode;
}

export function DashboardHeader({ children }: DashboardHeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link
            href="/dashboard"
            className={
              isActive("/dashboard")
                ? "text-foreground font-bold"
                : "text-muted-foreground font-normal hover:text-foreground"
            }
          >
            Post Now
          </Link>
          <Link
            href="/dashboard/company-info"
            className={
              isActive("/dashboard/company-info")
                ? "text-foreground font-bold"
                : "text-muted-foreground font-normal hover:text-foreground"
            }
          >
            Company Info
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {children}
        </div>
      </div>
    </nav>
  );
}
