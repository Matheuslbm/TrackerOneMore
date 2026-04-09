import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMoods, useLogMood } from "@/api/moodApi";
import { toast } from "sonner";
import { MoodLevel } from "@/shared/types";

const moodLevels = [
  { id: MoodLevel.Awful, label: "Péssimo", color: "bg-destructive/50" },
  { id: MoodLevel.Bad, label: "Ruim", color: "bg-destructive/30" },
  { id: MoodLevel.Neutral, label: "Neutro", color: "bg-muted-foreground/40" },
  { id: MoodLevel.Good, label: "Bem", color: "bg-primary/60" },
  { id: MoodLevel.Excellent, label: "Ótimo", color: "bg-primary" },
];

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [localMoodMap, setLocalMoodMap] = useState<Record<string, MoodLevel>>({});

  // Get moods for the week - MESMA LÓGICA DO HABITGRID (semana começa na segunda)
  const today = new Date(selectedDate);
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Converter weekStart para string no formato LOCAL
  const weekStartYear = weekStart.getFullYear();
  const weekStartMonth = String(weekStart.getMonth() + 1).padStart(2, '0');
  const weekStartDay = String(weekStart.getDate()).padStart(2, '0');
  const weekStartStr = `${weekStartYear}-${weekStartMonth}-${weekStartDay}`;

  // Converter weekEnd para string no formato LOCAL
  const weekEndYear = weekEnd.getFullYear();
  const weekEndMonth = String(weekEnd.getMonth() + 1).padStart(2, '0');
  const weekEndDay = String(weekEnd.getDate()).padStart(2, '0');
  const weekEndStr = `${weekEndYear}-${weekEndMonth}-${weekEndDay}`;

  const { data: moods = [], isLoading, isFetching, refetch } = useMoods(
    weekStartStr,
    weekEndStr
  );
  const logMoodMutation = useLogMood();

  // Sincronizar localMoodMap com dados do servidor
  useEffect(() => {
    if (moods && moods.length > 0) {
      const serverMoodMap: Record<string, MoodLevel> = {};
      moods.forEach(mood => {
        // Converter string de enum para número
        let numericLevel: MoodLevel = mood.level as any;

        // Se vier como string, converter para número
        if (typeof mood.level === 'string') {
          const levelMap: Record<string, MoodLevel> = {
            'Awful': MoodLevel.Awful,
            'Bad': MoodLevel.Bad,
            'Neutral': MoodLevel.Neutral,
            'Good': MoodLevel.Good,
            'Excellent': MoodLevel.Excellent,
          };
          numericLevel = levelMap[mood.level] || (mood.level as any);
        }

        serverMoodMap[mood.date] = numericLevel;
      });
      // Fazer merge: dados do servidor sobrescrevem dados locais
      setLocalMoodMap(prev => {
        return { ...prev, ...serverMoodMap };
      });
    }
  }, [moods]);

  // Create a map of date -> mood for easy lookup
  const moodMap = useMemo(() => {
    // Apenas use localMoodMap que já foi sincronizado com os dados do servidor
    return { ...localMoodMap };
  }, [localMoodMap]);

  const getMoodStyle = (moodId: MoodLevel): React.CSSProperties => {
    const heights: Record<MoodLevel, number> = {
      [MoodLevel.Awful]: 20,
      [MoodLevel.Bad]: 35,
      [MoodLevel.Neutral]: 50,
      [MoodLevel.Good]: 70,
      [MoodLevel.Excellent]: 100,
    };
    return { height: `${heights[moodId]}%` };
  };

  const getMoodColor = (moodId: MoodLevel): string => {
    switch (moodId) {
      case MoodLevel.Awful:
        return "bg-destructive/60";
      case MoodLevel.Bad:
        return "bg-destructive/35";
      case MoodLevel.Neutral:
        return "bg-muted-foreground/30";
      case MoodLevel.Good:
        return "bg-primary/70";
      case MoodLevel.Excellent:
        return "bg-primary";
      default:
        return "bg-muted";
    }
  };

  const handleSetMood = async (dayIndex: number, level: MoodLevel) => {
    try {
      const dateToSet = new Date(weekStart);
      dateToSet.setDate(dateToSet.getDate() + dayIndex);
      const year = dateToSet.getFullYear();
      const month = String(dateToSet.getMonth() + 1).padStart(2, '0');
      const day = String(dateToSet.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Atualizar estado local imediatamente para feedback visual
      setLocalMoodMap(prev => ({ ...prev, [dateStr]: level }));

      await logMoodMutation.mutateAsync({
        date: dateStr,
        level,
      });

      toast.success("Humor registrado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar humor");
      // Reverter o estado local se falhar
      setLocalMoodMap(prev => {
        const copy = { ...prev };
        const dateToSet = new Date(weekStart);
        dateToSet.setDate(dateToSet.getDate() + dayIndex);
        const year = dateToSet.getFullYear();
        const month = String(dateToSet.getMonth() + 1).padStart(2, '0');
        const day = String(dateToSet.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        delete copy[dateStr];
        return copy;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-6 flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Humor Semanal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Como você se sentiu em cada dia</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {moodLevels.map((m) => (
            <span key={m.id} className="flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${m.color}`} />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {dayLabels.map((day, di) => {
          const dateForDay = new Date(weekStart);
          dateForDay.setDate(dateForDay.getDate() + di);
          const year = dateForDay.getFullYear();
          const month = String(dateForDay.getMonth() + 1).padStart(2, '0');
          const dayStr = String(dateForDay.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${dayStr}`;
          const moodForDay = moodMap[dateStr];

          return (
            <div key={day} className="flex flex-col items-center gap-2">
              <span className="font-display text-xs text-muted-foreground mb-1">{day}</span>

              {/* Bar visualization */}
              <div className="relative h-24 w-full flex items-end justify-center rounded-lg bg-secondary/50 overflow-hidden">
                {moodForDay ? (
                  <motion.div
                    initial={{ height: "0%" }}
                    animate={{ height: getMoodStyle(moodForDay).height }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`w-full rounded-t-md ${getMoodColor(moodForDay)}`}
                  />
                ) : (
                  <div className="w-full h-[2px] bg-border" />
                )}
              </div>

              {/* Mood buttons */}
              <div className="flex flex-col gap-1">
                {[MoodLevel.Excellent, MoodLevel.Good, MoodLevel.Neutral, MoodLevel.Bad, MoodLevel.Awful].map((level) => {
                  const isSelected = moodForDay === level;

                  // Classes dinâmicas para cada nível de humor quando selecionado
                  const buttonClass = isSelected
                    ? level === MoodLevel.Excellent
                      ? "h-4 w-8 rounded-sm border border-foreground/20 transition-all text-[8px] font-medium bg-primary text-primary-foreground disabled:opacity-50"
                      : level === MoodLevel.Good
                        ? "h-4 w-8 rounded-sm border border-foreground/20 transition-all text-[8px] font-medium bg-primary/70 text-primary-foreground disabled:opacity-50"
                        : level === MoodLevel.Neutral
                          ? "h-4 w-8 rounded-sm border border-foreground/20 transition-all text-[8px] font-medium bg-muted-foreground/30 text-foreground disabled:opacity-50"
                          : level === MoodLevel.Bad
                            ? "h-4 w-8 rounded-sm border border-foreground/20 transition-all text-[8px] font-medium bg-destructive/35 text-foreground disabled:opacity-50"
                            : "h-4 w-8 rounded-sm border border-foreground/20 transition-all text-[8px] font-medium bg-destructive/60 text-foreground disabled:opacity-50"
                    : "h-4 w-8 rounded-sm border border-border transition-all text-[8px] font-medium bg-muted text-muted-foreground hover:border-muted-foreground/40 disabled:opacity-50";

                  return (
                    <motion.button
                      key={level}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleSetMood(di, level)}
                      disabled={logMoodMutation.isPending}
                      className={buttonClass}
                    >
                      {level}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isFetching && !isLoading && (
        <div className="flex items-center justify-center mt-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
