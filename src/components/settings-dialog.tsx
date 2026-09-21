"use client";
import { useAuth } from "@/context/auth-context";
import { isAdmin } from "@/lib/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCog, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const admin = isAdmin(user?.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Einstellungen
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Angemeldet als</p>
            <p className="text-sm font-medium">{user?.email ?? "—"}</p>
            {admin && (
              <Badge className="bg-amber-500 text-white text-[10px] gap-1 px-1.5 mt-1">
                <ShieldCheck className="h-3 w-3" /> Admin
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
