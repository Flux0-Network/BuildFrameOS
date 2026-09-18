"use client";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const projects = useStore((s) => s.projects);
  const contacts = useStore((s) => s.contacts);

  const aktiv = projects.filter((p) => p.status === "aktiv").length;
  const abgeschlossen = projects.filter((p) => p.status === "abgeschlossen").length;

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Übersicht deiner Bauprojekte</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs lg:text-sm font-medium">Gesamt</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs lg:text-sm font-medium">Aktiv</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-green-600">{aktiv}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs lg:text-sm font-medium">Abgeschlossen</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{abgeschlossen}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs lg:text-sm font-medium">Kontakte</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-sm lg:text-base">Aktive Projekte</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6 pt-0">
            {aktiv === 0 ? (
              <p className="text-sm text-muted-foreground">Keine aktiven Projekte.</p>
            ) : (
              <ul className="space-y-1">
                {projects
                  .filter((p) => p.status === "aktiv")
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projekte/${p.id}`}
                        className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
                      >
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          {p.address && <p className="text-xs text-muted-foreground truncate">{p.address}</p>}
                        </div>
                        <Badge variant="success" className="flex-shrink-0">aktiv</Badge>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-sm lg:text-base">Letzte Kontakte</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6 pt-0">
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Kontakte angelegt.</p>
            ) : (
              <ul className="space-y-1">
                {contacts.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      {c.company && <p className="text-xs text-muted-foreground truncate">{c.company}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
