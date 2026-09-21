"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/context/auth-context";
import { isAdmin, ADMIN_EMAIL } from "@/lib/admin";
import { generateBauberichtPDF, sharePDF } from "@/lib/pdf";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HardHat, FileDown, Send, Loader2, Building2, BookOpen,
  ChevronRight, CheckCircle2, PauseCircle, TrendingUp, ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_META = {
  aktiv:         { label: "Aktiv",         icon: TrendingUp,   cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  pausiert:      { label: "Pausiert",      icon: PauseCircle,  cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  abgeschlossen: { label: "Abgeschlossen", icon: CheckCircle2, cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
} as const;

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChefPage() {
  const router   = useRouter();
  const { user } = useAuth();
  const diary    = useStore((s) => s.diary);
  const projects = useStore((s) => s.projects);
  const contacts = useStore((s) => s.contacts);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Guard — redirect non-admins
  useEffect(() => {
    if (user && !isAdmin(user.email)) {
      router.replace("/");
    }
  }, [user, router]);

  const admin = isAdmin(user?.email);

  const chefEntries = useMemo(
    () => diary.filter((e) => e.chefNotes?.trim()).sort((a, b) => b.date.localeCompare(a.date)),
    [diary]
  );

  const recentEntries = useMemo(
    () => [...diary].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [diary]
  );

  const thisWeekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return diary.filter((e) => new Date(e.date) >= weekAgo).length;
  }, [diary]);

  const handlePdf = async (entryId: string, forward = false) => {
    const entry   = diary.find((e) => e.id === entryId);
    const project = projects.find((p) => p.id === entry?.projectId);
    if (!entry || !project) return;
    const key = entryId + (forward ? "-fwd" : "-dl");
    setLoadingId(key);
    try {
      const blob  = await generateBauberichtPDF(entry, project, contacts, user?.email ?? "");
      const date  = new Date(entry.date).toLocaleDateString("de-DE").replace(/\./g, "-");
      const fname = `Baubericht_${project.name.replace(/\s+/g, "_")}_${date}.pdf`;
      await sharePDF(blob, fname, forward ? ADMIN_EMAIL : undefined);
    } finally {
      setLoadingId(null);
    }
  };

  // Show nothing while redirect is in flight
  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-8">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <p className="font-semibold">Kein Zugriff</p>
        <p className="text-sm text-muted-foreground">Dieser Bereich ist nur für Admins zugänglich.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <HardHat className="h-6 w-6 text-amber-500" />
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Chef-Dashboard</h1>
          <p className="text-muted-foreground text-sm">Vollständige Übersicht aller Projekte und Hinweise</p>
        </div>
        <Badge className="bg-amber-500 text-white text-[10px] px-1.5 ml-auto">Admin</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Building2}  label="Projekte gesamt"   value={projects.length}                                          color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatCard icon={TrendingUp} label="Aktive Projekte"   value={projects.filter((p) => p.status === "aktiv").length}     color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" />
        <StatCard icon={BookOpen}   label="Berichte (7 Tage)" value={thisWeekCount}                                           color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" />
        <StatCard icon={HardHat}    label="Chef-Hinweise"     value={chefEntries.length}                                      color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: hints + recent */}
        <div className="lg:col-span-3 space-y-6">

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Chef-Hinweise</h2>
              <Badge variant="secondary">{chefEntries.length}</Badge>
            </div>

            {chefEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <HardHat className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Keine ausstehenden Hinweise.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chefEntries.map((entry) => {
                  const project = projects.find((p) => p.id === entry.projectId);
                  const isDl  = loadingId === entry.id + "-dl";
                  const isFwd = loadingId === entry.id + "-fwd";
                  return (
                    <Card key={entry.id} className="overflow-hidden">
                      <div className="h-0.5 bg-amber-400" />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm font-semibold">
                                {new Date(entry.date).toLocaleDateString("de-DE", {
                                  weekday: "short", day: "2-digit", month: "short", year: "numeric",
                                })}
                              </span>
                              {project && (
                                <Link href={`/projekte/${project.id}`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                  {project.name}<ChevronRight className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                            <p className="text-sm text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 rounded px-2.5 py-2 border border-amber-100 dark:border-amber-800 line-clamp-3">
                              {entry.chefNotes}
                            </p>
                            {entry.attendees && entry.attendees.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1.5">
                                {entry.attendees.length} Firma{entry.attendees.length !== 1 ? "en" : ""}
                                {" · "}{entry.attendees.reduce((n, a) => n + a.personCount, 0)} Personen
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={isDl} onClick={() => handlePdf(entry.id, false)} title="PDF herunterladen">
                              {isDl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                            </Button>
                            <Button size="sm" className="h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600 text-white border-0" disabled={isFwd} onClick={() => handlePdf(entry.id, true)} title="An Chef senden">
                              {isFwd ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Letzte Berichte</h2>
              <Link href="/bautagebuch" className="text-xs text-primary hover:underline">Alle anzeigen</Link>
            </div>
            {recentEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Einträge.</p>
            ) : (
              <div className="space-y-1.5">
                {recentEntries.map((entry) => {
                  const project = projects.find((p) => p.id === entry.projectId);
                  return (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {new Date(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                          {project && <p className="text-xs text-muted-foreground truncate">{project.name}</p>}
                        </div>
                      </div>
                      {entry.chefNotes && <HardHat className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right: projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Projekte</h2>
            <Link href="/projekte" className="text-xs text-primary hover:underline">Alle</Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Projekte.</p>
          ) : (
            <div className="space-y-1.5">
              {projects.map((project) => {
                const meta       = STATUS_META[project.status];
                const StatusIcon = meta.icon;
                const count      = diary.filter((e) => e.projectId === project.id).length;
                return (
                  <Link
                    key={project.id}
                    href={`/projekte/${project.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md", meta.cls)}>
                        <StatusIcon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        {project.client && <p className="text-xs text-muted-foreground truncate">{project.client}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">{count}</span>
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
