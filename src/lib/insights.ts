import type { AppData, CalendarDay, DailyLog, Insight, NutritionMode, ProgressEntry, WorkoutSession } from "@/lib/types";
import { average } from "@/lib/utils";

function getModeForDay(day?: CalendarDay): NutritionMode {
  return day && day.dayType !== "rest" ? "on" : "off";
}

function getTargetCalories(data: AppData, day?: CalendarDay) {
  return getModeForDay(day) === "on" ? data.settings.onTargets.calories : data.settings.offTargets.calories;
}

export function buildInsights(data: AppData, todayKey: string): Insight[] {
  const todaysIndex = data.calendarDays.findIndex((day) => day.date === todayKey);
  const recentCalendar = data.calendarDays.slice(Math.max(todaysIndex - 9, 0), todaysIndex + 1);
  const recentLogs = data.dailyLogs
    .filter((log) => recentCalendar.some((day) => day.date === log.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const lastWeekLogs = recentLogs.slice(-7);
  const lastWeekSessions = data.workoutSessions.filter((session) =>
    recentCalendar.slice(-7).some((day) => day.date === session.date)
  );
  const progress = [...data.progressEntries].sort((a, b) => a.date.localeCompare(b.date));
  const insights: Insight[] = [];

  const lastTwoProgress = progress.slice(-2);
  if (lastTwoProgress.length === 2) {
    const [prev, current] = lastTwoProgress;
    if (Math.abs(current.weightKg - prev.weightKg) <= 0.3 && current.waistCm < prev.waistCm) {
      insights.push({
        id: "recomp",
        tone: "positive",
        title: "Positive recomposition trend",
        description: "Weight is stable while waist is trending down, which usually signals body composition is moving in the right direction."
      });
    }

    if (current.weightKg > prev.weightKg + 0.4 && current.waistCm > prev.waistCm + 0.3) {
      insights.push({
        id: "calorie-drift",
        tone: "warning",
        title: "Possible calorie drift",
        description: "Weight and waist are both rising. It may be time to audit intake accuracy or tighten OFF-day execution."
      });
    }
  }

  const proteinMisses = lastWeekLogs.filter((log) => {
    const day = data.calendarDays.find((entry) => entry.date === log.date);
    const target = getModeForDay(day) === "on" ? data.settings.onTargets.protein : data.settings.offTargets.protein;
    return log.protein < target;
  }).length;

  if (proteinMisses >= 4) {
    insights.push({
      id: "protein-warning",
      tone: "warning",
      title: "Protein is slipping",
      description: `Protein came in below target ${proteinMisses} times over the last 7 logged days. Tightening snack choices should fix this quickly.`
    });
  }

  const hydrationMisses = lastWeekLogs.filter((log) => log.waterLiters < data.settings.waterTargetLiters).length;
  if (hydrationMisses >= 4) {
    insights.push({
      id: "hydration-warning",
      tone: "warning",
      title: "Hydration has been inconsistent",
      description: `${hydrationMisses} of the last 7 days were below the water target. A fixed morning and training bottle routine would likely help.`
    });
  }

  const missedWorkouts = recentCalendar
    .filter((day) => day.dayType === "training")
    .filter((day) => !data.dailyLogs.find((log) => log.date === day.date)?.workoutCompleted).length;
  if (missedWorkouts >= 2) {
    insights.push({
      id: "adherence-warning",
      tone: "warning",
      title: "Training adherence needs attention",
      description: `${missedWorkouts} planned training sessions were missed across the last 10 days. Consider simplifying the week template or protecting training slots earlier in the day.`
    });
  }

  const downSessions = lastWeekSessions.filter((session) => session.perceivedPerformance === "down");
  if (downSessions.length >= 1) {
    const lowFuelDays = downSessions.filter((session) => {
      const day = data.calendarDays.find((entry) => entry.date === session.date);
      const log = data.dailyLogs.find((entry) => entry.date === session.date);
      return !!log && log.calories < getTargetCalories(data, day) - 150;
    });

    if (lowFuelDays.length >= 1) {
      insights.push({
        id: "recovery-warning",
        tone: "warning",
        title: "Recovery may be under-fueled",
        description: "Performance dipped on training days where calories ran noticeably low. Bringing ON-day intake closer to target should improve output."
      });
    }
  }

  if (!insights.length && lastWeekLogs.length) {
    const avgSleep = average(lastWeekLogs.map((log) => log.sleepHours));
    insights.push({
      id: "baseline",
      tone: "neutral",
      title: "Execution is stable",
      description: `Recent adherence looks steady. Average sleep is ${avgSleep.toFixed(1)} hours, so the next leverage point is keeping protein and water just as consistent.`
    });
  }

  return insights.slice(0, 4);
}

export function getWorkoutPerformanceSummary(sessions: WorkoutSession[]) {
  const recent = sessions.slice(-4);
  const up = recent.filter((session) => session.perceivedPerformance === "up").length;
  const down = recent.filter((session) => session.perceivedPerformance === "down").length;
  if (up > down) return "improving";
  if (down > up) return "warning";
  return "stable";
}

export function getProgressTrendLabel(values: ProgressEntry[], key: "weightKg" | "waistCm") {
  const recent = values.slice(-2);
  if (recent.length < 2) return "stable";
  const delta = recent[1][key] - recent[0][key];
  if (key === "waistCm") {
    if (delta < -0.2) return "improving";
    if (delta > 0.2) return "warning";
    return "stable";
  }

  if (Math.abs(delta) < 0.3) return "stable";
  return delta < 0 ? "improving" : "warning";
}

export function getAdherenceStatus(logs: DailyLog[], target: number, key: keyof DailyLog) {
  const count = logs.filter((log) => Number(log[key] ?? 0) >= target).length;
  const ratio = logs.length ? count / logs.length : 0;
  if (ratio >= 0.75) return "improving";
  if (ratio >= 0.5) return "stable";
  return "warning";
}
