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
import { ChevronLeft, Plus, MapPin, User, Calendar, Pencil, Trash2, Cloud, Thermometer, Users } from "lucide-react";
import { ProjectDialog } from "./project-dialog";

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  aktiv: "success",
  pausiert: "warning",
  abgeschlossen: "secondary",
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const entries = useStore((s) => s.diary.filter((d) => d.projectId === projectId));
  const deleteDiaryEntry = useStore((s) => s.deleteDiaryEntry);
  const [projectOpen, setProjectOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  if (!project) notFound();

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

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
                <CardContent className="px-4 pb-4 pt-1">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
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
                  {entry.activities && (
                    <div className="mb-2">
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
