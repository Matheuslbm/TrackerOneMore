import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Flame, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const gateUnlockedKey = "gateUnlocked";

const Gate = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const gatePassword = useMemo(() => {
    return (import.meta.env.VITE_GATE_PASSWORD || "").trim();
  }, []);

  useLayoutEffect(() => {
    if (localStorage.getItem(gateUnlockedKey) === "true") {
      navigate("/auth", { replace: true });
      return;
    }

    const ctx = gsap.context(() => {
      const sparks = gsap.utils.toArray<HTMLElement>(".firework-spark");
      sparks.forEach((spark, index) => {
        const angle = (index / sparks.length) * Math.PI * 2;
        const radius = 60 + (index % 3) * 14;
        const delay = index * 0.1;
        gsap.fromTo(
          spark,
          { x: 0, y: 0, opacity: 0, scale: 0.1 },
          {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            repeat: -1,
            delay,
            ease: "power2.out",
            yoyo: true,
          }
        );
      });

      gsap.to(".firework-core", {
        scale: 1.15,
        opacity: 0.9,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [navigate]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatePassword) {
      toast.error("Senha nao configurada. Ajuste VITE_GATE_PASSWORD.");
      return;
    }

    setSubmitting(true);

    if (password.trim() === gatePassword) {
      localStorage.setItem(gateUnlockedKey, "true");
      toast.success("Acesso liberado.");
      navigate("/auth", { replace: true });
    } else {
      toast.error("Senha incorreta.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-streak-fire/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Acesso restrito
            </span>
            <h1 className="mt-3 font-display text-4xl font-bold text-foreground lg:text-5xl">
              Antes do login,
              <span className="text-streak-fire"> prove sua determinacao</span>.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Este ambiente esta protegido por senha. Insira a chave para liberar o acesso
              ao painel.
            </p>

            <form onSubmit={handleUnlock} className="mt-8 flex flex-col gap-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.2em]">
                Senha do ambiente
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Verificando..." : "Liberar acesso"}
              </button>
              <p className="text-xs text-muted-foreground">
                Essa senha fica no arquivo .env e nao aparece no repositorio.
              </p>
            </form>
          </motion.div>

          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex items-center justify-center"
          >
            <div className="glass relative flex h-80 w-80 items-center justify-center rounded-[32px] border border-border/40">
              <div className="firework-core absolute flex h-20 w-20 items-center justify-center rounded-full bg-streak-fire/20">
                <Flame className="h-10 w-10 text-streak-fire" />
              </div>
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="firework-spark absolute h-2 w-2 rounded-full bg-streak-fire/70"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Gate;
