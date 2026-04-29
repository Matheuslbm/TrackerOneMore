import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, Shield, Trophy, Loader2, Eye, EyeOff, Ban } from "lucide-react";
import { useActiveChallenges, useCreateChallenge, useDeleteChallenge, useLogChallenge } from "@/api/challengesApi";
import { toast } from "sonner";

const difficultyOptions = [
  { id: "Easy", label: "Fácil", color: "bg-primary/50 border-primary/30" },
  { id: "Medium", label: "Médio", color: "bg-streak-fire/40 border-streak-fire/30" },
  { id: "Hard", label: "Difícil", color: "bg-destructive/40 border-destructive/30" },
];

type ChallengeType = "objective" | "cleanup";

const challengeTypeLabels: Record<ChallengeType, string> = {
  objective: "Objetivo",
  cleanup: "Limpeza",
};

const challengeTypeIcons: Record<ChallengeType, typeof Shield> = {
  objective: Shield,
  cleanup: Ban,
};

const challengeTypeStorageKey = "challengeTypes";
const hiddenTitleStorageKey = "challengeHiddenTitles";
const completedTodayStorageKey = "challengeCompletedToday";

const getTodayKey = () => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const todayDay = String(today.getDate()).padStart(2, "0");
  return `${todayYear}-${todayMonth}-${todayDay}`;
};

const loadChallengeTypes = () => {
  try {
    const raw = localStorage.getItem(challengeTypeStorageKey);
    if (!raw) return {} as Record<string, ChallengeType>;
    return JSON.parse(raw) as Record<string, ChallengeType>;
  } catch {
    return {} as Record<string, ChallengeType>;
  }
};

const loadHiddenTitles = () => {
  try {
    const raw = localStorage.getItem(hiddenTitleStorageKey);
    if (!raw) return {} as Record<string, boolean>;
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {} as Record<string, boolean>;
  }
};

