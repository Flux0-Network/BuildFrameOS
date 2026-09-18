"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { DiaryEntry } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiaryDialog } from "@/components/diary/diary-dialog";
import {
  ChevronLeft, Plus, MapPin, User, Calendar, Pencil, Trash2,
  Cloud, Thermometer, Users, FileDown, Send
} from "lucide-react";
import { ProjectDialog } from "./project-dialog";
import { generateBauberichtPDF, sharePDF } from "@/lib/pdf";

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  aktiv: "success",
  pausiert: "warning",
  abgeschlossen: "secondary",
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const entries = useStore((s) => s.diary.filter((d) => d.projectId === projectId));
  const contacts = useStore((s) => s.contacts);
  const chefName = useStore((s) => s.chefName);
  const chefEmail = useStore((s) => s.chefEmail);
  const deleteDiaryEntry = useStore((s) => s.deleteDiaryEntry);
  const [projectOpen, setProjectOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  if (!project) notFound();

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  const handlePdf = async (entry: DiaryEntry, forward = false) => {
    setLoadingPdf(entry.id + (forward ? "-fwd" : ""));
    try {
      const blob = await generateBauberichtPDF(entry, project, contacts, chefName);
      const date = new Date(entry.date).toLocaleDateString("de-DE").replace(/\./g, "-");
      const filename = `Baubericht_${project.name.replace(/\s+/g, "_")}_${date}.pdf`;
      await sharePDF(blob, filename, forward ? chefEmail : undefined);
    } finally {
      setLoadingPdf(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      <div className="mb-5">
        <Link href="/projekte" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ChevronLeft className="h-4 w-4" /> Alle Projekte
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl lg:text-3xl font-bold truncate">{project.name}</h1>
              <Badge variant={statusVariant[project.status] ?? "secondary"} className="flex-shrink-0">
                {project.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-xs lg:text-sm text-muted-foreground">
              {project.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" /> {project.address}
                </span>
              )}
              {project.client && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 flex-shrink-0" /> {project.client}
                </span>
              )}
              {project.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  {project.startDate}{project.endDate ? ` – ${project.endDate}` : ""}
                </span>
              )}
            </div>
            {project.description && (
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setProjectOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">Bearbeiten</span>
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg lg:text-xl font-semibold">Bautagebuch</h2>
          <Button size="sm" onClick={() => { setEditingEntry(null); setDiaryOpen(true); }}>
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Eintrag</span>
          </Button>
        </div>

        {sorted.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm mb-3">Noch keine Einträge im Bautagebuch.</p>
              <Button size="sm" onClick={() => { setEditingEntry(null); setDiaryOpen(true); }}>
                <Plus className="h-4 w-4" /> Ersten Eintrag erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map((entry) => (
              <Card key={entry.id} className="group">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm lg:text-base leading-snug">
                      {new Date(entry.date).toLocaleDateString("de-DE", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </CardTitle>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="PDF herunterladen"
                        disabled={loadingPdf === entry.id}
                        onClick={() => handlePdf(entry, false)}>
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                      {chefEmail && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:text-amber-700" title="An Chef senden"
                          disabled={loadingPdf === entry.id + "-fwd"}
                          onClick={() => handlePdf(entry, true)}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { setEditingEntry(entry); setDiaryOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm("Eintrag wirklich löschen?")) deleteDiaryEntry(entry.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-1 space-y-3">
                  {/* Weather row */}
                  {(entry.weather || entry.temperature != null || entry.workers != null) && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {entry.weather && (
                        <span className="flex items-center gap-1"><Cloud className="h-3.5 w-3.5" /> {entry.weather}</span>
                      )}
                      {entry.temperature != null && (
                        <span className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> {entry.temperature}°C</span>
                      )}
                      {entry.workers != null && (
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {entry.workers} Arbeiter</span>
                      )}
                    </div>
                  )}

                  {/* Attendees table */}
                  {entry.attendees && entry.attendees.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Anwesende
                      </p>
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground">Firma / Person</th>
                              <th className="text-center px-2.5 py-1.5 font-medium text-muted-foreground w-16">Pers.</th>
                              <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground">Tätigkeit</th>
                              <th className="text-left px-2.5 py-1.5 font-medium text-muted-foreground hidden sm:table-cell">Notiz</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entry.attendees.map((a) => (
                              <tr key={a.id} className="border-b last:border-0">
                                <td className="px-2.5 py-1.5 font-medium">{a.firmName}</td>
                                <td className="px-2.5 py-1.5 text-center text-muted-foreground">{a.personCount}</td>
                                <td className="px-2.5 py-1.5 text-muted-foreground">{a.activity}</td>
                                <td className="px-2.5 py-1.5 text-muted-foreground hidden sm:table-cell">{a.notes ?? ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {entry.activities && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Tätigkeiten</p>
                      <p className="text-sm whitespace-pre-wrap">{entry.activities}</p>
                    </div>
                  )}
                  {entry.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Notizen</p>
                      <p className="text-sm whitespace-pre-wrap">{entry.notes}</p>
                    </div>
                  )}
                  {entry.chefNotes && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                      <p className="text-xs font-medium text-amber-800 mb-0.5">Chef-Hinweis</p>
                      <p className="text-sm text-amber-900 whitespace-pre-wrap">{entry.chefNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjectDialog open={projectOpen} onOpenChange={setProjectOpen} project={project} />
      <DiaryDialog open={diaryOpen} onOpenChange={setDiaryOpen} projectId={projectId} entry={editingEntry} />
    </div>
  );
}
