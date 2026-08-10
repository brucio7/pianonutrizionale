import { useState } from "react";
import { Plus, X, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MealEntry } from "@/lib/nutrition-plan";

type Props = {
  label: string;
  time: string;
  entry: MealEntry;
  onChange: (entry: MealEntry) => void;
};

export function MealSlotCard({ label, time, entry, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const addAlternative = () => {
    const value = draft.trim();
    if (!value) return;
    onChange({ ...entry, alternatives: [...entry.alternatives, value] });
    setDraft("");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold text-card-foreground">{label}</h3>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          {time}
        </span>
      </header>

      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Piatto principale
      </label>
      <div className="relative">
        <Utensils className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
        <Input
          value={entry.main}
          onChange={(e) => onChange({ ...entry, main: e.target.value })}
          placeholder={`Cosa mangi a ${label.toLowerCase()}?`}
          className="h-11 bg-surface pl-9 text-base"
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Alternative
        </p>

        {entry.alternatives.length > 0 && (
          <ul className="mb-2 space-y-1.5">
            {entry.alternatives.map((alt, i) => (
              <li
                key={`${alt}-${i}`}
                className="group flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-sm text-surface-foreground"
              >
                <span className="text-accent">oppure</span>
                <span className="flex-1">{alt}</span>
                <button
                  type="button"
                  aria-label={`Rimuovi alternativa ${alt}`}
                  onClick={() =>
                    onChange({
                      ...entry,
                      alternatives: entry.alternatives.filter((_, idx) => idx !== i),
                    })
                  }
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAlternative();
              }
            }}
            placeholder="Aggiungi un'alternativa…"
            className="h-10 bg-card text-sm"
          />
          <Button type="button" variant="secondary" size="icon" className="h-10 w-10 shrink-0" onClick={addAlternative}>
            <Plus className="size-4" />
            <span className="sr-only">Aggiungi alternativa</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
