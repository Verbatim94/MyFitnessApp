"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Home,
  NotebookPen,
  Sandwich,
  Settings2
} from "lucide-react";
import { useEffect } from "react";
import type { ComponentType } from "react";
import { buildInsights } from "@/lib/insights";
import { AppStoreProvider, useAppStore } from "@/lib/store";
import type { TabKey } from "@/lib/types";
import { formatLongDate } from "@/lib/utils";
import { CalendarScreen } from "@/components/screens/calendar-screen";
import { LogScreen } from "@/components/screens/log-screen";
import { MealsScreen } from "@/components/screens/meals-screen";
import { ProgressScreen } from "@/components/screens/progress-screen";
import { SettingsScreen } from "@/components/screens/settings-screen";
import { TodayScreen } from "@/components/screens/today-screen";
import { cn } from "@/lib/utils";

const tabs: Array<{ key: TabKey; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: "today", label: "Today", icon: Home },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "log", label: "Log", icon: NotebookPen },
  { key: "meals", label: "Meals", icon: Sandwich },
  { key: "progress", label: "Progress", icon: ChartNoAxesCombined },
  { key: "settings", label: "Settings", icon: Settings2 }
];

function ShellContent() {
  const { activeTab, dispatch, data, todayKey } = useAppStore();
  const insights = buildInsights(data, todayKey);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 pb-32 pt-4 safe-pb">
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/6 bg-background/85 px-4 pb-4 pt-2 backdrop-blur-xl">
        <div className="rounded-[28px] border border-white/8 bg-white/4 p-4 shadow-glow">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{data.settings.appName}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{tabs.find((tab) => tab.key === activeTab)?.label}</div>
            </div>
            <div className="rounded-2xl bg-white/6 px-3 py-2 text-right">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current phase</div>
              <div className="mt-1 text-sm font-medium text-foreground">{data.settings.currentPhase}</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">{formatLongDate(todayKey)}</div>
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        {activeTab === "today" ? <TodayScreen insights={insights} /> : null}
        {activeTab === "calendar" ? <CalendarScreen /> : null}
        {activeTab === "log" ? <LogScreen /> : null}
        {activeTab === "meals" ? <MealsScreen /> : null}
        {activeTab === "progress" ? <ProgressScreen /> : null}
        {activeTab === "settings" ? <SettingsScreen /> : null}
      </motion.div>

      <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4">
        <div className="grid grid-cols-6 gap-1 rounded-[30px] border border-white/10 bg-card/95 p-2 shadow-soft backdrop-blur-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => dispatch({ type: "set-tab", tab: tab.key })}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                  isActive ? "bg-accent/15 text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-accent" : "text-muted-foreground")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

export function AppShell() {
  return (
    <AppStoreProvider>
      <ShellContent />
    </AppStoreProvider>
  );
}
