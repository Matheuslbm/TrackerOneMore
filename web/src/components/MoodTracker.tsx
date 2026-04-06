import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMoods, useLogMood } from "@/api/moodApi";
import { toast } from "sonner";
import { MoodLevel } from "@/shared/types";

const moodLevels = [
  { id: MoodLevel.Terrible, label: "Péssimo", color: "bg-destructive/50" },
  { id: MoodLevel.Bad, label: "Ruim", color: "bg-destructive/30" },
  { id: MoodLevel.Neutral, label: "Neutro", color: "bg-muted-foreground/40" },
  { id: MoodLevel.Good, label: "Bem", color: "bg-primary/60" },
  { id: MoodLevel.Excellent, label: "Ótimo", color: "bg-primary" },
];

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get moods for the week
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const { data: moods = [], isLoading, isFetching } = useMoods(
    weekStart.toISOString().split("T")[0],
    weekEnd.toISOString().split("T")[0]
  );
  const logMoodMutation = useLogMood();

  // Create a map of date -> mood for easy lookup
  const moodMap = useMemo(() => {
    const map: Record<string, MoodLevel> = {};
    moods.forEach(mood => {
      map[mood.date] = mood.level;
    });
    return map;
  }, [moods]);

  const getMoodStyle = (moodId: MoodLevel): React.CSSProperties => {
    const heights: Record<MoodLevel, number> = {
      [MoodLevel.Terrible]: 20,
      [MoodLevel.Bad]: 35,
      [MoodLevel.Neutral]: 50,
      [MoodLevel.Good]: 70,
      [MoodLevel.Excellent]: 100,
    };
    return { height: `${heights[moodId]}%` };
  };

  const getMoodColor = (moodId: MoodLevel): string => {
    switch (moodId) {
      case MoodLevel.Terrible:
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
      const dateStr = dateToSet.toISOString().split("T")[0];

      await logMoodMutation.mutateAsync({
        date: dateStr,
        level,
      });

      toast.success("Humor registrado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar humor");
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
          const dateStr = dateForDay.toISOString().split("T")[0];
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
                {[MoodLevel.Excellent, MoodLevel.Good, MoodLevel.Neutral, MoodLevel.Bad, MoodLevel.Terrible].map((level) => {
                  const isSelected = moodForDay === level;
                  const buttonClass = isSelected
                    ? `h-4 w-8 rounded-sm border transition-all text-[8px] font-medium ${getMoodColor(level)} border-foreground/20 text-primary-foreground disabled:opacity-50`
                    : "h-4 w-8 rounded-sm border transition-all text-[8px] font-medium bg-muted border-border text-muted-foreground hover:border-muted-foreground/40 disabled:opacity-50";

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
