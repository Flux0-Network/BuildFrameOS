"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, BookOpen, Users, LayoutDashboard, HardHat, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projekte", label: "Projekte", icon: Building2 },
  { href: "/bautagebuch", label: "Bautagebuch", icon: BookOpen },
  { href: "/kontakte", label: "Kontakte", icon: Users },
];

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b bg-card px-4 h-14">
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-primary" />
          <span className="font-bold text-base tracking-tight">BuildFrameOS</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r bg-card transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-primary" />
            <span className="font-bold text-base tracking-tight">BuildFrameOS</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <NavLinks onClose={() => setOpen(false)} />
        <div className="px-5 py-4 border-t text-xs text-muted-foreground">v0.1.0</div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col border-r bg-card">
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <HardHat className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">BuildFrameOS</span>
        </div>
        <NavLinks />
        <div className="px-6 py-4 border-t text-xs text-muted-foreground">v0.1.0</div>
      </aside>
    </>
  );
}
