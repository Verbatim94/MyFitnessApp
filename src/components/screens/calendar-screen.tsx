"use client";

import { Copy, RefreshCcw, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, IconButton, Input, Pill, PrimaryButton, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import type { CalendarDay, DayType } from "@/lib/types";
import { addDays, formatDateLabel, startOfWeek, toDateKey } from "@/lib/utils";

const dayOptions: Array<{ type: DayType; label: string; workoutTemplateId?: string }> = [
  { type: "training", label: "ON / Training", workoutTemplateId: "upper-a" },
  { type: "rest", label: "OFF / Rest" },
  { type: "cardio", label: "Cardio", workoutTemplateId: "custom-cardio" },
  { type: "deload", label: "Deload" },
  { type: "custom", label: "Custom" }
];

const templateOptions = ["Upper A", "Lower A", "Upper B", "Lower B", "Rest", "Custom"];

export function CalendarScreen() {
  const { getWeekDays, todayKey, dispatch, getCalendarDay } = useAppStore();
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const weekDays = getWeekDays(anchorDate);
  const selectedDay = getCalendarDay(selectedDate) ?? { date: selectedDate, dayType: "rest" as DayType };
  const weekStartKey = toDateKey(startOfWeek(anchorDate));

  const monthPreview = useMemo(() => {
    const start = startOfWeek(anchorDate);
    return Array.from({ length: 28 }, (_, index) => {
      const date = toDateKey(addDays(start, index));
      return getCalendarDay(date) ?? { date, dayType: "rest" as DayType };
    });
  }, [anchorDate, getCalendarDay]);

  const updateDayType = (option: (typeof dayOptions)[number]) => {
    dispatch({
      type: "update-calendar-day",
      date: selectedDate,
      patch: {
        dayType: option.type,
        workoutTemplateId: option.workoutTemplateId,
        customLabel: option.type === "cardio" ? "Zone 2 + mobility" : undefined
      }
    });
  };

  const updateTemplate = (template: string) => {
    dispatch({
      type: "update-calendar-day",
      date: selectedDate,
      patch: {
        workoutTemplateId: template === "Rest" ? undefined : template.toLowerCase().replace(/\s+/g, "-"),
        customLabel: template === "Custom" ? "Custom session" : undefined
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Week engine" caption="Training schedule drives ON/OFF nutrition and today state." />
        <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/8 bg-card-2/60 p-3">
          <button type="button" onClick={() => setAnchorDate(addDays(anchorDate, -7))} className="rounded-2xl bg-white/6 px-3 py-2 text-sm">
            Prev
          </button>
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active week</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{formatDateLabel(weekDays[0].date)} - {formatDateLabel(weekDays[6].date)}</div>
          </div>
          <button type="button" onClick={() => setAnchorDate(addDays(anchorDate, 7))} className="rounded-2xl bg-white/6 px-3 py-2 text-sm">
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDate(day.date)}
              className={`rounded-[22px] border p-2 text-left transition ${
                day.date === selectedDate ? "border-accent/40 bg-accent/12" : "border-white/8 bg-white/4"
              }`}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {new Date(day.date).toLocaleDateString("en-US", { weekday: "narrow" })}
              </div>
              <div className="mt-2 text-lg font-semibold">{new Date(day.date).getDate()}</div>
              <div className="mt-3">
                <DayDot day={day} />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none">
          <IconButton onClick={() => dispatch({ type: "duplicate-week", weekStart: weekStartKey })}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate week
          </IconButton>
          <IconButton onClick={() => dispatch({ type: "apply-default-week", weekStart: weekStartKey })}>
            <Wand2 className="mr-2 h-4 w-4" />
            Default template
          </IconButton>
          <IconButton onClick={() => dispatch({ type: "reset-week", weekStart: weekStartKey })}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reset week
          </IconButton>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Day setup" caption={formatDateLabel(selectedDate)} />
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => updateDayType(option)}
              className={`rounded-2xl border px-4 py-2 text-sm ${
                selectedDay.dayType === option.type ? "border-accent/40 bg-accent/15" : "border-white/10 bg-white/4"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Workout template</div>
          <div className="grid grid-cols-2 gap-2">
            {templateOptions.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => updateTemplate(template)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                  (selectedDay.workoutTemplateId ?? "Rest").toLowerCase() === template.toLowerCase().replace(/\s+/g, "-")
                    ? "border-accent/40 bg-accent/15"
                    : "border-white/10 bg-white/4"
                }`}
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/8 bg-card-2/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Resolved mode</div>
              <div className="mt-2 text-lg font-semibold">{selectedDay.dayType === "rest" ? "OFF" : "ON"}</div>
            </div>
            <Pill tone={selectedDay.dayType === "rest" ? "default" : "success"}>
              {selectedDay.workoutTemplateId ? selectedDay.workoutTemplateId.toUpperCase() : "REST"}
            </Pill>
          </div>
          <div className="mt-4">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Custom label</div>
            <Input
              placeholder="Optional note like Gym + steps or Travel day"
              value={selectedDay.customLabel ?? ""}
              onChange={(event) =>
                dispatch({
                  type: "update-calendar-day",
                  date: selectedDate,
                  patch: { customLabel: event.target.value || undefined }
                })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Month pulse" caption="A compact view for weekly pattern balance." />
        <div className="grid grid-cols-7 gap-2">
          {monthPreview.map((day) => (
            <div key={day.date} className="rounded-2xl border border-white/8 bg-white/4 p-2 text-center">
              <div className="text-xs text-muted-foreground">{new Date(day.date).getDate()}</div>
              <div className="mt-2 flex justify-center">
                <DayDot day={day} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => setAnchorDate(new Date())} className="w-full justify-center">
            Jump to current week
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function DayDot({ day }: { day: CalendarDay }) {
  const color =
    day.dayType === "training"
      ? "bg-success"
      : day.dayType === "cardio"
        ? "bg-warning"
        : day.dayType === "deload"
          ? "bg-accent"
          : day.dayType === "custom"
            ? "bg-white"
            : "bg-muted-foreground/50";
  return <span className={`block h-2.5 w-2.5 rounded-full ${color}`} />;
}
