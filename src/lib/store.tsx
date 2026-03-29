"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import { createSeedData } from "@/lib/seed";
import type {
  AppData,
  CalendarDay,
  DailyLog,
  DayType,
  MacroTargets,
  MealVariant,
  NutritionMode,
  PhotoEntry,
  ProgressEntry,
  Settings,
  TabKey
} from "@/lib/types";
import { addDays, clamp, startOfWeek, toDateKey } from "@/lib/utils";

const STORAGE_KEY = "phase-app-data-v1";

type AppAction =
  | { type: "set-tab"; tab: TabKey }
  | { type: "update-calendar-day"; date: string; patch: Partial<CalendarDay> }
  | { type: "duplicate-week"; weekStart: string }
  | { type: "reset-week"; weekStart: string }
  | { type: "apply-default-week"; weekStart: string }
  | { type: "update-daily-log"; date: string; patch: Partial<DailyLog> }
  | { type: "toggle-supplement"; date: string; supplement: string }
  | { type: "toggle-meal-favorite"; mealId: string }
  | { type: "update-settings"; patch: Partial<Settings> }
  | { type: "add-progress-entry"; entry: ProgressEntry }
  | { type: "add-photo"; entry: PhotoEntry }
  | { type: "import-data"; payload: AppData }
  | { type: "reset-data" };

interface AppState {
  data: AppData;
  activeTab: TabKey;
}

interface AppStore extends AppState {
  todayKey: string;
  dispatch: Dispatch<AppAction>;
  getCalendarDay: (date: string) => CalendarDay | undefined;
  getDailyLog: (date: string) => DailyLog | undefined;
  getNutritionMode: (date: string) => NutritionMode;
  getTargetsForDate: (date: string) => MacroTargets;
  getWeekDays: (anchor?: Date) => CalendarDay[];
}

