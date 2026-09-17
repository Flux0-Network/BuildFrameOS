"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import type { Project } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FormData = {
  name: string;
  address: string;
  client: string;
  status: "aktiv" | "abgeschlossen" | "pausiert";
  startDate: string;
  endDate: string;
  description: string;
};

export function ProjectDialog({
  open, onOpenChange, project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project | null;
}) {
  const addProject = useStore((s) => s.addProject);
  const updateProject = useStore((s) => s.updateProject);
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: { status: "aktiv" },
  });
  const status = watch("status");

  useEffect(() => {
    reset({
      name: project?.name ?? "",
      address: project?.address ?? "",
      client: project?.client ?? "",
      status: project?.status ?? "aktiv",
      startDate: project?.startDate ?? "",
      endDate: project?.endDate ?? "",
      description: project?.description ?? "",
    });
  }, [project, open, reset]);

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      address: data.address || undefined,
      client: data.client || undefined,
      status: data.status,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      description: data.description || undefined,
    };
    if (project) {
      updateProject(project.id, payload);
    } else {
      addProject(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Projekt bearbeiten" : "Neues Projekt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Projektname *</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="z.B. Neubau Musterstraße 5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="client">Auftraggeber</Label>
              <Input id="client" {...register("client")} placeholder="Firma / Person" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as FormData["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="pausiert">Pausiert</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Adresse / Baustelle</Label>
            <Input id="address" {...register("address")} placeholder="Straße, PLZ Ort" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Beginn</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Geplantes Ende</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea id="description" {...register("description")} placeholder="Kurze Projektbeschreibung..." rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit">{project ? "Speichern" : "Erstellen"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
