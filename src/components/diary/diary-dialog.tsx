"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import type { DiaryEntry, DiaryAttendee } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Users } from "lucide-react";

type FormData = {
  date: string;
  weather: string;
  temperature: string;
  workers: string;
  activities: string;
  notes: string;
  chefNotes: string;
};

const weatherOptions = ["Sonnig", "Bewölkt", "Regnerisch", "Windig", "Schnee", "Nebel", "Gewitter"];

const emptyAttendee = { contactId: "", firmName: "", personCount: 1, activity: "", notes: "" };

export function DiaryDialog({
  open, onOpenChange, projectId, entry,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  entry: DiaryEntry | null;
}) {
  const addDiaryEntry = useStore((s) => s.addDiaryEntry);
  const updateDiaryEntry = useStore((s) => s.updateDiaryEntry);
  const contacts = useStore((s) => s.contacts);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const weather = watch("weather");

  const [attendees, setAttendees] = useState<DiaryAttendee[]>([]);
  const [addingAttendee, setAddingAttendee] = useState(false);
  const [newA, setNewA] = useState(emptyAttendee);

  useEffect(() => {
    reset({
      date: entry?.date ?? new Date().toISOString().split("T")[0],
      weather: entry?.weather ?? "",
      temperature: entry?.temperature != null ? String(entry.temperature) : "",
      workers: entry?.workers != null ? String(entry.workers) : "",
      activities: entry?.activities ?? "",
      notes: entry?.notes ?? "",
      chefNotes: entry?.chefNotes ?? "",
    });
    setAttendees(entry?.attendees ?? []);
    setAddingAttendee(false);
    setNewA(emptyAttendee);
  }, [entry, open, reset]);

  const handleContactSelect = (contactId: string) => {
    if (contactId === "__manual__") {
      setNewA((a) => ({ ...a, contactId: "", firmName: "" }));
      return;
    }
    const contact = contacts.find((c) => c.id === contactId);
    setNewA((a) => ({
      ...a,
      contactId,
      firmName: contact?.company || contact?.name || "",
    }));
  };

  const commitAttendee = () => {
    if (!newA.firmName.trim() || !newA.activity.trim()) return;
    setAttendees((prev) => [
      ...prev,
      { ...newA, id: crypto.randomUUID() },
    ]);
    setNewA(emptyAttendee);
    setAddingAttendee(false);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      date: data.date,
      weather: data.weather || undefined,
      temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      workers: data.workers ? parseInt(data.workers) : undefined,
      activities: data.activities || undefined,
      notes: data.notes || undefined,
      chefNotes: data.chefNotes || undefined,
      attendees: attendees.length > 0 ? attendees : undefined,
    };
    if (entry) {
      updateDiaryEntry(entry.id, payload);
    } else {
      addDiaryEntry({ ...payload, projectId });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Eintrag bearbeiten" : "Neuer Bautagebuch-Eintrag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Datum *</Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>

          {/* Weather row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <Label>Wetter</Label>
              <Select value={weather} onValueChange={(v) => setValue("weather", v)}>
                <SelectTrigger><SelectValue placeholder="Wählen..." /></SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temperature">Temp. (°C)</Label>
              <Input id="temperature" type="number" step="0.5" {...register("temperature")} placeholder="18" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workers">Arbeiter</Label>
              <Input id="workers" type="number" {...register("workers")} placeholder="5" />
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-1.5">
            <Label htmlFor="activities">Tätigkeiten</Label>
            <Textarea id="activities" {...register("activities")} placeholder="Was wurde heute gemacht?" rows={3} />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Anwesende Firmen / Personen
              </Label>
              {!addingAttendee && (
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs"
                  onClick={() => setAddingAttendee(true)}>
                  <Plus className="h-3 w-3 mr-0.5" /> Hinzufügen
                </Button>
              )}
            </div>

            {attendees.length > 0 && (
              <div className="space-y-1.5">
                {attendees.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold">{a.firmName}</span>
                      <span className="text-muted-foreground ml-2">{a.personCount} Pers.</span>
                      <span className="text-muted-foreground ml-2">· {a.activity}</span>
                      {a.notes && <span className="text-muted-foreground ml-2">({a.notes})</span>}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => setAttendees((prev) => prev.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {addingAttendee && (
              <div className="rounded-md border p-3 space-y-2.5 bg-muted/20">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Firma (aus Kontakten)</Label>
                    <Select
                      value={newA.contactId || "__manual__"}
                      onValueChange={handleContactSelect}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Kontakt wählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">Manuell eingeben</SelectItem>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.company ? `${c.company} (${c.name})` : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Name / Firma *</Label>
                    <Input className="h-8 text-xs" placeholder="Firma GmbH"
                      value={newA.firmName}
                      onChange={(e) => setNewA((a) => ({ ...a, firmName: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Tätigkeit *</Label>
                    <Input className="h-8 text-xs" placeholder="Maurerarbeiten..."
                      value={newA.activity}
                      onChange={(e) => setNewA((a) => ({ ...a, activity: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Personen</Label>
                    <Input className="h-8 text-xs" type="number" min={1} placeholder="3"
                      value={newA.personCount}
                      onChange={(e) => setNewA((a) => ({ ...a, personCount: parseInt(e.target.value) || 1 }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Notiz (optional)</Label>
                  <Input className="h-8 text-xs" placeholder="Zusätzliche Info..."
                    value={newA.notes}
                    onChange={(e) => setNewA((a) => ({ ...a, notes: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" className="h-7 text-xs" onClick={commitAttendee}>
                    Eintragen
                  </Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 text-xs"
                    onClick={() => { setAddingAttendee(false); setNewA(emptyAttendee); }}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notizen / Besonderheiten</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Besondere Vorkommnisse, Lieferungen, Probleme..." rows={2} />
          </div>

          {/* Chef notes */}
          <div className="space-y-1.5 rounded-md border border-amber-200 bg-amber-50 p-3">
            <Label htmlFor="chefNotes" className="text-amber-800 font-medium">Chef-Hinweis</Label>
            <Textarea
              id="chefNotes"
              {...register("chefNotes")}
              placeholder="Hinweise / Anweisungen speziell für den Chef..."
              rows={2}
              className="bg-white border-amber-200 focus-visible:ring-amber-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit">{entry ? "Speichern" : "Eintrag erstellen"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
