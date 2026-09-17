"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, BookOpen, Users, LayoutDashboard, HardHat } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projekte", label: "Projekte", icon: Building2 },
  { href: "/bautagebuch", label: "Bautagebuch", icon: BookOpen },
  { href: "/kontakte", label: "Kontakte", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 border-r bg-card flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <HardHat className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg tracking-tight">BuildFrameOS</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        v0.1.0
      </div>
    </aside>
  );
}
