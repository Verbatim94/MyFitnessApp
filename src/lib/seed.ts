import type {
  AppData,
  CalendarDay,
  DailyLog,
  MealVariant,
  ProgressEntry,
  Settings,
  WorkoutSession,
  WorkoutTemplate
} from "@/lib/types";
import { addDays, startOfWeek, toDateKey } from "@/lib/utils";

const today = new Date();
const weekStart = startOfWeek(today);

const settings: Settings = {
  appName: "Phase",
  currentPhase: "Recomposition",
  fiberTarget: 35,
  waterTargetLiters: 3.2,
  onTargets: {
    calories: 2425,
    protein: 165,
    carbs: 275,
    fats: 65,
    fiber: 35
  },
  offTargets: {
    calories: 2175,
    protein: 165,
    carbs: 180,
    fats: 70,
    fiber: 35
  },
  supplementList: ["Creatine", "Omega-3", "Vitamin D3", "Magnesium", "Electrolytes"],
  preferredWeeklySchedule: ["training", "training", "rest", "training", "training", "cardio", "rest"]
};

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "upper-a",
    name: "Upper A",
    exercises: [
      { id: "ua-1", name: "Low incline Smith press", targetSets: 3, targetReps: "6-8", targetRir: "1-2" },
      { id: "ua-2", name: "Lat machine neutral/semi-supinated", targetSets: 3, targetReps: "8-10", targetRir: "1-2" },
      { id: "ua-3", name: "Chest press", targetSets: 2, targetReps: "8-10", targetRir: "1-2" },
      { id: "ua-4", name: "Universal row biased to lats", targetSets: 2, targetReps: "8-10", targetRir: "1-2" },
      { id: "ua-5", name: "Lateral raise", targetSets: 3, targetReps: "12-15", targetRir: "1-2" },
      { id: "ua-6", name: "Straight-arm pulldown", targetSets: 2, targetReps: "12-15", targetRir: "1-2" },
      { id: "ua-7", name: "Pushdown", targetSets: 2, targetReps: "10-12", targetRir: "1-2" }
    ]
  },
  {
    id: "lower-a",
    name: "Lower A",
    exercises: [
      { id: "la-1", name: "Hack squat or squat", targetSets: 3, targetReps: "5-8", targetRir: "1-2" },
      { id: "la-2", name: "Romanian deadlift", targetSets: 3, targetReps: "6-8", targetRir: "1-2" },
      { id: "la-3", name: "Leg press", targetSets: 2, targetReps: "10-12", targetRir: "1-2" },
      { id: "la-4", name: "Leg curl", targetSets: 2, targetReps: "10-12", targetRir: "1-2" },
      { id: "la-5", name: "Calf raise", targetSets: 3, targetReps: "8-12", targetRir: "1-2" },
      { id: "la-6", name: "Abs", targetSets: 3, targetReps: "12-15", targetRir: "1-2" }
    ]
  },
  {
    id: "upper-b",
    name: "Upper B",
    exercises: [
      { id: "ub-1", name: "One-arm cable lat pulldown", targetSets: 3, targetReps: "8-10", targetRir: "1-2" },
      { id: "ub-2", name: "Lat machine or assisted pull-up", targetSets: 3, targetReps: "6-10", targetRir: "1-2" },
      { id: "ub-3", name: "Low incline Smith press", targetSets: 3, targetReps: "6-8", targetRir: "1-2" },
      { id: "ub-4", name: "Machine lateral raise", targetSets: 3, targetReps: "12-15", targetRir: "1-2" },
      { id: "ub-5", name: "Reverse pec deck / rear delt fly", targetSets: 2, targetReps: "12-15", targetRir: "1-2" },
      { id: "ub-6", name: "Cable fly", targetSets: 2, targetReps: "10-12", targetRir: "1-2" },
      { id: "ub-7", name: "Curl", targetSets: 2, targetReps: "10-12", targetRir: "1-2" }
    ]
  },
  {
    id: "lower-b",
    name: "Lower B",
    exercises: [
      { id: "lb-1", name: "Front squat or heavy press", targetSets: 3, targetReps: "5-8", targetRir: "1-2" },
      { id: "lb-2", name: "Bulgarian split squat", targetSets: 2, targetReps: "8-10", targetRir: "1-2" },
      { id: "lb-3", name: "Seated leg curl", targetSets: 3, targetReps: "10-12", targetRir: "1-2" },
      { id: "lb-4", name: "Back extension", targetSets: 2, targetReps: "10-15", targetRir: "1-2" },
      { id: "lb-5", name: "Universal row or seated cable row", targetSets: 2, targetReps: "8-10", targetRir: "1-2" },
      { id: "lb-6", name: "Light chest press", targetSets: 2, targetReps: "10-12", targetRir: "1-2" },
      { id: "lb-7", name: "Calf raise", targetSets: 3, targetReps: "8-12", targetRir: "1-2" }
    ]
  }
];

