import { useState } from "react";
import { motion } from "framer-motion";
import HabitGrid from "@/components/HabitGrid";
import MoodTracker from "@/components/MoodTracker";
import MonthlyHabitGrid from "@/components/MonthlyHabitGrid";
import HabitsDashboard from "@/components/HabitsDashboard";
import Challenge from "@/components/Challenge";
import Summary from "@/components/Summary";
import { Flame, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "resumo", label: "Resumo" },
  { id: "habitos", label: "Hábitos" },
  { id: "desafios", label: "Desafios" },
];

const activeTabStorageKey = "activeTab";

const Index = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const stored = localStorage.getItem(activeTabStorageKey);
    return stored && tabs.some((t) => t.id === stored) ? stored : "resumo";
  });
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header with integrated tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-t-2xl px-8 pt-8 pb-0"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-5">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-streak-fire/15 border border-streak-fire/20"
              >
                <Flame
                  className="h-8 w-8 text-streak-fire drop-shadow-[0_0_10px_hsl(var(--streak-fire)/0.5)]"
                  fill="hsl(var(--streak-fire))"
                  strokeWidth={1.5}
                />
              </motion.div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                  Streak<span className="text-streak-fire">.</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">Construa hábitos, mantenha consistência</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          {/* Tabs */}
          <nav className="flex gap-1 pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  localStorage.setItem(activeTabStorageKey, tab.id);
                }}
                className={`relative px-6 py-2.5 text-sm font-display font-semibold transition-all ${activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-t-xl bg-muted/40 border border-border/30 border-b-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content seamlessly below */}
        <div className="glass rounded-b-2xl rounded-t-none border-t-0 px-6 py-6">
          <AnimatedTab visible={activeTab === "habitos"}>
            <div className="flex flex-col gap-6">
              <HabitGrid />
              <MoodTracker />
              <HabitsDashboard />
              <MonthlyHabitGrid />
            </div>
          </AnimatedTab>

          <AnimatedTab visible={activeTab === "resumo"}>
            <Summary />
          </AnimatedTab>

          <AnimatedTab visible={activeTab === "desafios"}>
            <Challenge />
          </AnimatedTab>
        </div>
      </div>
    </div>
  );
};

const AnimatedTab = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
  if (!visible) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
};

export default Index;
