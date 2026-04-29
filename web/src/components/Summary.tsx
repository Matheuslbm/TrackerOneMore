import { motion } from "framer-motion";
import { Flame, Target, Trophy, TrendingUp, Zap, BarChart3, Loader2 } from "lucide-react";
import { useDashboard, useHabitsPerformance } from "@/api/dashboardApi";

const Summary = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();
  const { data: performanceData, isLoading: performanceLoading } = useHabitsPerformance(undefined, undefined, 1);

  const habitSummaries = dashboardData?.habitSummaries ?? [];
  const challengeSummaries = dashboardData?.activeChallenges ?? [];

  const totalStreak = habitSummaries.reduce((acc, habit) => acc + habit.currentStreak, 0)
    + challengeSummaries.reduce((acc, challenge) => acc + challenge.currentStreak, 0);
  const avgConsistency = performanceData?.averageCompletionRate ?? 0;

  const streaks = habitSummaries.map((habit) => {
    const target = Math.max(5, (Math.floor(habit.currentStreak / 5) + 1) * 5);

    return {
      name: habit.name,
      streak: habit.currentStreak,
      best: target,
    };
  });

  const weeklyDays = (() => {
    const startDate = performanceData?.period?.startDate;
    if (!startDate) return [] as { label: string; height: number }[];

    const start = new Date(`${startDate}T00:00:00`);
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const totalHabits = performanceData?.habitPerformances?.length ?? 0;

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const completedCount = performanceData?.habitPerformances?.reduce((sum, habit) => {
        const log = habit.dailyLogs.find((l) => l.date === dateKey);
        return sum + (log?.status === "Completed" ? 1 : 0);
      }, 0) ?? 0;

      const height = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

      return {
        label: dayNames[date.getDay()],
        height,
      };
    });
  })();

  if (dashboardLoading || performanceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Hábitos Ativos", value: habitSummaries.length.toString(), icon: Target, color: "text-primary" },
          { label: "Consistência", value: `${Math.round(avgConsistency)}%`, icon: TrendingUp, color: "text-moss-light" },
          { label: "Desafios Ativos", value: challengeSummaries.length.toString(), icon: Zap, color: "text-accent" },
          { label: "Dias Ativos", value: (dashboardData?.contributionData?.length ?? 0).toString(), icon: Trophy, color: "text-streak-fire" },
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

      <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Balanço Semanal</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyDays.map((day) => (
            <div key={day.label} className="flex flex-col items-center gap-2">
              <div className="h-28 w-full rounded-lg bg-muted/30 flex items-end overflow-hidden">
                <div className="w-full rounded-t-md bg-primary/70" style={{ height: `${day.height}%` }} />
              </div>
              <span className="font-display text-[10px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Summary;
