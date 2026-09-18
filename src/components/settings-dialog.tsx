"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog } from "lucide-react";

type FormData = { chefName: string; chefEmail: string };

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const chefName = useStore((s) => s.chefName);
  const chefEmail = useStore((s) => s.chefEmail);
  const setChefInfo = useStore((s) => s.setChefInfo);
  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    reset({ chefName, chefEmail });
  }, [open, chefName, chefEmail, reset]);

  const onSubmit = (data: FormData) => {
    setChefInfo({ name: data.chefName, email: data.chefEmail });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Einstellungen
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-3">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Chef-Bereich</p>
            <div className="space-y-1.5">
              <Label htmlFor="chefName">Name des Chefs</Label>
              <Input id="chefName" {...register("chefName")} placeholder="Max Mustermann" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chefEmail">E-Mail des Chefs</Label>
              <Input id="chefEmail" type="email" {...register("chefEmail")} placeholder="chef@firma.de" />
              <p className="text-xs text-muted-foreground">
                Wird beim Weiterleiten von Bauberichten als Empfänger verwendet.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit">Speichern</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
