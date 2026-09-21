"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { generateBauberichtPDF, sharePDF } from "@/lib/pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HardHat, Mail, User, AlertCircle, FileDown, Send,
  ChevronRight, Loader2, Settings,
} from "lucide-react";
import Link from "next/link";
import { SettingsDialog } from "@/components/settings-dialog";

export default function ChefPage() {
  const diary    = useStore((s) => s.diary);
  const projects = useStore((s) => s.projects);
  const contacts = useStore((s) => s.contacts);
  const chefName  = useSettingsStore((s) => s.chefName);
  const chefEmail = useSettingsStore((s) => s.chefEmail);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const chefEntries = diary
    .filter((e) => e.chefNotes && e.chefNotes.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handlePdf = async (entryId: string, forward = false) => {
    const entry   = diary.find((e) => e.id === entryId);
    const project = projects.find((p) => p.id === entry?.projectId);
    if (!entry || !project) return;
    setLoadingId(entryId + (forward ? "-fwd" : "-dl"));
    try {
      const blob = await generateBauberichtPDF(entry, project, contacts, chefName);
      const date = new Date(entry.date).toLocaleDateString("de-DE").replace(/\./g, "-");
      const filename = `Baubericht_${project.name.replace(/\s+/g, "_")}_${date}.pdf`;
      await sharePDF(blob, filename, forward ? chefEmail : undefined);
    } finally {
      setLoadingId(null);
    }
  };

  const chefConfigured = chefName.trim() || chefEmail.trim();

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Chef</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Berichte mit Chef-Hinweisen und Kontaktdaten
        </p>
      </div>

      {/* Chef contact card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardHat className="h-4 w-4 text-amber-500" />
              Chef-Kontakt
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-3.5 w-3.5" />
              Bearbeiten
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!chefConfigured ? (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Chef noch nicht konfiguriert
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Trage Name und E-Mail in den Einstellungen ein, um Berichte weiterzuleiten.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 text-xs border-amber-300"
                  onClick={() => setSettingsOpen(true)}
                >
                  Jetzt einrichten
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              {chefName && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-bold text-sm flex-shrink-0">
                    {chefName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">{chefName}</p>
                  </div>
                </div>
              )}
              {chefEmail && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">E-Mail</p>
                    <p className="text-sm font-medium">{chefEmail}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chef-Hinweis entries */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Berichte mit Chef-Hinweis
        </h2>
        <Badge variant="secondary">{chefEntries.length}</Badge>
      </div>

      {chefEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <HardHat className="h-9 w-9 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Noch keine Einträge mit Chef-Hinweis.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Füge beim Anlegen eines Bautagebuch-Eintrags einen Chef-Hinweis hinzu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chefEntries.map((entry) => {
            const project = projects.find((p) => p.id === entry.projectId);
            const isLoadingDl  = loadingId === entry.id + "-dl";
            const isLoadingFwd = loadingId === entry.id + "-fwd";

            return (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Date + project */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold">
                          {new Date(entry.date).toLocaleDateString("de-DE", {
                            weekday: "short", day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                        {project && (
                          <Link
                            href={`/projekte/${project.id}`}
                            className="text-xs text-primary hover:underline flex items-center gap-0.5"
                          >
                            {project.name}
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      {/* Chef note preview */}
                      <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
                          Chef-Hinweis
                        </p>
                        <p className="text-sm text-amber-900 dark:text-amber-200 line-clamp-3">
                          {entry.chefNotes}
                        </p>
                      </div>

                      {/* Attendees count */}
                      {entry.attendees && entry.attendees.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {entry.attendees.length} Firma{entry.attendees.length !== 1 ? "en" : ""} anwesend
                          · {entry.attendees.reduce((n, a) => n + a.personCount, 0)} Personen
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 text-xs"
                        disabled={isLoadingDl}
                        onClick={() => handlePdf(entry.id, false)}
                      >
                        {isLoadingDl
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <FileDown className="h-3.5 w-3.5" />}
                        PDF
                      </Button>
                      {chefEmail && (
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white border-0"
                          disabled={isLoadingFwd}
                          onClick={() => handlePdf(entry.id, true)}
                        >
                          {isLoadingFwd
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Send className="h-3.5 w-3.5" />}
                          Senden
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

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
