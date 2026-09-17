"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import type { Contact } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormData = {
  name: string;
  company: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
};

export function ContactDialog({
  open, onOpenChange, contact,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact: Contact | null;
}) {
  const addContact = useStore((s) => s.addContact);
  const updateContact = useStore((s) => s.updateContact);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    reset({
      name: contact?.name ?? "",
      company: contact?.company ?? "",
      role: contact?.role ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
      notes: contact?.notes ?? "",
    });
  }, [contact, open, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      company: data.company || undefined,
      role: data.role || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      notes: data.notes || undefined,
    };
    if (contact) {
      updateContact(contact.id, payload);
    } else {
      addContact(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? "Kontakt bearbeiten" : "Neuer Kontakt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Max Mustermann" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Firma</Label>
              <Input id="company" {...register("company")} placeholder="Musterbau GmbH" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Funktion</Label>
              <Input id="role" {...register("role")} placeholder="Polier, Architekt..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" type="tel" {...register("phone")} placeholder="+49 123 456789" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" {...register("email")} placeholder="max@example.de" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Zusätzliche Infos..." rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit">{contact ? "Speichern" : "Erstellen"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
