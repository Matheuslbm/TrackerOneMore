import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X, Minus } from "lucide-react";
import { useHabitsPerformanceByMonth } from "@/api/analyticsApi";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const mapStatusToCode = (status: 'Completed' | 'Missed' | 'GraceDay' | null): number => {
  if (!status) return 0;
  if (status === 'Completed') return 1;
  if (status === 'Missed') return 2;
  if (status === 'GraceDay') return 3;
  return 0;
};

const parseDateFromISO = (dateStr: string): number => {
  const parts = dateStr.split('-');
  return parseInt(parts[2], 10);
};

const MonthlyHabitGrid = () => {
  const now = new Date();
  const [offset, setOffset] = useState(0);

  const { year, month, daysInMonth, todayIndex, isCurrentMonth } = useMemo(() => {
    const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const y = ref.getFullYear();
    const m = ref.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const isCurr = y === now.getFullYear() && m === now.getMonth();
    const today = isCurr ? now.getDate() : dim;
    return { year: y, month: m, daysInMonth: dim, todayIndex: today, isCurrentMonth: isCurr };
  }, [offset]);

  const { data: performanceData, isLoading, isError } = useHabitsPerformanceByMonth(year, month);

  const habitData = useMemo(() => {
    if (!performanceData) return [];

    return performanceData.habitPerformances.map((habit) => {
      const daysArray: number[] = Array(daysInMonth).fill(0);

      habit.dailyLogs.forEach((log) => {
        const day = parseDateFromISO(log.date);
        if (day >= 1 && day <= daysInMonth) {
          daysArray[day - 1] = mapStatusToCode(log.status);
        }
      });

      return {
        habitId: habit.habitId,
        name: habit.habitName,
        days: daysArray,
      };
    });
  }, [performanceData, daysInMonth]);

  if (isLoading) {
    return (
      <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
        <div className="flex items-center justify-center h-40">
          <p className="text-destructive">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-foreground">Desempenho Mensal</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3 w-3 items-center justify-center rounded-[3px] bg-moss-light/80">
                <Check className="h-2 w-2 text-background" strokeWidth={3} />
              </span>
              Feito
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3 w-3 items-center justify-center rounded-[3px] bg-destructive/70">
                <X className="h-2 w-2 text-background" strokeWidth={3} />
              </span>
              Não
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-3 w-3 items-center justify-center rounded-[3px] bg-purple-500/60">
                <Minus className="h-2 w-2 text-background" strokeWidth={3} />
              </span>
              Grace
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setOffset((o) => o - 1)}
              className="p-1 text-muted-foreground hover:text-foreground transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-display text-xs text-foreground min-w-[110px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={() => setOffset((o) => o + 1)}
              disabled={offset >= 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        key={`${year}-${month}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="overflow-x-auto"
      >
        <div className="min-w-[640px]">
          <div className="flex pl-24 mb-1.5">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const isToday = isCurrentMonth && d === todayIndex;
              return (
                <div key={d} className="flex-1 flex justify-center">
                  <span
                    className={`font-display text-[10px] ${
                      isToday
                        ? "text-streak-fire font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {d}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-1.5">
            {habitData.map((h, hi) => (
              <div key={h.habitId} className="flex items-center">
                <span className="w-24 pr-2 text-xs text-foreground truncate">{h.name}</span>
                <div className="flex-1 flex gap-[2px]">
                  {h.days.map((status, di) => {
                    const day = di + 1;
                    const isToday = isCurrentMonth && day === todayIndex;
                    let cls = "bg-muted/30";
                    let icon = null;
                    if (status === 1) {
                      cls = "bg-moss-light/80";
                      icon = <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />;
                    } else if (status === 2) {
                      cls = "bg-destructive/60";
                      icon = <X className="h-2.5 w-2.5 text-background" strokeWidth={3} />;
                    } else if (status === 3) {
                      cls = "bg-purple-500/50";
                      icon = <Minus className="h-2.5 w-2.5 text-background" strokeWidth={3} />;
                    }
                    return (
                      <motion.div
                        key={di}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (hi * daysInMonth + di) * 0.005, duration: 0.15 }}
                        className={`flex-1 aspect-square min-w-[16px] rounded-[4px] flex items-center justify-center ${cls} ${
                          isToday ? "ring-1 ring-streak-fire" : ""
                        } transition-all hover:ring-1 hover:ring-foreground/30`}
                        title={`${h.name} — dia ${day}`}
                      >
                        {icon}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MonthlyHabitGrid;
