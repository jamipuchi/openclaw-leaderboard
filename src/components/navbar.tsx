"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Send, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/submit", label: "Submit", icon: Send },
  { href: "/docs", label: "API Docs", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🏆</span>
          <span className="text-gradient">OpenClaw</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
