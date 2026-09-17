"use client";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDiaryEntry, updateDiaryEntry } from "@/app/actions/diary";
import type { InferSelectModel } from "drizzle-orm";
import type { diaryEntries } from "@/db/schema";

type DiaryEntry = InferSelectModel<typeof diaryEntries>;

type FormData = {
  date: string;
  weather: string;
  temperature: string;
  workers: string;
  activities: string;
  notes: string;
};

const weatherOptions = ["Sonnig", "Bewölkt", "Regnerisch", "Windig", "Schnee", "Nebel", "Gewitter"];

export function DiaryDialog({
  open,
  onOpenChange,
  projectId,
  entry,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: number;
  entry: DiaryEntry | null;
}) {
  const [pending, startTransition] = useTransition();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();
  const weather = watch("weather");

  useEffect(() => {
    if (entry) {
      reset({
        date: entry.date,
        weather: entry.weather ?? "",
        temperature: entry.temperature != null ? String(entry.temperature) : "",
        workers: entry.workers != null ? String(entry.workers) : "",
        activities: entry.activities ?? "",
        notes: entry.notes ?? "",
      });
    } else {
      reset({
        date: new Date().toISOString().split("T")[0],
        weather: "",
        temperature: "",
        workers: "",
        activities: "",
        notes: "",
      });
    }
  }, [entry, open, reset]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const payload = {
        date: data.date,
        weather: data.weather || undefined,
        temperature: data.temperature ? parseFloat(data.temperature) : undefined,
        workers: data.workers ? parseInt(data.workers) : undefined,
        activities: data.activities || undefined,
        notes: data.notes || undefined,
      };
      if (entry) {
        await updateDiaryEntry(entry.id, projectId, payload);
      } else {
        await createDiaryEntry({ ...payload, projectId });
      }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Eintrag bearbeiten" : "Neuer Bautagebuch-Eintrag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">Datum *</Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <Label>Wetter</Label>
              <Select value={weather} onValueChange={(v) => setValue("weather", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
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

          <div className="space-y-1.5">
            <Label htmlFor="activities">Tätigkeiten</Label>
            <Textarea
              id="activities"
              {...register("activities")}
              placeholder="Was wurde heute gemacht?"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notizen / Besonderheiten</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Besondere Vorkommnisse, Lieferungen, Probleme..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Speichern..." : entry ? "Speichern" : "Eintrag erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