const loadCompletedToday = () => {
  try {
    const raw = localStorage.getItem(completedTodayStorageKey);
    if (!raw) return {} as Record<string, string>;
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

const Challenge = () => {
  const { data: challenges = [], isLoading, isFetching } = useActiveChallenges();
  const createChallengeMutation = useCreateChallenge();
  const deleteChallengeMutation = useDeleteChallenge();
  const logChallengeMutation = useLogChallenge();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState(14);
  const [newType, setNewType] = useState<ChallengeType>("objective");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Record<string, string>>({});
  const [hiddenTitles, setHiddenTitles] = useState<Record<string, boolean>>(() => loadHiddenTitles());
  const [completedToday, setCompletedToday] = useState<Record<string, string>>(() => loadCompletedToday());
  const [challengeTypes, setChallengeTypes] = useState<Record<string, ChallengeType>>(() => loadChallengeTypes());

  const saveChallengeTypes = (next: Record<string, ChallengeType>) => {
    setChallengeTypes(next);
    localStorage.setItem(challengeTypeStorageKey, JSON.stringify(next));
  };

  const saveHiddenTitles = (next: Record<string, boolean>) => {
    setHiddenTitles(next);
    localStorage.setItem(hiddenTitleStorageKey, JSON.stringify(next));
  };

  const saveCompletedToday = (next: Record<string, string>) => {
    setCompletedToday(next);
    localStorage.setItem(completedTodayStorageKey, JSON.stringify(next));
  };

  const handleAddChallenge = async () => {
    if (!newName.trim()) {
      toast.error("Digite um nome para o desafio");
      return;
    }

    try {
      const created = await createChallengeMutation.mutateAsync({
        title: newName.trim(),
        initialDaysDuration: newDuration,
      });

      saveChallengeTypes({
        ...challengeTypes,
        [created.id]: newType,
      });

      setNewName("");
      setNewDuration(14);
      setNewType("objective");
      setShowAdd(false);
      toast.success("Desafio criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar desafio");
    }
  };

  const handleLogChallenge = async (challengeId: string) => {
    try {
      const todayStr = getTodayKey();
      const difficulty = (selectedDifficulty[challengeId] || "Easy") as "Easy" | "Medium" | "Hard";

      await logChallengeMutation.mutateAsync({
        challengeId,
        date: todayStr,
        difficulty,
        survived: true,
      });

      saveCompletedToday({
        ...completedToday,
        [challengeId]: todayStr,
      });
      toast.success("Dia registrado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar dia");
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      await deleteChallengeMutation.mutateAsync(challengeId);
      if (challengeTypes[challengeId]) {
        const next = { ...challengeTypes };
        delete next[challengeId];
        saveChallengeTypes(next);
      }
      if (completedToday[challengeId]) {
        const next = { ...completedToday };
        delete next[challengeId];
        saveCompletedToday(next);
      }
      toast.success("Desafio deletado");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar desafio");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">Desafios</h2>
          <p className="text-[11px] text-muted-foreground">Comprometa-se, construa disciplina</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 rounded-lg bg-primary/20 border border-primary/30 px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/30 transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo Desafio
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="rounded-xl bg-muted/30 border border-border/30 p-4 flex flex-col gap-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do desafio..."
                className="rounded-lg bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/40 focus:border-primary/60"
                onKeyDown={(e) => e.key === "Enter" && handleAddChallenge()}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewType("objective")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border transition-colors ${newType === "objective"
                      ? "bg-primary/20 border-primary/40 text-foreground"
                      : "bg-muted/20 border-border/30 text-muted-foreground"
                    }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Objetivo
                </button>
                <button
                  onClick={() => setNewType("cleanup")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs border transition-colors ${newType === "cleanup"
                      ? "bg-destructive/15 border-destructive/40 text-foreground"
                      : "bg-muted/20 border-border/30 text-muted-foreground"
                    }`}
                >
                  <Ban className="h-3.5 w-3.5" />
                  Limpeza
                </button>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="rounded-lg bg-background/60 px-2 py-1.5 text-sm text-foreground border border-border/40"
                >
                  <option value={7}>7 dias</option>
                  <option value={14}>14 dias</option>
                  <option value={21}>21 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
                <button
                  onClick={handleAddChallenge}
                  disabled={createChallengeMutation.isPending}
                  className="ml-auto rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {createChallengeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {challenges.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum desafio ativo. Crie seu primeiro desafio!</p>
        </div>
      ) : (
        <>
          {challenges.map((challenge, i) => {
            const totalDays = challenge.daysRemaining + challenge.currentStreak;
            const progress = totalDays > 0
              ? (challenge.currentStreak / totalDays) * 100
              : 0;
            const todayKey = getTodayKey();
            const isCompletedToday = completedToday[challenge.id] === todayKey;
            const type = challengeTypes[challenge.id] ?? "objective";
            const TypeIcon = challengeTypeIcons[type];

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-muted/20 border border-border/30 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <TypeIcon className={`h-4 w-4 ${type === "cleanup" ? "text-destructive" : "text-primary"}`} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {hiddenTitles[challenge.id] ? "••••••" : challenge.title}
                      </span>
                      <button
                        onClick={() =>
                          saveHiddenTitles({
                            ...hiddenTitles,
                            [challenge.id]: !hiddenTitles[challenge.id],
                          })
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {hiddenTitles[challenge.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        {challengeTypeLabels[type]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {challenge.currentStreak > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-5 w-5 text-streak-fire" />
                        <span className="font-display text-sm font-bold fire-gradient">{challenge.currentStreak}</span>
                      </div>
                    )}
                    {challenge.daysRemaining <= 0 && <Trophy className="h-5 w-5 text-streak-fire" />}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>{challenge.daysRemaining} dias restantes</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${challenge.daysRemaining <= 0 ? "bg-streak-fire" : "bg-primary"}`}
                    />
                  </div>
                </div>

                {challenge.isActive ? (
                  <div className="flex items-center justify-between">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLogChallenge(challenge.id)}
                      disabled={logChallengeMutation.isPending || isCompletedToday}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${isCompletedToday
                          ? "bg-moss-light/80 text-background"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                    >
                      {logChallengeMutation.isPending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : isCompletedToday
                          ? "Dia concluido"
                          : "Marcar dia"}
                    </motion.button>
                    <motion.div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">Dificuldade:</span>
                      {difficultyOptions.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDifficulty(prev => ({ ...prev, [challenge.id]: d.id }))}
                          className={`rounded-lg px-3 py-1 text-xs border transition-colors ${selectedDifficulty[challenge.id] === d.id
                            ? `${d.color} text-foreground`
                            : "bg-muted/30 border-border/30 text-muted-foreground"
                            }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </motion.div>
                    <button
                      onClick={() => handleDeleteChallenge(challenge.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Deletar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-streak-fire">
                      <Trophy className="h-4 w-4" />
                      <span className="font-medium">Desafio completo!</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Challenge analytics */}
          <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">Análise de Desafios</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <span className="text-2xl font-display font-bold text-foreground">{challenges.filter((c) => c.isActive).length}</span>
                <p className="text-[11px] text-muted-foreground mt-1">Ativos</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <span className="text-2xl font-display font-bold text-streak-fire">{Math.max(...challenges.map((c) => c.currentStreak), 0)}</span>
                <p className="text-[11px] text-muted-foreground mt-1">Maior Streak</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4 text-center">
                <span className="text-2xl font-display font-bold text-foreground">{challenges.filter((c) => !c.isActive).length}</span>
                <p className="text-[11px] text-muted-foreground mt-1">Completos</p>
              </div>
            </div>
          </div>
        </>
      )}

      {isFetching && !isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default Challenge;
