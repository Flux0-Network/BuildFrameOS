"use client";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiaryDialog } from "@/components/diary/diary-dialog";
import { deleteDiaryEntry } from "@/app/actions/diary";
import { ChevronLeft, Plus, MapPin, User, Calendar, Pencil, Trash2, Cloud, Thermometer, Users } from "lucide-react";
import { ProjectDialog } from "./project-dialog";
import type { InferSelectModel } from "drizzle-orm";
import type { projects, diaryEntries } from "@/db/schema";

type Project = InferSelectModel<typeof projects>;
type DiaryEntry = InferSelectModel<typeof diaryEntries>;

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  aktiv: "success",
  pausiert: "warning",
  abgeschlossen: "secondary",
};

export function ProjectDetail({
  project,
  entries,
}: {
  project: Project;
  entries: DiaryEntry[];
}) {
  const [projectOpen, setProjectOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/projekte"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Alle Projekte
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant={statusVariant[project.status] ?? "secondary"}>{project.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
              {project.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {project.address}
                </span>
              )}
              {project.client && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {project.client}
                </span>
              )}
              {project.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.startDate}{project.endDate ? ` – ${project.endDate}` : ""}
                </span>
              )}
            </div>
            {project.description && (
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{project.description}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setProjectOpen(true)}>
            <Pencil className="h-3.5 w-3.5" /> Bearbeiten
          </Button>
        </div>
      </div>

      {/* Bautagebuch */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bautagebuch</h2>
          <Button
            size="sm"
            onClick={() => { setEditingEntry(null); setDiaryOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Eintrag
          </Button>
        </div>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-3">Noch keine Einträge im Bautagebuch.</p>
              <Button
                size="sm"
                onClick={() => { setEditingEntry(null); setDiaryOpen(true); }}
              >
                <Plus className="h-4 w-4" /> Ersten Eintrag erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {[...entries].reverse().map((entry) => (
              <Card key={entry.id} className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {new Date(entry.date).toLocaleDateString("de-DE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setEditingEntry(entry); setDiaryOpen(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={async () => {
                          if (confirm("Eintrag wirklich löschen?")) {
                            await deleteDiaryEntry(entry.id, project.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    {entry.weather && (
                      <span className="flex items-center gap-1">
                        <Cloud className="h-3.5 w-3.5" /> {entry.weather}
                      </span>
                    )}
                    {entry.temperature != null && (
                      <span className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5" /> {entry.temperature}°C
                      </span>
                    )}
                    {entry.workers != null && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {entry.workers} Arbeiter
                      </span>
                    )}
                  </div>
                  {entry.activities && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Tätigkeiten</p>
                      <p className="text-sm whitespace-pre-wrap">{entry.activities}</p>
                    </div>
                  )}
                  {entry.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Notizen</p>
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
      <DiaryDialog
        open={diaryOpen}
        onOpenChange={setDiaryOpen}
        projectId={project.id}
        entry={editingEntry}
      />
    </div>
  );
}
