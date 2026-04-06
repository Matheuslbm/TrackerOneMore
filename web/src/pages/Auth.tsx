import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/shared/types";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const loginData: LoginRequest = { email, password };
        const { data } = await api.post<AuthResponse>("/auth/login", loginData);

        setToken(data.accessToken);
        setUser(data);

        toast.success(`Bem-vindo, ${data.name}!`);
        navigate("/");
      } else {
        const registerData: RegisterRequest = { name, email, password };
        const { data } = await api.post<AuthResponse>("/auth/register", registerData);

        setToken(data.accessToken);
        setUser(data);

        toast.success(`Conta criada com sucesso! Bem-vindo, ${data.name}!`);
        navigate("/");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Algo deu errado";
      toast.error(errorMessage);
      console.error("Erro no auth:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-10"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-streak-fire/10 border border-streak-fire/20 mb-5"
          >
            <Flame
              className="h-11 w-11 text-streak-fire drop-shadow-[0_0_14px_hsl(var(--streak-fire)/0.5)]"
              fill="hsl(var(--streak-fire))"
              strokeWidth={1.5}
            />
          </motion.div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
            Streak<span className="text-streak-fire">.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Construa hábitos, mantenha consistência
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-8"
        >
          {/* Toggle */}
          <div className="flex gap-1 mb-8 p-1 rounded-xl bg-muted/40">
            {["Entrar", "Criar conta"].map((label, i) => {
              const active = i === 0 ? isLogin : !isLogin;
              return (
                <button
                  key={label}
                  onClick={() => setIsLogin(i === 0)}
                  className={`relative flex-1 py-2.5 text-sm font-display font-semibold transition-colors rounded-lg ${active ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="authToggle"
                      className="absolute inset-0 rounded-lg bg-secondary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="text-sm text-muted-foreground font-medium mb-1.5 block">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      required={!isLogin}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground font-medium mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <p className="text-center text-xs text-muted-foreground mt-5">
              Esqueceu a senha?{" "}
              <button className="text-primary hover:underline">Recuperar</button>
            </p>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Excelência é a repetição de comportamentos que nada tem de especial
        </p>
      </div>
    </div>
  );
};

export default Auth;