function createDefaultLog(date: string): DailyLog {
  return {
    date,
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
}

function sortByDate<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

function getWeekDateKeys(weekStartKey: string) {
  const base = new Date(`${weekStartKey}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(base, index)));
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "set-tab":
      return { ...state, activeTab: action.tab };
    case "update-calendar-day": {
      const existing = state.data.calendarDays.find((day) => day.date === action.date);
      const nextDays: CalendarDay[] = existing
        ? state.data.calendarDays.map((day) => (day.date === action.date ? { ...day, ...action.patch } : day))
        : [...state.data.calendarDays, { date: action.date, dayType: "rest", ...action.patch }];
      return { ...state, data: { ...state.data, calendarDays: sortByDate(nextDays) } };
    }
    case "duplicate-week": {
      const sourceKeys = getWeekDateKeys(action.weekStart);
      const targetStart = toDateKey(addDays(new Date(`${action.weekStart}T00:00:00`), 7));
      const targetKeys = getWeekDateKeys(targetStart);
      const copied = state.data.calendarDays.filter((day) => sourceKeys.includes(day.date));
      const mapped: CalendarDay[] = targetKeys.map((date, index) => {
        const sourceDay = copied[index];
        if (sourceDay) {
          return { ...sourceDay, date };
        }
        return { date, dayType: "rest" };
      });
      const preserved = state.data.calendarDays.filter((day) => !targetKeys.includes(day.date));
      return { ...state, data: { ...state.data, calendarDays: sortByDate([...preserved, ...mapped]) } };
    }
    case "reset-week": {
      const resetKeys = getWeekDateKeys(action.weekStart);
      const next = state.data.calendarDays.map((day) =>
        resetKeys.includes(day.date) ? { ...day, dayType: "rest" as DayType, workoutTemplateId: undefined, customLabel: undefined } : day
      );
      return { ...state, data: { ...state.data, calendarDays: next } };
    }
    case "apply-default-week": {
      const schedule = state.data.settings.preferredWeeklySchedule;
      const keys = getWeekDateKeys(action.weekStart);
      const next = state.data.calendarDays.map((day) => {
        const index = keys.indexOf(day.date);
        if (index === -1) return day;
        const pattern = schedule[index];
        const workoutTemplateId =
          pattern === "training"
            ? ["upper-a", "lower-a", "upper-b", "lower-b"][index % 4]
            : pattern === "cardio"
              ? "custom-cardio"
              : undefined;
        return {
          ...day,
          dayType: pattern,
          workoutTemplateId,
          customLabel: pattern === "cardio" ? "Zone 2 + mobility" : undefined
        };
      });
      return { ...state, data: { ...state.data, calendarDays: next } };
    }
    case "update-daily-log": {
      const existing = state.data.dailyLogs.find((log) => log.date === action.date) ?? createDefaultLog(action.date);
      const nextLogs = state.data.dailyLogs.some((log) => log.date === action.date)
        ? state.data.dailyLogs.map((log) => (log.date === action.date ? { ...log, ...action.patch } : log))
        : [...state.data.dailyLogs, { ...existing, ...action.patch }];
      return { ...state, data: { ...state.data, dailyLogs: sortByDate(nextLogs) } };
    }
    case "toggle-supplement": {
      const existing = state.data.dailyLogs.find((log) => log.date === action.date) ?? createDefaultLog(action.date);
      const supplementsTaken = existing.supplementsTaken.includes(action.supplement)
        ? existing.supplementsTaken.filter((item) => item !== action.supplement)
        : [...existing.supplementsTaken, action.supplement];
      const nextLog = { ...existing, supplementsTaken };
      const nextLogs = state.data.dailyLogs.some((log) => log.date === action.date)
        ? state.data.dailyLogs.map((log) => (log.date === action.date ? nextLog : log))
        : [...state.data.dailyLogs, nextLog];
      return { ...state, data: { ...state.data, dailyLogs: sortByDate(nextLogs) } };
    }
    case "toggle-meal-favorite": {
      const nextMeals = state.data.mealVariants.map((meal) =>
        meal.id === action.mealId ? { ...meal, favorite: !meal.favorite } : meal
      );
      return { ...state, data: { ...state.data, mealVariants: nextMeals } };
    }
    case "update-settings":
      return { ...state, data: { ...state.data, settings: { ...state.data.settings, ...action.patch } } };
    case "add-progress-entry": {
      const filtered = state.data.progressEntries.filter((entry) => entry.date !== action.entry.date);
      return { ...state, data: { ...state.data, progressEntries: sortByDate([...filtered, action.entry]) } };
    }
    case "add-photo":
      return { ...state, data: { ...state.data, photos: [action.entry, ...state.data.photos] } };
    case "import-data":
      return { ...state, data: action.payload };
    case "reset-data":
      return { ...state, data: createSeedData() };
    default:
      return state;
  }
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    data: createSeedData(),
    activeTab: "today" as TabKey
  });

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const payload = JSON.parse(raw) as AppData;
        dispatch({ type: "import-data", payload });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  }, [hydrated, state.data]);

  const todayKey = toDateKey(new Date());
  const store = useMemo<AppStore>(() => {
    const getCalendarDay = (date: string) => state.data.calendarDays.find((day) => day.date === date);
    const getDailyLog = (date: string) => state.data.dailyLogs.find((log) => log.date === date);
    const getNutritionMode = (date: string): NutritionMode => (getCalendarDay(date)?.dayType === "rest" ? "off" : "on");
    const getTargetsForDate = (date: string) =>
      getNutritionMode(date) === "on" ? state.data.settings.onTargets : state.data.settings.offTargets;
    const getWeekDays = (anchor = new Date()) => {
      const first = startOfWeek(anchor);
      return Array.from({ length: 7 }, (_, index) => {
        const date = toDateKey(addDays(first, index));
        return getCalendarDay(date) ?? { date, dayType: "rest" as DayType };
      });
    };

    return {
      ...state,
      todayKey,
      dispatch,
      getCalendarDay,
      getDailyLog,
      getNutritionMode,
      getTargetsForDate,
      getWeekDays
    };
  }, [state, todayKey]);

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}

export function useDailyCompletion(date: string) {
  const { data, getDailyLog, getTargetsForDate, getCalendarDay } = useAppStore();
  const log = getDailyLog(date) ?? createDefaultLog(date);
  const targets = getTargetsForDate(date);
  const day = getCalendarDay(date);
  const checks = [
    log.protein >= targets.protein * 0.9,
    log.waterLiters >= data.settings.waterTargetLiters,
    data.settings.supplementList.every((supplement) => !["Creatine", "Vitamin D3", "Omega-3"].includes(supplement)) ||
      log.supplementsTaken.length >= 2,
    day?.dayType === "training" ? log.workoutCompleted : true
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return clamp(score, 0, 100);
}

export function exportAppData(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "phase-export.json";
  link.click();
  URL.revokeObjectURL(url);
}
