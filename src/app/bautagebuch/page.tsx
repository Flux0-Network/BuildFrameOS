"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Cloud, Thermometer, Users, FileDown, Send } from "lucide-react";
import { generateBauberichtPDF, sharePDF } from "@/lib/pdf";

export default function BautagebuchPage() {
  const diary = useStore((s) => s.diary);
  const projects = useStore((s) => s.projects);
  const contacts = useStore((s) => s.contacts);
  const chefName = useStore((s) => s.chefName);
  const chefEmail = useStore((s) => s.chefEmail);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const sorted = [...diary].sort((a, b) => b.date.localeCompare(a.date));

  const handlePdf = async (entryId: string, forward = false) => {
    const entry = diary.find((e) => e.id === entryId);
    const project = projects.find((p) => p.id === entry?.projectId);
    if (!entry || !project) return;
    setLoadingPdf(entryId + (forward ? "-fwd" : ""));
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
                    <div className="flex items-center gap-1">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mr-1">
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" title="PDF herunterladen"
                        disabled={loadingPdf === entry.id}
                        onClick={() => handlePdf(entry.id, false)}>
                        <FileDown className="h-3.5 w-3.5" />
                      </Button>
                      {chefEmail && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-amber-600 hover:text-amber-700" title="An Chef senden"
                          disabled={loadingPdf === entry.id + "-fwd"}
                          onClick={() => handlePdf(entry.id, true)}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-1 space-y-2">
                  {entry.attendees && entry.attendees.length > 0 && (
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="text-left px-2.5 py-1 font-medium text-muted-foreground">Firma</th>
                            <th className="text-center px-2.5 py-1 font-medium text-muted-foreground w-14">Pers.</th>
                            <th className="text-left px-2.5 py-1 font-medium text-muted-foreground">Tätigkeit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.attendees.map((a) => (
                            <tr key={a.id} className="border-b last:border-0">
                              <td className="px-2.5 py-1 font-medium">{a.firmName}</td>
                              <td className="px-2.5 py-1 text-center text-muted-foreground">{a.personCount}</td>
                              <td className="px-2.5 py-1 text-muted-foreground">{a.activity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {entry.activities && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{entry.activities}</p>
                  )}
                  {entry.chefNotes && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5">
                      <p className="text-xs font-medium text-amber-800">Chef-Hinweis</p>
                      <p className="text-xs text-amber-900 line-clamp-1">{entry.chefNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
