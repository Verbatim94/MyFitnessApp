"use client";

import { Camera, Dumbbell, Scale, Tape, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, FieldLabel, Input, Pill, ProgressBar, PrimaryButton, SectionHeader } from "@/components/ui";
import { getAdherenceStatus, getProgressTrendLabel, getWorkoutPerformanceSummary } from "@/lib/insights";
import { useAppStore } from "@/lib/store";
import { formatDateLabel, percentage, toDateKey } from "@/lib/utils";

export function ProgressScreen() {
  const { data, dispatch } = useAppStore();
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput] = useState("");

  const weeklyWeightData = data.progressEntries.map((entry) => ({
    date: formatDateLabel(entry.date),
    weight: entry.weightKg,
    waist: entry.waistCm
  }));

  const adherenceLogs = data.dailyLogs.slice(-7);
  const proteinHitRate = percentage(
    adherenceLogs.filter((log) => log.protein >= data.settings.onTargets.protein * 0.9).length,
    adherenceLogs.length
  );
  const hydrationHitRate = percentage(
    adherenceLogs.filter((log) => log.waterLiters >= data.settings.waterTargetLiters).length,
    adherenceLogs.length
  );
  const workoutCompletion = percentage(data.workoutSessions.filter((session) => session.completed).length, Math.max(1, data.workoutSessions.length));

  const keyLifts = useMemo(() => {
    const map = new Map<string, { name: string; latest: number; best: number }>();
    data.workoutSessions.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const current = map.get(exercise.exerciseName);
        if (!current) {
          map.set(exercise.exerciseName, { name: exercise.exerciseName, latest: exercise.loadKg, best: exercise.loadKg });
        } else {
          current.latest = exercise.loadKg;
          current.best = Math.max(current.best, exercise.loadKg);
        }
      });
    });
    return Array.from(map.values()).filter((item) =>
      ["smith", "lat", "universal", "leg press", "machine"].some((name) => item.name.toLowerCase().includes(name))
    );
  }, [data.workoutSessions]);

  const addEntry = () => {
    const weight = Number(weightInput);
    const waist = Number(waistInput);
    if (!weight || !waist) return;
    dispatch({ type: "add-progress-entry", entry: { date: toDateKey(new Date()), weightKg: weight, waistCm: waist } });
    setWeightInput("");
    setWaistInput("");
  };

  const onPhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "add-photo",
        entry: {
          id: crypto.randomUUID(),
          date: toDateKey(new Date()),
          label: "Check-in photo",
          imageDataUrl: String(reader.result)
        }
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Weight trend" caption="Weekly average trend with signal labels." />
        <TrendHeader icon={Scale} label={getProgressTrendLabel(data.progressEntries, "weightKg")} />
        <ChartCard>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyWeightData}>
              <defs>
                <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(163, 205, 184, 0.7)" />
                  <stop offset="100%" stopColor="rgba(163, 205, 184, 0)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1317", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 }} />
              <Area type="monotone" dataKey="weight" stroke="#a3cdb8" fill="url(#weightFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </Card>

      <Card>
        <SectionHeader title="Waist trend" caption="A clean read on recomposition direction." />
        <TrendHeader icon={Tape} label={getProgressTrendLabel(data.progressEntries, "waistCm")} />
        <ChartCard>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyWeightData}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1317", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 }} />
              <Line type="monotone" dataKey="waist" stroke="#d6b98e" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Card>

      <Card>
        <SectionHeader title="Key lifts trend" caption="Last and best loads for seeded priority lifts." />
        <TrendHeader icon={Dumbbell} label={getWorkoutPerformanceSummary(data.workoutSessions)} />
        <div className="space-y-3">
          {keyLifts.map((lift) => (
            <div key={lift.name} className="rounded-3xl border border-white/8 bg-card-2/60 p-4">
              <div className="text-sm font-semibold">{lift.name}</div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Latest: {lift.latest} kg</span>
                <span>Best: {lift.best} kg</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Adherence" caption="Weekly execution across key behaviors." />
        <div className="space-y-4">
          {[
            { label: "Workout completion %", value: workoutCompletion, status: workoutCompletion >= 75 ? "improving" : workoutCompletion >= 50 ? "stable" : "warning" },
            { label: "Protein target adherence %", value: proteinHitRate, status: getAdherenceStatus(adherenceLogs, data.settings.onTargets.protein * 0.9, "protein") },
            { label: "Hydration adherence %", value: hydrationHitRate, status: getAdherenceStatus(adherenceLogs, data.settings.waterTargetLiters, "waterLiters") }
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{item.label}</span>
                <Pill tone={item.status === "improving" ? "success" : item.status === "warning" ? "warning" : "default"}>{item.status}</Pill>
              </div>
              <ProgressBar value={item.value} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Photos" caption="Visual check-ins stored locally for the MVP." action={<Camera className="h-4 w-4 text-accent" />} />
        <label className="mb-4 flex cursor-pointer items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/4 p-6 text-sm text-muted-foreground">
          <input type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
          Add progress photo
        </label>
        {data.photos.length ? (
          <div className="grid grid-cols-2 gap-3">
            {data.photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-3xl border border-white/8 bg-card-2/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageDataUrl} alt={photo.label} className="h-40 w-full object-cover" />
                <div className="p-3 text-xs text-muted-foreground">{formatDateLabel(photo.date)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/8 bg-card-2/60 p-4 text-sm text-muted-foreground">
            No photos yet. Add a front or side check-in to compare week over week.
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Quick check-in" caption="Add today's weight and waist in a few taps." action={<TrendingUp className="h-4 w-4 text-accent" />} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Weight (kg)</FieldLabel>
            <Input type="number" step="0.1" value={weightInput} onChange={(event) => setWeightInput(event.target.value)} />
          </div>
          <div>
            <FieldLabel>Waist (cm)</FieldLabel>
            <Input type="number" step="0.1" value={waistInput} onChange={(event) => setWaistInput(event.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={addEntry} className="w-full justify-center">
            Save progress entry
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function TrendHeader({
  icon: Icon,
  label
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-accent" />
      <Pill tone={label === "improving" ? "success" : label === "warning" ? "warning" : "default"}>{label}</Pill>
    </div>
  );
}

function ChartCard({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-white/8 bg-card-2/60 p-2">{children}</div>;
}
