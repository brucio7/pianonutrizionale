import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Leaf, RotateCcw, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealSlotCard } from "@/components/MealSlotCard";
import {
  DAYS,
  MEAL_SLOTS,
  countPlanned,
  emptyDay,
  emptyWeek,
  loadWeek,
  saveWeek,
  type MealEntry,
  type MealSlotId,
  type WeekPlan,
} from "@/lib/nutrition-plan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Piano Alimentare Settimanale — Pasti e Alternative" },
      {
        name: "description",
        content:
          "Organizza colazione, spuntini, pranzo e cena per ogni giorno della settimana, con un piatto principale e le sue alternative.",
      },
      { property: "og:title", content: "Piano Alimentare Settimanale — Pasti e Alternative" },
      {
        property: "og:description",
        content:
          "Organizza colazione, spuntini, pranzo e cena per ogni giorno della settimana, con un piatto principale e le sue alternative.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [week, setWeek] = useState<WeekPlan>(() => emptyWeek());
  const [activeDay, setActiveDay] = useState<string>(DAYS[0]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWeek(loadWeek());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWeek(week);
  }, [week, hydrated]);

  const day = week[activeDay] ?? emptyDay();

  const updateSlot = (slot: MealSlotId, entry: MealEntry) => {
    setWeek((prev) => ({
      ...prev,
      [activeDay]: { ...(prev[activeDay] ?? emptyDay()), [slot]: entry },
    }));
  };

  const clearDay = () => {
    setWeek((prev) => ({ ...prev, [activeDay]: emptyDay() }));
  };

  const planned = countPlanned(day);

  return (
    <div className="min-h-screen paper-grain">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold leading-tight">Piano Alimentare</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl leading-none text-primary">
              {planned}
              <span className="text-base text-muted-foreground">/{MEAL_SLOTS.length}</span>
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {activeDay}: pasti inseriti
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-6">
        <nav className="flex flex-wrap gap-2" aria-label="Giorni della settimana">
          {DAYS.map((d) => {
            const filled = countPlanned(week[d] ?? emptyDay());
            const active = d === activeDay;
            return (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-lifted"
                    : "border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-secondary"
                }`}
              >
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.slice(0, 3)}</span>
                {filled > 0 && (
                  <span
                    className={`ml-2 text-xs ${active ? "text-primary-foreground/80" : "text-accent"}`}
                  >
                    {filled}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-3xl">{activeDay}</h2>
          <Button variant="ghost" size="sm" onClick={clearDay} className="text-muted-foreground">
            <RotateCcw className="mr-2 size-4" />
            Svuota giorno
          </Button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {MEAL_SLOTS.map((slot) => (
            <MealSlotCard
              key={slot.id}
              label={slot.label}
              time={slot.time}
              entry={day[slot.id]}
              onChange={(entry) => updateSlot(slot.id, entry)}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Il tuo piano viene salvato automaticamente su questo dispositivo.
        </p>
      </main>
    </div>
  );
}
