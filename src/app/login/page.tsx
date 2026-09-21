"use client";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MailCheck } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "register";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.error) {
        if (result.error.toLowerCase().includes("email not confirmed")) {
          setError("E-Mail noch nicht bestätigt. Bitte prüfe dein Postfach.");
        } else {
          setError("E-Mail oder Passwort falsch.");
        }
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // After clicking confirmation link, land on the app root
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setAwaitingConfirm(true);
      }
    }

    setLoading(false);
  };

  if (awaitingConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Image src="/buildframeOS-logo.png" alt="BuildFrameOS" width={36} height={36} className="object-contain" />
            <span className="text-2xl font-bold tracking-tight">BuildFrameOS</span>
          </div>
          <Card>
            <CardContent className="pt-8 pb-8">
              <MailCheck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">E-Mail bestätigen</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Wir haben eine Bestätigungs-E-Mail an
              </p>
              <p className="text-sm font-medium mb-4">{email}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
                Danach wirst du automatisch eingeloggt.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setAwaitingConfirm(false); setMode("login"); setPassword(""); }}
              >
                Zurück zur Anmeldung
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/buildframeOS-logo.png" alt="BuildFrameOS" width={36} height={36} className="object-contain" />
          <span className="text-2xl font-bold tracking-tight">BuildFrameOS</span>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">
              {mode === "login" ? "Anmelden" : "Registrieren"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firma.de"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                {mode === "register" && (
                  <p className="text-xs text-muted-foreground">Mindestens 6 Zeichen</p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {mode === "login" ? "Anmelden" : "Konto erstellen"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Noch kein Konto?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => { setMode("register"); setError(""); }}
                    >
                      Registrieren
                    </button>
                  </>
                ) : (
                  <>
                    Bereits ein Konto?{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => { setMode("login"); setError(""); }}
                    >
                      Anmelden
                    </button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
