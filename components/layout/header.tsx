"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Menu, Bell } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = "Dashboard" }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3 pl-0 sm:pl-4 sm:border-l">
        {/* Text section */}
        <div className="text-right leading-tight">
          <p className="text-sm font-medium truncate max-w-[120px] sm:max-w-none">
            {user?.name}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
            {user?.role ? ROLE_LABELS[user.role] : ""}
          </p>
        </div>

        {/* Avatar */}
        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
