import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const habitNames = ["Todos", "Leitura", "Código", "Meditar", "Exercício", "Água 2L"];

const generateData = (seed: number) => {
  const weeks = 52;
  const days = 7;
  const data: number[][] = [];
  let r = seed;
  const next = () => { r = (r * 16807 + 0) % 2147483647; return r / 2147483647; };
  for (let w = 0; w < weeks; w++) {
    const week: number[] = [];
    for (let d = 0; d < days; d++) {
      const recency = w / weeks;
      const rand = next();
      if (rand < 0.15 - recency * 0.05) week.push(0);
      else if (rand < 0.35) week.push(1);
      else if (rand < 0.55) week.push(2);
      else if (rand < 0.78) week.push(3);
      else week.push(4);
    }
    data.push(week);
  }
  return data;
};

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const levelClasses: Record<number, string> = {
  0: "bg-commit-0",
  1: "bg-commit-1",
  2: "bg-commit-2",
  3: "bg-commit-3",
  4: "bg-commit-4",
};

const CommitGraph = () => {
  const [habitIndex, setHabitIndex] = useState(0);
  const data = useMemo(() => generateData(habitIndex * 1000 + 42), [habitIndex]);

  const scrollHabit = (dir: number) => {
    setHabitIndex((prev) => Math.max(0, Math.min(habitNames.length - 1, prev + dir)));
  };

  return (
    <div className="rounded-xl bg-muted/20 border border-border/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-foreground">Consistência Anual</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scrollHabit(-1)} disabled={habitIndex === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-display text-xs text-foreground min-w-[60px] text-center">{habitNames[habitIndex]}</span>
          <button onClick={() => scrollHabit(1)} disabled={habitIndex === habitNames.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1 ml-3 text-xs text-muted-foreground">
            <span>Menos</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} className={`inline-block h-3 w-3 rounded-[3px] ${levelClasses[level]}`} />
            ))}
            <span>Mais</span>
          </div>
        </div>
      </div>

      <motion.div key={habitIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <div className="mb-1 flex pl-8">
          {months.map((m) => (
            <span key={m} className="flex-1 text-center font-display text-[10px] text-muted-foreground">{m}</span>
          ))}
        </div>

        <div className="flex gap-[3px] overflow-x-auto">
          <div className="flex flex-col gap-[3px] pr-1 pt-0">
            {["", "Seg", "", "Qua", "", "Sex", ""].map((d, i) => (
              <span key={i} className="flex h-[13px] items-center font-display text-[10px] text-muted-foreground">{d}</span>
            ))}
          </div>
          {data.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((level, di) => (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.0008, duration: 0.2 }}
                  className={`h-[13px] w-[13px] rounded-[3px] ${levelClasses[level]} transition-all hover:ring-1 hover:ring-foreground/20`}
                  title={`${habitNames[habitIndex]} — Semana ${wi + 1}, Dia ${di + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CommitGraph;