const calendarPattern: Array<{ dayType: CalendarDay["dayType"]; workoutTemplateId?: string }> = [
  { dayType: "training", workoutTemplateId: "upper-a" },
  { dayType: "training", workoutTemplateId: "lower-a" },
  { dayType: "rest" },
  { dayType: "training", workoutTemplateId: "upper-b" },
  { dayType: "training", workoutTemplateId: "lower-b" },
  { dayType: "cardio", workoutTemplateId: "custom-cardio" },
  { dayType: "rest" }
];

const calendarDays: CalendarDay[] = Array.from({ length: 21 }, (_, index) => {
  const date = addDays(weekStart, index);
  const base = calendarPattern[index % 7];
  return {
    date: toDateKey(date),
    dayType: base.dayType,
    workoutTemplateId: base.workoutTemplateId,
    customLabel: base.dayType === "cardio" ? "Zone 2 + mobility" : undefined
  };
});

function seededLog(dateOffset: number, values: Partial<DailyLog>): DailyLog {
  const date = toDateKey(addDays(today, dateOffset));
  return {
    date,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    waterLiters: 0,
    supplementsTaken: [],
    workoutCompleted: false,
    notes: "",
    energy: 3,
    hunger: 3,
    sleepHours: 7,
    ...values
  };
}

const dailyLogs: DailyLog[] = [
  seededLog(-6, {
    calories: 2380,
    protein: 162,
    carbs: 266,
    fats: 63,
    fiber: 33,
    waterLiters: 2.6,
    supplementsTaken: ["Creatine", "Vitamin D3", "Omega-3"],
    workoutCompleted: true,
    energy: 4,
    hunger: 2,
    sleepHours: 7.5
  }),
  seededLog(-5, {
    calories: 2440,
    protein: 167,
    carbs: 279,
    fats: 65,
    fiber: 34,
    waterLiters: 3.1,
    supplementsTaken: ["Creatine", "Vitamin D3", "Electrolytes"],
    workoutCompleted: true,
    energy: 4,
    hunger: 3,
    sleepHours: 7.2
  }),
  seededLog(-4, {
    calories: 2120,
    protein: 158,
    carbs: 168,
    fats: 71,
    fiber: 31,
    waterLiters: 2.2,
    supplementsTaken: ["Omega-3", "Magnesium"],
    workoutCompleted: false,
    energy: 3,
    hunger: 3,
    sleepHours: 6.9
  }),
  seededLog(-3, {
    calories: 2305,
    protein: 152,
    carbs: 248,
    fats: 62,
    fiber: 30,
    waterLiters: 2.4,
    supplementsTaken: ["Creatine", "Omega-3"],
    workoutCompleted: true,
    energy: 3,
    hunger: 4,
    sleepHours: 6.6
  }),
  seededLog(-2, {
    calories: 2180,
    protein: 149,
    carbs: 182,
    fats: 72,
    fiber: 35,
    waterLiters: 2.0,
    supplementsTaken: ["Magnesium"],
    workoutCompleted: false,
    energy: 2,
    hunger: 4,
    sleepHours: 6.4
  }),
  seededLog(-1, {
    calories: 2410,
    protein: 166,
    carbs: 272,
    fats: 64,
    fiber: 37,
    waterLiters: 3.4,
    supplementsTaken: ["Creatine", "Vitamin D3", "Electrolytes"],
    workoutCompleted: true,
    energy: 4,
    hunger: 2,
    sleepHours: 7.8
  }),
  seededLog(0, {
    calories: 1980,
    protein: 128,
    carbs: 175,
    fats: 58,
    fiber: 24,
    waterLiters: 1.8,
    supplementsTaken: ["Creatine"],
    workoutCompleted: false,
    energy: 3,
    hunger: 3,
    sleepHours: 7.1
  })
];

