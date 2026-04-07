import { motion } from "framer-motion";
import { Flame, Target, Trophy, TrendingUp, Zap, BarChart3, Loader2 } from "lucide-react";
import { useDashboard } from "@/api/dashboardApi";
import { useHabits } from "@/api/habitsApi";

const Summary = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: habitsData, isLoading: habitsLoading } = useHabits(1, 100);

  const totalStreak = dashboardData?.totalStreaks || 0;
  const avgConsistency = dashboardData?.consistency || 0;
  const activeHabits = habitsData?.items || [];
  const activeChallenges = dashboardData?.activeChallenges?.length || 0;

  // Transform habit data to streak format
  const streaks = activeHabits.map((habit) => ({
    name: habit.name,
    streak: habit.currentStreak || 0,
    best: Math.max(habit.currentStreak || 0, 10),
  }));

  if (dashboardLoading || habitsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero streak */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-muted/20 border border-border/30 p-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          className="inline-flex"
        >
          <Flame className="h-16 w-16 text-streak-fire drop-shadow-[0_0_12px_hsl(var(--streak-fire)/0.4)]" />
        </motion.div>
        <h2 className="font-display text-5xl font-bold mt-3 fire-gradient">{totalStreak}</h2>
        <p className="text-sm text-muted-foreground mt-1">Streaks Totais Combinados</p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Hábitos Ativos", value: activeHabits.length.toString(), icon: Target, color: "text-primary" },
          { label: "Consistência", value: `${Math.round(avgConsistency)}%`, icon: TrendingUp, color: "text-moss-light" },
          { label: "Desafios Ativos", value: activeChallenges.toString(), icon: Zap, color: "text-accent" },
          { label: "Emblemas", value: "1", icon: Trophy, color: "text-streak-fire" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl bg-muted/30 border border-border/30 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Streak breakdown */}
      <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
        <div className="flex items-center gap-2 mb-5">
          <Flame className="h-5 w-5 text-streak-fire" />
          <h3 className="font-display text-sm font-semibold text-foreground">Seus Streaks</h3>
        </div>
        <div className="flex flex-col gap-4">
          {streaks.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-4">
              <span className="text-sm text-foreground w-24">{s.name}</span>
              <div className="flex-1 h-3 rounded-full bg-muted/40 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(s.streak / s.best) * 100}%` }} transition={{ duration: 0.6, delay: 0.15 + i * 0.05 }} className="h-full rounded-full bg-primary" />
              </div>
              <div className="flex items-center gap-1.5 w-20 justify-end">
                <Flame className={`h-4 w-4 ${s.streak >= 10 ? "text-streak-fire animate-flame-dance" : "text-muted-foreground"}`} />
                <span className={`font-display text-sm font-bold ${s.streak >= 10 ? "fire-gradient" : "text-muted-foreground"}`}>{s.streak}</span>
                <span className="text-[10px] text-muted-foreground">/{s.best}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Motivational quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-muted/10 border border-border/20 px-8 py-6 text-center"
      >
        <p className="font-display text-base italic text-muted-foreground leading-relaxed">
          "Excelência é a repetição de comportamentos que nada tem de especial"
        </p>
        <span className="mt-2 inline-block text-xs text-muted-foreground/60">+1</span>
      </motion.div>

      {/* Weekly balance */}
      <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Balanço Semanal</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => {
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className="h-28 w-full rounded-lg bg-muted/30 flex items-end overflow-hidden">
                  <div className="w-full rounded-t-md bg-primary/70" style={{ height: '0%' }} />
                </div>
                <span className="font-display text-[10px] text-muted-foreground">{day}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Summary;
