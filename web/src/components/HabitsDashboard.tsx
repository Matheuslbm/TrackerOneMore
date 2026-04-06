import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, BarChart3, Target, ChevronLeft, ChevronRight } from "lucide-react";

const stats = [
  { label: "Hábitos Ativos", value: "5", icon: Target, color: "text-primary" },
  { label: "Taxa de Conclusão", value: "78%", icon: TrendingUp, color: "text-moss-light" },
  { label: "Melhor Streak", value: "24", icon: Flame, color: "text-streak-fire" },
  { label: "Semana Atual", value: "85%", icon: BarChart3, color: "text-primary" },
];

const habitBreakdown = [
  { name: "Leitura", pct: 95, streak: 24, mood: 4.2 },
  { name: "Código", pct: 88, streak: 18, mood: 3.8 },
  { name: "Meditar", pct: 82, streak: 12, mood: 4.5 },
  { name: "Exercício", pct: 65, streak: 5, mood: 3.5 },
  { name: "Água 2L", pct: 50, streak: 3, mood: 3.2 },
];

const moodCorrelation = [
  { day: "Seg", habits: 5, mood: 4 },
  { day: "Ter", habits: 4, mood: 3 },
  { day: "Qua", habits: 5, mood: 5 },
  { day: "Qui", habits: 3, mood: 3 },
  { day: "Sex", habits: 4, mood: 4 },
  { day: "Sáb", habits: 3, mood: 2 },
  { day: "Dom", habits: 0, mood: 3 },
];

const dashViews = [
  { id: "performance", title: "Desempenho por Hábito" },
  { id: "mood-correlation", title: "Hábitos × Humor" },
  { id: "weekly-trend", title: "Tendência Semanal" },
];

const HabitsDashboard = () => {
  const [activeView, setActiveView] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = (dir: number) => {
    const next = Math.max(0, Math.min(dashViews.length - 1, activeView + dir));
    setActiveView(next);
  };

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
              {habitBreakdown.map((h) => (
                <div key={h.name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-24">{h.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${h.pct}%` }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full rounded-full bg-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{h.pct}%</span>
                  <div className="flex items-center gap-1 w-14 justify-end">
                    <Flame className="h-3.5 w-3.5 text-streak-fire" />
                    <span className="text-xs font-display font-bold text-foreground">{h.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeView === 1 && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-7 gap-2">
                {moodCorrelation.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2">
                    <div className="h-24 w-full rounded-lg bg-muted/30 flex items-end gap-0.5 overflow-hidden p-0.5">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(d.habits / 5) * 100}%` }} transition={{ duration: 0.5 }} className="flex-1 rounded-sm bg-primary/70" />
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(d.mood / 5) * 100}%` }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1 rounded-sm bg-streak-fire/60" />
                    </div>
                    <span className="font-display text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground mt-1">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary/70" />Hábitos</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-streak-fire/60" />Humor</span>
              </div>
            </div>
          )}

          {activeView === 2 && (
            <div className="flex flex-col gap-3">
              {habitBreakdown.map((h) => (
                <div key={h.name} className="flex items-center gap-3">
                  <span className="text-sm text-foreground w-24">{h.name}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${h.pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-primary" />
                    </div>
                    <div className="w-16 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(h.mood / 5) * 100}%` }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full rounded-full bg-streak-fire/60" />
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground w-16 text-right">😊 {h.mood}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HabitsDashboard;
