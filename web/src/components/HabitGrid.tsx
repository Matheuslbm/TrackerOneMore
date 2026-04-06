import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Plus, X, Settings2, Loader2 } from "lucide-react";
import { useHabits, useCreateHabit, useDeleteHabit, useLogHabit } from "@/api/habitsApi";
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
  const createHabitMutation = useCreateHabit();
  const deleteHabitMutation = useDeleteHabit("");
  const logHabitMutation = useLogHabit();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<HabitType>(HabitType.Productive);
  const [newFreq, setNewFreq] = useState(7);
  const [streakPopup, setStreakPopup] = useState<{ id: string; streak: number } | null>(null);

  const habits = habitsData?.items || [];

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
      setNewType(HabitType.Productive);
      setNewFreq(7);
      setShowAdd(false);
      toast.success("Hábito criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar hábito");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabitMutation.mutateAsync();
      toast.success("Hábito deletado");
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar hábito");
    }
  };

  const handleLogHabit = async (habitId: string, status: "Completed" | "Missed" | "Grace") => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await logHabitMutation.mutateAsync({
        habitId,
        date: today,
        status,
      });

      if (status === "Completed") {
        setStreakPopup({ id: habitId, streak: 1 });
        setTimeout(() => setStreakPopup(null), 2000);
      }

      toast.success("Registro salvo!");
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
                <option value={HabitType.Productive}>Produtivo</option>
                <option value={HabitType.Reducing}>Redutor</option>
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
                <span className="text-sm font-medium text-foreground">{habit.name}</span>
                <span className="text-[10px] text-muted-foreground">{habit.targetDaysPerWeek}x/sem</span>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>

              {/* Day buttons - placeholder for now, ideally would fetch weekly data */}
              {dayLabels.map((_, di) => (
                <div key={di} className="flex justify-center">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleLogHabit(habit.id, "Completed")}
                    className="h-8 w-8 rounded-lg border bg-muted/60 border-border hover:border-muted-foreground/30 transition-all duration-150"
                  />
                </div>
              ))}

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
