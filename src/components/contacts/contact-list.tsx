"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactDialog } from "./contact-dialog";
import { deleteContact } from "@/app/actions/contacts";
import { Plus, Phone, Mail, Building2, Pencil, Trash2 } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { contacts } from "@/db/schema";

type Contact = InferSelectModel<typeof contacts>;

export function ContactList({ contacts }: { contacts: Contact[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kontakte</h1>
          <p className="text-muted-foreground mt-1">{contacts.length} Kontakt{contacts.length !== 1 ? "e" : ""}</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> Neuer Kontakt
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-4">Noch keine Kontakte angelegt.</p>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4" /> Ersten Kontakt erstellen
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <Card key={c.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    {c.role && <p className="text-xs text-muted-foreground">{c.role}</p>}
                  </div>
                </div>

                {c.company && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{c.company}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <a href={`tel:${c.phone}`} className="hover:text-foreground transition-colors truncate">
                      {c.phone}
                    </a>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <a href={`mailto:${c.email}`} className="hover:text-foreground transition-colors truncate">
                      {c.email}
                    </a>
                  </div>
                )}

                {c.notes && (
                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2 line-clamp-2">{c.notes}</p>
                )}

                <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => { setEditing(c); setOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={async () => {
                      if (confirm(`Kontakt "${c.name}" wirklich löschen?`)) {
                        await deleteContact(c.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContactDialog open={open} onOpenChange={setOpen} contact={editing} />
    </div>
  );
}
