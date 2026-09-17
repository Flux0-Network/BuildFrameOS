"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Project } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectDialog } from "./project-dialog";
import { Plus, MapPin, User, Pencil, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  aktiv: "success",
  pausiert: "warning",
  abgeschlossen: "secondary",
};

export function ProjectList() {
  const projects = useStore((s) => s.projects);
  const deleteProject = useStore((s) => s.deleteProject);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projekte</h1>
          <p className="text-muted-foreground mt-1">{projects.length} Projekt{projects.length !== 1 ? "e" : ""}</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Neues Projekt
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-4">Noch keine Projekte angelegt.</p>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> Erstes Projekt erstellen
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Link href={`/projekte/${p.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                  </Link>
                  <Badge variant={statusVariant[p.status] ?? "secondary"}>{p.status}</Badge>
                </div>

                {p.address && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{p.address}</span>
                  </div>
                )}
                {p.client && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <User className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{p.client}</span>
                  </div>
                )}
                {p.startDate && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {p.startDate}{p.endDate ? ` – ${p.endDate}` : ""}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditing(p); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => { if (confirm(`Projekt "${p.name}" wirklich löschen?`)) deleteProject(p.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Link href={`/projekte/${p.id}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Details <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProjectDialog open={open} onOpenChange={setOpen} project={editing} />
    </div>
  );
}
