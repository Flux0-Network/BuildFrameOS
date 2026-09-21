"use client";
import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { useAuth } from "@/context/auth-context";
import { generateBauberichtPDF, sharePDF } from "@/lib/pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HardHat, Mail, AlertCircle, FileDown, Send, Loader2,
  Settings, Building2, BookOpen, Users, ChevronRight,
  CheckCircle2, Clock, PauseCircle, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { SettingsDialog } from "@/components/settings-dialog";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon, label, value, color,
}: {
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

const STATUS_META = {
  aktiv:         { label: "Aktiv",         icon: TrendingUp,   cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  pausiert:      { label: "Pausiert",      icon: PauseCircle,  cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" },
  abgeschlossen: { label: "Abgeschlossen", icon: CheckCircle2, cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
} as const;

export default function ChefPage() {
  const diary    = useStore((s) => s.diary);
  const projects = useStore((s) => s.projects);
  const contacts = useStore((s) => s.contacts);
  const chefName  = useSettingsStore((s) => s.chefName);
  const chefEmail = useSettingsStore((s) => s.chefEmail);
  const { user }  = useAuth();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isChef = !!chefEmail && user?.email === chefEmail;

  const chefEntries = useMemo(
    () => diary
      .filter((e) => e.chefNotes?.trim())
      .sort((a, b) => b.date.localeCompare(a.date)),
    [diary]
  );

  const recentEntries = useMemo(
    () => [...diary].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [diary]
  );

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return diary.filter((e) => new Date(e.date) >= weekAgo).length;
  }, [diary]);

  const handlePdf = async (entryId: string, forward = false) => {
    const entry   = diary.find((e) => e.id === entryId);
    const project = projects.find((p) => p.id === entry?.projectId);
    if (!entry || !project) return;
    const key = entryId + (forward ? "-fwd" : "-dl");
    setLoadingId(key);
    try {
      const blob = await generateBauberichtPDF(entry, project, contacts, chefName);
      const date  = new Date(entry.date).toLocaleDateString("de-DE").replace(/\./g, "-");
      const fname = `Baubericht_${project.name.replace(/\s+/g, "_")}_${date}.pdf`;
      await sharePDF(blob, fname, forward ? chefEmail : undefined);
    } finally {
      setLoadingId(null);
    }
  };

  const greeting = chefName ? `Guten Tag, ${chefName}` : "Chef-Dashboard";

  return (
    <div className="p-4 lg:p-8 max-w-5xl">

      {/* ── Page header ─────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <HardHat className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl lg:text-3xl font-bold">{greeting}</h1>
            {isChef && (
              <Badge className="bg-amber-500 text-white text-[10px] px-1.5">Chef</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">Übersicht aller Projekte, Berichte und Hinweise</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-3.5 w-3.5" />
          Einstellungen
        </Button>
      </div>

      {/* ── Chef not configured warning ─────────────── */}
      {!chefEmail && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Chef noch nicht konfiguriert</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Trage Name und E-Mail in den Einstellungen ein, um Berichte weiterzuleiten.
            </p>
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs border-amber-300" onClick={() => setSettingsOpen(true)}>
              Jetzt einrichten
            </Button>
          </div>
        </div>
      )}

      {/* ── Stats row ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Building2}  label="Projekte gesamt" value={projects.length}                                                             color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatCard icon={TrendingUp} label="Aktive Projekte"  value={projects.filter((p) => p.status === "aktiv").length}                        color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" />
        <StatCard icon={BookOpen}   label="Berichte (7 Tage)" value={thisWeekCount}                                                            color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" />
        <StatCard icon={HardHat}    label="Offene Hinweise"  value={chefEntries.length}                                                         color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left col: Chef-Hinweise + recent entries ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Chef-Hinweise */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Chef-Hinweise
              </h2>
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
                  const project   = projects.find((p) => p.id === entry.projectId);
                  const isDl  = loadingId === entry.id + "-dl";
                  const isFwd = loadingId === entry.id + "-fwd";
                  return (
                    <Card key={entry.id} className="overflow-hidden">
                      {/* amber top border */}
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
                            {chefEmail && (
                              <Button size="sm" className="h-8 w-8 p-0 bg-amber-500 hover:bg-amber-600 text-white border-0" disabled={isFwd} onClick={() => handlePdf(entry.id, true)} title="An Chef senden">
                                {isFwd ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent diary entries */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Letzte Berichte
              </h2>
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
                      {entry.chefNotes && (
                        <HardHat className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Right col: Projects + Chef contact ──────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* All projects */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Projekte
              </h2>
              <Link href="/projekte" className="text-xs text-primary hover:underline">Alle</Link>
            </div>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Projekte.</p>
            ) : (
              <div className="space-y-1.5">
                {projects.map((project) => {
                  const meta = STATUS_META[project.status];
                  const StatusIcon = meta.icon;
                  const entryCount = diary.filter((e) => e.projectId === project.id).length;
                  return (
                    <Link
                      key={project.id}
                      href={`/projekte/${project.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent transition-colors group"
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
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">{entryCount}</span>
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Chef contact info */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Chef-Kontakt
            </h2>
            <Card>
              <CardContent className="p-4 space-y-3">
                {chefName ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-sm">
                      {chefName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{chefName}</p>
                    </div>
                  </div>
                ) : null}
                {chefEmail ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">E-Mail</p>
                      <p className="text-sm font-medium truncate">{chefEmail}</p>
                    </div>
                  </div>
                ) : null}
                {!chefName && !chefEmail && (
                  <p className="text-xs text-muted-foreground text-center py-2">Noch nicht konfiguriert.</p>
                )}
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-3.5 w-3.5" />
                  Bearbeiten
                </Button>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
