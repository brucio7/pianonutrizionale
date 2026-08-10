export type MealSlotId = "breakfast" | "morningSnack" | "lunch" | "afternoonSnack" | "dinner";

export type MealEntry = {
  main: string;
  alternatives: string[];
};

export type DayPlan = Record<MealSlotId, MealEntry>;

export type WeekPlan = Record<string, DayPlan>;

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MEAL_SLOTS: { id: MealSlotId; label: string; time: string }[] = [
  { id: "breakfast", label: "Breakfast", time: "07:30" },
  { id: "morningSnack", label: "Morning snack", time: "10:30" },
  { id: "lunch", label: "Lunch", time: "13:00" },
  { id: "afternoonSnack", label: "Afternoon snack", time: "16:30" },
  { id: "dinner", label: "Dinner", time: "20:00" },
];

export const emptyDay = (): DayPlan =>
  MEAL_SLOTS.reduce((acc, slot) => {
    acc[slot.id] = { main: "", alternatives: [] };
    return acc;
  }, {} as DayPlan);

export const emptyWeek = (): WeekPlan =>
  DAYS.reduce((acc, day) => {
    acc[day] = emptyDay();
    return acc;
  }, {} as WeekPlan);

const STORAGE_KEY = "nutrition-plan-v1";

export function loadWeek(): WeekPlan {
  if (typeof window === "undefined") return emptyWeek();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyWeek();
    const parsed = JSON.parse(raw) as WeekPlan;
    const base = emptyWeek();
    for (const day of DAYS) {
      for (const slot of MEAL_SLOTS) {
        const entry = parsed?.[day]?.[slot.id];
        if (entry) {
          base[day][slot.id] = {
            main: typeof entry.main === "string" ? entry.main : "",
            alternatives: Array.isArray(entry.alternatives)
              ? entry.alternatives.filter((a) => typeof a === "string")
              : [],
          };
        }
      }
    }
    return base;
  } catch {
    return emptyWeek();
  }
}

export function saveWeek(week: WeekPlan) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(week));
}

export function countPlanned(day: DayPlan) {
  return MEAL_SLOTS.filter((s) => day[s.id].main.trim().length > 0).length;
}
