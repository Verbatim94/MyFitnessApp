"use client";

import { Droplets, Flame, MoonStar, Pill as PillIcon, Sparkles, Target, Zap } from "lucide-react";
import { useMemo } from "react";
import type { ComponentType } from "react";
import { Card, MetricRing, Pill, ProgressBar, SectionHeader } from "@/components/ui";
import { useAppStore, useDailyCompletion } from "@/lib/store";
import type { Insight } from "@/lib/types";
import { formatDateLabel, percentage } from "@/lib/utils";

export function TodayScreen({ insights }: { insights: Insight[] }) {
  const { data, todayKey, getCalendarDay, getDailyLog, getTargetsForDate, getNutritionMode } = useAppStore();
  const day = getCalendarDay(todayKey);
  const log = getDailyLog(todayKey);
  const targets = getTargetsForDate(todayKey);
  const score = useDailyCompletion(todayKey);
  const mode = getNutritionMode(todayKey);

  const completion = useMemo(() => {
    const actual = log ?? {
      calories: 0,
      protein: 0,
      waterLiters: 0,
      supplementsTaken: [],
      workoutCompleted: false
    };
    return [
      {
        label: "Calories",
        value: percentage(actual.calories, targets.calories)
      },
      {
        label: "Protein",
        value: percentage(actual.protein, targets.protein)
      },
      {
        label: "Hydration",
        value: percentage(actual.waterLiters, data.settings.waterTargetLiters)
      }
    ];
  }, [data.settings.waterTargetLiters, log, targets.calories, targets.protein]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-card-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Pill tone={mode === "on" ? "success" : "default"}>{mode.toUpperCase()} Day</Pill>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">Today is built around recovery and execution.</h1>
            <p className="mt-2 max-w-[26ch] text-sm text-muted-foreground">
              {day?.dayType === "training"
                ? `${day.workoutTemplateId?.replace("-", " ").toUpperCase() ?? "Training"} is scheduled. Keep fueling high and finish the log before bed.`
                : day?.dayType === "cardio"
                  ? "Cardio day is active. Keep hydration high and aim for a lighter but clean execution flow."
                  : "No lifting is scheduled today. Use the extra margin to stay tight on nutrition, water, and recovery."}
            </p>
          </div>
          <MetricRing value={score} label="Daily completion" sublabel={`Week ${getWeekNumber(todayKey)}`} />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Flame className="h-3.5 w-3.5" />
            Target calories
          </div>
          <div className="mt-4 text-3xl font-semibold tracking-tight">{targets.calories}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            {targets.protein}P / {targets.carbs}C / {targets.fats}F
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Planned work
          </div>
          <div className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            {day?.customLabel ?? humanizeDayType(day?.dayType ?? "rest")}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{formatDateLabel(todayKey)}</div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Quick state" caption="Fast operational snapshot for the day." />
        <div className="grid grid-cols-2 gap-3">
          <QuickStat icon={Droplets} label="Water" value={`${(log?.waterLiters ?? 0).toFixed(1)}L / ${data.settings.waterTargetLiters}L`} />
          <QuickStat icon={PillIcon} label="Supplements" value={`${log?.supplementsTaken.length ?? 0} checked`} />
          <QuickStat icon={Zap} label="Workout" value={log?.workoutCompleted ? "Completed" : day?.dayType === "training" ? "Pending" : "Not scheduled"} />
          <QuickStat icon={MoonStar} label="Sleep" value={`${(log?.sleepHours ?? 0).toFixed(1)} hrs`} />
        </div>
      </Card>

      <Card>
        <SectionHeader title="Target alignment" caption="How today is stacking up versus the plan." />
        <div className="space-y-4">
          {completion.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">{item.value}%</span>
              </div>
              <ProgressBar value={item.value} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Insights" caption="Deterministic coaching notes based on recent trends." action={<Sparkles className="h-4 w-4 text-accent" />} />
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-3xl border border-white/8 bg-white/4 p-4">
              <div className="flex items-center gap-2">
                <Pill tone={insight.tone === "positive" ? "success" : insight.tone === "warning" ? "warning" : "default"}>
                  {insight.tone}
                </Pill>
                <div className="text-sm font-semibold">{insight.title}</div>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/8 bg-card-2/70 p-4">
      <Icon className="h-4 w-4 text-accent" />
      <div className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function humanizeDayType(dayType: string) {
  switch (dayType) {
    case "training":
      return "Training";
    case "cardio":
      return "Cardio";
    case "deload":
      return "Deload";
    case "custom":
      return "Custom";
    default:
      return "Rest";
  }
}

function getWeekNumber(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.ceil((diff + start.getDay() + 1) / 7);
}
