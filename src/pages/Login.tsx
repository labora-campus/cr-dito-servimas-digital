import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithPassword, user, loading } = useAuth();

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/";
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [from, loading, navigate, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signInWithPassword({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      toast({ title: "Login", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">Ingresar</h1>
        <p className="text-sm text-muted-foreground mt-1">Servimas Créditos</p>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
