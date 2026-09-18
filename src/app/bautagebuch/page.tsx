"use client";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Cloud, Thermometer, Users } from "lucide-react";

export default function BautagebuchPage() {
  const diary = useStore((s) => s.diary);
  const projects = useStore((s) => s.projects);

  const sorted = [...diary].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-5">
        <h1 className="text-2xl lg:text-3xl font-bold">Bautagebuch</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Alle Einträge über alle Projekte</p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm mb-1">Noch keine Einträge vorhanden.</p>
          <p className="text-xs text-muted-foreground">Gehe zu einem Projekt und erstelle den ersten Eintrag.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => {
            const project = projects.find((p) => p.id === entry.projectId);
            return (
              <Card key={entry.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm lg:text-base">
                        {new Date(entry.date).toLocaleDateString("de-DE", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })}
                      </CardTitle>
                      {project && (
                        <Link href={`/projekte/${project.id}`} className="text-xs text-primary hover:underline">
                          {project.name}
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {entry.weather && (
                        <span className="flex items-center gap-1"><Cloud className="h-3.5 w-3.5" /> {entry.weather}</span>
                      )}
                      {entry.temperature != null && (
                        <span className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> {entry.temperature}°C</span>
                      )}
                      {entry.workers != null && (
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {entry.workers}</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {entry.activities && (
                  <CardContent className="px-4 pb-4 pt-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">{entry.activities}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
