export type DayType = "training" | "rest" | "cardio" | "deload" | "custom";
export type NutritionMode = "on" | "off";
export type MealCategory = "breakfast" | "morningSnack" | "lunch" | "afternoonSnack" | "dinner";
export type TabKey = "today" | "calendar" | "log" | "meals" | "progress" | "settings";

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface Settings {
  appName: string;
  currentPhase: string;
  fiberTarget: number;
  waterTargetLiters: number;
  onTargets: MacroTargets;
  offTargets: MacroTargets;
  supplementList: string[];
  preferredWeeklySchedule: DayType[];
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  targetRir: string;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
}

export interface CalendarDay {
  date: string;
  dayType: DayType;
  workoutTemplateId?: string;
  customLabel?: string;
}

export interface DailyLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  waterLiters: number;
  caffeineMg?: number;
  supplementsTaken: string[];
  workoutCompleted: boolean;
  notes: string;
  energy: number;
  hunger: number;
  sleepHours: number;
  digestion?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsAchieved: string;
  loadKg: number;
  rir: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  workoutTemplateId: string;
  completed: boolean;
  perceivedPerformance: "up" | "flat" | "down";
  exercises: ExerciseLog[];
}

export interface MealVariant {
  id: string;
  category: MealCategory;
  mode: NutritionMode;
  name: string;
  ingredients: string[];
  tags: string[];
  caloriesRange: [number, number];
  proteinRange: [number, number];
  carbsRange?: [number, number];
  fatsRange?: [number, number];
  favorite?: boolean;
}

export interface ProgressEntry {
  date: string;
  weightKg: number;
  waistCm: number;
}

export interface PhotoEntry {
  id: string;
  date: string;
  label: string;
  imageDataUrl: string;
}

export interface AppData {
  settings: Settings;
  workoutTemplates: WorkoutTemplate[];
  calendarDays: CalendarDay[];
  dailyLogs: DailyLog[];
  workoutSessions: WorkoutSession[];
  mealVariants: MealVariant[];
  progressEntries: ProgressEntry[];
  photos: PhotoEntry[];
}

export interface Insight {
  id: string;
  tone: "positive" | "warning" | "neutral";
  title: string;
  description: string;
}
