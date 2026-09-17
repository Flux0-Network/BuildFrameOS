import { getProjects } from "./actions/projects";
import { getContacts } from "./actions/contacts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [projects, contacts] = await Promise.all([getProjects(), getContacts()]);

  const aktiv = projects.filter((p) => p.status === "aktiv").length;
  const abgeschlossen = projects.filter((p) => p.status === "abgeschlossen").length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Übersicht deiner Bauprojekte</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projekte gesamt</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Projekte</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{aktiv}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abgeschlossen}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontakte</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent projects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aktive Projekte</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.filter((p) => p.status === "aktiv").length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine aktiven Projekte.</p>
            ) : (
              <ul className="space-y-2">
                {projects
                  .filter((p) => p.status === "aktiv")
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projekte/${p.id}`}
                        className="flex items-center justify-between rounded-md p-2 hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          {p.address && (
                            <p className="text-xs text-muted-foreground">{p.address}</p>
                          )}
                        </div>
                        <Badge variant="success">aktiv</Badge>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Letzte Kontakte</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Kontakte angelegt.</p>
            ) : (
              <ul className="space-y-2">
                {contacts.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-accent transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      {c.company && (
                        <p className="text-xs text-muted-foreground">{c.company}</p>
                      )}
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
