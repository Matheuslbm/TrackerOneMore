import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, X, Settings2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useHabits, useCreateHabit, useLogHabit, useWeeklyHabitLogs, useDeleteHabitLog, useUpdateHabit } from "@/api/habitsApi";
import api from "@/api/api";
import { toast } from "sonner";
import { HabitType } from "@/shared/types";

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const StreakFire = ({ streak }: { streak: number }) => {
  const isHot = streak >= 7;
  const isBlazing = streak >= 14;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 rounded-full bg-streak-fire/10 border border-streak-fire/20 px-3 py-1"
    >
      <motion.div
        animate={
          isBlazing
            ? { scale: [1, 1.3, 1], rotate: [0, -8, 8, 0], y: [0, -2, 0] }
            : isHot
              ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }
              : { scale: [1, 1.1, 1] }
        }
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: isBlazing ? 0.6 : 1 }}
      >
        <Flame
          className={`drop-shadow-[0_0_6px_hsl(var(--streak-fire)/0.5)] ${isBlazing ? "h-5 w-5" : "h-4 w-4"
            } text-streak-fire`}
          fill="hsl(var(--streak-fire))"
          strokeWidth={1.5}
        />
      </motion.div>
      <span className="font-display text-sm font-bold fire-gradient tabular-nums">{streak}</span>
    </motion.div>
  );
};