const workoutSessions: WorkoutSession[] = [
  {
    id: "ws-1",
    date: toDateKey(addDays(today, -6)),
    workoutTemplateId: "upper-a",
    completed: true,
    perceivedPerformance: "up",
    exercises: [
      { exerciseId: "ua-1", exerciseName: "Low incline Smith press", setsCompleted: 3, repsAchieved: "8/8/7", loadKg: 72.5, rir: "1" },
      { exerciseId: "ua-2", exerciseName: "Lat machine neutral/semi-supinated", setsCompleted: 3, repsAchieved: "10/9/8", loadKg: 57.5, rir: "1-2" }
    ]
  },
  {
    id: "ws-2",
    date: toDateKey(addDays(today, -5)),
    workoutTemplateId: "lower-a",
    completed: true,
    perceivedPerformance: "flat",
    exercises: [
      { exerciseId: "la-1", exerciseName: "Hack squat or squat", setsCompleted: 3, repsAchieved: "8/7/7", loadKg: 112.5, rir: "1" },
      { exerciseId: "la-3", exerciseName: "Leg press", setsCompleted: 2, repsAchieved: "12/11", loadKg: 220, rir: "1-2" }
    ]
  },
  {
    id: "ws-3",
    date: toDateKey(addDays(today, -3)),
    workoutTemplateId: "upper-b",
    completed: true,
    perceivedPerformance: "down",
    exercises: [
      { exerciseId: "ub-3", exerciseName: "Low incline Smith press", setsCompleted: 3, repsAchieved: "7/6/6", loadKg: 72.5, rir: "0-1" },
      { exerciseId: "ub-4", exerciseName: "Machine lateral raise", setsCompleted: 3, repsAchieved: "13/12/11", loadKg: 27.5, rir: "1-2" }
    ]
  },
  {
    id: "ws-4",
    date: toDateKey(addDays(today, -1)),
    workoutTemplateId: "lower-b",
    completed: true,
    perceivedPerformance: "up",
    exercises: [
      { exerciseId: "lb-1", exerciseName: "Front squat or heavy press", setsCompleted: 3, repsAchieved: "8/8/6", loadKg: 105, rir: "1-2" },
      { exerciseId: "lb-7", exerciseName: "Calf raise", setsCompleted: 3, repsAchieved: "12/12/11", loadKg: 85, rir: "1-2" }
    ]
  }
];

function createMealVariant(
  id: string,
  category: MealVariant["category"],
  mode: MealVariant["mode"],
  name: string,
  ingredients: string[],
  tags: string[],
  caloriesRange: [number, number],
  proteinRange: [number, number],
  carbsRange?: [number, number],
  fatsRange?: [number, number]
): MealVariant {
  return { id, category, mode, name, ingredients, tags, caloriesRange, proteinRange, carbsRange, fatsRange };
}

