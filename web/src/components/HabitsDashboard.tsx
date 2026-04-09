import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, BarChart3, Target, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useHabits } from "@/api/habitsApi";
import { useAnalytics } from "@/api/dashboardApi";

const dashViews = [
  { id: "performance", title: "Desempenho por Hábito" },
  { id: "mood-correlation", title: "Hábitos × Humor" },
  { id: "weekly-trend", title: "Tendência Semanal" },
];

const HabitsDashboard = () => {
  const [activeView, setActiveView] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: habitsData, isLoading: habitsLoading } = useHabits(1, 100);
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics(undefined, undefined, 1);

  const scrollTo = (dir: number) => {
    const next = Math.max(0, Math.min(dashViews.length - 1, activeView + dir));
    setActiveView(next);
  };

  const habits = habitsData?.items || [];
  const bestStreak = Math.max(...habits.map(h => h.currentStreak || 0), 0);
  const avgCompletion = habits.length > 0
    ? Math.round((habits.filter(h => h.currentStreak > 0).length / habits.length) * 100)
    : 0;
  
  // Get current week completion rate from analytics data
  const weeklyProgress = analyticsData?.weeklyTrends && analyticsData.weeklyTrends.length > 0
    ? Math.round(analyticsData.weeklyTrends[analyticsData.weeklyTrends.length - 1].habitCompletionRate)
    : 0;

  const stats = [
    { label: "Hábitos Ativos", value: habits.length.toString(), icon: Target, color: "text-primary" },
    { label: "Taxa de Conclusão", value: `${avgCompletion}%`, icon: TrendingUp, color: "text-moss-light" },
    { label: "Melhor Streak", value: bestStreak.toString(), icon: Flame, color: "text-streak-fire" },
    { label: "Semana Atual", value: `${weeklyProgress}%`, icon: BarChart3, color: "text-primary" },
  ];

  // Transform habit data for display
  const habitBreakdown = habits.map((h) => ({
    name: h.name,
    pct: 0, // Será preenchido com dados reais quando houver logs
    streak: h.currentStreak || 0,
    mood: 0, // Será preenchido com dados de analytics
  }));

  const isLoading = habitsLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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

      {/* Swipeable dashboard */}
      <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-foreground">{dashViews[activeView].title}</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => scrollTo(-1)} disabled={activeView === 0} className="p-1 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1 mx-2">
              {dashViews.map((_, i) => (
                <button key={i} onClick={() => setActiveView(i)} className={`h-1.5 rounded-full transition-all ${i === activeView ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
              ))}
            </div>
            <button onClick={() => scrollTo(1)} disabled={activeView === dashViews.length - 1} className="p-1 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <motion.div key={activeView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
          {activeView === 0 && (
            <div className="flex flex-col gap-3">
              {habitBreakdown.length > 0 ? (
                habitBreakdown.map((h) => (
                  <div key={h.name} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-24 truncate">{h.name}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${h.pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full rounded-full bg-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(h.pct)}%</span>
                    <div className="flex items-center gap-1 w-14 justify-end">
                      <Flame className="h-3.5 w-3.5 text-streak-fire" />
                      <span className="text-xs font-display font-bold text-foreground">{h.streak}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhum hábito registrado</p>
              )}
            </div>
          )}

          {activeView === 1 && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-7 gap-2">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => {
                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <div className="h-24 w-full rounded-lg bg-muted/30 flex items-end gap-0.5 overflow-hidden p-0.5">
                        <div className="flex-1 rounded-sm bg-primary/70" style={{ height: '0%' }} />
                        <div className="flex-1 rounded-sm bg-streak-fire/60" style={{ height: '0%' }} />
                      </div>
                      <span className="font-display text-[10px] text-muted-foreground">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary/70" />Hábitos</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-streak-fire/60" />Humor</span>
              </div>
              <p className="text-center text-muted-foreground text-sm py-4">Dados será carregados quando houver registros</p>
            </div>
          )}

          {activeView === 2 && (
            <div className="flex flex-col gap-3">
              {habitBreakdown.length > 0 ? (
                habitBreakdown.map((h) => (
                  <div key={h.name} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-24 truncate">{h.name}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${h.pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-primary" />
                      </div>
                      <div className="w-16 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(h.mood / 5) * 100}%` }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full rounded-full bg-streak-fire/60" />
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground w-16 text-right">😊 {h.mood.toFixed(1)}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhum hábito registrado</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HabitsDashboard;
