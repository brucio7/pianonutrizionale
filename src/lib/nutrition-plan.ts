export type MealSlotId = "breakfast" | "morningSnack" | "lunch" | "afternoonSnack" | "dinner";

export type MainDish = { dish: string; quantity: string };

export type Alternative = { dish: string; quantity: string; prefix?: string };

export type MealEntry = {
  mains: MainDish[];
  alternatives: Alternative[];
};

export type DayPlan = Record<MealSlotId, MealEntry>;

export type WeekPlan = Record<string, DayPlan>;

export const DAYS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
] as const;

export const MEAL_SLOTS: { id: MealSlotId; label: string; time: string }[] = [
  { id: "breakfast", label: "Colazione", time: "07:30" },
  { id: "morningSnack", label: "Spuntino mattina", time: "10:30" },
  { id: "lunch", label: "Pranzo", time: "13:00" },
  { id: "afternoonSnack", label: "Merenda", time: "16:30" },
  { id: "dinner", label: "Cena", time: "20:00" },
];

export const emptyMainDish = (): MainDish => ({ dish: "", quantity: "" });

export const emptyAlternative = (): Alternative => ({ dish: "", quantity: "", prefix: "invece di" });

export const emptyDay = (): DayPlan =>
  MEAL_SLOTS.reduce((acc, slot) => {
    acc[slot.id] = { mains: [emptyMainDish()], alternatives: [] };
    return acc;
  }, {} as DayPlan);

export const emptyWeek = (): WeekPlan =>
  DAYS.reduce((acc, day) => {
    acc[day] = emptyDay();
    return acc;
  }, {} as WeekPlan);

const STORAGE_KEY = "piano-alimentare-v1";

export function loadWeek(): WeekPlan {
  if (typeof window === "undefined") return emptyWeek();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyWeek();
    const parsed = JSON.parse(raw) as WeekPlan;
    const base = emptyWeek();
    for (const day of DAYS) {
      const dayPlan = base[day];
      if (!dayPlan) continue;
      for (const slot of MEAL_SLOTS) {
        const entry = parsed?.[day]?.[slot.id];
        if (entry) {
          // Backward compat: old format had main/quantity strings
          const legacy = entry as unknown as { main?: string; quantity?: string; mains?: unknown };
          const legacyMain = typeof legacy.main === "string" ? legacy.main : "";
          const legacyQty = typeof legacy.quantity === "string" ? legacy.quantity : "";
          const rawMains = legacy.mains;
          const mains: MainDish[] = Array.isArray(rawMains) && rawMains.length > 0
            ? (rawMains as MainDish[])
                .filter((m) => m && typeof m === "object")
                .map((m) => ({
                  dish: typeof m.dish === "string" ? m.dish : "",
                  quantity: typeof m.quantity === "string" ? m.quantity : "",
                }))
            : [{ dish: legacyMain, quantity: legacyQty }];
          const rawAlts = Array.isArray(entry.alternatives) ? entry.alternatives : [];
          const alternatives: Alternative[] = rawAlts
            .map((a) => {
              if (typeof a === "string") return { dish: a, quantity: "" };
              if (a && typeof a === "object") {
                return {
                  dish: typeof a.dish === "string" ? a.dish : "",
                  quantity: typeof a.quantity === "string" ? a.quantity : "",
                  prefix: typeof a.prefix === "string" ? a.prefix : "invece di",
                };
              }
              return null;
            })
            .filter((a): a is Alternative => a !== null);
          dayPlan[slot.id] = { mains, alternatives };
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
  return MEAL_SLOTS.filter(
    (s) => day[s.id].mains.some((m) => m.dish.trim().length > 0),
  ).length;
}
