import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Eye, EyeOff, Plus, Shield, Ban, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { useActiveChallenges, useCreateChallenge, useDeleteChallenge, useLogChallenge } from "@/api/challengesApi";
import { toast } from "sonner";

const difficultyOptions = [
  { id: "Easy", label: "Fácil", color: "bg-primary/50 border-primary/30" },
  { id: "Medium", label: "Médio", color: "bg-streak-fire/40 border-streak-fire/30" },
  { id: "Hard", label: "Difícil", color: "bg-destructive/40 border-destructive/30" },
];

const Challenge = () => {
  const { data: challenges = [], isLoading, isFetching } = useActiveChallenges();
  const createChallengeMutation = useCreateChallenge();
  const deleteChallengeMutation = useDeleteChallenge("");
  const logChallengeMutation = useLogChallenge();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDuration, setNewDuration] = useState(14);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Record<string, string>>({});

  const handleAddChallenge = async () => {
    if (!newName.trim()) {
      toast.error("Digite um nome para o desafio");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + newDuration);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      await createChallengeMutation.mutateAsync({
        title: newName.trim(),
        startDate: today,
        targetEndDate: targetDateStr,
      });

      setNewName("");
      setNewDuration(14);
      setShowAdd(false);
      toast.success("Desafio criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar desafio");
    }
  };

  const handleLogChallenge = async (challengeId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const difficulty = (selectedDifficulty[challengeId] || "Easy") as "Easy" | "Medium" | "Hard";

      await logChallengeMutation.mutateAsync({
        challengeId,
        date: today,
        difficulty,
      });

      toast.success("Dia registrado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar dia");
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      await deleteChallengeMutation.mutateAsync();
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
            const progress = challenge.daysRemaining > 0
              ? ((challenge.daysRemaining / (challenge.daysRemaining + challenge.currentStreak)) * 100)
              : 100;

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
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{challenge.title}</span>
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
                      disabled={logChallengeMutation.isPending}
                      className="rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {logChallengeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Marcar dia"}
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