const mealVariants: MealVariant[] = [
  createMealVariant("b1-on", "breakfast", "on", "Skyr oats bowl", ["Skyr 300 g", "Oats 80 g", "Banana", "Nuts 10 g"], ["high protein", "work energy"], [500, 550], [35, 40], [55, 70], [10, 15]),
  createMealVariant("b1-off", "breakfast", "off", "Skyr berries bowl", ["Skyr 300 g", "Oats 50 g", "Berries", "Nuts 10 g"], ["high protein", "fiber"], [450, 500], [35, 40], [35, 50], [10, 15]),
  createMealVariant("b2-on", "breakfast", "on", "Eggs and bread", ["3 eggs", "Egg whites 200 g", "Bread"], ["high protein", "savory"], [500, 550], [35, 40], [55, 70], [10, 15]),
  createMealVariant("b2-off", "breakfast", "off", "Eggs and light bread", ["3 eggs", "Egg whites 200 g", "Less bread"], ["high protein", "savory"], [450, 500], [35, 40], [35, 50], [10, 15]),
  createMealVariant("b3-on", "breakfast", "on", "Yogurt whey cereal", ["Greek yogurt 250 g", "Whey 30 g", "Cereal"], ["high protein", "fast"], [500, 550], [35, 40], [55, 70], [10, 15]),
  createMealVariant("b3-off", "breakfast", "off", "Yogurt whey cereal light", ["Greek yogurt 250 g", "Whey 30 g", "Less cereal"], ["high protein", "fast"], [450, 500], [35, 40], [35, 50], [10, 15]),
  createMealVariant("b4-on", "breakfast", "on", "Protein pancake", ["Egg whites 200 g", "1 egg", "Oats"], ["high protein", "pre-workout"], [500, 550], [35, 40], [55, 70], [10, 15]),
  createMealVariant("b4-off", "breakfast", "off", "Protein pancake light", ["Egg whites 200 g", "1 egg", "Less oats"], ["high protein", "pre-workout"], [450, 500], [35, 40], [35, 50], [10, 15]),
  createMealVariant("b5-on", "breakfast", "on", "Kefir kiwi oats", ["Kefir", "Oats", "Kiwi", "Almonds"], ["gut health", "fiber"], [500, 550], [35, 40], [55, 70], [10, 15]),
  createMealVariant("b5-off", "breakfast", "off", "Kefir kiwi oats light", ["Kefir", "Less oats", "Kiwi", "Almonds"], ["gut health", "fiber"], [450, 500], [35, 40], [35, 50], [10, 15]),
  createMealVariant("ms1-on", "morningSnack", "on", "Protein yogurt and fruit", ["Protein yogurt", "Fruit"], ["high protein", "portable"], [200, 250], [20, 25]),
  createMealVariant("ms1-off", "morningSnack", "off", "Protein yogurt and fruit", ["Protein yogurt", "Fruit"], ["high protein", "portable"], [180, 230], [20, 25]),
  createMealVariant("ms2-on", "morningSnack", "on", "Cottage cheese and fruit", ["Cottage cheese", "Fruit"], ["high protein", "light"], [200, 250], [20, 25]),
  createMealVariant("ms2-off", "morningSnack", "off", "Cottage cheese and fruit", ["Cottage cheese", "Fruit"], ["high protein", "light"], [180, 230], [20, 25]),
  createMealVariant("ms3-on", "morningSnack", "on", "Whey and fruit", ["Whey", "Fruit"], ["fast", "pre-workout"], [200, 250], [20, 25]),
  createMealVariant("ms3-off", "morningSnack", "off", "Whey and fruit", ["Whey", "Fruit"], ["fast", "light"], [180, 230], [20, 25]),
  createMealVariant("ms4-on", "morningSnack", "on", "Boiled eggs and fruit", ["2 boiled eggs", "Fruit"], ["satiating", "simple"], [200, 250], [20, 25]),
  createMealVariant("ms4-off", "morningSnack", "off", "Boiled eggs and fruit", ["2 boiled eggs", "Fruit"], ["satiating", "simple"], [180, 230], [20, 25]),
  createMealVariant("ms5-on", "morningSnack", "on", "Skyr and rice cakes", ["Skyr", "Rice cakes"], ["high protein", "crisp"], [200, 250], [20, 25]),
  createMealVariant("ms5-off", "morningSnack", "off", "Skyr and almonds", ["Skyr", "Almonds"], ["high protein", "fats"], [180, 230], [20, 25]),
  createMealVariant("l1-on", "lunch", "on", "Chicken rice bowl", ["Chicken or turkey", "Rice", "Vegetables", "Olive oil"], ["high protein", "training fuel"], [650, 750], [40, 45], [70, 90]),
  createMealVariant("l1-off", "lunch", "off", "Chicken rice bowl light", ["Chicken or turkey", "Rice", "Vegetables", "Olive oil"], ["high protein", "balanced"], [550, 650], [40, 45], [45, 65]),
  createMealVariant("l2-on", "lunch", "on", "Lean beef pasta", ["Lean beef", "Pasta", "Vegetables"], ["iron", "work energy"], [650, 750], [40, 45], [70, 90]),
  createMealVariant("l2-off", "lunch", "off", "Lean beef pasta light", ["Lean beef", "Pasta", "Vegetables"], ["iron", "balanced"], [550, 650], [40, 45], [45, 65]),
  createMealVariant("l3-on", "lunch", "on", "Fish potatoes salad", ["White fish", "Potatoes", "Salad", "Olive oil"], ["lean", "fiber"], [650, 750], [40, 45], [70, 90]),
  createMealVariant("l3-off", "lunch", "off", "Fish potatoes salad light", ["White fish", "Potatoes", "Salad", "Olive oil"], ["lean", "fiber"], [550, 650], [40, 45], [45, 65]),
  createMealVariant("l4-on", "lunch", "on", "Legumes and rice", ["Lentils/chickpeas/beans", "Rice", "Vegetables"], ["fiber", "plant-forward"], [650, 750], [40, 45], [70, 90]),
  createMealVariant("l4-off", "lunch", "off", "Legumes and rice light", ["Lentils/chickpeas/beans", "Rice", "Vegetables"], ["fiber", "plant-forward"], [550, 650], [40, 45], [45, 65]),
  createMealVariant("l5-on", "lunch", "on", "Tuna bread salad", ["Tuna", "Bread", "Salad", "Olive oil"], ["fast", "high protein"], [650, 750], [40, 45], [70, 90]),
  createMealVariant("l5-off", "lunch", "off", "Tuna bread salad light", ["Tuna", "Bread", "Salad", "Olive oil"], ["fast", "high protein"], [550, 650], [40, 45], [45, 65]),
  createMealVariant("as1-on", "afternoonSnack", "on", "Whey banana rice cakes", ["Whey", "Banana", "Rice cakes"], ["pre-workout", "fast"], [250, 350], [20, 30], [30, 50]),
  createMealVariant("as1-off", "afternoonSnack", "off", "Whey banana rice cakes light", ["Whey", "Half banana", "Rice cakes"], ["fast", "light"], [180, 260], [20, 25], [10, 25]),
  createMealVariant("as2-on", "afternoonSnack", "on", "Greek yogurt and cereal", ["Greek yogurt", "Cereal"], ["high protein", "quick"], [250, 350], [20, 30], [30, 50]),
  createMealVariant("as2-off", "afternoonSnack", "off", "Greek yogurt and cereal light", ["Greek yogurt", "Less cereal"], ["high protein", "quick"], [180, 260], [20, 25], [10, 25]),
  createMealVariant("as3-on", "afternoonSnack", "on", "Skyr toast sweet", ["Skyr", "Bread", "Jam or honey"], ["pre-workout", "simple"], [250, 350], [20, 30], [30, 50]),
  createMealVariant("as3-off", "afternoonSnack", "off", "Skyr toast light", ["Skyr", "Bread", "Little jam"], ["light", "simple"], [180, 260], [20, 25], [10, 25]),
  createMealVariant("as4-on", "afternoonSnack", "on", "Mini pita and eggs", ["Mini pita or mini piadina", "Eggs", "Egg whites", "Greek yogurt sauce"], ["savory", "portable"], [250, 350], [20, 30], [30, 50]),
  createMealVariant("as4-off", "afternoonSnack", "off", "Mini pita and eggs light", ["Mini pita", "Eggs", "Egg whites", "Greek yogurt sauce"], ["savory", "portable"], [180, 260], [20, 25], [10, 25]),
  createMealVariant("as5-on", "afternoonSnack", "on", "Cottage cheese and fruit", ["Cottage cheese", "Fruit"], ["light", "high protein"], [250, 350], [20, 30], [30, 50]),
  createMealVariant("as5-off", "afternoonSnack", "off", "Cottage cheese and fruit", ["Cottage cheese", "Fruit"], ["light", "high protein"], [180, 260], [20, 25], [10, 25]),
  createMealVariant("d1-on", "dinner", "on", "White fish and potatoes", ["White fish", "Potatoes", "Vegetables", "Olive oil"], ["lean", "recovery"], [650, 750], [40, 45], [45, 65]),
  createMealVariant("d1-off", "dinner", "off", "White fish and potatoes light", ["White fish", "Potatoes", "Vegetables", "Olive oil"], ["lean", "recovery"], [600, 700], [40, 45], [30, 50]),
  createMealVariant("d2-on", "dinner", "on", "Salmon and potatoes", ["Salmon", "Potatoes", "Vegetables"], ["omega-3", "satiating"], [650, 750], [40, 45], [45, 65]),
  createMealVariant("d2-off", "dinner", "off", "Salmon and potatoes light", ["Salmon", "Potatoes", "Vegetables"], ["omega-3", "satiating"], [600, 700], [40, 45], [30, 50]),
  createMealVariant("d3-on", "dinner", "on", "Eggs and bread plate", ["Eggs", "Egg whites", "Bread", "Salad"], ["savory", "high protein"], [650, 750], [40, 45], [45, 65]),
  createMealVariant("d3-off", "dinner", "off", "Eggs and bread plate light", ["Eggs", "Egg whites", "Bread", "Salad"], ["savory", "high protein"], [600, 700], [40, 45], [30, 50]),
  createMealVariant("d4-on", "dinner", "on", "Chicken rice dinner", ["Chicken", "Rice", "Vegetables"], ["recovery", "high protein"], [650, 750], [40, 45], [45, 65]),
  createMealVariant("d4-off", "dinner", "off", "Chicken rice dinner light", ["Chicken", "Rice", "Vegetables"], ["recovery", "high protein"], [600, 700], [40, 45], [30, 50]),
  createMealVariant("d5-on", "dinner", "on", "Legumes and protein plate", ["Lentils/chickpeas", "Eggs or chicken", "Vegetables", "Bread"], ["fiber", "balanced"], [650, 750], [40, 45], [45, 65]),
  createMealVariant("d5-off", "dinner", "off", "Legumes and protein plate light", ["Lentils/chickpeas", "Eggs or chicken", "Vegetables", "Bread"], ["fiber", "balanced"], [600, 700], [40, 45], [30, 50])
];

const progressEntries: ProgressEntry[] = [
  { date: toDateKey(addDays(today, -28)), weightKg: 79.4, waistCm: 83.4 },
  { date: toDateKey(addDays(today, -21)), weightKg: 79.2, waistCm: 83.1 },
  { date: toDateKey(addDays(today, -14)), weightKg: 79.3, waistCm: 82.7 },
  { date: toDateKey(addDays(today, -7)), weightKg: 79.1, waistCm: 82.4 },
  { date: toDateKey(today), weightKg: 79.2, waistCm: 82.1 }
];

export function createSeedData(): AppData {
  return {
    settings,
    workoutTemplates,
    calendarDays,
    dailyLogs,
    workoutSessions,
    mealVariants,
    progressEntries,
    photos: []
  };
}
