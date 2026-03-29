"use client";

import { Copy, Heart, ShoppingBasket } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, IconButton, Pill, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import type { MealCategory, NutritionMode } from "@/lib/types";

const categories: Array<{ key: MealCategory; label: string }> = [
  { key: "breakfast", label: "Breakfast" },
  { key: "morningSnack", label: "Morning snack" },
  { key: "lunch", label: "Lunch" },
  { key: "afternoonSnack", label: "Afternoon snack" },
  { key: "dinner", label: "Dinner" }
];

export function MealsScreen() {
  const { data, todayKey, getNutritionMode, dispatch } = useAppStore();
  const [mode, setMode] = useState<NutritionMode>(getNutritionMode(todayKey));

  const grouped = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      meals: data.mealVariants.filter((meal) => meal.category === category.key && meal.mode === mode)
    }));
  }, [data.mealVariants, mode]);

  const shoppingList = useMemo(() => {
    return Array.from(new Set(grouped.flatMap((group) => group.meals.flatMap((meal) => meal.ingredients)))).slice(0, 16);
  }, [grouped]);

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Meal planner" caption="Fast ON/OFF variants, not a food tracker." />
        <div className="flex gap-2">
          {(["on", "off"] as NutritionMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-2xl px-4 py-2 text-sm ${mode === item ? "bg-accent text-accent-foreground" : "bg-white/6 text-muted-foreground"}`}
            >
              {item.toUpperCase()} day
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-3xl border border-white/8 bg-card-2/60 p-4 text-sm text-muted-foreground">
          {mode === "on"
            ? "2400-2450 kcal, 160-170 g protein, higher carbs, 60-70 g fats, 32-38 g fiber."
            : "2150-2200 kcal, 160-170 g protein, lower carbs, 65-75 g fats, 32-38 g fiber."}
        </div>
      </Card>

      {grouped.map((group) => (
        <Card key={group.key}>
          <SectionHeader title={group.label} caption={`${group.meals.length} seeded variants`} />
          <div className="space-y-3">
            {group.meals.map((meal) => (
              <div key={meal.id} className="rounded-3xl border border-white/8 bg-card-2/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{meal.name}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {meal.tags.map((tag) => (
                        <Pill key={tag}>{tag}</Pill>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => dispatch({ type: "toggle-meal-favorite", mealId: meal.id })}>
                    <Heart className={`h-4 w-4 ${meal.favorite ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <div className="mt-4 text-sm leading-6 text-muted-foreground">{meal.ingredients.join(" • ")}</div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {meal.caloriesRange[0]}-{meal.caloriesRange[1]} kcal
                  </span>
                  <span>
                    {meal.proteinRange[0]}-{meal.proteinRange[1]}P
                    {meal.carbsRange ? ` • ${meal.carbsRange[0]}-${meal.carbsRange[1]}C` : ""}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <IconButton
                    className="flex-1 justify-center"
                    onClick={() => navigator.clipboard.writeText(`${meal.name}: ${meal.ingredients.join(", ")}`)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Quick copy
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <SectionHeader title="Shopping list" caption="A quick aggregated view from the current ON/OFF plan." action={<ShoppingBasket className="h-4 w-4 text-accent" />} />
        <div className="flex flex-wrap gap-2">
          {shoppingList.map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      </Card>
    </div>
  );
}
