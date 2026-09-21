"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import LoginPage from "@/app/login/page";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const initializeFromSupabase = useStore((s) => s.initializeFromSupabase);
  const clearData = useStore((s) => s.clearData);
  const initialized = useStore((s) => s.initialized);

  useEffect(() => {
    if (user) {
      initializeFromSupabase();
    } else if (!loading) {
      clearData();
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
