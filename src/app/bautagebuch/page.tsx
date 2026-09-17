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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bautagebuch</h1>
        <p className="text-muted-foreground mt-1">Alle Einträge über alle Projekte</p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Noch keine Einträge vorhanden.</p>
          <p className="text-sm text-muted-foreground">
            Gehe zu einem Projekt und erstelle den ersten Eintrag.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => {
            const project = projects.find((p) => p.id === entry.projectId);
            return (
              <Card key={entry.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {new Date(entry.date).toLocaleDateString("de-DE", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      {project && (
                        <Link href={`/projekte/${project.id}`} className="text-sm text-primary hover:underline">
                          {project.name}
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
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
                          <Users className="h-3.5 w-3.5" /> {entry.workers}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {entry.activities && (
                  <CardContent className="pt-0">
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
