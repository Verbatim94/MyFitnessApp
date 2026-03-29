"use client";

import { Minus, Plus } from "lucide-react";
import { Card, CheckboxChip, FieldLabel, Input, ProgressBar, SectionHeader, Textarea } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { percentage } from "@/lib/utils";

const numericFields: Array<{
  key: "calories" | "protein" | "carbs" | "fats" | "fiber" | "waterLiters" | "caffeineMg" | "sleepHours";
  label: string;
  step: number;
}> = [
  { key: "calories", label: "Calories", step: 50 },
  { key: "protein", label: "Protein (g)", step: 5 },
  { key: "carbs", label: "Carbs (g)", step: 5 },
  { key: "fats", label: "Fats (g)", step: 5 },
  { key: "fiber", label: "Fiber (g)", step: 2 },
  { key: "waterLiters", label: "Water (L)", step: 0.25 },
  { key: "caffeineMg", label: "Caffeine (mg)", step: 25 },
  { key: "sleepHours", label: "Sleep Hours", step: 0.5 }
];

export function LogScreen() {
  const { todayKey, getDailyLog, dispatch, getTargetsForDate, data, getCalendarDay } = useAppStore();
  const log = getDailyLog(todayKey) ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    waterLiters: 0,
    caffeineMg: 0,
    supplementsTaken: [],
    workoutCompleted: false,
    notes: "",
    energy: 3,
    hunger: 3,
    sleepHours: 7,
    digestion: ""
  };
  const targets = getTargetsForDate(todayKey);
  const day = getCalendarDay(todayKey);
  const plannedTemplate = data.workoutTemplates.find((template) => template.id === day?.workoutTemplateId);

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Daily log" caption="Auto-saved, mobile-first, and fast to update." />
        <div className="grid grid-cols-2 gap-3">
          {numericFields.map((field) => {
            const currentValue = Number(log[field.key] ?? 0);
            return (
              <div key={field.key} className="rounded-3xl border border-white/8 bg-card-2/60 p-3">
                <FieldLabel>{field.label}</FieldLabel>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateNumber(dispatch, todayKey, field.key, currentValue - field.step)}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white/6"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <Input
                    type="number"
                    step={field.step}
                    value={currentValue}
                    onChange={(event) => updateNumber(dispatch, todayKey, field.key, Number(event.target.value))}
                    className="text-center"
                  />
                  <button
                    type="button"
                    onClick={() => updateNumber(dispatch, todayKey, field.key, currentValue + field.step)}
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-white/6"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Target vs actual" caption="Live comparison against the calendar-driven target." />
        <div className="space-y-4">
          {[
            { label: "Calories", actual: log.calories, target: targets.calories },
            { label: "Protein", actual: log.protein, target: targets.protein },
            { label: "Carbs", actual: log.carbs, target: targets.carbs },
            { label: "Fats", actual: log.fats, target: targets.fats },
            { label: "Fiber", actual: log.fiber, target: targets.fiber },
            { label: "Water", actual: log.waterLiters, target: data.settings.waterTargetLiters }
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <span className="text-muted-foreground">
                  {item.actual} / {item.target} {item.label === "Water" ? "L" : ""}
                </span>
              </div>
              <ProgressBar value={percentage(item.actual, item.target)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Checklists" caption="Supplements, workout completion, and subjective recovery." />
        <div className="space-y-4">
          <div>
            <FieldLabel>Supplements</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {data.settings.supplementList.map((supplement) => (
                <CheckboxChip
                  key={supplement}
                  checked={log.supplementsTaken.includes(supplement)}
                  label={supplement}
                  onClick={() => dispatch({ type: "toggle-supplement", date: todayKey, supplement })}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Energy (1-5)</FieldLabel>
              <Input
                type="range"
                min={1}
                max={5}
                step={1}
                value={log.energy}
                onChange={(event) => dispatch({ type: "update-daily-log", date: todayKey, patch: { energy: Number(event.target.value) } })}
              />
              <div className="mt-2 text-sm text-muted-foreground">{log.energy} / 5</div>
            </div>
            <div>
              <FieldLabel>Hunger (1-5)</FieldLabel>
              <Input
                type="range"
                min={1}
                max={5}
                step={1}
                value={log.hunger}
                onChange={(event) => dispatch({ type: "update-daily-log", date: todayKey, patch: { hunger: Number(event.target.value) } })}
              />
              <div className="mt-2 text-sm text-muted-foreground">{log.hunger} / 5</div>
            </div>
          </div>

          <CheckboxChip
            checked={log.workoutCompleted}
            label={day?.dayType === "training" ? "Workout completed" : "Recovery tasks complete"}
            onClick={() => dispatch({ type: "update-daily-log", date: todayKey, patch: { workoutCompleted: !log.workoutCompleted } })}
          />

          <div className="grid grid-cols-1 gap-3">
            <div>
              <FieldLabel>Digestion</FieldLabel>
              <Input
                placeholder="Optional note"
                value={log.digestion ?? ""}
                onChange={(event) => dispatch({ type: "update-daily-log", date: todayKey, patch: { digestion: event.target.value } })}
              />
            </div>
            <div>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                placeholder="Training quality, appetite, recovery notes..."
                value={log.notes}
                onChange={(event) => dispatch({ type: "update-daily-log", date: todayKey, patch: { notes: event.target.value } })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Workout logbook"
          caption={
            plannedTemplate
              ? `${plannedTemplate.name} is today's planned session.`
              : "Training templates show last, best, and suggested next targets."
          }
        />
        {plannedTemplate ? (
          <div className="space-y-3">
            {plannedTemplate.exercises.map((exercise) => {
              const relatedLogs = data.workoutSessions
                .flatMap((session) => session.exercises.map((entry) => ({ ...entry, date: session.date })))
                .filter((entry) => entry.exerciseName === exercise.name || entry.exerciseId === exercise.id);
              const lastEntry = relatedLogs.at(-1);
              const bestLoad = relatedLogs.length ? Math.max(...relatedLogs.map((entry) => entry.loadKg)) : 0;
              const suggested = lastEntry ? `${(lastEntry.loadKg + 2.5).toFixed(1)} kg if reps stay clean` : "Start with a smooth baseline set";

              return (
                <div key={exercise.id} className="rounded-3xl border border-white/8 bg-card-2/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{exercise.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {exercise.targetSets} sets • {exercise.targetReps} reps • RIR {exercise.targetRir}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Last: {lastEntry ? `${lastEntry.loadKg} kg` : "N/A"}</div>
                      <div className="mt-1">Best: {bestLoad ? `${bestLoad} kg` : "N/A"}</div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-white/5 px-3 py-2 text-sm text-foreground">{suggested}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-card-2/60 p-4 text-sm text-muted-foreground">
            No lifting template is attached to today. Use the Calendar tab to assign Upper A, Lower A, Upper B, or Lower B to an ON day.
          </div>
        )}
      </Card>
    </div>
  );
}

function updateNumber(
  dispatch: ReturnType<typeof useAppStore>["dispatch"],
  date: string,
  key: (typeof numericFields)[number]["key"],
  value: number
) {
  const rounded = key === "waterLiters" || key === "sleepHours" ? Number(Math.max(0, value).toFixed(2)) : Math.max(0, Math.round(value));
  dispatch({ type: "update-daily-log", date, patch: { [key]: rounded } });
}