const HabitGrid = () => {
  const { data: habitsData, isLoading, isFetching } = useHabits();
  const { data: weeklyData } = useWeeklyHabitLogs();
  const createHabitMutation = useCreateHabit();
  const logHabitMutation = useLogHabit();
  const deleteHabitLogMutation = useDeleteHabitLog();
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<HabitType>(HabitType.Daily);
  const [newFreq, setNewFreq] = useState(7);
  const [streakPopup, setStreakPopup] = useState<{ id: string; streak: number } | null>(null);
  const [habitLogs, setHabitLogs] = useState<Record<string, "Completed" | "Grace" | "Missed">>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingFreq, setEditingFreq] = useState(1);

  // Debounce timer para evitar múltiplas requisições
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Rastrear quais logs têm atualizações pendentes (aguardando debounce)
  const pendingUpdatesRef = useRef<Set<string>>(new Set());

  const habits = habitsData?.items || [];

  // Carregamento inicial dos logs do servidor quando a semana é determinada
  useEffect(() => {
    if (!weeklyData || habits.length === 0) return;

    // Usar os logs que já vinham no weeklyData (nova forma com endpoint único)
    if (weeklyData.logs) {
      const logsMap: Record<string, "Completed" | "Grace" | "Missed"> = {};

      for (const log of weeklyData.logs) {
        const logKey = `${log.habitId}-${log.date}`;
        logsMap[logKey] = log.status as "Completed" | "Grace" | "Missed";
      }

      // Só atualizar states que NÃO têm atualizações pendentes
      setHabitLogs(prev => {
        const newLogs = { ...prev };
        for (const [key, status] of Object.entries(logsMap)) {
          // Se não tem atualização pendente, atualizar do servidor
          if (!pendingUpdatesRef.current.has(key)) {
            newLogs[key] = status;
          }
        }
        return newLogs;
      });
    }
  }, [weeklyData, habits]);

  // Cleanup: limpar timers ao desmontar o componente
  useEffect(() => {
    return () => {
      // Limpar todos os timers pendentes
      Object.values(debounceTimerRef.current).forEach(timer => clearTimeout(timer));
      // Limpar atualizações pendentes
      pendingUpdatesRef.current.clear();
    };
  }, []);

  const handleAddHabit = async () => {
    if (!newName.trim()) {
      toast.error("Digite um nome para o hábito");
      return;
    }

    try {
      await createHabitMutation.mutateAsync({
        name: newName.trim(),
        type: newType,
        targetDaysPerWeek: newFreq,
        graceDaysAllowed: 1,
      });
      setNewName("");
      setNewType(HabitType.Daily);
      setNewFreq(7);
      setShowAdd(false);
      toast.success("Hábito criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar hábito");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.delete(`/habits/${habitId}`);
      toast.success("Hábito deletado");
      // Refetch habits
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar hábito");
    }
  };

  const handleEditHabit = (habit: any) => {
    setEditingId(habit.id);
    setEditingName(habit.name);
    setEditingFreq(habit.targetDaysPerWeek || 1);
  };

  const handleSaveEdit = async (habitId: string) => {
    if (!editingName.trim()) {
      toast.error("Nome não pode ser vazio");
      return;
    }

    try {
      await api.put(`/habits/${habitId}`, {
        name: editingName.trim(),
        type: "Daily",
        targetDaysPerWeek: editingFreq,
        graceDaysAllowed: 1,
      });
      toast.success("Hábito atualizado!");
      setEditingId(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar hábito");
    }
  };

  const handleLogHabit = async (habitId: string, dayIndex: number) => {
    try {
      // MESMA LÓGICA DA RENDERIZAÇÃO
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + dayIndex);
      
      // Converter para formato YYYY-MM-DD usando data LOCAL (não UTC)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const logKey = `${habitId}-${dateStr}`;

      // Ciclar entre os estados: Nada → Completed -> Missed -> Grace -> (delete)
      const currentStatus = habitLogs[logKey] || null;
      const nextStatus: "Completed" | "Grace" | "Missed" | null =
        !currentStatus ? "Completed" :
          currentStatus === "Completed" ? "Missed" :
            currentStatus === "Missed" ? "Grace" :
              null;

      // Guardar estado anterior para reverter se houver erro
      const previousStatus = currentStatus;

      // Atualizar estado local imediatamente para feedback visual
      if (nextStatus === null) {
        // 4º clique: deletar
        setHabitLogs(prev => {
          const { [logKey]: _, ...rest } = prev;
          return rest;
        });
      } else {
        // Ciclar normalmente
        setHabitLogs(prev => ({ ...prev, [logKey]: nextStatus }));
      }

      // Marcar como atualização pendente (não deixar ser sobrescrito pelo servidor)
      pendingUpdatesRef.current.add(logKey);

      // Cancelar timeout anterior se existir
      const timerKey = logKey;
      if (debounceTimerRef.current[timerKey]) {
        clearTimeout(debounceTimerRef.current[timerKey]);
      }

      // Criar novo timeout com debounce
      debounceTimerRef.current[timerKey] = setTimeout(async () => {
        try {
          // Fazer a requisição apenas após a espera
          if (nextStatus === null) {
            await deleteHabitLogMutation.mutateAsync({
              habitId,
              date: dateStr,
            });
            toast.success("Marcação removida!");
          } else {
            await logHabitMutation.mutateAsync({
              habitId,
              date: dateStr,
              status: nextStatus,
            });
            toast.success("Registro salvo!");
          }
        } catch (error: any) {
          // Extrair mensagem de erro personalizada do backend
          const errorMessage = error.response?.data?.error || error.message || "Erro ao registrar hábito";
          
          toast.error(errorMessage);

          // ✋ Se tentou logar um Grace e foi rejeitado (erro contém "Curingas"), deixar o dia vazio
          // Isso garante que o dia não fica marcado em vermelho (Missed)
          if (errorMessage.includes("Curingas") && nextStatus === "Grace") {
            // Grace foi rejeitado, remove qualquer marcação deixando vazio
            setHabitLogs(prev => {
              const { [logKey]: _, ...rest } = prev;
              return rest;
            });
          } else {
            // Outro erro, reverter para estado anterior
            setHabitLogs(prev => {
              if (previousStatus === null) {
                const { [logKey]: _, ...rest } = prev;
                return rest;
              } else {
                return { ...prev, [logKey]: previousStatus };
              }
            });
          }
        }

        // ✅ CORREÇÃO: Aguardar pequeno delay para garantir que refetches iniciaram
        // antes de remover da lista de atualizações pendentes
        // Isso evita race condition onde useEffect dispara enquanto a chave ainda deveria estar protegida
        setTimeout(() => {
          pendingUpdatesRef.current.delete(logKey);
          delete debounceTimerRef.current[timerKey];
        }, 50); // 50ms é suficiente para mutation.onSuccess disparar e invalidateQueries começar
      }, 1000); // Aguarda 1000ms (mais tempo para o usuário terminar de clicar)
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar hábito");
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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">Meus Hábitos</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Feito
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" /> Grace
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-destructive/50" /> Perdido
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/20 border border-primary/30 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/30"
          >
            <Plus className="h-4 w-4" /> Hábito
          </motion.button>
        </div>
      </div>

      {/* Add habit form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border/40 p-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do hábito..."
                className="flex-1 rounded-lg bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/40 focus:border-primary/60"
                onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as HabitType)}
                className="rounded-lg bg-background/60 px-2 py-2 text-sm text-foreground border border-border/40"
              >
                <option value={HabitType.Daily}>Diário</option>
                <option value={HabitType.WeeklyTarget}>Meta Semanal</option>
              </select>
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <select
                  value={newFreq}
                  onChange={(e) => setNewFreq(Number(e.target.value))}
                  className="rounded-lg bg-background/60 px-2 py-2 text-sm text-foreground border border-border/40"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n}x/sem</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddHabit}
                disabled={createHabitMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {createHabitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {habits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhum hábito criado ainda. Crie seu primeiro hábito!</p>
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-[1fr_repeat(7,40px)_100px] gap-2 px-1">
            <div />
            {dayLabels.map((d) => (
              <span key={d} className="text-center font-display text-[11px] text-muted-foreground">{d}</span>
            ))}
            <div />
          </div>

          {/* Habit rows */}
          {habits.map((habit, hi) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: hi * 0.03 }}
              className="group relative grid grid-cols-[1fr_repeat(7,40px)_100px] items-center gap-2 rounded-xl px-1 py-2.5 transition-all hover:bg-muted/30"
            >
              <div className="flex items-center gap-2">
                {editingId === habit.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-sm font-medium text-foreground bg-background border border-primary rounded px-2 py-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(habit.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <select
                      value={editingFreq}
                      onChange={(e) => setEditingFreq(Number(e.target.value))}
                      className="text-xs bg-background border border-primary rounded px-1 py-1"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>{n}x</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSaveEdit(habit.id)}
                      className="text-xs bg-primary px-2 py-1 rounded text-primary-foreground"
                    >
                      Salvar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditHabit(habit)}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {habit.name}
                    </button>
                    <span className="text-[10px] text-muted-foreground">{habit.targetDaysPerWeek}x/sem</span>
                  </>
                )}
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>

              {/* Day buttons - placeholder for now, ideally would fetch weekly data */}
              {dayLabels.map((dayLabel, di) => {
                // MESMA LÓGICA DO HOOK useWeeklyHabitLogs
                const today = new Date();
                const dayOfWeek = today.getDay();
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                startOfWeek.setHours(0, 0, 0, 0);

                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + di);
                
                // Converter para formato YYYY-MM-DD usando data LOCAL (não UTC)
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                const logKey = `${habit.id}-${dateStr}`;
                const status = habitLogs[logKey];

                const statusColor =
                  status === "Completed" ? "bg-primary border-primary" :
                    status === "Grace" ? "bg-accent border-accent" :
                      status === "Missed" ? "bg-destructive/50 border-destructive/50" :
                        "bg-muted/60 border-border";

                return (
                  <div key={di} className="flex justify-center">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => handleLogHabit(habit.id, di)}
                      className={`h-8 w-8 rounded-lg border transition-all duration-150 ${statusColor}`}
                    />
                  </div>
                );
              })}

              <div className="flex items-center justify-center relative">
                {habit.currentStreak > 0 ? (
                  <StreakFire streak={habit.currentStreak} />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
                <AnimatePresence>
                  {streakPopup?.id === habit.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: -30 }}
                      exit={{ scale: 0, opacity: 0, y: -50 }}
                      className="absolute -top-2 flex items-center gap-1 rounded-full bg-streak-fire/20 border border-streak-fire/30 px-3 py-1"
                    >
                      <Flame className="h-4 w-4 text-streak-fire" />
                      <span className="font-display text-xs font-bold fire-gradient">{streakPopup.streak}🔥</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
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

export default HabitGrid;
